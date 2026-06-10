/**
 * Barrel export for `@/lib/maps`.
 *
 * Everything the rest of the backend needs to talk to Mapbox from the
 * server is re-exported from here:
 *
 * ```ts
 * import {
 *   geocode,
 *   reverseGeocode,
 *   getStaticMapUrl,
 *   cacheFor,
 * } from "@/lib/maps";
 * ```
 *
 * The module is server-only — re-exports flow through `server.ts`, which
 * opens with `import "server-only"`. Importing from this barrel in a
 * client component will fail the build, by design.
 *
 * @module src/lib/maps
 */

// ─── Geocoding ───────────────────────────────────────────────────────────
export {
  geocode,
  reverseGeocode,
  type GeocodeResult,
  type ReverseGeocodeInput,
} from "@/lib/maps/server";

// ─── Static images ───────────────────────────────────────────────────────
export {
  getStaticMapUrl,
  type StaticMapOptions,
} from "@/lib/maps/server";

// ─── In-memory cache ─────────────────────────────────────────────────────
export { cacheFor } from "@/lib/maps/server";
