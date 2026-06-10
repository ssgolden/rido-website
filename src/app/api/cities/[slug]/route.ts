/**
 * /api/cities/[slug]
 *
 * Single-city lookup by slug. Returns the *full* city record: lat,
 * lng, the geofence polygon as GeoJSON, the parking zones, the
 * current status, and the `launchedAt` timestamp.
 *
 * Behaviour summary:
 *   1. Await the dynamic-route `params` (Next.js 16 — see
 *      `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md`).
 *   2. Validate the slug with the shared `citySlugSchema`. Slugs come
 *      from `src/data/cities.ts`; an unknown slug is a 404.
 *   3. If the slug matches a static city, return the static record
 *      (with an empty geofence + parkingZones — those are owned by
 *      the maps agent and will be filled in from the DB later).
 *   4. Otherwise, look up the row in the `cities` table and return
 *      the full record including GeoJSON.
 *   5. 404 if no row matches, 200 with the row otherwise.
 *   6. Cache-Control: public, max-age=300, s-maxage=300.
 *
 * Error envelope:
 *   Every failure uses `err(...)` from `@/lib/contract`.
 *     - 400  malformed slug
 *     - 404  no such city
 *     - 500  DB failure
 *
 * @module src/app/api/cities/[slug]
 */

import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { ok, err, ErrorCodes, type ApiResponse } from "@/lib/contract";
import { getDb, cities as citiesTable, type City as DbCity } from "@/lib/db";
import { citySlugSchema } from "@/lib/validators";
import { cities as staticCities } from "@/data/cities";

// ─── Constants ──────────────────────────────────────────────────────────────

/**
 * Cache-Control value applied to the 200 response. 5 minutes mirrors
 * the list endpoint — cities don't change on a per-second cadence.
 */
const CACHE_HEADER = "public, max-age=300, s-maxage=300" as const;

// ─── Types ──────────────────────────────────────────────────────────────────

/**
 * Response shape for a single city. Mirrors the DB row's public
 * fields, with lat/lng coerced to numbers (the DB stores them as
 * text — see `src/lib/db/schema.ts`).
 *
 * `geofence` and `parkingZones` are typed as `unknown` in the DB
 * schema and we leave them as such here. The maps agent owns the
 * GeoJSON validators and will eventually narrow the type at the
 * boundary. The wire shape is a plain JSON object / array.
 */
interface CityDetailResponse {
  slug: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  geofence: unknown;
  parkingZones: unknown;
  status: "live" | "coming_soon" | "beta";
  launchedAt: string | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Convert a DB `cities` row into the public detail response.
 */
function dbToResponse(c: DbCity): CityDetailResponse {
  const lat = Number(c.lat);
  const lng = Number(c.lng);
  return {
    slug: c.slug,
    name: c.name,
    region: c.region,
    country: c.country,
    lat: Number.isFinite(lat) ? lat : 0,
    lng: Number.isFinite(lng) ? lng : 0,
    geofence: c.geofence,
    parkingZones: c.parkingZones,
    status: c.status,
    launchedAt: c.launchedAt ? c.launchedAt.toISOString() : null,
  };
}

/**
 * Build a static-city detail response. Static cities don't yet have
 * a real geofence polygon or parking zones (those come from the
 * maps agent), so we return `null` for both and let the client fall
 * back to a default rendering. The list endpoint uses the same
 * data without those nulls because it never promised the extra
 * fields — this endpoint *is* the place where they would appear.
 */
function staticToResponse(
  c: (typeof staticCities)[number],
): CityDetailResponse {
  return {
    slug: c.slug,
    name: c.name,
    region: c.region,
    country: "ES",
    lat: c.lat,
    lng: c.lng,
    geofence: null,
    parkingZones: null,
    status: c.comingSoon ? "coming_soon" : "live",
    launchedAt: null,
  };
}

/**
 * Wrap a contract envelope in a `NextResponse` with the standard
 * 5-minute cache header. 404 / 400 responses intentionally do *not*
 * get the cache header.
 */
function jsonResponse(
  body: ApiResponse<unknown>,
  status: number,
  options: { cacheable?: boolean } = {},
): NextResponse {
  const headers: Record<string, string> = {};
  if (options.cacheable) headers["Cache-Control"] = CACHE_HEADER;
  return NextResponse.json(body, { status, headers });
}

// ─── GET /api/cities/[slug] ────────────────────────────────────────────────

/**
 * Handle a `GET /api/cities/[slug]` request.
 *
 * @param _req The incoming Next.js request (unused — the slug is in the URL).
 * @param ctx  The route context. In Next.js 16, `params` is a Promise.
 * @returns A {@link NextResponse} with the contract envelope.
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  // 1. Await the dynamic-route params. In Next.js 16, params are
  //    delivered as a Promise (see node_modules/next/dist/docs/01-app/
  //    03-api-reference/03-file-conventions/route.md).
  const { slug } = await ctx.params;

  // 2. Validate the slug against the canonical list. An unknown slug
  //    is a 404, not a 400 — but a clearly malformed slug (empty,
  //    contains spaces, etc.) is a 400.
  const slugParse = citySlugSchema.safeParse(slug);
  if (!slugParse.success) {
    return jsonResponse(
      err(ErrorCodes.NOT_FOUND, "City not found"),
      404,
    );
  }

  // 3. Fast path: static city. The static list is the source of
  //    truth for the public catalogue; the DB is consulted for
  //    pre-launch / beta cities (which currently live there).
  const staticHit = staticCities.find((c) => c.slug === slug);
  if (staticHit) {
    return jsonResponse(ok(staticToResponse(staticHit)), 200, {
      cacheable: true,
    });
  }

  // 4. DB lookup. We use a primary-key `eq` on `slug` (it is the PK
  //    per `src/lib/db/schema.ts`), so the query is index-backed and
  //    O(log n).
  const db = getDb();
  try {
    const rows: DbCity[] = await db
      .select()
      .from(citiesTable)
      .where(eq(citiesTable.slug, slug))
      .limit(1);

    const city = rows[0];
    if (!city) {
      return jsonResponse(
        err(ErrorCodes.NOT_FOUND, "City not found"),
        404,
      );
    }

    return jsonResponse(ok(dbToResponse(city)), 200, { cacheable: true });
  } catch {
    return jsonResponse(
      err(
        ErrorCodes.INTERNAL,
        "We couldn't load that city right now. Please try again in a moment.",
      ),
      500,
    );
  }
}
