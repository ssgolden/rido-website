/**
 * /api/notifications/unsubscribe
 *
 * Public endpoint for the browser's service worker to deregister a Web
 * Push subscription. This is the explicit, user-initiated counterpart
 * of the subscribe flow — the caller already knows the endpoint it
 * wants gone, and we just delete the matching row.
 *
 * Behaviour:
 *   - DELETE — remove the row whose `endpoint` matches the JSON body
 *     or the `?endpoint=…` query string, return 200 `{ ok: true }`.
 *   - Missing or invalid endpoint → 400 VALIDATION.
 *   - The handler is **idempotent**: re-deleting an already-removed
 *     row still returns 200, because the caller's intent ("this
 *     subscription should be gone") is satisfied either way. The
 *     404 path is intentionally NOT taken so a service worker that
 *     retries on a transient error never gets stuck in a loop.
 *
 * Note: this is distinct from the email-unsubscribe link
 * (`src/app/api/unsubscribe/route.ts`). That one is for marketing-
 * email lists; this one is for Web Push subscriptions specifically.
 * The two share the HTTP verb and the idempotency philosophy but
 * are otherwise separate concerns.
 *
 * Caching:
 *   Every response sets `Cache-Control: no-store`. A cached 200
 *   could mask a delete that hasn't actually been applied yet (e.g.
 *   if a proxy were to replay a stale response after a re-subscribe
 *   followed by an unsubscribe).
 *
 * @module src/app/api/notifications/unsubscribe
 */

import { NextResponse, type NextRequest } from "next/server";
import { z, ZodError } from "zod";
import { eq } from "drizzle-orm";

import { ok, err, ErrorCodes, type ApiResponse } from "@/lib/contract";
import { getDb, webPushSubscriptions } from "@/lib/db";

// ─── Constants ──────────────────────────────────────────────────────────────

/**
 * Standard `Cache-Control: no-store` header value applied to every
 * response from this route. DELETE for a notification subscription
 * must never be replayed by a proxy — the DB is the single source of
 * truth.
 */
const NO_STORE = "no-store" as const;

// ─── Schema ─────────────────────────────────────────────────────────────────

/**
 * Zod schema for the DELETE request. Accepts the endpoint from
 * either a JSON body or a query string (handled by the route
 * handler); the schema only needs to validate the URL shape.
 *
 * Rules:
 *   - `endpoint` — non-empty string, must parse as a `https://` URL.
 *     We reject `http://` (push services are TLS-only) and any other
 *     scheme (`data:`, `javascript:`, etc.) to prevent an attacker
 *     from probing the table with garbage rows.
 */
const unsubscribeSchema = z.object({
  endpoint: z
    .string()
    .trim()
    .min(1, "endpoint is required")
    .url("endpoint must be a valid URL")
    .refine(
      (u) => u.startsWith("https://"),
      "endpoint must use the https:// scheme",
    ),
});

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Wrap a contract envelope in a `NextResponse` with the standard
 * `Cache-Control: no-store` header applied. Mirrors the helper used
 * by the sibling routes so all the JSON endpoints share an identical
 * response shape.
 *
 * @param body   The contract envelope (`ok(...)` or `err(...)` result).
 * @param status HTTP status code (200, 400, 500, …).
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
 * Parse the DELETE request body or `?endpoint=…` query string into a
 * validated endpoint URL.
 *
 * Two shapes are supported:
 *   1. JSON body `{ "endpoint": "https://…" }` — used by the
 *      service worker when it calls `subscription.unsubscribe()` and
 *      then POSTs the endpoint back to the server.
 *   2. Query string `?endpoint=https://…` — used by curl, by the
 *      future "manage subscriptions" admin UI, and by any caller
 *      that can't easily send a JSON body.
 *
 * @param req The incoming Next.js request.
 * @returns A validated `https://…` endpoint string.
 * @throws  {ZodError} when the input doesn't satisfy the schema; the
 *          route handler translates this to a 400 VALIDATION.
 */
async function parseEndpointFromRequest(req: NextRequest): Promise<string> {
  // Try the query string first — it's the cheaper path and the common
  // case for `?endpoint=…` callers.
  const queryEndpoint = req.nextUrl.searchParams.get("endpoint");
  if (typeof queryEndpoint === "string" && queryEndpoint.trim().length > 0) {
    return unsubscribeSchema.parse({ endpoint: queryEndpoint }).endpoint;
  }

  // Fall back to the JSON body. We tolerate an empty / missing body —
  // `req.json()` throws on a non-JSON payload, but the schema also
  // accepts `null` and reports a clear "endpoint is required" error.
  let raw: unknown = null;
  try {
    raw = await req.json();
  } catch {
    // Body wasn't JSON; fall through to the schema, which will report
    // the missing-field error in the same envelope as a malformed body.
    raw = null;
  }
  return unsubscribeSchema.parse(raw ?? {}).endpoint;
}

// ─── DELETE /api/notifications/unsubscribe ──────────────────────────────────

/**
 * Handle a `DELETE /api/notifications/unsubscribe` request.
 *
 * Removes the row whose `endpoint` matches the request body or query
 * string. The handler is **idempotent**: re-deleting an already-
 * removed row still returns `200 { ok: true }`, because the caller's
 * intent ("this subscription should be gone") is satisfied either
 * way. This mirrors the explicit unsubscribe philosophy of
 * `src/app/api/unsubscribe/route.ts` for email lists, and it means a
 * service worker that retries on a transient error never gets stuck
 * in a loop.
 *
 * Accepts the endpoint from either:
 *   - JSON body: `{ "endpoint": "https://…" }`
 *   - Query string: `?endpoint=https://…`
 *
 * Flow:
 *   1. Resolve the endpoint from either the body or the query string.
 *      Invalid / missing → 400 VALIDATION.
 *   2. Delete the row. We use `.returning({ endpoint })` so the SQL
 *      layer tells us whether anything was actually removed, but the
 *      outcome (removed or absent) both yield 200 — see step 3.
 *   3. Return `200 { ok: true }`.
 *
 * @param req The incoming Next.js request carrying the endpoint.
 * @returns A {@link NextResponse} with the contract envelope.
 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  // 1. Resolve the endpoint from either the body or the query string.
  let endpoint: string;
  try {
    endpoint = await parseEndpointFromRequest(req);
  } catch (e) {
    if (e instanceof ZodError) {
      return jsonResponse(
        err(
          ErrorCodes.VALIDATION,
          "Invalid unsubscribe request",
          e.issues,
        ),
        400,
      );
    }
    throw e;
  }

  // 2. Delete the row. The "was anything actually removed?" signal
  //    is captured in `removed` but intentionally NOT surfaced to the
  //    caller — both "deleted now" and "wasn't there" are valid
  //    terminal states for an idempotent unsubscribe, and both yield
  //    the same 200 response.
  const db = getDb();
  try {
    await db
      .delete(webPushSubscriptions)
      .where(eq(webPushSubscriptions.endpoint, endpoint));
  } catch {
    return jsonResponse(
      err(
        ErrorCodes.INTERNAL,
        "We couldn't remove your notification subscription. Please try again in a moment.",
      ),
      500,
    );
  }

  // 3. Success — always 200 with `{ ok: true }`, matching the
  //    task spec verbatim.
  return jsonResponse(ok({ ok: true }), 200);
}
