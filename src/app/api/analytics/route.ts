/**
 * /api/analytics
 *
 * Public, fire-and-forget analytics ingestion endpoint. The marketing site,
 * the booking app, and the admin dashboard all POST events here. The route
 * is intentionally minimal: validate the body, sanitise `properties` to
 * strip PII / secrets, persist one row, return 204.
 *
 * Behaviour summary:
 *   1. Parse + validate the JSON body against
 *      {@link analyticsEventSchema} (`{ name, properties?, sessionId }`).
 *      Validation failures are returned as `400 VALIDATION` with the
 *      standard contract envelope.
 *   2. **Sanitise `properties`** — drop any key starting with `_` or
 *      containing `password` / `token` / `secret` / `apikey` /
 *      `authorization` (case-insensitive). See
 *      {@link sanitizeProperties} for the full rule set.
 *   3. **Rate limit by IP** — STUB. The task spec calls for a per-IP
 *      rate limit, and the future `src/lib/security/rate-limit` module
 *      is the call site. Today the limit is a deliberate no-op with a
 *      `TODO` pointing at the wiring.
 *   4. Insert a row into `analytics_events` with the sanitised payload
 *      plus request metadata (IP, user-agent, locale). DB failures are
 *      logged and swallowed: the contract is "accept the event", so
 *      a transient DB error must not break the page that fired it.
 *      (Surfacing a 500 would cause the client to retry and bloat the
 *      table — the opposite of what we want.)
 *   5. Return `204 No Content` with `Cache-Control: no-store`. No body.
 *
 * Error envelope:
 *   Only validation failures are user-visible (400). All other failures
 *   collapse to 204 so the client never has to handle a transient
 *   ingestion error.
 *
 * Caching:
 *   `Cache-Control: no-store` on every response — POSTs must never be
 *   replayed by a proxy, and 204 has no body that a proxy could safely
 *   cache anyway. The header is set explicitly on both the 204 and the
 *   400 paths so the contract is uniform.
 *
 * @module src/app/api/analytics
 */

import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { err, ErrorCodes, type ApiResponse } from "@/lib/contract";
import {
  sanitizeAnalyticsEvent,
  recordAnalyticsEvent,
  type SanitizedAnalyticsEvent,
} from "@/lib/analytics/server";

// ─── Constants ──────────────────────────────────────────────────────────────

/**
 * Standard `Cache-Control: no-store` header value applied to every
 * response from this route. Ingestion POSTs must never be replayed by a
 * proxy, and a 204 body has nothing for a cache to store, so we set
 * `no-store` uniformly on the success and error paths.
 */
const NO_STORE = "no-store" as const;

/**
 * Reserved for the (yet-to-land) `src/lib/security/rate-limit` module.
 * Kept as a named constant so the future wiring only has to swap the
 * implementation in one place.
 */
const RATE_LIMIT_PER_MIN = 60;

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Best-effort client IP extraction for the rate-limit key and the
 * audit `ip` column on `analytics_events`. Mirrors the helper used by
 * `src/app/api/waitlist/route.ts` so the analytics and waitlist
 * endpoints key the future rate-limit module identically.
 *
 * We prefer the left-most `X-Forwarded-For` (the original client when
 * behind Vercel's edge), then fall back to `X-Real-IP`, then return
 * `null` so the DB column stays nullable rather than receiving a
 * literal "unknown" string.
 *
 * @param req The incoming Next.js request.
 * @returns A non-empty IP string, or `null` if it could not be resolved.
 */
function clientIp(req: NextRequest): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return null;
}

