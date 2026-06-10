/**
 * /api/vehicles/[id]
 *
 * Single-vehicle lookup by primary key (UUID). Used by the deep-link
 * "view this vehicle on the map" flow and by the operator dashboard.
 *
 * Behaviour summary:
 *   1. Await the dynamic-route `params` (Next.js 16 hands it back as a
 *      Promise — see the route-handler docs in `node_modules/next/dist/docs`).
 *   2. Validate the id is a well-formed UUID; reject anything else
 *      with 400 BAD_REQUEST *before* hitting the DB.
 *   3. Query the `vehicles` table by primary key.
 *   4. Return 404 NOT_FOUND if the row does not exist, 200 with the
 *      full row otherwise.
 *   5. Cache-Control: public, max-age=30, s-maxage=30.
 *
 * Error envelope:
 *   Every non-validation failure uses `err(...)` from `@/lib/contract`.
 *     - 400  malformed id
 *     - 404  no such vehicle
 *     - 500  DB failure
 *
 * @module src/app/api/vehicles/[id]
 */

import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { ok, err, ErrorCodes, type ApiResponse } from "@/lib/contract";
import { getDb, vehicles, type Vehicle } from "@/lib/db";
import { idSchema } from "@/lib/validators";

// ─── Constants ──────────────────────────────────────────────────────────────

/**
 * Cache-Control value applied to the 200 response. 30 s mirrors the
 * list endpoint: short enough that a vehicle that has just been
 * retired is reflected quickly, long enough to absorb the dashboard's
 * auto-refresh cadence.
 */
const CACHE_HEADER = "public, max-age=30, s-maxage=30" as const;

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Wrap a contract envelope in a `NextResponse` with the standard
 * 30 s cache header. 404 / 400 responses intentionally do *not* get
 * the cache header — they're not safe to share.
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

// ─── GET /api/vehicles/[id] ─────────────────────────────────────────────────

/**
 * Handle a `GET /api/vehicles/[id]` request.
 *
 * @param _req   The incoming Next.js request (unused — the id is in the URL).
 * @param ctx    The route context. In Next.js 16, `params` is a Promise.
 * @returns A {@link NextResponse} with the contract envelope.
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  // 1. Await the dynamic-route params. In Next.js 16, params are
  //    delivered as a Promise (see node_modules/next/dist/docs/01-app/
  //    03-api-reference/03-file-conventions/route.md).
  const { id } = await ctx.params;

  // 2. Validate the id is a well-formed UUID. This avoids a pointless
  //    DB round-trip for `/api/vehicles/garbage` and gives the client
  //    a precise error envelope.
  if (!idSchema.safeParse(id).success) {
    return jsonResponse(
      err(ErrorCodes.BAD_REQUEST, "Vehicle id must be a valid UUID"),
      400,
    );
  }

  // 3. Fetch the row. We use `.limit(1)` even though a primary-key
  //    lookup is guaranteed unique; it's a defensive habit that costs
  //    nothing.
  const db = getDb();
  try {
    const rows: Vehicle[] = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.id, id))
      .limit(1);

    const vehicle = rows[0];
    if (!vehicle) {
      return jsonResponse(
        err(ErrorCodes.NOT_FOUND, "Vehicle not found"),
        404,
      );
    }

    return jsonResponse(ok(vehicle), 200, { cacheable: true });
  } catch {
    return jsonResponse(
      err(
        ErrorCodes.INTERNAL,
        "We couldn't load that vehicle right now. Please try again in a moment.",
      ),
      500,
    );
  }
}
