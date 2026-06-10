/**
 * /api/admin/waitlist
 *
 * Admin-only surface over the Rido waitlist. Two handlers live here:
 *
 *   - `GET`    — paginated, filterable list of all signups. Backed by
 *                the standard `paginationSchema` extended with
 *                `city`, `dateRange`, `locale`, and `search` query
 *                params so the ops console can drill into the funnel.
 *   - `DELETE` — remove a single signup by id. Used by the admin
 *                tool to drop bot / spam rows or comply with
 *                GDPR-style erasure requests.
 *
 * Both handlers are gated by NextAuth: the request must carry a
 * valid session whose `user.role === "admin"`. Anything else (no
 * session, wrong role) is rejected with `401 UNAUTHORIZED` per the
 * task spec.
 *
 * The response envelope is the standard `ApiResponse<T>` from
 * `@/lib/contract`. Every reply — success or error — sets
 * `Cache-Control: no-store` so admin tooling never sees a stale
 * row count or a stale page.
 *
 * @module src/app/api/admin/waitlist
 */

import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { and, count, desc, eq, gte, ilike, lte, sql, type SQL } from "drizzle-orm";
import { z, ZodError } from "zod";

import { ok, err, ErrorCodes, type ApiResponse, paginationSchema } from "@/lib/contract";
import { getDb, waitlistSignups } from "@/lib/db";
import { citySlugSchema, localeSchema } from "@/lib/validators";
import { getAuthOptions } from "@/lib/auth/config";
import { cities } from "@/data/cities";

// ─── Constants ──────────────────────────────────────────────────────────────

/**
 * Standard `Cache-Control: no-store` header value applied to every
 * response from this route. Admin tooling should never see a stale
 * page; an out-of-date count is worse than a fresh 100ms hit.
 */
const NO_STORE = "no-store" as const;

// ─── Query schema (GET) ──────────────────────────────────────────────────────

/**
 * Validated query string for the admin `GET` endpoint.
 *
 * Extends the standard `paginationSchema` (`page`, `pageSize`) with
 * the four filter params required by the task spec:
 *
 *   - `city`     — exact slug match against `waitlist_signups.city`.
 *   - `dateFrom` / `dateTo` — inclusive ISO-8601 range filter on
 *                  `waitlist_signups.created_at`.
 *   - `locale`   — exact match against `waitlist_signups.locale`.
 *   - `search`   — case-insensitive substring match against
 *                  `waitlist_signups.email` (uses Postgres `ILIKE`).
 *
 * All fields are optional; omitting them returns the full set. The
 * `search` string is capped at 100 chars so a curious admin can't
 * paste a 10kB blob into the URL bar and force a full-table scan
 * with a multi-megabyte ILIKE pattern.
 */
const adminWaitlistQuerySchema = paginationSchema.extend({
  city: citySlugSchema.optional(),
  dateFrom: z
    .string()
    .datetime({ offset: true })
    .optional()
    .describe("ISO-8601 timestamp, inclusive lower bound for created_at"),
  dateTo: z
    .string()
    .datetime({ offset: true })
    .optional()
    .describe("ISO-8601 timestamp, inclusive upper bound for created_at"),
  locale: localeSchema.optional(),
  search: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .describe("Case-insensitive substring match against email"),
});
export type AdminWaitlistQuery = z.infer<typeof adminWaitlistQuerySchema>;

// ─── Body schema (DELETE) ────────────────────────────────────────────────────

/**
 * Validated body for the admin `DELETE` endpoint. Accepts a single
 * `{ id }` field — the waitlist row's UUID. The body is intentionally
 * tiny: the admin tool only ever needs to remove one row at a time
 * so the typical request is a single object.
 */
const deleteBodySchema = z.object({
  id: z.string().uuid("id must be a valid UUID"),
});
export type DeleteBody = z.infer<typeof deleteBodySchema>;

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Wrap a contract envelope in a `NextResponse` with the standard
 * `Cache-Control: no-store` header applied.
 *
 * @param body The contract envelope (`ok(...)` or `err(...)` result).
 * @param status HTTP status code (200, 400, 401, 500, …).
 * @returns A `NextResponse` ready to return from the route handler.
 */
function jsonResponse(
  body: ApiResponse<unknown>,
  status: number,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": NO_STORE,
    },
  });
}

