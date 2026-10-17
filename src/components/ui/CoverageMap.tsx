"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { announcedCities, regionsWithUnannouncedTowns, type City, type LaunchRegion } from "@/data/cities";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/config";
import { useScrollRootNode } from "@/components/ui/SmoothScrollProvider";
import type { Map as MapLibreMap, LngLatBoundsLike, StyleSpecification } from "maplibre-gl";

type MapLibreModule = typeof import("maplibre-gl");

/**
 * The library and its stylesheet load together, only when the map is about to
 * be shown, so the 70 KB maplibre stylesheet is no longer render-blocking on
 * every page that has a map.
 */
const loadMapLibre = () =>
  Promise.all([import("maplibre-gl"), import("maplibre-gl/dist/maplibre-gl.css")]).then(([lib]) => lib);

const copy = {
  en: {
    mapAria: "Map of Rido launch towns — launching soon",
    regionMapAria: "Map of the Costa del Sol region — Rido launch towns announced soon",
    launchingSoon: "Launching soon",
    /** Poster label under a region whose towns are not announced yet. */
    comingNext: "Coming next",
    /** Lowercase suffix appended to marker aria-labels: "<City> — launching soon". */
    launchingSoonSuffix: "launching soon",
    eScooter: "E-Scooter",
    eBike: "E-Bike",
  },
  es: {
    mapAria: "Mapa de las ciudades de lanzamiento de Rido — muy pronto",
    regionMapAria: "Mapa de la región de la Costa del Sol — las ciudades de lanzamiento de Rido se anunciarán muy pronto",
    launchingSoon: "Próximamente",
    comingNext: "Próximamente",
    launchingSoonSuffix: "próximamente",
    eScooter: "Patinete eléctrico",
    eBike: "Bici eléctrica",
  },
} as const satisfies Record<Locale, Record<string, string>>;

type Copy = (typeof copy)[Locale];

/** Keyless, free-for-commercial-use vector style (OpenFreeMap / OpenMapTiles). */
const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

/**
 * Brand-dark recolor applied over the light Positron canvas after the style
 * loads. Positron is a neutral greyscale style, so mapping every layer type
 * onto the navy palette produces a coherent dark map without a custom style
 * server. These are canvas paint values (not CSS), derived from
 * --color-rido-navy (#0F172A).
 */
const MAP_COLORS = {
  background: "#0B1222",
  land: "#101B31",
  landAlt: "#15223C",
  water: "#0D1A33",
  waterLine: "#1C2E50",
  roadMajor: "#2D3E60",
  roadMinor: "#1E2C49",
  boundary: "#3A4C70",
  text: "#94A3B8",
  textHalo: "#0B1222",
} as const;

/** Bounding box around the given towns. A single town gets a wider pad so it frames the whole town, not one street. */
function boundsFor(towns: City[]): LngLatBoundsLike {
  const lats = towns.map((c) => c.lat);
  const lngs = towns.map((c) => c.lng);
  const pad = towns.length === 1 ? 0.06 : 0.03; // ~6km / ~3km breathing room
  return [
    [Math.min(...lngs) - pad, Math.min(...lats) - pad],
    [Math.max(...lngs) + pad, Math.max(...lats) + pad],
  ];
}

/**
 * Fixed western-Costa-del-Sol region view used when no towns are passed. Deliberately NOT derived from the city
 * coordinates, so the camera frames the region generally rather than
 * hinting at the exact coverage footprint.
 */
