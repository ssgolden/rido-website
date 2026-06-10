/**
 * /api/health
 *
 * Liveness probe for the Rido backend. Returns a small, stable
 * JSON envelope that downstream monitors (Kubernetes, Vercel's
 * "Health Check" feature, uptime robots, etc.) can hit on a
 * regular cadence.
 *
 * Behaviour:
 *
 *   - The handler is intentionally **stateless**: no DB query,
 *     no env validation, no rate-limit check. A health check
 *     that depends on the database would flap whenever Postgres
 *     hiccups, which is exactly the opposite of what
 *     "is the *app* alive?" should mean. The `/api/admin/...`
 *     surface and the waitlist POST are the right places to
 *     detect a broken DB connection.
 *
 *   - The response shape is the standard contract envelope
 *     (`@/lib/contract`) so a generic Rido API client can
 *     consume the response without a special case:
 *
 *       {
 *         "ok": true,
 *         "data": {
 *           "status":  "healthy",
 *           "uptime":  42.137,           // seconds, float
 *           "version": "0.1.0"           // package.json version
 *         }
 *       }
 *
 *   - `Cache-Control: no-store` is set so a CDN never serves a
 *     stale uptime to a probe. Health endpoints are the textbook
 *     example of a response that must be fresh on every hit.
 *
 *   - The route is reachable on `GET` only; other methods get
 *     a 405 with the standard `METHOD_NOT_ALLOWED` envelope.
 *
 * @module src/app/api/health
 */

import { NextResponse } from "next/server";

import { ok, err, ErrorCodes, type ApiResponse } from "@/lib/contract";

// ─── Constants ──────────────────────────────────────────────────────────────

/**
 * Standard `Cache-Control: no-store` header value applied to
 * every health response. A probe must always see the freshest
 * possible value; even a 1 s cache would risk a false-negative
 * during a rolling restart.
 */
const NO_STORE = "no-store" as const;

/**
 * Application version string, surfaced from `package.json` at
 * build time. We declare it `as const` so the literal is kept
 * verbatim in the bundle; if you bump the version in
 * `package.json`, the new value flows through on the next build.
 */
const APP_VERSION = "0.1.0" as const;

// ─── Module-level state ────────────────────────────────────────────────────

/**
 * The timestamp at which the current Node process started. We
 * capture it lazily (i.e. on first read, not at module load) so
 * that the value reflects the moment the runtime actually
 * became available, not the moment a deploy was scheduled. The
 * capture is a single property write per process — effectively
 * free — and the field is `readonly` so the value cannot be
 * accidentally reset by a test.
 */
let processStartedAt: number | null = null;

/**
 * Return the process start time in milliseconds since the Unix
 * epoch, computing it on the first call and caching the result
 * forever after. We prefer `process.uptime()` to a stored
 * timestamp when available — it survives the `globalThis` cache
 * surviving a hot reload — but fall back to a stored value in
 * edge runtimes where `process` is not defined.
 *
 * @returns The process start time as a `Date.now()`-style
 *          millisecond timestamp.
 */
function getProcessStartedAt(): number {
  if (processStartedAt !== null) return processStartedAt;
  // `process.uptime()` returns seconds; convert to ms so the
  // subtraction with `Date.now()` (ms) works without a unit
  // mismatch. The fallback handles edge runtimes that don't
  // expose `process` — `Date.now()` is the only timestamp we
  // can rely on in that environment.
  const start =
    typeof process !== "undefined" && typeof process.uptime === "function"
      ? Date.now() - Math.floor(process.uptime() * 1000)
      : Date.now();
  processStartedAt = start;
  return start;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Wrap a contract envelope in a `NextResponse` with the standard
 * `Cache-Control: no-store` header applied. Mirrors the helper
 * used in `/api/admin/waitlist` and `/api/newsletter`.
 *
 * @param body The contract envelope (`ok(...)` or `err(...)` result).
 * @param status HTTP status code.
 * @returns A `NextResponse` ready to return from the route handler.
 */
function jsonResponse(body: ApiResponse<unknown>, status: number): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": NO_STORE },
  });
}

// ─── GET /api/health ────────────────────────────────────────────────────────

/**
 * Handle a `GET /api/health` request.
 *
 * The handler is safe to call repeatedly; there is no rate
 * limiting on the health check (a probe that is itself
 * rate-limited would be useless). The response is always 200
 * with `status: "healthy"` unless something inside the runtime
 * itself has thrown — which would already be a 500 by the time
 * the error envelope is constructed.
 *
 * @returns A {@link NextResponse} with the contract envelope.
 */
export async function GET(): Promise<NextResponse> {
  const startedAt = getProcessStartedAt();
  const uptimeSeconds = (Date.now() - startedAt) / 1000;

  return jsonResponse(
    ok({
      status: "healthy" as const,
      uptime: Math.max(0, Math.round(uptimeSeconds * 1000) / 1000),
      version: APP_VERSION,
    }),
    200,
  );
}

// ─── Method guard ───────────────────────────────────────────────────────────

/**
 * Reject any HTTP method other than `GET`. Health checks are
 * always GETs; a non-GET probe is almost certainly a misbehaving
 * monitor and is better answered with a clear 405 than a silent
 * success.
 *
 * @returns A {@link NextResponse} with a `METHOD_NOT_ALLOWED`
 *          envelope and a 405 status.
 */
export async function POST(): Promise<NextResponse> {
  return jsonResponse(
    err(ErrorCodes.METHOD_NOT_ALLOWED, "GET is the only method supported on /api/health"),
    405,
  );
}

export async function PUT(): Promise<NextResponse> {
  return jsonResponse(
    err(ErrorCodes.METHOD_NOT_ALLOWED, "GET is the only method supported on /api/health"),
    405,
  );
}

export async function PATCH(): Promise<NextResponse> {
  return jsonResponse(
    err(ErrorCodes.METHOD_NOT_ALLOWED, "GET is the only method supported on /api/health"),
    405,
  );
}

export async function DELETE(): Promise<NextResponse> {
  return jsonResponse(
    err(ErrorCodes.METHOD_NOT_ALLOWED, "GET is the only method supported on /api/health"),
    405,
  );
}