/**
 * Decide whether the current request is authenticated as an admin.
 *
 * The function returns a discriminated union so the caller can
 * branch without re-doing the work:
 *
 *   - `{ ok: true }`              — session is present and `role === "admin"`.
 *   - `{ ok: false, code, msg }`  — a contract error code matching the
 *                                   failure mode (`UNAUTHORIZED` for no
 *                                   session, `FORBIDDEN` for wrong role)
 *                                   plus a human-readable message.
 *
 * The function is intentionally non-throwing so the GET and DELETE
 * handlers can `return` straight from the check.
 *
 * @returns A tag-union describing the auth result.
 */
type AdminGate =
  | { ok: true }
  | { ok: false; code: string; message: string };

async function requireAdmin(): Promise<AdminGate> {
  const session = await getServerSession(getAuthOptions());
  if (!session?.user) {
    return {
      ok: false,
      code: ErrorCodes.UNAUTHORIZED,
      message: "Sign-in required",
    };
  }
  if (session.user.role !== "admin") {
    return {
      ok: false,
      code: ErrorCodes.FORBIDDEN,
      message: "Admin role required",
    };
  }
  return { ok: true };
}

/**
 * Translate a Zod-validated admin query into a list of Drizzle
 * WHERE predicates. Centralised so GET + any future bulk-export
 * endpoint share the same filter semantics. The function returns
 * an empty array when no filters are active so the caller can do
 * `query.where(...filters)` regardless.
 *
 * @param q The parsed admin query.
 * @returns An array of Drizzle `SQL` predicates (possibly empty).
 */
function buildWhere(q: AdminWaitlistQuery): SQL[] {
  const wheres: SQL[] = [];
  if (q.city) {
    wheres.push(eq(waitlistSignups.city, q.city));
  }
  if (q.locale) {
    wheres.push(eq(waitlistSignups.locale, q.locale));
  }
  if (q.dateFrom) {
    // Postgres `timestamp with time zone` columns accept ISO-8601
    // strings directly; we pass the raw value through to avoid
    // Date-timezone drift in the driver.
    wheres.push(gte(waitlistSignups.createdAt, new Date(q.dateFrom)));
  }
  if (q.dateTo) {
    wheres.push(lte(waitlistSignups.createdAt, new Date(q.dateTo)));
  }
  if (q.search) {
    // Escape `%` and `_` so a search for "100%" isn't interpreted
    // as a wildcard. We also wrap the pattern in `%…%` for a
    // substring match.
    const escaped = q.search
      .replace(/\\/g, "\\\\")
      .replace(/%/g, "\\%")
      .replace(/_/g, "\\_");
    wheres.push(ilike(waitlistSignups.email, `%${escaped}%`));
  }
  return wheres;
}

// ─── GET /api/admin/waitlist ─────────────────────────────────────────────────

