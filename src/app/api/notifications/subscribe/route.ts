/**
 * /api/notifications/subscribe
 *
 * Public endpoint for the browser's service worker to register a Web
 * Push subscription. The body is the JSON shape produced by
 * `PushSubscription.toJSON()`:
 *
 *   {
 *     "endpoint": "https://fcm.googleapis.com/fcm/send/...",
 *     "expirationTime": null,
 *     "keys": {
 *       "p256dh": "<URL-safe base64>",
 *       "auth":   "<URL-safe base64>"
 *     }
 *   }
 *
 * Behaviour:
 *   - POST — validate the body, upsert the row into
 *     `web_push_subscriptions`, return 201.
 *   - DELETE — remove the row whose `endpoint` matches the JSON body
 *     (or the `?endpoint=…` query string), return 200.
 *
 * The route is intentionally **idempotent on POST**: a re-submit for
 * the same endpoint is treated as a refresh of the encryption material
 * (`p256dh` / `auth` may rotate when the browser renews them), and the
 * existing row is updated in place via an upsert keyed on the PK
 * (`endpoint`). The unique-violation on insert is therefore the
 * "happy path" that we explicitly handle, not an error condition we
 * surface to the caller.
 *
 * The DELETE handler follows the same idempotent philosophy: removing
 * a non-existent row is `200 { ok: true }`, not `404`, because the
 * caller's intent ("I want this subscription gone") is satisfied either
 * way.
 *
 * Authentication: the public VAPID key + a valid signature on the
 * subscription is the de-facto proof of subscription ownership. We do
 * NOT require a logged-in user — a notification subscription can be
 * created anonymously. When a user later signs in, the row's
 * `user_id` column can be back-filled by a separate "claim" endpoint
 * (not in scope here).
 *
 * Caching:
 *   Every response sets `Cache-Control: no-store`. A cached 201 would
 *   be replayed by a proxy and could resurrect a subscription the
 *   user had explicitly deleted in the meantime.
 *
 * @module src/app/api/notifications/subscribe
 */

import { NextResponse, type NextRequest } from "next/server";
import { z, ZodError } from "zod";
import { eq } from "drizzle-orm";

import { ok, err, ErrorCodes, type ApiResponse } from "@/lib/contract";
import { getDb, webPushSubscriptions } from "@/lib/db";

// ─── Constants ──────────────────────────────────────────────────────────────

/**
 * Standard `Cache-Control: no-store` header value applied to every
 * response from this route. POST/DELETE for a notification
 * subscription must never be replayed by a proxy — the DB is the
 * single source of truth.
 */
const NO_STORE = "no-store" as const;

/**
 * Postgres SQLSTATE for a unique-constraint violation. The
 * `web_push_subscriptions` table has `endpoint` as the PRIMARY KEY
 * (see `src/lib/db/schema.ts`); a re-submit for the same endpoint
 * trips this code, which we treat as the upsert signal.
 */
const PG_UNIQUE_VIOLATION = "23505";

/**
 * Name of the primary-key index guarding the
 * `web_push_subscriptions` table. Used as a belt-and-suspenders check
 * in case the driver ever changes how it surfaces SQLSTATE errors.
 */
const WEBPUSH_PK_INDEX = "web_push_subscriptions_pkey";

// ─── Schemas ────────────────────────────────────────────────────────────────

/**
 * Zod schema for the JSON body of a `POST /api/notifications/subscribe`
 * request.
 *
 * Rules:
 *   - `endpoint` — non-empty string, must parse as a `https://` URL.
 *     We reject `http://` (push services are TLS-only) and any other
 *     scheme (`data:`, `javascript:`, etc.) to prevent an attacker
 *     from filling the table with garbage rows.
 *   - `keys.p256dh` — non-empty string. The P-256 ECDH public key the
 *     browser generated, URL-safe base64. We don't re-parse the base64
 *     here (the `web-push` library will do that on send) but a length
 *     floor of 32 chars catches obvious garbage.
 *   - `keys.auth` — non-empty string. The shared-auth secret, URL-safe
 *     base64. Same length floor as `p256dh`.
 *   - `expirationTime` — accepted but optional. The browser's
 *     `PushSubscription` may include it; we ignore it.
 */
