/**
 * Server-side Mapbox helpers for the Rido platform.
 *
 * This module owns:
 *   1. {@link geocode}           — forward-geocode a free-form address into
 *                                  `{ lat, lng, formattedAddress }` via the
 *                                  Mapbox Geocoding API v5.
 *   2. {@link reverseGeocode}    — resolve a `{ lat, lng }` pair back into a
 *                                  human-readable address.
 *   3. {@link getStaticMapUrl}   — build a Mapbox Static Images API URL for a
 *                                  given point, with optional magenta pin.
 *   4. {@link cacheFor}          — a 24-hour in-memory `fetch` wrapper keyed by
 *                                  URL. Used internally to keep the Geocoding
 *                                  API bill under control for repeated lookups
 *                                  (e.g. the same address re-rendered on every
 *                                  page load).
 *
 * Conventions:
 *   - Auth is read from `MAPBOX_SECRET_TOKEN` via {@link getEnv}. The module
 *     throws if the secret is missing or if a request fails — callers that
 *     want softer behaviour should wrap calls in `try/catch`.
 *   - All four exports are server-only (`"server-only"` import guard at the
 *     top of the module). Importing this file from a client component will
 *     fail the build.
 *   - URLs are built with `URL`/`URLSearchParams` rather than string
 *     concatenation so query values are always correctly encoded.
 *
 * @module src/lib/maps/server
 */

import "server-only";
import { getEnv } from "@/lib/contract";

// ─── Constants ────────────────────────────────────────────────────────────

/** Base URL for the Mapbox Geocoding API v5. */
const GEOCODING_BASE = "https://api.mapbox.com/geocoding/v5/mapbox.places";

/**
 * Base URL for the Mapbox Static Images API. We always render against the
 * `dark-v11` style to match the Rido brand (dark mode only, magenta
 * accent) and we always request the `@2x` retina variant.
 */
const STATIC_IMAGES_BASE =
  "https://api.mapbox.com/styles/v1/mapbox/dark-v11/static";

/** Default zoom level for the static map — close enough to read a street. */
const DEFAULT_ZOOM = 14;

/** Default rendered width in CSS pixels. */
const DEFAULT_WIDTH = 600;

/** Default rendered height in CSS pixels. */
const DEFAULT_HEIGHT = 400;

/**
 * Mapbox `pin-s` icon colour, hex without the leading `#`. Rido brand
 * magenta: `#DE0498` → `de0498`. Saturated a hair hotter to read well on
 * the dark style.
 */
const PIN_COLOR = "ff0099";

/** TTL for {@link cacheFor}, expressed in milliseconds (24 hours). */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// ─── Public types ─────────────────────────────────────────────────────────

/**
 * A geocoded location. Returned by both {@link geocode} and
 * {@link reverseGeocode} so the rest of the app can treat the two as
 * interchangeable.
 */
export interface GeocodeResult {
  /** Latitude in decimal degrees (WGS84). */
  lat: number;
  /** Longitude in decimal degrees (WGS84). */
  lng: number;
  /** The human-readable address as formatted by Mapbox. */
  formattedAddress: string;
}

/**
 * Input for {@link reverseGeocode}. Object form (rather than positional
 * args) keeps call sites readable and forwards-compatible with future
 * options (e.g. `language`, `types`).
 */
export interface ReverseGeocodeInput {
  /** Latitude in decimal degrees (WGS84). */
  lat: number;
  /** Longitude in decimal degrees (WGS84). */
  lng: number;
}

/**
 * Options for {@link getStaticMapUrl}. All fields are optional and have
 * sensible defaults tuned for the Rido dark/magenta aesthetic.
 */
export interface StaticMapOptions {
  /** Latitude of the map centre. */
  lat: number;
  /** Longitude of the map centre. */
  lng: number;
  /**
   * Zoom level. `0` = world, `22` = building. Defaults to {@link DEFAULT_ZOOM}
   * which is roughly "street" level — close enough to see the pin, far
   * enough to keep the surrounding neighbourhood in frame.
   */
  zoom?: number;
  /** Output width in CSS pixels (rendered at `@2x` = 2× device pixels). */
  width?: number;
  /** Output height in CSS pixels (rendered at `@2x` = 2× device pixels). */
  height?: number;
  /**
   * Whether to overlay the magenta pin at the centre coordinate. Defaults
   * to `true` — for the typical "show me a vehicle here" use case the pin
   * is the whole point of the image. Set to `false` to render a plain
   * basemap.
   */
  marker?: boolean;
}

