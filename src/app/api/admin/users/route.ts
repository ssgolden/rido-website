/**
 * /api/admin/users
 *
 * Admin-only surface over the Rido user directory. One handler:
 *
 *   - `GET` — paginated, filterable list of all user accounts. Backed
 *             by the standard `paginationSchema` extended with an
 *             optional `search` query param so the ops console can
 *             drill into the user base by name or email.
 *
 * Auth:
 *   The request must carry a valid NextAuth session whose
 *   `user.role === "admin"`. Anything else (no session, wrong role)
 *   is rejected with `401 UNAUTHORIZED` per the standard contract
 *   error envelope. The auth gate is identical to the one used by
 *   `/api/admin/waitlist`, so the contract is consistent across the
 *   admin surface.
 *
 * Response shape:
 *   The standard `PaginatedResponse<T>` envelope from
 *   `@/lib/contract`. Every reply sets `Cache-Control: no-store` so
 *   admin tooling never sees a stale row count or a stale page.
 *
 * Note on the role column:
 *   The `users` table in `src/lib/db/schema.ts` does not currently
 *   expose a `role` column (the role is stamped on the JWT in
 *   `src/lib/auth/config.ts`). The handler therefore returns
 *   `role: "user"` for every row, with a JSDoc note explaining the
 *   placeholder. When the schema gains a `role` column (Agent #1
 *   follow-up), this route is the call site to switch the SELECT.
 *
 * @module src/app/api/admin/users
 */

import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { and, count, desc, ilike, or, type SQL } from "drizzle-orm";
import { z, ZodError } from "zod";

import { ok, err, ErrorCodes, type ApiResponse, paginationSchema } from "@/lib/contract";
import { getDb, users, type User } from "@/lib/db";
import { getAuthOptions } from "@/lib/auth/config";

// ─── Constants ──────────────────────────────────────────────────────────────

/**
 * Standard `Cache-Control: no-store` header value applied to every
 * response from this route. Admin tooling should never see a stale
 * page; an out-of-date count is worse than a fresh 100ms hit.
 */
const NO_STORE = "no-store" as const;

/**
 * Default role stamped onto every row returned by this route. The
 * `users` table does not expose a `role` column today (the role is
 * carried on the JWT and set by the `jwt` callback in
 * `src/lib/auth/config.ts`); we default to `"user"` because the
 * row-by-row SELECT cannot surface a more accurate answer without
 * a DB column to read from. If/when the schema gains a `role`
 * column, swap the `role: "user" as const` mapping below for
 * `role: users.role` and remove this comment.
 */
const DEFAULT_USER_ROLE = "user" as const;

// ─── Query schema ───────────────────────────────────────────────────────────

/**
 * Validated query string for the admin `GET` endpoint.
 *
 * Extends the standard `paginationSchema` (`page`, `pageSize`) with
 * a single optional `search` filter:
 *
 *   - `search` — case-insensitive substring match against
 *                `users.name` OR `users.email` (uses Postgres
 *                `ILIKE`). Capped at 100 chars so a curious admin
 *                can't paste a 10kB blob into the URL bar and force
 *                a full-table scan with a multi-megabyte ILIKE
 *                pattern.
 */
const adminUsersQuerySchema = paginationSchema.extend({
  search: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .describe("Case-insensitive substring match against name or email"),
});
export type AdminUsersQuery = z.infer<typeof adminUsersQuerySchema>;

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Wrap a contract envelope in a `NextResponse` with the standard
 * `Cache-Control: no-store` header applied. Mirrors the helper in
 * `/api/admin/waitlist` and `/api/newsletter`.
 *
 * @param body The contract envelope (`ok(...)` or `err(...)` result).
 * @param status HTTP status code.
 * @returns A `NextResponse` ready to return from the route handler.
 */
function jsonResponse(
  body: ApiResponse<unknown>,
  status: number,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": NO_STORE },
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
 * The function is intentionally non-throwing so the GET handler can
 * `return` straight from the check. The shape is identical to the
 * one used by `/api/admin/waitlist` — keeping the admin gate in a
 * single shape is what guarantees the contract is consistent across
 * the whole `/api/admin/*` surface.
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
function buildWhere(q: AdminUsersQuery): SQL[] {
  const wheres: SQL[] = [];
  if (q.search) {
    // Escape `%` and `_` so a search for "100%" isn't interpreted
    // as a wildcard. We also wrap the pattern in `%…%` for a
    // substring match against either name or email.
    const escaped = q.search
      .replace(/\\/g, "\\\\")
      .replace(/%/g, "\\%")
      .replace(/_/g, "\\_");
    const pattern = `%${escaped}%`;
    wheres.push(or(ilike(users.name, pattern), ilike(users.email, pattern))!);
  }
  return wheres;
}

// ─── GET /api/admin/users ────────────────────────────────────────────────────

/**
 * Handle a `GET /api/admin/users` request.
 *
 * Returns a paginated, filterable list of Rido users. See
 * {@link adminUsersQuerySchema} for the supported query parameters
 * and {@link buildWhere} for how they're translated into a Drizzle
 * `WHERE` clause.
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
  //    401 UNAUTHORIZED per the task spec — same semantics as
  //    `/api/admin/waitlist`.
  const gate = await requireAdmin();
  if (!gate.ok) {
    return jsonResponse(err(gate.code, gate.message), 401);
  }

  // 2. Parse + validate the query string. Bad params → 400.
  const params = req.nextUrl.searchParams;
  const rawQuery = {
    page: params.get("page") ?? undefined,
    pageSize: params.get("pageSize") ?? undefined,
    search: params.get("search") ?? undefined,
  };

  let query: AdminUsersQuery;
  try {
    query = adminUsersQuerySchema.parse(rawQuery);
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
  const whereExpr =
    wheres.length === 0
      ? undefined
      : wheres.length === 1
        ? wheres[0]
        : and(...wheres);
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
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
          emailVerified: users.emailVerified,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(whereExpr)
        .orderBy(desc(users.createdAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ value: count() })
        .from(users)
        .where(whereExpr),
    ]);

    const total = Number(totalRow[0]?.value ?? 0);

    return jsonResponse(
      ok({
        items: items.map((r: Pick<User, "id" | "name" | "email" | "image" | "emailVerified" | "createdAt">) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          image: r.image,
          emailVerified: r.emailVerified ? r.emailVerified.toISOString() : null,
          createdAt: r.createdAt.toISOString(),
          // Placeholder role — see {@link DEFAULT_USER_ROLE} for the
          // schema-followup context. Today the role is carried on
          // the JWT only; we surface `"user"` as a stable default
          // so the admin UI doesn't have to special-case missing
          // roles.
          role: DEFAULT_USER_ROLE,
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
        "We couldn't load the user list right now. Please try again in a moment.",
      ),
      500,
    );
  }
}