/**
 * Handle a `GET /api/admin/waitlist` request.
 *
 * Returns a paginated, filterable list of waitlist signups. See
 * {@link adminWaitlistQuerySchema} for the supported query
 * parameters and {@link buildWhere} for how they're translated into
 * a Drizzle `WHERE` clause.
 *
 * The response shape mirrors the standard `PaginatedResponse<T>`
 * contract envelope:
 *
 *   ```json
 *   {
 *     "ok": true,
 *     "data": {
 *       "items":     [...],
 *       "page":      1,
 *       "pageSize":  20,
 *       "total":     137,
 *       "hasMore":   true
 *     }
 *   }
 *   ```
 *
 * @param req The incoming Next.js request carrying the query string.
 * @returns A {@link NextResponse} with the contract envelope.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  // 1. Auth gate. Anonymous or non-admin callers are rejected with
  //    401 UNAUTHORIZED per the task spec.
  const gate = await requireAdmin();
  if (!gate.ok) {
    return jsonResponse(err(gate.code, gate.message), 401);
  }

  // 2. Parse + validate the query string. Bad params → 400.
  const params = req.nextUrl.searchParams;
  const rawQuery = {
    page: params.get("page") ?? undefined,
    pageSize: params.get("pageSize") ?? undefined,
    city: params.get("city") ?? undefined,
    dateFrom: params.get("dateFrom") ?? undefined,
    dateTo: params.get("dateTo") ?? undefined,
    locale: params.get("locale") ?? undefined,
    search: params.get("search") ?? undefined,
  };

  let query: AdminWaitlistQuery;
  try {
    query = adminWaitlistQuerySchema.parse(rawQuery);
  } catch (e) {
    if (e instanceof ZodError) {
      return jsonResponse(
        err(ErrorCodes.VALIDATION, "Invalid admin query", e.issues),
        400,
      );
    }
    throw e;
  }

  // 3. Translate filters into Drizzle predicates.
  const wheres = buildWhere(query);
  const whereExpr = wheres.length === 0 ? undefined : wheres.length === 1 ? wheres[0] : and(...wheres);
  const { page, pageSize } = query;
  const offset = (page - 1) * pageSize;

  // 4. Run the page query + the count query in parallel. They are
  //    independent reads; the count is needed for the `hasMore` /
  //    `total` fields in the paginated envelope.
  const db = getDb();
  try {
    const [items, totalRow] = await Promise.all([
      db
        .select({
          id: waitlistSignups.id,
          email: waitlistSignups.email,
          city: waitlistSignups.city,
          locale: waitlistSignups.locale,
          source: waitlistSignups.source,
          status: waitlistSignups.status,
          createdAt: waitlistSignups.createdAt,
          confirmedAt: waitlistSignups.confirmedAt,
        })
        .from(waitlistSignups)
        .where(whereExpr)
        .orderBy(desc(waitlistSignups.createdAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ value: count() })
        .from(waitlistSignups)
        .where(whereExpr),
    ]);

    const total = Number(totalRow[0]?.value ?? 0);

    return jsonResponse(
      ok({
        items: items.map((r) => ({
          id: r.id,
          email: r.email,
          city: r.city,
          // Surface the human-readable city name alongside the slug
          // so the admin UI doesn't have to re-import `src/data/cities`.
          cityName: cities.find((c) => c.slug === r.city)?.name ?? r.city,
          locale: r.locale,
          source: r.source,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
          confirmedAt: r.confirmedAt ? r.confirmedAt.toISOString() : null,
        })),
        page,
        pageSize,
        total,
        hasMore: offset + items.length < total,
      }),
      200,
    );
  } catch {
    return jsonResponse(
      err(
        ErrorCodes.INTERNAL,
        "We couldn't load the waitlist right now. Please try again in a moment.",
      ),
      500,
    );
  }
}

// ─── DELETE /api/admin/waitlist ──────────────────────────────────────────────

/**
 * Handle a `DELETE /api/admin/waitlist` request.
 *
 * Body: `{ id: string (uuid) }`. Removes the matching row from
 * `waitlist_signups` and returns the count of deleted rows
 * (`{ ok: true, data: { deleted: 1 } }`). A non-existent id is
 * treated as a successful no-op (`deleted: 0`) so the admin tool
 * doesn't have to special-case "already gone" rows.
 *
 * @param req The incoming Next.js request carrying `{ id }` in the
 *            JSON body.
 * @returns A {@link NextResponse} with the contract envelope.
 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  // 1. Auth gate. Same semantics as GET — admin-only.
  const gate = await requireAdmin();
  if (!gate.ok) {
    return jsonResponse(err(gate.code, gate.message), 401);
  }

  // 2. Parse + validate the JSON body.
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonResponse(
      err(ErrorCodes.BAD_REQUEST, "Request body must be valid JSON"),
      400,
    );
  }

  let body: DeleteBody;
  try {
    body = deleteBodySchema.parse(raw);
  } catch (e) {
    if (e instanceof ZodError) {
      return jsonResponse(
        err(ErrorCodes.VALIDATION, "Invalid delete body", e.issues),
        400,
      );
    }
    throw e;
  }

  // 3. Delete by id. We use `.returning({ id })` to get the actual
  //    number of rows that disappeared — Drizzle's `delete()` returns
  //    the row count, but `returning` is more explicit and matches
  //    the contact / waitlist POST pattern.
  const db = getDb();
  try {
    const deleted = await db
      .delete(waitlistSignups)
      .where(eq(waitlistSignups.id, body.id))
      .returning({ id: waitlistSignups.id });

    return jsonResponse(
      ok({ deleted: deleted.length }),
      200,
    );
  } catch {
    return jsonResponse(
      err(
        ErrorCodes.INTERNAL,
        "We couldn't remove that signup right now. Please try again in a moment.",
      ),
      500,
    );
  }
}
