/**
 * Public security surface for the Rido backend.
 *
 * This module is the single entry point for every other piece of
 * code that needs a rate-limit decision or a client-IP lookup.
 * The rest of the app imports {@link rateLimit},
 * {@link rateLimitByIp}, and {@link extractClientIp} from here,
 * never from `./rate-limit` directly — that way the backend
 * choice (in-memory vs. Redis) is a deployment concern that
 * never leaks into the call sites.
 *
 * ## Backend selection
 *
 * The rate-limiter backend is chosen *once* per process, at
 * module-load time, by inspecting `process.env.REDIS_URL`:
 *
 *   - `REDIS_URL` is set   → Redis backend (see "Optional Redis
 *                            backend" below).
 *   - `REDIS_URL` is unset → in-memory backend (see `./rate-limit`).
 *
 * Reading the env var directly (instead of going through
 * `getEnv()` from `@/lib/contract`) keeps the dispatcher usable
 * in tests and build-time tooling that do not load `.env`. The
 * full env schema is consulted for *other* configuration, not
 * for the backend branch.
 *
 * ## Optional Redis backend
 *
 * The Redis backend is currently a `// TODO stub`. `ioredis` is
 * listed in `package.json` dependencies, so wiring it up is a
 * pure implementation task — the function signatures and result
 * shapes in this barrel will not change. An operator who sets
 * `REDIS_URL` will see a clear "not implemented" error from the
 * stub rather than silently being downshifted to the in-memory
 * store, which is the correct failure mode: it surfaces the
 * misconfiguration loudly, instead of letting the deploy behave
 * as if rate limiting worked when in fact every call is hitting
 * a fresh serverless instance's empty bucket.
 *
 * The contract: a successful wire-up of the Redis backend will
 * `INCR` a per-window key, `EXPIRE` it to `windowSeconds`, and
 * report `allowed: false` when the count exceeds `limit`. The
 * returned `remaining`, `resetAt`, and `retryAfterSeconds` values
 * are derived from the post-INCR count and the remaining TTL —
 * semantics identical to the in-memory token bucket.
 *
 * ## Future expansions
 *
 * The security module is expected to grow to include CSRF token
 * helpers, signed-cookie utilities, and request-signature
 * verifications. They will all be re-exported from this barrel
 * so that the import surface (`@/lib/security`) stays stable as
 * the module grows.
 *
 * @module src/lib/security
 */

import {
  rateLimit as inMemoryRateLimit,
  extractClientIp as inMemoryExtractClientIp,
  clearRateLimit as inMemoryClearRateLimit,
  type RateLimitInput,
  type RateLimitResult,
} from "./rate-limit";

// ─── Public type re-exports ────────────────────────────────────────────────

/**
 * Re-export of the rate-limit input contract. Callers that want
 * to type a stored policy or a config object should import the
 * type from this barrel rather than from `./rate-limit`, so the
 * public surface is stable when we eventually re-export it.
 */
export type { RateLimitInput, RateLimitResult } from "./rate-limit";

// ─── Header / CORS / CSRF re-exports ───────────────────────────────────────

/**
 * Re-export the security-headers helpers so consumers can do
 *
 * ```ts
 * import { generateNonce, getSecurityHeaders } from "@/lib/security";
 * ```
 *
 * without reaching into `./headers` directly. The semantics
 * (a per-request CSP nonce, a `frame-ancestors 'none'` policy,
 * HSTS in production, …) are all owned by `./headers`; this
 * barrel only forwards.
 */
export {
  generateNonce,
  getSecurityHeaders,
  buildContentSecurityPolicy,
} from "./headers";

/**
 * Re-export the CORS helpers. Callers that want a one-shot
 * "give me the headers I should attach to a response" helper
 * should import {@link getCorsHeaders} and {@link isOriginAllowed}
 * from this barrel rather than from `./cors` directly — the
 * same pattern we use for the rate-limit dispatch: a single
 * public surface, a swappable implementation.
 */
export { getCorsHeaders, isOriginAllowed } from "./cors";
export type { CorsHeaders } from "./cors";

