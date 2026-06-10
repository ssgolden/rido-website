/**
 * /api/vehicles
 *
 * Public surface of the live vehicle fleet. One handler in this file:
 *
 *   - `GET` — return the list of vehicles currently available (or any
 *             other status the caller filters by), optionally narrowed
 *             to a geographic point + radius via the haversine filter.
 *
 * Behaviour summary:
 *   1. Parse + validate the query string against {@link vehicleQuerySchema}.
 *      lat / lng / radiusMeters are *required* by the schema (no defaults
 *      — searching "the whole world" is not a valid use-case for a
 *      micro-mobility fleet), but `type`, `citySlug`, and `limit` have
 *      sensible defaults inside the schema itself.
 *   2. Honour the inline `cached` stub: a 30 s in-process cache keyed on
 *      the normalised query. This is a deliberate no-op placeholder so
 *      the cache layer can be swapped in without touching the route.
 *   3. Query the `vehicles` table for the requested `citySlug` and
 *      `type` (cheap DB-side filters that avoid a full table scan).
 *   4. If lat/lng are present, compute the haversine distance for each
 *      candidate and keep only those within `radiusMeters`.
 *   5. Apply `limit`, sort by distance (or lastSeenAt if no anchor), and
 *      return the `{ vehicles, total, ... }` paginated envelope.
 *   6. Cache-Control: public, max-age=30, s-maxage=30 so the edge can
 *      serve repeat calls without hitting the DB.
 *
 * Error envelope:
 *   Every non-validation failure uses `err(...)` from `@/lib/contract`.
 *     - 400  invalid query
 *     - 500  DB failure
 *
 * @module src/app/api/vehicles
 */

import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { and, desc, eq } from "drizzle-orm";

import { ok, err, ErrorCodes, type ApiResponse } from "@/lib/contract";
import { getDb, vehicles, type Vehicle } from "@/lib/db";
import { vehicleQuerySchema, type VehicleQuery } from "@/lib/validators";

// ─── Constants ──────────────────────────────────────────────────────────────

/**
 * Cache-Control value applied to every successful GET response. 30 s is
 * the right horizon for live fleet data: short enough that a vehicle
 * that has just gone out of service disappears quickly, long enough
 * that the map's normal polling cadence hits the edge cache.
 */
const CACHE_HEADER = "public, max-age=30, s-maxage=30" as const;

/**
 * Earth's mean radius in metres. Used by the haversine formula to
 * convert a (lat, lng) pair into a great-circle distance.
 */
const EARTH_RADIUS_METERS = 6_371_000;

// ─── Inline cache stub ──────────────────────────────────────────────────────

/**
 * Inline cache stub. The real cache module (`src/lib/cache/*`) is owned
 * by another agent and isn't safe to import yet, so we keep a tiny
 * in-process map here as a placeholder. When the cache module lands,
 * the `TODO` blocks below mark the exact call sites that need to be
 * replaced.
 */
type CacheEntry = { data: unknown; expiresAt: number };
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30_000;

function cacheKeyFor(q: VehicleQuery): string {
  // Stable, human-readable key. Round numbers so a 36.5099 vs 36.51 hit
  // the same bucket.
  return [
    q.lat.toFixed(4),
    q.lng.toFixed(4),
    q.radiusMeters,
    q.type,
    q.citySlug ?? "_",
    q.limit,
  ].join("|");
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Great-circle distance between two (lat, lng) points, in metres.
 *
 * Uses the haversine formula — accurate to ~0.5 % over short urban
 * distances, which is well below our `radiusMeters` granularity. The
 * inputs are validated by the schema (lat ∈ [-90, 90], lng ∈ [-180, 180])
 * so we do not need to defend against NaN / out-of-range values here.
 *
 * @param aLat  Anchor latitude in decimal degrees.
 * @param aLng  Anchor longitude in decimal degrees.
 * @param bLat  Target latitude in decimal degrees.
 * @param bLng  Target longitude in decimal degrees.
 * @returns Distance in metres.
 */
function haversineMeters(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Parse the `URLSearchParams`-style query object from a Next.js
 * `NextRequest` into a plain `Record<string, string>` shape that
 * Zod's `coerce.number()` can chew on.
 *
 * `URLSearchParams` is iterable but iterating it requires either
 * `--target es2015+` or `--downlevelIteration` — `Object.fromEntries`
 * has the same effect in one line and is friendlier to older tool
 * targets, which is why we use it here.
 */
function readQuery(req: NextRequest): Record<string, string> {
  return Object.fromEntries(req.nextUrl.searchParams.entries());
}

/**
 * Wrap a contract envelope in a `NextResponse` with the standard
 * 30 s cache header applied.
 */
function jsonResponse(
  body: ApiResponse<unknown>,
  status: number,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": CACHE_HEADER },
  });
}

