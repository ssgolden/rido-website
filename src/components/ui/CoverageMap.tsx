"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { announcedCities, type City } from "@/data/cities";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/config";
import { LoaderCircle, Map as MapIcon } from "lucide-react";
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
    /** Sea label on the poster. */
    sea: "Mediterranean",
    exploreMap: "Explore map",
    loadingMap: "Loading map…",
    /** Lowercase suffix appended to marker aria-labels: "<City> — launching soon". */
    launchingSoonSuffix: "launching soon",
    eScooter: "E-Scooter",
    eBike: "E-Bike",
  },
  es: {
    mapAria: "Mapa de las ciudades de lanzamiento de Rido — muy pronto",
    regionMapAria: "Mapa de la región de la Costa del Sol — las ciudades de lanzamiento de Rido se anunciarán muy pronto",
    launchingSoon: "Próximamente",
    sea: "Mediterráneo",
    exploreMap: "Explorar el mapa",
    loadingMap: "Cargando el mapa…",
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
 * Illustrated poster: the real Costa Blanca coast, traced from Cabo de Palos
 * north to Cabo de la Nao, in the map's own navy palette. Shown instantly
 * before the map library loads and kept as the permanent fallback (no WebGL,
 * tiles blocked). Equirectangular projection (x = lon · cos 38.2°, y = −lat),
 * so the shoreline keeps its true proportions and locals recognise the
 * Torrevieja bay, Cabo Roig, the Santa Pola cape, Tabarca and the two salt
 * lagoons. Announced towns get a labelled marker at their real position;
 * nothing else is named.
 */
const POSTER_SCALE = 400; // user units per degree of latitude
const LON_FACTOR = Math.cos((38.2 * Math.PI) / 180); // longitude shrink at this latitude
/** Visible frame (lon/lat): the Mar Menor to Alicante bay, Torrevieja left of centre. */
const FRAME = { west: -1.12, east: 0.24, south: 37.58, north: 38.4 };
const VIEW_W = (FRAME.east - FRAME.west) * LON_FACTOR * POSTER_SCALE;
const VIEW_H = (FRAME.north - FRAME.south) * POSTER_SCALE;
/** Land and sea run far past the frame so a wider or taller panel shows more coast, never an empty band. */
const BLEED = 800;

function project(lon: number, lat: number): [number, number] {
  return [(lon - FRAME.west) * LON_FACTOR * POSTER_SCALE, (FRAME.north - lat) * POSTER_SCALE];
}

/**
 * Coastline, south-west to north-east (lon, lat): the Cartagena shore east of
 * Portmán, Cabo de Palos, the outer beach of La Manga, Torre de la Horadada,
 * Cabo Roig, Punta Prima, the Torrevieja bay and harbour, Cabo Cervera, La
 * Mata, the Guardamar dunes and Segura mouth, the Santa Pola salt flats and
 * cape, Arenales, Alicante bay and Cabo de las Huertas, San Juan, El Campello,
 * Villajoyosa, Benidorm bay, Sierra Helada, Altea, Mascarat, Calpe and the
 * Peñón, Moraira, Granadella and Cabo de la Nao.
 */
const COAST: [number, number][] = [
  [-0.95, 37.572], [-0.85, 37.58], [-0.76, 37.6], // Cartagena shore
  [-0.685, 37.632], // Cabo de Palos
  [-0.715, 37.66], [-0.735, 37.7], [-0.75, 37.74], [-0.758, 37.78], [-0.765, 37.815], // La Manga
  [-0.77, 37.84], [-0.765, 37.86], [-0.755, 37.877], // San Pedro, Torre de la Horadada
  [-0.745, 37.892], [-0.738, 37.902], // Mil Palmeras, Campoamor
  [-0.715, 37.914], [-0.71, 37.926], [-0.7, 37.94], // Cabo Roig, Cala Capitán, Punta Prima
  [-0.69, 37.958], [-0.681, 37.971], [-0.672, 37.983], [-0.665, 37.995], // Náufragos, harbour, Cura, Los Locos
  [-0.658, 38.005], [-0.65, 38.02], [-0.64, 38.045], // Cabo Cervera, La Mata beach
  [-0.635, 38.07], [-0.64, 38.105], // Guardamar dunes, Segura mouth
  [-0.62, 38.14], [-0.6, 38.165], [-0.565, 38.19], [-0.515, 38.205], // La Marina, salt flats, Santa Pola, its cape
  [-0.515, 38.25], [-0.515, 38.29], // Arenales, Urbanova
  [-0.49, 38.335], [-0.47, 38.35], [-0.44, 38.36], [-0.41, 38.355], // Alicante port, Postiguet, Albufereta, Cabo de las Huertas
  [-0.405, 38.39], [-0.39, 38.425], [-0.33, 38.46], // San Juan, El Campello, Coveta Fumà
  [-0.23, 38.505], [-0.18, 38.52], // Villajoyosa, Finestrat
  [-0.14, 38.53], [-0.1, 38.54], [-0.07, 38.535], [-0.05, 38.56], // Benidorm bay, Sierra Helada
  [-0.06, 38.575], [-0.05, 38.6], [-0.01, 38.62], // Albir, Altea, Mascarat
  [0.04, 38.64], [0.075, 38.632], [0.08, 38.65], // Calpe, Peñón de Ifach
  [0.135, 38.685], [0.15, 38.68], [0.19, 38.715], [0.235, 38.73], // Moraira, Cap d'Or, Granadella, Cabo de la Nao
];

/** Mar Menor shoreline (lon, lat), clockwise from the Encañizadas. */
const MAR_MENOR: [number, number][] = [
  [-0.785, 37.815], [-0.77, 37.78], [-0.765, 37.74], [-0.755, 37.7], [-0.745, 37.665], [-0.76, 37.645],
  [-0.8, 37.64], [-0.84, 37.655], [-0.86, 37.69], [-0.87, 37.73], [-0.865, 37.77], [-0.84, 37.8], [-0.81, 37.815],
];

/** Salt lagoons inland of Torrevieja: centre (lon, lat), radii in degrees (lon, lat), rotation. */
const LAGOONS = [
  { id: "torrevieja", at: [-0.73, 37.993] as const, rx: 0.026, ry: 0.029, rotate: 15 },
  { id: "la-mata", at: [-0.7, 38.031] as const, rx: 0.019, ry: 0.012, rotate: 0 },
];

/** Tabarca island (lon, lat), radii in degrees. */
const TABARCA = { at: [-0.479, 38.166] as const, rx: 0.011, ry: 0.0035 };

const toPath = (points: [number, number][]) =>
  points.map(([lon, lat], i) => {
    const [x, y] = project(lon, lat);
    return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

const coastLine = toPath(COAST);
const [coastStartX, coastStartY] = project(...COAST[0]);
const [coastEndX] = project(...COAST[COAST.length - 1]);
// Land is everything west and north of the coast: close the shape through the bleed.
const landArea = `${coastLine} L${coastEndX.toFixed(1)},${-BLEED} L${-BLEED},${-BLEED} L${-BLEED},${(coastStartY + BLEED).toFixed(1)} L${coastStartX.toFixed(1)},${(coastStartY + BLEED).toFixed(1)} Z`;
const marMenor = `${toPath(MAR_MENOR)} Z`;

const SEA = "#0A1426";
const SEA_LINE = "#1C2E50";
const LAND = "#17243F";
const COAST_STROKE = "#3A4C70";
const LAGOON = "#0D1A33";

function CoverageSvgFallback({ towns, seaLabel }: { towns: City[]; seaLabel: string }) {
  const markers = towns.map((town) => ({ town, at: project(town.lng, town.lat) }));
  const seaAt = project(-0.33, 37.86);
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox={`0 0 ${VIEW_W.toFixed(1)} ${VIEW_H.toFixed(1)}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <pattern id="poster-sea-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill={SEA_LINE} />
        </pattern>
      </defs>
      {/* Sea, with a faint dot grid */}
      <rect x={-BLEED} y={-BLEED} width={VIEW_W + BLEED * 2} height={VIEW_H + BLEED * 2} fill={SEA} />
      <rect x={-BLEED} y={-BLEED} width={VIEW_W + BLEED * 2} height={VIEW_H + BLEED * 2} fill="url(#poster-sea-grid)" />
      {/* Land and coastline */}
      <path d={landArea} fill={LAND} />
      <path d={coastLine} fill="none" stroke={COAST_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      {/* Mar Menor */}
      <path d={marMenor} fill={LAGOON} stroke={COAST_STROKE} strokeWidth="1" strokeLinejoin="round" />
      {/* Salt lagoons */}
      {LAGOONS.map(({ id, at: [lon, lat], rx, ry, rotate }) => {
        const [x, y] = project(lon, lat);
        return (
          <ellipse
            key={id}
            cx={x}
            cy={y}
            rx={rx * LON_FACTOR * POSTER_SCALE}
            ry={ry * POSTER_SCALE}
            transform={`rotate(${rotate} ${x.toFixed(1)} ${y.toFixed(1)})`}
            fill={LAGOON}
            stroke={COAST_STROKE}
            strokeWidth="1"
          />
        );
      })}
      {/* Tabarca */}
      {(() => {
        const [x, y] = project(...TABARCA.at);
        return <ellipse cx={x} cy={y} rx={TABARCA.rx * LON_FACTOR * POSTER_SCALE} ry={TABARCA.ry * POSTER_SCALE} fill={LAND} stroke={COAST_STROKE} strokeWidth="1" />;
      })()}

      <text x={seaAt[0]} y={seaAt[1]} textAnchor="middle" fill="rgba(148,163,184,0.55)" fontSize="15" fontWeight="600" fontFamily="Inter Variable, sans-serif" letterSpacing="0.22em">{seaLabel.toUpperCase()}</text>

      {/* Announced towns */}
      {markers.map(({ town, at: [x, y] }, i) => (
        <g key={town.slug}>
          <circle cx={x} cy={y} r="16" fill="#DE0498" opacity="0.14" />
          <circle cx={x} cy={y} r="11" fill="none" stroke="#DE0498" strokeWidth="1.5" className="city-pulse-ring" style={{ animationDelay: `${i * 0.4}s` }} />
          <circle cx={x} cy={y} r="7" fill="#DE0498" stroke="#fff" strokeWidth="2" />
          <text x={x + 18} y={y + 7} textAnchor="start" fill="#fff" fontSize="22" fontWeight="700" fontFamily="Sora Variable, Inter Variable, sans-serif">{town.name}</text>
        </g>
      ))}
    </svg>
  );
}

type MapStatus = "idle" | "loading" | "ready" | "fallback";

/**
 * Real interactive coverage map (MapLibre GL + OpenFreeMap tiles — keyless).
 * maplibre-gl (~250KB) is dynamically imported only when the visitor taps
 * "Explore map" or the panel comes within ~1.5 viewports — never on first
 * paint or first scroll; until then (and on any failure) the SVG poster renders.
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
  useEffect(() => {
    copyRef.current = t;
  }, [t]);

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

  // Lazy trigger: start the map once the panel is within ~1.5 viewports
  // (rootMargin is relative to the root's height) — but only after the
  // visitor has scrolled a quarter of a screen, so the ~270 KB library is
  // never fetched on first paint (the panel sits right under the hero) nor on
  // a stray first scroll. The same observer flags the panel as in view so the
  // SVG poster's animations pause while it is off-screen (CSS [data-inview]
  // rule). Without IntersectionObserver the button is the only way in.
  const armedRef = useRef(false);
  const nearRef = useRef(false);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const root = scrollRoot ?? document.getElementById("page-scroll");
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        nearRef.current = visible;
        el.toggleAttribute("data-inview", visible);
        if (visible && armedRef.current && !startedRef.current) void initMap();
      },
      { root, rootMargin: "150% 0px" }
    );
    io.observe(el);

    const scroller: HTMLElement | Window = root ?? window;
    const onScroll = () => {
      const top = scroller instanceof Window ? scroller.scrollY : scroller.scrollTop;
      const height = scroller instanceof Window ? scroller.innerHeight : scroller.clientHeight;
      if (top < height * 0.25) return;
      armedRef.current = true;
      scroller.removeEventListener("scroll", onScroll);
      if (nearRef.current && !startedRef.current) void initMap();
    };
    if (!armedRef.current) scroller.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      scroller.removeEventListener("scroll", onScroll);
    };
  }, [initMap, scrollRoot]);

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
      className="coverage-map relative w-full max-w-3xl h-[260px] sm:h-[340px] rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden"
    >
      {/* Poster + permanent fallback (the traced-coast SVG) */}
      {posterVisible && <CoverageSvgFallback towns={towns} seaLabel={t.sea} />}

      {/* Tap to load the live map before scrolling brings it near; gone once the map is up or impossible. */}
      {status !== "ready" && status !== "fallback" && (
        <button
          type="button"
          onClick={() => void initMap()}
          disabled={status === "loading"}
          aria-busy={status === "loading"}
          className="absolute bottom-3 right-3 z-10 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-rido-navy/80 px-4 text-sm font-semibold text-white backdrop-blur-sm cursor-pointer hover:border-rido-magenta/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rido-magenta disabled:cursor-default"
        >
          {status === "loading" ? (
            <LoaderCircle className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />
          ) : (
            <MapIcon className="h-4 w-4" aria-hidden="true" />
          )}
          {status === "loading" ? t.loadingMap : t.exploreMap}
        </button>
      )}

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