const REGION_BOUNDS: LngLatBoundsLike = [
  [-5.35, 36.3],
  [-4.55, 36.7],
];

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Recolor every layer of the loaded style toward the navy palette. Best-effort per layer. */
function applyBrandStyle(map: MapLibreMap) {
  const layers = map.getStyle()?.layers ?? [];
  for (const layer of layers) {
    const id = layer.id;
    try {
      switch (layer.type) {
        case "background":
          map.setPaintProperty(id, "background-color", MAP_COLORS.background);
          break;
        case "fill": {
          const isWater = /water|ocean|river|lake/i.test(id);
          const isBuilt = /building|residential|industrial|commercial/i.test(id);
          const fill = isWater ? MAP_COLORS.water : isBuilt ? MAP_COLORS.landAlt : MAP_COLORS.land;
          map.setPaintProperty(id, "fill-color", fill);
          map.setPaintProperty(id, "fill-outline-color", fill);
          break;
        }
        case "line": {
          const isWater = /water|river|stream|canal/i.test(id);
          const isBoundary = /boundary|admin/i.test(id);
          const isMajor = /motorway|trunk|primary|major/i.test(id);
          map.setPaintProperty(
            id,
            "line-color",
            isWater ? MAP_COLORS.waterLine : isBoundary ? MAP_COLORS.boundary : isMajor ? MAP_COLORS.roadMajor : MAP_COLORS.roadMinor
          );
          break;
        }
        case "symbol":
          if (/poi/i.test(id)) {
            // POI clutter fights the coverage story on a small canvas.
            map.setLayoutProperty(id, "visibility", "none");
            break;
          }
          map.setPaintProperty(id, "text-color", MAP_COLORS.text);
          map.setPaintProperty(id, "text-halo-color", MAP_COLORS.textHalo);
          break;
        case "fill-extrusion":
          map.setPaintProperty(id, "fill-extrusion-color", MAP_COLORS.landAlt);
          break;
      }
    } catch {
      // Per-layer recolor is best-effort; an unknown paint prop must not kill the map.
    }
  }
}

/** Popup content built via DOM APIs (no HTML string interpolation). */
function buildPopupContent(city: City, t: Copy): HTMLElement {
  const root = document.createElement("div");
  root.className = "coverage-popup-body";

  const name = document.createElement("p");
  name.className = "coverage-popup-name";
  name.textContent = city.name;
  root.appendChild(name);

  const region = document.createElement("p");
  region.className = "coverage-popup-region";
  region.textContent = city.region;
  root.appendChild(region);

  const meta = document.createElement("div");
  meta.className = "coverage-popup-meta";
  if (city.comingSoon) {
    const badge = document.createElement("span");
    badge.className = "coverage-popup-badge";
    badge.textContent = t.launchingSoon;
    meta.appendChild(badge);
  }
  for (const v of city.vehicles) {
    const chip = document.createElement("span");
    chip.className = "coverage-popup-chip";
    chip.textContent = v === "e-scooter" ? t.eScooter : t.eBike;
    meta.appendChild(chip);
  }
  root.appendChild(meta);
  return root;
}

function addCityMarkers(lib: MapLibreModule, map: MapLibreMap, towns: City[], reducedMotion: boolean, t: Copy) {
  for (const city of towns) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "coverage-marker-btn cursor-pointer";
    button.setAttribute(
      "aria-label",
      city.comingSoon ? `${city.name} — ${t.launchingSoonSuffix}` : city.name
    );

    const marker = document.createElement("span");
    marker.className = "coverage-marker";
    if (!reducedMotion) {
      const ring = document.createElement("span");
      ring.className = "coverage-marker-ring";
      marker.appendChild(ring);
    }
    const dot = document.createElement("span");
    dot.className = "coverage-marker-dot";
    marker.appendChild(dot);

    const label = document.createElement("span");
    label.className = "coverage-marker-label";
    label.textContent = city.name;
    marker.appendChild(label);
    button.appendChild(marker);

    const popup = new lib.Popup({
      offset: 20,
      closeButton: false,
      className: "coverage-popup",
      maxWidth: "260px",
    }).setDOMContent(buildPopupContent(city, t));

    new lib.Marker({ element: button, anchor: "center" })
      .setLngLat([city.lng, city.lat])
      .setPopup(popup)
      .addTo(map);
  }
}

/*
 * Illustrated poster: the Mediterranean coast from Alicante to the Strait of
 * Gibraltar in the map's own navy palette. Shown instantly before the map
 * library loads and kept as the permanent fallback (no WebGL, tiles blocked).
 * Announced towns get a labelled marker at their real position; regions with
 * unannounced towns get a soft highlight and a "coming soon" label only, never
 * a dot, so nothing hints at which towns they are.
 */