// ─── Mapbox wire types ────────────────────────────────────────────────────

/**
 * Subset of the Mapbox Geocoding API response that we actually read.
 * Documented at https://docs.mapbox.com/api/search/geocoding/.
 */
interface MapboxGeocodingResponse {
  features?: Array<{
    /** "Place name" formatted by Mapbox, e.g. `"1600 Pennsylvania Ave NW, Washington, District of Columbia 20500, United States"`. */
    place_name?: string;
    /** Mapbox `Feature` centre, in `[lng, lat]` order. */
    center?: [number, number];
  }>;
  /** Top-level error message set by Mapbox on 4xx/5xx. */
  message?: string;
}

// ─── Internal helpers ─────────────────────────────────────────────────────

/**
 * Resolve and return the Mapbox secret token, throwing a descriptive
 * error if it is not configured. Centralised so the three call sites all
 * produce the same message.
 *
 * @returns The non-empty `MAPBOX_SECRET_TOKEN` value.
 * @throws {Error} If the env var is missing or empty.
 */
function requireMapboxToken(): string {
  const env = getEnv();
  const token = env.MAPBOX_SECRET_TOKEN;
  if (!token || token.length === 0) {
    throw new Error(
      "MAPBOX_SECRET_TOKEN is not configured. Set it in .env to enable server-side geocoding. See .env.example for the full list.",
    );
  }
  return token;
}

/**
 * Parse a Mapbox Geocoding API response and pull the first feature's
 * coordinates + formatted address. Returns `null` if the response is
 * well-formed but has no features (i.e. the address was not found).
 *
 * @param payload The raw JSON body from the Mapbox Geocoding API.
 * @returns The first feature as a {@link GeocodeResult}, or `null` if
 *          the response contained no features.
 */
function pickFirstFeature(
  payload: MapboxGeocodingResponse,
): GeocodeResult | null {
  const feature = payload.features?.[0];
  if (!feature) return null;
  const center = feature.center;
  if (!center || center.length < 2) return null;
  // Mapbox returns coordinates in [lng, lat] order — flip them into the
  // more conventional { lat, lng } shape that the rest of the app uses.
  const [lng, lat] = center;
  return {
    lat,
    lng,
    formattedAddress: feature.place_name ?? "",
  };
}

// ─── Public API: geocoding ────────────────────────────────────────────────

/**
 * Forward-geocode a free-form address into coordinates.
 *
 * Wraps `https://api.mapbox.com/geocoding/v5/mapbox.places/{address}.json`
 * with a `limit=1` constraint and returns the top match (or `null` if
 * Mapbox found nothing for the input).
 *
 * The response is cached in-memory for 24 hours via {@link cacheFor}, so
 * repeated renders of the same address do not re-bill the Mapbox quota.
 *
 * @param address The address string to geocode. Will be URL-encoded by
 *                the helper — callers do not need to pre-encode it.
 * @returns A {@link GeocodeResult} for the best match, or `null` if
 *          Mapbox returned no features for the input.
 * @throws {Error} If `MAPBOX_SECRET_TOKEN` is missing, or if the upstream
 *                 request fails for any reason (network error, non-2xx
 *                 status, malformed JSON, etc.).
 *
 * @example
 * ```ts
 * const hit = await geocode("Calle Mayor 1, Madrid, Spain");
 * if (hit) {
 *   console.log(hit.lat, hit.lng, hit.formattedAddress);
 * }
 * ```
 */
export async function geocode(
  address: string,
): Promise<GeocodeResult | null> {
  if (!address || address.trim().length === 0) {
    // Treat empty input as "no result" rather than wasting an API call.
    return null;
  }
  const token = requireMapboxToken();
  const url =
    `${GEOCODING_BASE}/${encodeURIComponent(address)}.json`
    + `?access_token=${encodeURIComponent(token)}`
    + `&limit=1`;
  const payload = await cacheFor(url, () => fetchJson(url));
  return pickFirstFeature(payload);
}

