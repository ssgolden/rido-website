"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import "maplibre-gl/dist/maplibre-gl.css";
import { cities, type City } from "@/data/cities";
import type { Map as MapLibreMap, LngLatBoundsLike } from "maplibre-gl";

type MapLibreModule = typeof import("maplibre-gl");

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

/** Bounding box of the five launch towns (Costa del Sol coastline). */
const COVERAGE_BOUNDS: LngLatBoundsLike = (() => {
  const lats = cities.map((c) => c.lat);
  const lngs = cities.map((c) => c.lng);
  const pad = 0.03; // ~3km breathing room around the outermost markers
  return [
    [Math.min(...lngs) - pad, Math.min(...lats) - pad],
    [Math.max(...lngs) + pad, Math.max(...lats) + pad],
  ];
})();

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
function buildPopupContent(city: City): HTMLElement {
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
    badge.textContent = "Launching soon";
    meta.appendChild(badge);
  }
  for (const v of city.vehicles) {
    const chip = document.createElement("span");
    chip.className = "coverage-popup-chip";
    chip.textContent = v === "e-scooter" ? "E-Scooter" : "E-Bike";
    meta.appendChild(chip);
  }
  root.appendChild(meta);
  return root;
}

function addCityMarkers(lib: MapLibreModule, map: MapLibreMap, reducedMotion: boolean) {
  for (const city of cities) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "coverage-marker-btn cursor-pointer";
    button.setAttribute(
      "aria-label",
      city.comingSoon ? `${city.name} — launching soon` : city.name
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
    }).setDOMContent(buildPopupContent(city));

    new lib.Marker({ element: button, anchor: "center" })
      .setLngLat([city.lng, city.lat])
      .setPopup(popup)
      .addTo(map);
  }
}

/**
 * The previous decorative SVG visualization, kept as (a) the instant poster
 * shown before the map library loads and (b) the permanent fallback when
 * WebGL is unavailable or the style/tiles fail to load.
 */
function CoverageSvgFallback() {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 260" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      {/* Coastline path */}
      <path d="M40,180 Q120,140 200,155 Q300,170 380,120 Q460,80 560,100 Q640,110 720,85 Q760,75 780,80" fill="none" stroke="#DE0498" strokeWidth="1" strokeDasharray="6 8" opacity="0.15" className="dash-flow" />
      {/* Sea area */}
      <path d="M40,180 Q120,140 200,155 Q300,170 380,120 Q460,80 560,100 Q640,110 720,85 Q760,75 780,80 L780,260 L40,260 Z" fill="rgba(222,4,152,0.02)" />

      {/* Connection lines between cities */}
      {cities.map((city, i) => {
        if (i === 0) return null;
        const total = cities.length;
        const margin = 80;
        const available = 800 - margin * 2;
        const step = total > 1 ? available / (total - 1) : 0;
        const prevX = margin + step * (i - 1);
        const prevY = 120 + ((i - 1) % 2 === 0 ? 20 : -25);
        const currX = margin + step * i;
        const currY = 120 + (i % 2 === 0 ? 20 : -25);
        return (
          <line key={`line-${city.slug}`} x1={prevX} y1={prevY} x2={currX} y2={currY} stroke="#DE0498" strokeWidth="0.8" strokeDasharray="3 5" opacity="0.15" className="dash-flow-short" />
        );
      })}

      {/* City markers */}
      {cities.map((city, i) => {
        const total = cities.length;
        const margin = 80;
        const available = 800 - margin * 2;
        const step = total > 1 ? available / (total - 1) : 0;
        const x = margin + step * i;
        const y = 120 + (i % 2 === 0 ? 20 : -25);
        return (
          <g key={city.slug}>
            {/* Outer pulse ring */}
            <circle cx={x} cy={y} r="6" fill="none" stroke="#DE0498" strokeWidth="0.8" opacity="0.4" className="city-pulse-ring" style={{ animationDelay: `${i * 0.4}s` }} />
            {/* Middle ring */}
            <circle cx={x} cy={y} r="8" fill="none" stroke="#DE0498" strokeWidth="0.5" opacity="0.2" />
            {/* Inner dot */}
            <circle cx={x} cy={y} r="4" fill="#DE0498" opacity="0.9" className="city-dot-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
            {/* Glow */}
            <circle cx={x} cy={y} r="12" fill="#DE0498" opacity="0.08" />
            {/* City name */}
            <text x={x} y={y - 14} textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="11" fontFamily="Inter Variable, Inter, sans-serif" fontWeight="700">{city.name}</text>
          </g>
        );
      })}
    </svg>
  );
}

type MapStatus = "idle" | "loading" | "ready" | "fallback";

/**
 * Real interactive coverage map (MapLibre GL + OpenFreeMap tiles — keyless).
 * maplibre-gl (~250KB) is dynamically imported only once the panel scrolls
 * near the viewport; until then (and on any failure) the SVG poster renders.
 */
export function CoverageMap() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const startedRef = useRef(false);
  const [status, setStatus] = useState<MapStatus>("idle");
  const [posterVisible, setPosterVisible] = useState(true);
  const prefersReducedMotion = useReducedMotion();
  const reducedRef = useRef(prefersReducedMotion);
  reducedRef.current = prefersReducedMotion;

  const initMap = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (!supportsWebGL()) {
      setStatus("fallback");
      return;
    }
    setStatus("loading");

    let lib: MapLibreModule;
    try {
      lib = await import("maplibre-gl");
    } catch {
      setStatus("fallback");
      return;
    }

    const container = mapContainerRef.current;
    if (!container) {
      setStatus("fallback");
      return;
    }

    const reduced = reducedRef.current ?? false;
    let map: MapLibreMap;
    try {
      map = new lib.Map({
        container,
        style: STYLE_URL,
        // Initial camera from bounds — set at construction time, so there is
        // no animated fitBounds at all (reduced-motion safe by design).
        bounds: COVERAGE_BOUNDS,
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
      addCityMarkers(lib, map, reduced);
      setStatus("ready");
    });
    // Any error before first load (style JSON, glyphs, sprite, initial tiles
    // unreachable) means the map cannot prove anything — show the SVG instead.
    // Errors after a successful load (a single dropped tile) are ignored.
    map.on("error", fail);
  }, []);

  // Lazy trigger: only pull in maplibre-gl when the panel approaches the viewport.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || startedRef.current) return;
    if (typeof IntersectionObserver === "undefined") {
      void initMap();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          void initMap();
        }
      },
      { rootMargin: "500px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [initMap]);

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
      aria-label="Map of Rido launch towns on the Costa del Sol — all launching soon"
      className="coverage-map relative w-full max-w-3xl h-[220px] sm:h-[340px] rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden"
    >
      {/* Poster + permanent fallback (the original SVG visualization) */}
      {posterVisible && <CoverageSvgFallback />}

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
          Launching soon
        </div>
      )}
    </div>
  );
}