const POSTER_W = 800;
const POSTER_H = 340;
/** Visible frame: the stretch from the Costa del Sol to Torrevieja, zoomed so labels read on phones. */
const VIEW = { x: 110, w: 640 };
const LON_MIN = -5.75;
const LAT_MAX = 38.55;
const POSTER_SCALE = 128; // px per degree of latitude
const LON_FACTOR = 0.8; // cos(37°): keeps the coast's real proportions
const POSTER_X0 = 80;

function project(lon: number, lat: number): [number, number] {
  return [POSTER_X0 + (lon - LON_MIN) * LON_FACTOR * POSTER_SCALE, (LAT_MAX - lat) * POSTER_SCALE];
}

/** Simplified coastline, north-east to south-west (lon, lat). */
const COAST: [number, number][] = [
  [0.6, 39.6], [0.2, 39.0], [-0.05, 38.75], [-0.48, 38.34], [-0.56, 38.19], [-0.68, 37.98], [-0.76, 37.8], [-0.72, 37.63],
  [-0.98, 37.58], [-1.3, 37.55], [-1.58, 37.4], [-1.85, 37.22], [-2.0, 36.95], [-2.19, 36.72],
  [-2.46, 36.83], [-3.02, 36.74], [-3.52, 36.72], [-3.88, 36.75], [-4.42, 36.71], [-4.62, 36.54],
  [-4.88, 36.5], [-5.15, 36.42], [-5.35, 36.15], [-5.6, 36.01], [-5.9, 36.05], [-6.2, 36.4],
  [-6.35, 36.75], [-6.6, 37.2],
];

const coastPoints = COAST.map(([lon, lat]) => project(lon, lat));
const coastLine = coastPoints.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
// Land is everything north (above) of the coast.
// The drawing is fitted to the panel's width; land and sea run far past the
// viewBox so a taller panel shows more of both instead of empty bands.
const BLEED = 600;
const landArea = `${coastLine} L${-BLEED},${coastPoints.at(-1)![1].toFixed(1)} L${-BLEED},${-BLEED} L${POSTER_W + BLEED},${-BLEED} L${POSTER_W + BLEED},${coastPoints[0][1].toFixed(1)} L${coastPoints[0][0].toFixed(1)},${coastPoints[0][1].toFixed(1)} Z`;

/** Where each region's highlight and label sit (lon, lat). */
const REGION_ANCHORS: Record<LaunchRegion, [number, number]> = {
  "Costa Blanca": [-0.7, 38.0],
  "Costa del Sol": [-4.65, 36.62],
};