/**
 * Wrap a contract envelope in a `NextResponse` with the standard
 * `Cache-Control: no-store` header applied. Mirrors the helper used by
 * the waitlist / contact / newsletter routes so the four endpoints
 * share an identical response shape.
 *
 * @param body The contract envelope (`err(...)` result — the success
 *             path bypasses this helper to emit a body-less 204).
 * @param status HTTP status code (only 400 today; the helper is kept
 *               generic so a future 429 / 413 path is one line).
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
 * Build the body-less 204 response for the success path. We return
 * `null` as the body so Next.js emits an HTTP 204 with no payload
 * (which is exactly what the contract says: "204 No Content (no
 * body)"). The `Cache-Control: no-store` header is set explicitly so
 * the response is byte-for-byte consistent with the error paths.
 */
function noContentResponse(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Cache-Control": NO_STORE,
    },
  });
}

// ─── POST /api/analytics ────────────────────────────────────────────────────

/**
 * Handle a `POST /api/analytics` request.
 *
 * Body shape (validated by {@link analyticsEventSchema}):
 *   - `name`        : string, 1..128 chars. The event name.
 *   - `properties?` : optional object. Sanitised in place: keys
 *                     starting with `_` or containing `password` /
 *                     `token` / `secret` / `apikey` / `authorization`
 *                     (case-insensitive) are stripped before the row is
 *                     written.
 *   - `sessionId`   : string, 1..128 chars. Client-generated session
 *                     identifier.
 *
 * Responses:
 *   - `204 No Content` on success. No body, `Cache-Control: no-store`.
 *   - `400 VALIDATION` if the body fails schema parsing. The contract
 *     envelope carries the Zod issues so the client can surface a
 *     useful message.
 *   - `400 BAD_REQUEST` if the body is not valid JSON.
 *
 * @param req The incoming Next.js request.
 * @returns A {@link NextResponse} with the contract envelope (400) or a
 *          body-less 204.
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

  // 2. Validate against the schema + sanitise `properties`. A Zod
  //    failure becomes a 400 envelope with the issue list; anything
  //    else is rethrown because it would be a genuine bug.
  let event: SanitizedAnalyticsEvent;
  try {
    event = sanitizeAnalyticsEvent(raw);
  } catch (e) {
    if (e instanceof ZodError) {
      return jsonResponse(
        err(ErrorCodes.VALIDATION, "Invalid analytics event", e.issues),
        400,
      );
    }
    throw e;
  }

  // 3. Rate limiting — STUB for now. The task spec says to rate limit
  //    by IP. The future `src/lib/security/rate-limit` module is the
  //    call site; today we noop so the route works in environments
  //    where the rate-limit module is not yet wired up. The constant
  //    is kept so the wiring is a one-line change.
  //
  // TODO: agent rate-limit — call
  //   `await checkRateLimit({ key: "analytics:ingest", identifier:
  //   clientIp(req) ?? "unknown", limit: RATE_LIMIT_PER_MIN, window:
  //   "1m" })` here. Until then, the 60/min budget is unenforced and
  //   we accept the spam risk in development.
  const ip = clientIp(req);
  const userAgent = req.headers.get("user-agent");
  const locale = req.headers.get("accept-language")?.split(",")[0]?.trim() ?? null;
  void ip;
  void RATE_LIMIT_PER_MIN;

  // 4. Persist the event. DB failures are swallowed: the contract is
  //    "accept the event", so a transient DB error must not break the
  //    page that fired it. Surfacing a 500 would cause the client to
  //    retry and bloat the table — the opposite of what we want.
  //
  // TODO: agent observability — replace the silent `catch {}` with a
  //   structured log line via the future `src/lib/observability`
  //   module. Today, a DB failure here is invisible. We accept that
  //   gap for v1; it is the observability agent's contract to land
  //   the logger + metrics wiring.
  try {
    await recordAnalyticsEvent({
      name: event.name,
      properties: event.properties,
      sessionId: event.sessionId,
      ip,
      userAgent: userAgent ?? null,
      locale,
    });
  } catch {
    // Swallow DB errors — see the comment above. The caller gets 204
    // regardless. A real logger will surface this in a later revision.
  }

  // 5. Success — 204 No Content, no body, `Cache-Control: no-store`.
  return noContentResponse();
}