/**
 * Reverse-geocode a coordinate pair into a human-readable address.
 *
 * Same upstream API as {@link geocode}, but the path segment is
 * `{lng},{lat}` instead of a free-form string. Mapbox returns the most
 * specific feature that contains the point; we keep the top match.
 *
 * The response is cached in-memory for 24 hours via {@link cacheFor}.
 *
 * @param input The `{ lat, lng }` pair to resolve. See {@link ReverseGeocodeInput}.
 * @returns A {@link GeocodeResult} for the best match, or `null` if
 *          Mapbox returned no features.
 * @throws {Error} If `MAPBOX_SECRET_TOKEN` is missing, or if the upstream
 *                 request fails for any reason.
 *
 * @example
 * ```ts
 * const hit = await reverseGeocode({ lat: 40.4168, lng: -3.7038 });
 * // → { lat: 40.4168, lng: -3.7038, formattedAddress: "Madrid, Spain" }
 * ```
 */
export async function reverseGeocode(
  input: ReverseGeocodeInput,
): Promise<GeocodeResult | null> {
  const { lat, lng } = input;
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const token = requireMapboxToken();
  const url =
    `${GEOCODING_BASE}/${lng},${lat}.json`
    + `?access_token=${encodeURIComponent(token)}`
    + `&limit=1`;
  const payload = await cacheFor(url, () => fetchJson(url));
  return pickFirstFeature(payload);
}

// ─── Public API: static maps ──────────────────────────────────────────────

/**
 * Build a Mapbox Static Images API URL for a given point.
 *
 * Produces a URL against the `dark-v11` style with `@2x` retina output
 * and (by default) a magenta `pin-s+ff0099(lng,lat)` overlay. Returned
 * as a string so the caller can drop it straight into an `<img src=…>`
 * or a `next/image` `src` prop.
 *
 * This helper does NOT fetch the image — the browser does that on render.
 * Building the URL is cheap and cacheable, so we keep it pure and let the
 * `<img>` tag's own HTTP cache handle the actual bytes.
 *
 * @param options Map centre + optional zoom/width/height/marker. See
 *                {@link StaticMapOptions}. All fields except `lat` and
 *                `lng` have defaults.
 * @returns A fully-formed Mapbox Static Images URL ready to be assigned
 *          to an `src` attribute.
 * @throws {Error} If `MAPBOX_SECRET_TOKEN` is missing (the URL is useless
 *                 without it). Forwards the error from
 *                 {@link requireMapboxToken}.
 *
 * @example
 * ```ts
 * const url = getStaticMapUrl({ lat: 40.4168, lng: -3.7038 });
 * // → "https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s+ff0099(-3.7038,40.4168)/-3.7038,40.4168,14,600x400@2x?access_token=…"
 * ```
 */
export function getStaticMapUrl(options: StaticMapOptions): string {
  const {
    lat,
    lng,
    zoom = DEFAULT_ZOOM,
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
    marker = true,
  } = options;

  if (typeof lat !== "number" || typeof lng !== "number") {
    throw new Error("getStaticMapUrl: `lat` and `lng` must be numbers.");
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("getStaticMapUrl: `lat` and `lng` must be finite numbers.");
  }
  if (!Number.isFinite(zoom) || zoom < 0 || zoom > 22) {
    throw new Error("getStaticMapUrl: `zoom` must be a finite number in [0, 22].");
  }
  if (!Number.isFinite(width) || width <= 0) {
    throw new Error("getStaticMapUrl: `width` must be a positive number.");
  }
  if (!Number.isFinite(height) || height <= 0) {
    throw new Error("getStaticMapUrl: `height` must be a positive number.");
  }

  const token = requireMapboxToken();
  const overlay = marker ? `pin-s+${PIN_COLOR}(${lng},${lat})/` : "";
  const viewport = `${lng},${lat},${zoom},${width}x${height}@2x`;
  const params = new URLSearchParams({ access_token: token });
  return `${STATIC_IMAGES_BASE}/${overlay}${viewport}?${params.toString()}`;
}

// ─── In-memory 24h cache ──────────────────────────────────────────────────

/**
 * Single cache entry: the parsed JSON body and the wall-clock time at
 * which it should be considered stale. We store the parsed body (not the
 * raw `Response`) because `cacheFor` is generic over `T` and the caller
 * decides how to interpret the bytes.
 */
interface CacheEntry<T> {
  /** Parsed value returned by `loader`. */
  value: T;
  /** `Date.now()` value at which this entry expires. */
  expiresAt: number;
}