function CoverageSvgFallback({ towns, comingSoon }: { towns: City[]; comingSoon: string }) {
  const regions = regionsWithUnannouncedTowns.map((region) => ({ region, at: project(...REGION_ANCHORS[region]) }));
  const markers = towns.map((town) => ({ town, at: project(town.lng, town.lat) }));
  const from = markers[0]?.at;
  const to = regions[0]?.at;
  return (
    <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox={`${VIEW.x} 0 ${VIEW.w} ${POSTER_H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <radialGradient id="poster-region-glow">
          <stop offset="0%" stopColor="#DE0498" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#DE0498" stopOpacity="0" />
        </radialGradient>
        <pattern id="poster-sea-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#1C2E50" />
        </pattern>
      </defs>
      {/* Sea, with a faint dot grid */}
      <rect x={-BLEED} y={-BLEED} width={POSTER_W + BLEED * 2} height={POSTER_H + BLEED * 2} fill="#0A1426" />
      <rect x={-BLEED} y={-BLEED} width={POSTER_W + BLEED * 2} height={POSTER_H + BLEED * 2} fill="url(#poster-sea-grid)" />
      {/* Land and coastline */}
      <path d={landArea} fill="#17243F" />
      <path d={coastLine} fill="none" stroke="#3A4C70" strokeWidth="1.5" strokeLinejoin="round" />

      {/* Regions still to be announced: highlight + label, no town dots */}
      {regions.map(({ region, at: [x, y] }) => (
        <g key={region}>
          <ellipse cx={x} cy={y} rx="130" ry="52" fill="url(#poster-region-glow)" />
          <text x={x} y={y - 40} textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="22" fontWeight="700" fontFamily="Sora Variable, Inter Variable, sans-serif">{region}</text>
          <text x={x} y={y - 16} textAnchor="middle" fill="#F23DB5" fontSize="15" fontWeight="700" fontFamily="Inter Variable, sans-serif" letterSpacing="0.08em">{comingSoon.toUpperCase()}</text>
        </g>
      ))}

      {/* The route from the first launch town towards what's next */}
      {from && to && (
        <path
          d={`M${from[0]},${from[1]} Q${(from[0] + to[0]) / 2},${Math.max(from[1], to[1]) + 70} ${to[0]},${to[1]}`}
          fill="none"
          stroke="#DE0498"
          strokeWidth="1.5"
          strokeDasharray="6 8"
          opacity="0.5"
          className="dash-flow"
        />
      )}

      {/* Announced towns */}
      {markers.map(({ town, at: [x, y] }, i) => (
        <g key={town.slug}>
          <circle cx={x} cy={y} r="24" fill="#DE0498" opacity="0.14" />
          <circle cx={x} cy={y} r="11" fill="none" stroke="#DE0498" strokeWidth="1.5" className="city-pulse-ring" style={{ animationDelay: `${i * 0.4}s` }} />
          <circle cx={x} cy={y} r="7" fill="#DE0498" stroke="#fff" strokeWidth="2" />
          <text x={x - 18} y={y + 7} textAnchor="end" fill="#fff" fontSize="22" fontWeight="700" fontFamily="Sora Variable, Inter Variable, sans-serif">{town.name}</text>
        </g>
      ))}
    </svg>
  );
}

type MapStatus = "idle" | "loading" | "ready" | "fallback";

/**
 * Real interactive coverage map (MapLibre GL + OpenFreeMap tiles — keyless).
 * maplibre-gl (~250KB) is dynamically imported only once the panel scrolls
 * near the viewport; until then (and on any failure) the SVG poster renders.
 *
 * `towns` is the only source of town names (markers, labels, popups, aria,
 * SVG labels) and of the camera bounds. It defaults to `announcedCities`, so
 * no consumer can leak an unannounced town by accident. An empty list shows
 * a fixed Costa del Sol region view with no names.
 */
export function CoverageMap({ towns = announcedCities }: { towns?: City[] } = {}) {
  const showCities = towns.length > 0;
  const wrapRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const startedRef = useRef(false);
  const [status, setStatus] = useState<MapStatus>("idle");
  const [posterVisible, setPosterVisible] = useState(true);
  const locale = useLocale();
  const t = copy[locale];
  // Markers/popups are built once in the async init callback — read the
  // latest copy through a ref.
  const copyRef = useRef(t);
  copyRef.current = t;

  const initMap = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (!supportsWebGL()) {
      setStatus("fallback");
      return;
    }
    setStatus("loading");

    // Open the connection to the tile host now, and fetch the style JSON in
    // parallel with the library instead of after it.
    const origin = new URL(STYLE_URL).origin;
    if (!document.querySelector(`link[rel="preconnect"][href="${origin}"]`)) {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = origin;
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    }

    let lib: MapLibreModule;
    let style: StyleSpecification;
    try {
      [lib, style] = await Promise.all([
        loadMapLibre(),
        fetch(STYLE_URL).then((r) => {
          if (!r.ok) throw new Error(`style ${r.status}`);
          return r.json() as Promise<StyleSpecification>;
        }),
      ]);
    } catch {
      setStatus("fallback");
      return;
    }

    const container = mapContainerRef.current;
    if (!container) {
      setStatus("fallback");
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let map: MapLibreMap;
    try {
      map = new lib.Map({
        container,
        // Pre-fetched style object. OpenFreeMap's style uses absolute URLs for
        // its sources, sprite and glyphs, so it does not need its own base URL.
        style,
        // Initial camera from bounds — set at construction time, so there is
        // no animated fitBounds at all (reduced-motion safe by design).
        // Pre-announcement, frame the region generally instead of the towns.
        bounds: showCities ? boundsFor(towns) : REGION_BOUNDS,
        fitBoundsOptions: { padding: { top: 44, right: 44, bottom: 56, left: 44 } },
        attributionControl: {
          compact: true,
          // Keep the MapLibre credit we'd otherwise drop by overriding the
          // default; OSM/OpenFreeMap credits come from the style's sources.
          customAttribution: '<a href="https://maplibre.org/" target="_blank" rel="noopener">MapLibre</a>',
        },
        cooperativeGestures: true,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        fadeDuration: reduced ? 0 : 300,
        minZoom: 7,
        maxZoom: 15,
      });
    } catch {
      setStatus("fallback");
      return;
    }
    mapRef.current = map;
    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();
    map.addControl(new lib.NavigationControl({ showCompass: false }), "top-right");

    let settled = false;
    const fail = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(failTimer);
      try {
        map.remove();
      } catch {
        // already gone
      }
      mapRef.current = null;
      setStatus("fallback");
    };
    // Hung style/tile fetches never fire 'error'; don't wait forever.
    const failTimer = window.setTimeout(fail, 15000);

    map.on("load", () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(failTimer);
      applyBrandStyle(map);
      // Town markers (names, labels, popups) only after the announcement.
      if (showCities) addCityMarkers(lib, map, towns, reduced, copyRef.current);
      setStatus("ready");
    });
    // Any error before first load (style JSON, glyphs, sprite, initial tiles
    // unreachable) means the map cannot prove anything — show the SVG instead.
    // Errors after a successful load (a single dropped tile) are ignored.
    map.on("error", fail);
  }, [showCities, towns]);

  // The page scrolls inside the #page-scroll lane, not the window: observers
  // must use it as their root or the pre-load margin is clipped away.
  const scrollRoot = useScrollRootNode();

  // Lazy trigger: start the map when the panel comes within 500px of the
  // viewport. The same observer flags the panel as in view so the SVG poster's
  // animations pause while it is off-screen (CSS [data-inview] rule).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.setAttribute("data-inview", "");
      void initMap();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        el.toggleAttribute("data-inview", visible);
        if (visible && !startedRef.current) void initMap();
      },
      { root: scrollRoot, rootMargin: "500px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [initMap, scrollRoot]);

  // Warm the library during idle time after the visitor first scrolls, so the
  // ~270 KB script is parsed before the map arrives instead of mid-scroll.
  useEffect(() => {
    const target: HTMLElement | Window = scrollRoot ?? window;
    const onFirstScroll = () => {
      target.removeEventListener("scroll", onFirstScroll);
      const warm = () => void import("maplibre-gl").catch(() => {});
      if ("requestIdleCallback" in window) window.requestIdleCallback(warm, { timeout: 3000 });
      else setTimeout(warm, 1500);
    };
    target.addEventListener("scroll", onFirstScroll, { passive: true });
    return () => target.removeEventListener("scroll", onFirstScroll);
  }, [scrollRoot]);

  // Teardown on unmount.
  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      role="group"
      aria-label={showCities ? t.mapAria : t.regionMapAria}
      className="coverage-map relative w-full max-w-3xl h-[220px] sm:h-[340px] rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden"
    >
      {/* Poster + permanent fallback (the original SVG visualization) */}
      {posterVisible && <CoverageSvgFallback towns={towns} comingSoon={t.comingNext} />}

      {/* Real map canvas — fades in over the poster once tiles are ready */}
      {status !== "fallback" && (
        <div
          ref={mapContainerRef}
          className={`absolute inset-0 transition-opacity duration-500 ${status === "ready" ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onTransitionEnd={(e) => {
            if (status === "ready" && e.target === e.currentTarget && e.propertyName === "opacity") {
              setPosterVisible(false);
            }
          }}
        />
      )}

      {status === "ready" && (
        <div className="pointer-events-none absolute top-3 left-3 z-10 rounded-full bg-rido-navy/80 border border-rido-magenta/30 px-3 py-1 text-[11px] font-bold text-rido-magenta-light backdrop-blur-sm">
          {t.launchingSoon}
        </div>
      )}
    </div>
  );
}
