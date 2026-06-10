/**
 * /api/cities
 *
 * Public surface of the service-area city catalogue. One handler in
 * this file:
 *
 *   - `GET` — return the list of cities, optionally filtered by
 *             `status` (`live` | `coming_soon` | `beta` | `all`).
 *
 * Behaviour summary:
 *   1. Parse + validate the query string against {@link cityQuerySchema}.
 *      The schema defaults `status` to `live` so the public site never
 *      accidentally surfaces a pre-launch city.
 *   2. If no filters are present, return the full static catalogue from
 *      `src/data/cities.ts` (the DB is the source of truth *only* for
 *      live data — the marketing list of cities is a curated set).
 *   3. If filters *are* present, fall back to the DB and join the
 *      `cities` table on the supplied `status`. The `slug` filter is
 *      honoured if present.
 *   4. Cache-Control: public, max-age=300, s-maxage=300. Cities change
 *      on a weekly-to-monthly cadence, so a 5-minute horizon is fine.
 *   5. Inline 5-minute cache stub (placeholder for the future
 *      `src/lib/cache/*` module — see `TODO`).
 *
 * Error envelope:
 *   Every non-validation failure uses `err(...)` from `@/lib/contract`.
 *     - 400  invalid query
 *     - 500  DB failure
 *
 * @module src/app/api/cities
 */

import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { and, eq } from "drizzle-orm";

import { ok, err, ErrorCodes, type ApiResponse } from "@/lib/contract";
import { getDb, cities as citiesTable, type City as DbCity } from "@/lib/db";
import { cityQuerySchema, type CityQuery } from "@/lib/validators";
import { cities as staticCities } from "@/data/cities";

// ─── Constants ──────────────────────────────────────────────────────────────

/**
 * Cache-Control value applied to every successful GET response. The
 * city catalogue changes on the order of weeks, so a 5-minute horizon
 * is comfortably safe.
 */
const CACHE_HEADER = "public, max-age=300, s-maxage=300" as const;

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
const CACHE_TTL_MS = 5 * 60_000;

function cacheKeyFor(q: CityQuery): string {
  return [q.status, q.slug ?? "_", q.locale ?? "_"].join("|");
}

// ─── Types ──────────────────────────────────────────────────────────────────

/**
 * Shape returned by `GET /api/cities`. We model the city record with
 * the same fields used by `src/data/cities.ts` so the static-list
 * and DB paths produce identical output for the client. Lat/lng are
 * always serialised as numbers — the DB stores them as text per the
 * schema (a deliberate v1 simplification) and we coerce on the way out.
 */
interface CityResponse {
  slug: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  status: "live" | "coming_soon" | "beta";
  launchedAt: string | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Convert a static `src/data/cities.ts` record into the response
 * shape. Static cities are always considered `live` — anything in
 * that file is on the public marketing site.
 */
function staticToResponse(c: (typeof staticCities)[number]): CityResponse {
  return {
    slug: c.slug,
    name: c.name,
    region: c.region,
    country: "ES",
    lat: c.lat,
    lng: c.lng,
    status: c.comingSoon ? "coming_soon" : "live",
    launchedAt: null,
  };
}

/**
 * Convert a DB `cities` row into the response shape.
 */
function dbToResponse(c: DbCity): CityResponse {
  const lat = Number(c.lat);
  const lng = Number(c.lng);
  return {
    slug: c.slug,
    name: c.name,
    region: c.region,
    country: c.country,
    lat: Number.isFinite(lat) ? lat : 0,
    lng: Number.isFinite(lng) ? lng : 0,
    status: c.status,
    launchedAt: c.launchedAt ? c.launchedAt.toISOString() : null,
  };
}

/**
 * Build the public-facing list of cities from the static catalogue,
 * honouring the `status` filter. We treat the static list as the
 * canonical "live" set and the "all" filter as a superset of the
 * static + a placeholder note about pre-launch cities.
 *
 * @param status The validated `status` from the query.
 * @returns The list of cities matching `status`.
 */
function filterStatic(status: CityQuery["status"]): CityResponse[] {
  const all = staticCities.map(staticToResponse);
  if (status === "live") return all.filter((c) => c.status === "live");
  if (status === "coming_soon") {
    // Static list doesn't currently model coming-soon cities, so we
    // return an empty array rather than fabricating rows. The DB path
    // is the source of truth for pre-launch cities.
    return [];
  }
  if (status === "beta") return [];
  // "all" — static + any coming-soon placeholders we may add in the future.
  return all;
}

/**
 * Wrap a contract envelope in a `NextResponse` with the standard
 * 5-minute cache header.
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

// ─── GET /api/cities ────────────────────────────────────────────────────────

/**
 * Handle a `GET /api/cities` request.
 *
 * Query parameters (all validated by {@link cityQuerySchema}):
 *   - `status` `'live' | 'coming_soon' | 'beta' | 'all'` — defaults to `live`.
 *   - `slug`   Optional — return only the matching city.
 *   - `locale` Optional — accepted for forward-compatibility; we do not
 *             localise names yet, so it has no observable effect.
 *
 * @param req The incoming Next.js request.
 * @returns A {@link NextResponse} with the contract envelope.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  // 1. Parse + validate the query string.
  let query: CityQuery;
  try {
    query = cityQuerySchema.parse(
      Object.fromEntries(req.nextUrl.searchParams.entries()),
    );
  } catch (e) {
    if (e instanceof ZodError) {
      return jsonResponse(
        err(ErrorCodes.VALIDATION, "Invalid city query", e.issues),
        400,
      );
    }
    throw e;
  }

  // 2. Inline cache check. Same placeholder pattern as
  //    `/api/vehicles` — see the `TODO` after the write below.
  const key = cacheKeyFor(query);
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return jsonResponse(cached.data as ApiResponse<unknown>, 200);
  }

  // 3. Fast path: no filters → return the static catalogue. The DB is
  //    consulted only when the caller asks for non-static data
  //    (coming_soon / beta, or a specific slug we might not ship in
  //    the static list).
  const hasFilters =
    query.status !== "live" || query.slug !== undefined;

  if (!hasFilters) {
    const items = filterStatic(query.status);
    const body = ok({ cities: items, total: items.length });
    // TODO: agent cache — replace with `await cacheSet(key, body, 300_000)`.
    cache.set(key, { data: body, expiresAt: Date.now() + CACHE_TTL_MS });
    return jsonResponse(body, 200);
  }

  // 4. DB path. We build a Drizzle `where` from the validated filters
  //    and project each row into the response shape.
  const db = getDb();
  try {
    const whereParts = [];
    if (query.status !== "all") {
      whereParts.push(eq(citiesTable.status, query.status));
    }
    if (query.slug) {
      whereParts.push(eq(citiesTable.slug, query.slug));
    }

    const rows: DbCity[] = await db
      .select()
      .from(citiesTable)
      .where(whereParts.length > 0 ? and(...whereParts) : undefined)
      .orderBy(citiesTable.name);

    const items = rows.map(dbToResponse);
    const body = ok({ cities: items, total: items.length });
    // TODO: agent cache — replace with `await cacheSet(key, body, 300_000)`.
    cache.set(key, { data: body, expiresAt: Date.now() + CACHE_TTL_MS });
    return jsonResponse(body, 200);
  } catch {
    return jsonResponse(
      err(
        ErrorCodes.INTERNAL,
        "We couldn't load the city catalogue right now. Please try again in a moment.",
      ),
      500,
    );
  }
}