/**
 * Re-export the CSRF helpers. The constant-time verification in
 * {@link verifyCsrfToken} is the load-bearing security primitive;
 * exporting it from the barrel is what lets every other module
 * import a single security surface without needing to know
 * whether the token comes from a header, a form field, or
 * somewhere else.
 */
export {
  generateCsrfToken,
  verifyCsrfToken,
  getCsrfTokenFromHeaders,
  CSRF_HEADER,
} from "./csrf";

// ─── Backend selection ─────────────────────────────────────────────────────

/**
 * Resolve `REDIS_URL` from the environment. Reads the raw
 * `process.env` rather than the Zod-parsed `Env` from
 * `@/lib/contract` so that this file has no runtime dependency
 * on the rest of the contract module — a hard requirement for
 * the dispatcher, which needs to ask "is Redis configured?"
 * before it is safe to call `getEnv()`.
 *
 * @returns The URL string if `REDIS_URL` is set and non-empty,
 *          otherwise `null`.
 */
function getRedisUrl(): string | null {
  const raw = process.env.REDIS_URL;
  if (!raw || raw.trim().length === 0) return null;
  return raw;
}

/**
 * `true` iff `REDIS_URL` is set in the environment. The
 * dispatcher consults this exactly once at module-load time to
 * decide which rate-limit implementation to wire up.
 */
function isRedisConfigured(): boolean {
  return getRedisUrl() !== null;
}

// ─── Backend implementations ───────────────────────────────────────────────

/**
 * The minimal interface every rate-limit backend must satisfy.
 * Both the in-memory token-bucket and the future Redis backend
 * implement it. The signature is sync-shaped with an `async`
 * escape hatch — the in-memory backend is genuinely synchronous,
 * the Redis backend will return a `Promise`. The union of
 * return types (`T | Promise<T>`) lets callers `await` the
 * result uniformly without paying for a `Promise` they don't
 * need on the in-memory path.
 */
interface RateLimitBackend {
  /**
   * Consume one token from the bucket and return the decision.
   * The argument shape mirrors the public {@link rateLimit}
   * input — see `./rate-limit` for the full contract.
   */
  consume(input: RateLimitInput): RateLimitResult | Promise<RateLimitResult>;
}

/**
 * The in-memory token-bucket implementation. Thin adapter that
 * forwards to {@link rateLimit} from `./rate-limit`. The wrapper
 * exists so the dispatcher can swap implementations without
 * changing the public type signature in this barrel.
 */
const memoryBackend: RateLimitBackend = {
  consume: (input) => inMemoryRateLimit(input),
};

/**
 * // TODO stub — Redis backend.
 *
 * `ioredis` is installed (see `package.json`) but no concrete
 * implementation is wired up yet. This object exists so the
 * dispatcher in this file can resolve a backend at module-load
 * time without crashing, and so an operator who sets `REDIS_URL`
 * sees a clear "not implemented" error rather than silently
 * being downshifted to the in-memory store.
 *
 * Wire-up plan when the time comes:
 *   1. `new Redis(process.env.REDIS_URL!)` once at module load.
 *   2. `const count = await redis.incr(key)`.
 *   3. If `count === 1`, `await redis.expire(key, windowSeconds)`
 *      so the key disappears at the end of the window.
 *   4. `const ttl = await redis.pttl(key)` to compute `resetAt`
 *      and `retryAfterSeconds`.
 *   5. `allowed = count <= limit`; `remaining = max(0, limit - count)`.
 */
const redisBackend: RateLimitBackend = {
  consume: () => {
    throw new Error(
      "lib/security: Redis rate-limit backend is not implemented. " +
        "REDIS_URL is set; wire up an ioredis client (using INCR + EXPIRE) " +
        "to enable cross-instance rate limiting.",
    );
  },
};

/**
 * The active backend. Resolved once at module load — the value
 * never changes for the lifetime of the process, because env
 * vars are read-only in production. Tests that need to swap
 * backends should use the {@link __resetSecurityForTests} hook
 * below.
 */