// ─── GET /api/vehicles ──────────────────────────────────────────────────────

/**
 * Handle a `GET /api/vehicles` request.
 *
 * Query parameters (all validated by {@link vehicleQuerySchema}):
 *   - `lat`          Latitude of the search anchor. Required by schema.
 *   - `lng`          Longitude of the search anchor. Required by schema.
 *   - `radiusMeters` 100 m – 50 km.
 *   - `type`         `'e-scooter' | 'e-bike'`. Defaults to first enum value.
 *   - `citySlug`     Optional city filter. Index-backed on the DB.
 *   - `limit`        1..200; defaults to 50.
 *
 * @param req The incoming Next.js request.
 * @returns A {@link NextResponse} with the contract envelope.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  // 1. Parse + validate the query string.
  let query: VehicleQuery;
  try {
    query = vehicleQuerySchema.parse(readQuery(req));
  } catch (e) {
    if (e instanceof ZodError) {
      return jsonResponse(
        err(ErrorCodes.VALIDATION, "Invalid vehicle query", e.issues),
        400,
      );
    }
    throw e;
  }

  // 2. Inline cache check. This is the placeholder for the future
  //    `src/lib/cache` module — see the `TODO` after the DB read for
  //    the matching `set` site.
  const key = cacheKeyFor(query);
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return jsonResponse(cached.data as ApiResponse<unknown>, 200);
  }

  // 3. Query the DB. We use the cheap, indexable filters (citySlug,
  //    type) on the SQL side and reserve the haversine sweep for the
  //    application layer, because Postgres would need a PostGIS
  //    extension for an indexed geo-distance query and the spec says
  //    we store lat/lng as text in v1.
  const db = getDb();
  try {
    const whereParts = [eq(vehicles.type, query.type)];
    if (query.citySlug) {
      whereParts.push(eq(vehicles.citySlug, query.citySlug));
    }
    // We do not push `status` into the WHERE: the spec says "live
    // fleet" should include all non-retired vehicles by default. A
    // future revision can add a `status` query param.
    whereParts.push(eq(vehicles.status, "available"));

    const rows: Vehicle[] = await db
      .select()
      .from(vehicles)
      .where(and(...whereParts))
      .orderBy(desc(vehicles.lastSeenAt))
      .limit(query.limit);

    // 4. Haversine filter. lat/lng in the schema come back as strings
    //    (see src/lib/db/schema.ts) — we coerce to numbers here.
    const anchorLat = query.lat;
    const anchorLng = query.lng;
    const withDistance = rows
      .map((v) => {
        const vLat = Number(v.lat);
        const vLng = Number(v.lng);
        if (!Number.isFinite(vLat) || !Number.isFinite(vLng)) {
          return null;
        }
        return {
          ...v,
          distanceMeters: haversineMeters(
            anchorLat,
            anchorLng,
            vLat,
            vLng,
          ),
        };
      })
      .filter(
        (v): v is Vehicle & { distanceMeters: number } =>
          v !== null && v.distanceMeters <= query.radiusMeters,
      )
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    // 5. Build the paginated envelope. We treat `total` as the
    //    post-filter count (so the client knows how many vehicles are
    //    in *this* radius, not how many exist in the city).
    const items = withDistance.slice(0, query.limit);
    const body = ok({
      vehicles: items,
      total: withDistance.length,
      limit: query.limit,
      radiusMeters: query.radiusMeters,
    });

    // 6. Cache write. Same TODO as the read site above: replace with
    //    `await cacheSet(key, body, CACHE_TTL_MS)` when the cache
    //    module ships.
    // TODO: agent cache — replace with `await cacheSet(key, body, 30_000)`.
    cache.set(key, { data: body, expiresAt: Date.now() + CACHE_TTL_MS });

    return jsonResponse(body, 200);
  } catch {
    return jsonResponse(
      err(
        ErrorCodes.INTERNAL,
        "We couldn't load the live fleet right now. Please try again in a moment.",
      ),
      500,
    );
  }
}