/**
 * Module-level cache. Lives for the lifetime of the Node process — which
 * on Vercel's serverless functions means "per warm instance". For cold
 * starts the cache starts empty, which is fine: the worst case is one
 * extra upstream call per cold start.
 */
const responseCache = new Map<string, CacheEntry<unknown>>();

/**
 * Wrap an async loader (typically a `fetch` + `res.json()` pair) with a
 * 24-hour in-memory cache keyed by `url`. The cache is best-effort: it
 * is intentionally simple and does NOT survive process restarts, does
 * NOT coordinate across instances, and does NOT enforce a max size.
 *
 * Behaviour:
 *   - Cache HIT  → return the previously parsed value, no upstream call.
 *   - Cache MISS → call `loader`, store its resolved value with a
 *                  24-hour TTL, and return it. The `loader` is invoked
 *                  exactly once per cache miss even if multiple callers
 *                  race for the same key (the in-flight promise is
 *                  de-duplicated via {@link inflight}).
 *   - Loader throws → the error propagates to the caller AND the entry
 *                  is NOT cached, so the next caller can retry.
 *
 * @param url The cache key. Conventionally the request URL — callers
 *            should pass the same string they hand to `fetch`.
 * @param loader The async function that produces the value on a miss.
 *               Typically `() => fetchJson(url)`.
 * @returns The cached or freshly loaded value.
 *
 * @typeParam T The shape of the parsed value. Inferred from `loader`'s
 *              return type.
 */
export async function cacheFor<T>(
  url: string,
  loader: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const hit = responseCache.get(url) as CacheEntry<T> | undefined;
  if (hit && hit.expiresAt > now) {
    return hit.value;
  }
  // Expired entries are dropped eagerly so the Map does not grow
  // unbounded for long-lived processes. Misses on already-evicted
  // entries just call `loader` again.
  if (hit) responseCache.delete(url);

  // De-duplicate concurrent requests for the same key. Without this,
  // 10 simultaneous renders of the same address would issue 10 upstream
  // calls and then race to write the cache.
  const existing = inflight.get(url) as Promise<T> | undefined;
  if (existing) return existing;

  const promise = loader()
    .then((value) => {
      responseCache.set(url, { value, expiresAt: now + CACHE_TTL_MS });
      return value;
    })
    .finally(() => {
      inflight.delete(url);
    });
  inflight.set(url, promise);
  return promise;
}

/**
 * In-flight request registry, keyed by URL. Lets concurrent callers
 * share a single upstream call when the cache is cold.
 */
const inflight = new Map<string, Promise<unknown>>();

// ─── Internal: fetch + JSON helper ────────────────────────────────────────

/**
 * Issue a GET request, assert the response is OK, and return the parsed
 * JSON body. Centralised so all Mapbox calls share the same error
 * handling and so the cache wrapper above can stay generic.
 *
 * @param url The fully-formed request URL.
 * @returns The parsed JSON body, typed as `unknown` — callers narrow it
 *          to {@link MapboxGeocodingResponse} (or whatever the endpoint
 *          actually returns) at the use site.
 * @throws {Error} If the response status is not in the 200–299 range, or
 *                 if the body is not valid JSON. The thrown message
 *                 includes the HTTP status and, when available, the
 *                 Mapbox `message` field so log lines are debuggable.
 */
async function fetchJson(url: string): Promise<MapboxGeocodingResponse> {
  let res: Response;
  try {
    res = await fetch(url, { method: "GET" });
  } catch (err) {
    const detail = (err as Error)?.message ?? String(err);
    throw new Error(`Mapbox request failed (network error): ${detail}`);
  }
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new Error(
      `Mapbox request failed: response was not valid JSON (status ${res.status}).`,
    );
  }
  if (!res.ok) {
    // `body` is `unknown` after `res.json()`; probe defensively for the
    // optional `message` field that the Mapbox API uses for errors.
    const message =
      typeof body === "object" && body !== null && "message" in body
        ? String((body as { message?: unknown }).message)
        : `HTTP ${res.status}`;
    throw new Error(`Mapbox request failed (${res.status}): ${message}`);
  }
  // `body` is `unknown` after `res.json()`; narrow to the Mapbox shape
  // we actually read. The shape is permissive (all fields optional) so
  // a hostile or buggy upstream cannot blow up type-checking.
  return (body ?? {}) as MapboxGeocodingResponse;
}