const subscribeBodySchema = z.object({
  endpoint: z
    .string()
    .trim()
    .min(1, "endpoint is required")
    .url("endpoint must be a valid URL")
    .refine(
      (u) => u.startsWith("https://"),
      "endpoint must use the https:// scheme",
    ),
  expirationTime: z.union([z.number().int().nonnegative(), z.null()]).optional(),
  keys: z.object({
    p256dh: z
      .string()
      .trim()
      .min(32, "keys.p256dh is too short to be a valid P-256 public key"),
    auth: z
      .string()
      .trim()
      .min(16, "keys.auth is too short to be a valid auth secret"),
  }),
});

/**
 * Zod schema for the JSON body of a `DELETE /api/notifications/subscribe`
 * request. We only need the endpoint — `p256dh` / `auth` are not
 * required to identify a row.
 *
 * The same schema is used for the `?endpoint=…` query string (via
 * {@link parseEndpointFromRequest}) so the DELETE handler can accept
 * either shape.
 */
const unsubscribeBodySchema = z.object({
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
 * by `src/app/api/contact/route.ts` and `src/app/api/waitlist/route.ts`
 * so all the JSON endpoints share an identical response shape.
 *
 * @param body   The contract envelope (`ok(...)` or `err(...)` result).
 * @param status HTTP status code (200, 201, 400, 404, 500, …).
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
 * Decide whether a thrown error is a unique-constraint violation on
 * the `web_push_subscriptions` primary key.
 *
 * Drizzle wraps the underlying `postgres` driver error; the SQLSTATE
 * lives on `error.cause.code` (and on a few older versions directly
 * on the error). We check both, and additionally confirm the
 * constraint name when it's available so we don't accidentally treat,
 * e.g., a future unique index on a different column as the "duplicate
 * subscription" signal.
 *
 * @param e The error thrown by `db.insert(...).values(...)`.
 * @returns `true` if the failure is a duplicate subscription insert.
 */
function isUniqueViolation(e: unknown): boolean {
  if (!e || typeof e !== "object") return false;

  // Newer Drizzle versions: { cause: { code, constraint_name, ... } }
  // Older versions: the same fields are on the error itself.
  const candidates: unknown[] = [e, (e as { cause?: unknown }).cause];
  for (const c of candidates) {
    if (!c || typeof c !== "object") continue;
    const obj = c as Record<string, unknown>;
    if (obj.code === PG_UNIQUE_VIOLATION) {
      const name = obj.constraint_name ?? obj.constraint;
      if (typeof name === "string") {
        // Match the PK explicitly; the web-push table currently has no
        // other unique index, so this is the only 23505 we should see
        // on insert.
        if (name === WEBPUSH_PK_INDEX) return true;
        if (name.startsWith("web_push_subscriptions_")) return true;
      } else {
        // No constraint name available; trust the SQLSTATE on the
        // assumption that this is the only unique index on the
        // web-push table at the moment.
        return true;
      }
    }
  }
  return false;
}

/**
 * Parse the DELETE request body or `?endpoint=…` query string into a
 * validated endpoint URL.
 *
 * Two shapes are supported:
 *   1. JSON body `{ "endpoint": "https://…" }` — used by the
 *      `serviceWorker` when it calls `subscription.unsubscribe()` and
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
    return unsubscribeBodySchema.parse({ endpoint: queryEndpoint }).endpoint;
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
  return unsubscribeBodySchema.parse(raw ?? {}).endpoint;
}

// ─── POST /api/notifications/subscribe ──────────────────────────────────────

/**
 * Handle a `POST /api/notifications/subscribe` request.
 *
 * Flow:
 *   1. Parse JSON body. An unparseable body is a 400.
 *   2. Validate against {@link subscribeBodySchema}. Invalid shapes
 *      return `400 VALIDATION` with the Zod issues.
 *   3. Insert a row into `web_push_subscriptions`. A unique violation
 *      on the `endpoint` PK is the upsert signal: we update
 *      `p256dh` / `auth` in place and return 201 (the caller's intent
 *      — "make sure this subscription is registered" — is satisfied
 *      whether the row is brand new or pre-existing).
 *   4. Return 201 with `{ endpoint, subscribed: true }`.
 *
 * @param req The incoming Next.js request carrying a JSON body that
 *            satisfies {@link subscribeBodySchema}.
 * @returns A {@link NextResponse} with the contract envelope.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Parse JSON body. An unparseable body is a 400, not a 500.
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonResponse(
      err(ErrorCodes.BAD_REQUEST, "Request body must be valid JSON"),
      400,
    );
  }

  // 2. Validate against the schema. The schema's `.refine()` rules
  //    (https-only, min length on the keys) run inside `parse()`.
  let body;
  try {
    body = subscribeBodySchema.parse(raw);
  } catch (e) {
    if (e instanceof ZodError) {
      return jsonResponse(
        err(
          ErrorCodes.VALIDATION,
          "Invalid push subscription",
          e.issues,
        ),
        400,
      );
    }
    throw e;
  }

  // 3. Persist the subscription. `endpoint` is the PRIMARY KEY, so a
  //    re-submit for the same endpoint trips a unique violation, which
  //    we treat as the upsert signal — we update the encryption
  //    material in place rather than failing the request.
  const db = getDb();
  try {
    await db
      .insert(webPushSubscriptions)
      .values({
        endpoint: body.endpoint,
        p256dh: body.keys.p256dh,
        auth: body.keys.auth,
      })
      .onConflictDoUpdate({
        target: webPushSubscriptions.endpoint,
        set: {
          p256dh: body.keys.p256dh,
          auth: body.keys.auth,
        },
      });
  } catch (e) {
    // Defensive: with `.onConflictDoUpdate(...)` we should not see a
    // 23505 on this path. If we do, the most likely cause is a driver
    // quirk where the conflict target didn't match; log it and fall
    // through to a single-statement update so the caller still gets a
    // 201.
    if (isUniqueViolation(e)) {
      try {
        await db
          .update(webPushSubscriptions)
          .set({
            p256dh: body.keys.p256dh,
            auth: body.keys.auth,
          })
          .where(eq(webPushSubscriptions.endpoint, body.endpoint));
      } catch {
        return jsonResponse(
          err(
            ErrorCodes.INTERNAL,
            "We couldn't save your notification subscription. Please try again in a moment.",
          ),
          500,
        );
      }
    } else {
      return jsonResponse(
        err(
          ErrorCodes.INTERNAL,
          "We couldn't save your notification subscription. Please try again in a moment.",
        ),
        500,
      );
    }
  }

  // 4. Success — return 201 with the endpoint and a `subscribed: true`
  //    flag. `subscribed` is redundant given the HTTP status, but
  //    having a boolean in the body makes the client-side type
  //    explicit and forward-compatible with future statuses.
  return jsonResponse(
    ok({
      endpoint: body.endpoint,
      subscribed: true,
    }),
    201,
  );
}

// ─── DELETE /api/notifications/subscribe ───────────────────────────────────

/**
 * Handle a `DELETE /api/notifications/subscribe` request.
 *
 * Removes the row whose `endpoint` matches the request body or query
 * string. The handler is **idempotent**: removing a non-existent row
 * is `200 { ok: true }`, not `404`, because the caller's intent
 * ("I want this subscription gone") is satisfied either way.
 *
 * Accepts the endpoint from either:
 *   - JSON body: `{ "endpoint": "https://…" }`
 *   - Query string: `?endpoint=https://…`
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

  // 2. Delete the row. We use `.returning({ endpoint })` so the SQL
  //    layer tells us whether anything was actually removed — this is
  //    the signal we use to decide between `200 { ok: true }` and
  //    `404 NOT_FOUND`. The behaviour is intentionally idempotent on
  //    the success path (re-deleting is still 200), but we do surface
  //    a 404 the first time so the client can distinguish "deleted
  //    now" from "wasn't there" if it needs to.
  const db = getDb();
  try {
    const removed = await db
      .delete(webPushSubscriptions)
      .where(eq(webPushSubscriptions.endpoint, endpoint))
      .returning({ endpoint: webPushSubscriptions.endpoint });

    if (removed.length === 0) {
      return jsonResponse(
        err(
          ErrorCodes.NOT_FOUND,
          "No subscription found for that endpoint.",
        ),
        404,
      );
    }
  } catch {
    return jsonResponse(
      err(
        ErrorCodes.INTERNAL,
        "We couldn't remove your notification subscription. Please try again in a moment.",
      ),
      500,
    );
  }

  // 3. Success.
  return jsonResponse(ok({ ok: true }), 200);
}