const activeBackend: RateLimitBackend = isRedisConfigured()
  ? redisBackend
  : memoryBackend;

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Identifier for the rate-limit backend currently in use.
 * Exposed so callers that want to branch on the active backend
 * (e.g. test helpers that reset state between cases) can do so
 * without poking at the env vars themselves.
 */
export type RateLimitBackendId = "memory" | "redis";

/**
 * The id of the backend that was selected at module-load time.
 * Use this rather than re-reading `REDIS_URL` at the call site —
 * the dispatcher's decision is the one that matters, and an
 * env-var re-read would disagree with the dispatcher's view if
 * a test mutated the env.
 */
export const activeRateLimitBackend: RateLimitBackendId = isRedisConfigured()
  ? "redis"
  : "memory";

/**
 * Consume one token from the rate-limit bucket identified by
 * `input.key` and return the policy decision.
 *
 * The function signature is synchronous from the caller's point
 * of view on the in-memory backend (the default), and `await`-able
 * when the Redis backend is wired up. The TypeScript return type
 * is the union `T | Promise<T>` so both code paths type-check at
 * the call site; the standard practice is to `await` the result
 * unconditionally and let the V8 microtask queue fold the
 * already-resolved `Promise` cheaply.
 *
 * Behaviour:
 *   - `allowed: true`  → the caller may proceed; `remaining` is
 *                        the post-deduction token count, floored
 *                        to an integer; `resetAt` is the
 *                        wall-clock millisecond timestamp at
 *                        which the bucket would be fully
 *                        refilled.
 *   - `allowed: false` → the bucket is empty; the caller must
 *                        back off for `retryAfterSeconds` whole
 *                        seconds (always >= 1).
 *
 * @param input The policy and the bucket key. See
 *              {@link RateLimitInput} for the field-level
 *              contract.
 * @returns The {@link RateLimitResult} for this call, possibly
 *          wrapped in a `Promise` when the Redis backend is
 *          active.
 */
export function rateLimit(
  input: RateLimitInput,
): RateLimitResult | Promise<RateLimitResult> {
  return activeBackend.consume(input);
}

/**
 * Prebuilt helper for the common case "rate-limit a request by
 * the caller's IP". Wraps {@link rateLimit} with a key derived
 * from the supplied IP.
 *
 * If `ip` is `null` (i.e. {@link extractClientIp} returned
 * nothing) the call falls back to a single `"ip:unknown"`
 * bucket. This is a deliberate safety net — see `./rate-limit`
 * for the rationale.
 *
 * @param ip            The caller's IP, typically the result of
 *                      {@link extractClientIp}. `null` is
 *                      allowed.
 * @param limit         Forwarded to {@link rateLimit}.
 * @param windowSeconds Forwarded to {@link rateLimit}.
 * @returns The same shape as {@link rateLimit}.
 */
export function rateLimitByIp(
  ip: string | null,
  limit: number,
  windowSeconds: number,
): RateLimitResult | Promise<RateLimitResult> {
  return activeBackend.consume({
    key: ip ? `ip:${ip}` : "ip:unknown",
    limit,
    windowSeconds,
  });
}

/**
 * Extract the originating client IP from a headers bag. Pure
 * helper — does not consult the env, does not perform I/O, does
 * not validate the address shape. The full contract is in
 * `./rate-limit`.
 */
export function extractClientIp(
  headers:
    | Headers
    | Record<string, string | string[] | undefined>
    | null
    | undefined,
): string | null {
  return inMemoryExtractClientIp(headers);
}

// ─── Maintenance hooks ─────────────────────────────────────────────────────

/**
 * Drop every bucket in the in-memory store and tear down the
 * prune timer. Intended for tests and admin tooling; production
 * code should never call this. Calling it on a long-running
 * server would wipe the rate-limit state of every active caller,
 * which would be a significant DoS vector if the helper were
 * ever accidentally exposed via a public route.
 *
 * The Redis backend (when wired up) maintains its own state in
 * Redis itself, so this helper has no effect on it. Tests that
 * exercise the Redis branch should reset the underlying Redis
 * instance directly.
 *
 * @internal
 */
export function __resetSecurityForTests(): void {
  inMemoryClearRateLimit();
}
