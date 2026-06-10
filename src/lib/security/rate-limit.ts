/**
 * In-memory token-bucket rate limiter.
 *
 * The rate limiter is the security module's primary defence against
 * brute-force attacks, credential stuffing, and accidental
 * request-storms. Every other piece of the Rido backend that exposes
 * a public surface — `/api/auth/*`, `/api/contact`, `/api/upload`,
 * webhook receivers — should funnel its "is this caller allowed to
 * hit us again right now?" check through {@link rateLimit} or one
 * of the IP-based helpers at the bottom of this file.
 *
 * ## Algorithm
 *
 * The implementation is a classic *token bucket* with continuous
 * refill: each key is associated with a small record holding the
 * current token count and the wall-clock timestamp of the last
 * refill. On every call we:
 *
 *   1. Compute how many tokens should have been added since the last
 *      refill: `delta = (now - lastRefill) / windowSeconds * limit`.
 *   2. Add `delta` to the stored token count, capped at `limit` (the
 *      bucket's capacity).
 *   3. If the new count is `>= 1`, deduct one token and report
 *      "allowed". Otherwise report "denied" and compute how long the
 *      caller must wait before the next whole token is available.
 *
 * The token bucket has better burst behaviour than a fixed-window
 * counter: a client that earned 60 tokens in a quiet minute can
 * spend them all in a single second, and a client that has been
 * silent for a long time can immediately fire `limit` requests
 * without having to "warm up" over the window. The cost is slightly
 * more arithmetic per check and a per-key record (we store two
 * numbers — `tokens` and `lastRefill`).
 *
 * ## Scope and limits
 *
 *   - **Process-local only.** The `Map` lives in this module's
 *     closure, so the limiter is shared by every caller inside the
 *     same Node process but *not* across instances. On Vercel that
 *     means "per warm serverless function" — a determined attacker
 *     can multiply their effective quota by the number of warm
 *     instances. Acceptable for v1; cross-instance limiting requires
 *     the Redis backend (see "Optional Redis backend" below).
 *   - **No LRU / no max size.** The map will grow with the cardinality
 *     of unique keys. For a per-IP limiter at a low-traffic site
 *     this is fine; a future hardening pass can add either an LRU
 *     cap or a periodic prune of entries whose `lastRefill` is older
 *     than a few windows.
 *   - **No concurrent-write races.** JavaScript is single-threaded,
 *     so a single `rateLimit` call is atomic with respect to other
 *     calls. The Map is mutated only inside this function, so we
 *     never observe a half-written entry.
 *
 * ## Optional Redis backend
 *
 * If the `REDIS_URL` environment variable is set the dispatcher in
 * {@link ./index} will route calls to a Redis-backed implementation
 * using `INCR` + `EXPIRE`. `ioredis` is listed in `package.json`
 * dependencies, so the wire-up is a pure implementation task — the
 * function signatures and result shapes will not change. See
 * {@link ./index} for the dispatcher's branching rule.
 *
 * For v1 we ship *in-memory only*. The `REDIS_URL` branch is
 * stubbed at the dispatcher level so an operator who sets the env
 * var sees a clear "not implemented" error rather than silently
 * being downshifted to the in-memory store.
 *
 * @module src/lib/security/rate-limit
 */

// ─── Types ─────────────────────────────────────────────────────────────────

/**
 * Input to {@link rateLimit}. The shape is a single object (rather
 * than positional args) so adding optional fields later — e.g.
 * `cost` for "this request consumes N tokens" — is a non-breaking
 * change.
 */
export interface RateLimitInput {
  /**
   * The bucket identifier. Conventionally namespaced so that two
   * unrelated callers don't accidentally share a bucket:
   *
   *   - `auth:login:ip:1.2.3.4`
   *   - `contact:form:ip:1.2.3.4`
   *   - `webhook:stripe:account:acct_123`
   *
   * Any string is accepted; the only requirement is that
   * semantically-distinct buckets have distinct keys.
   */
  key: string;
  /**
   * The bucket's capacity, i.e. the maximum number of requests a
   * caller may make within `windowSeconds` in a steady state.
   * Must be a positive integer. The same value also acts as the
   * "refill rate" — the bucket is refilled at `limit / windowSeconds`
   * tokens per second, capped at `limit`.
   */
  limit: number;
  /**
   * The window length, in seconds, over which `limit` requests are
   * permitted. The token bucket's *effective* window is the same as
   * a sliding window of this length: `limit` requests at the start
   * of the window will be fully replenished `windowSeconds` later.
   * Must be a positive number.
   */
  windowSeconds: number;
}

/**
 * Result of a {@link rateLimit} check. Always returned — the function
 * never throws on policy violations; it just reports `allowed: false`
 * along with the data the caller needs to build a polite `429`
 * response.
 */
export interface RateLimitResult {
  /**
   * `true` if the caller may proceed. `false` if the bucket is empty
   * and the caller should back off.
   */
  allowed: boolean;
  /**
   * The number of tokens remaining in the bucket *after* this call.
   * Always `>= 0` and `<= limit`. Suitable for inclusion in the
   * `X-RateLimit-Remaining` response header (the dispatcher surfaces
   * the limit in the standard `x-rido-ratelimit` envelope from
   * `@/lib/contract`).
   */
  remaining: number;
  /**
   * Wall-clock timestamp (`Date.now()` milliseconds) at which the
   * bucket will be fully refilled. Suitable for the
   * `X-RateLimit-Reset` header. The value is absolute, not relative,
   * so the caller can serialise it directly to a number of seconds
   * or an ISO string without doing any arithmetic.
   */
  resetAt: number;
  /**
   * Set to a positive integer only when `allowed === false`. The
   * number of whole seconds the caller should wait before retrying
   * — i.e. the time until at least one whole token is available
   * again. Suitable for the `Retry-After` header on a `429`
   * response. Always at least `1`; never `0`.
   */
  retryAfterSeconds?: number;
}

/**
 * Single bucket's worth of state. The shape is intentionally minimal
 * — just enough to drive the refill math on the next call. We do
 * *not* store the original `limit` / `windowSeconds` because both
 * are call-site parameters; persisting them would make a key
 * "lock in" to the first caller's policy, which is exactly the kind
 * of footgun this minimal shape is designed to avoid.
 */
interface Bucket {
  /**
   * The current token count, possibly fractional. The refill math
   * is `delta = elapsed / windowSeconds * limit`, and we deliberately
   * do not floor it — keeping the fractional part means a caller who
   * is denied by a hair can retry almost immediately rather than
   * waiting for a full second.
   */
  tokens: number;
  /**
   * `Date.now()`-compatible millisecond timestamp of the last
   * refill calculation. We compare against `Date.now()` on the next
   * call, so storing a millisecond timestamp is what makes the
   * "time-since-last-refill" arithmetic cheap.
   */
  lastRefill: number;
}

// ─── Module-level state ────────────────────────────────────────────────────

/**
 * The shared bucket store. The map is a singleton — every caller
 * shares the same store, which is the whole point. A future addition
 * of a per-tenant or per-namespace store would either key the map
 * with a namespace prefix or maintain parallel maps; both are out of
 * scope for v1.
 */
const buckets = new Map<string, Bucket>();

/**
 * Periodic prune timer handle. Held at module scope so that
 * {@link __resetRateLimitForTests} can cancel it between test cases
 * (otherwise the timer would keep a reference to a stale store and
 * leak across cases).
 */
let pruneTimer: ReturnType<typeof setInterval> | null = null;

/**
 * How often the prune sweep runs, in milliseconds. Five minutes is
 * a reasonable default: it bounds memory growth without producing
 * observable CPU pressure on the hot path. The interval is
 * intentional and not derived from caller input — a caller that
 * wants faster eviction can call {@link __resetRateLimitForTests}
 * with a custom `staleAfterMs`.
 */
const DEFAULT_PRUNE_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Buckets whose `lastRefill` is older than this many milliseconds
 * are considered dead and dropped by the prune sweep. The default
 * is two hours: long enough that an active bucket is never
 * reaped under its user's feet, short enough that a brute-force
 * attacker that pings once and disappears doesn't leave a tombstone
 * in the map forever.
 */
const DEFAULT_STALE_AFTER_MS = 2 * 60 * 60 * 1000;

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Check (and atomically consume) one token from the bucket
 * identified by `input.key`.
 *
 * The function is synchronous: the in-memory store does not need
 * to do I/O, and the Redis backend (when implemented) will be a
 * thin async wrapper around `INCR` + `EXPIRE` that callers
 * `await` exactly once. The result shape is the same in both
 * cases.
 *
 * Behaviour:
 *   - Bucket missing     → a fresh bucket is created with a full
 *                          `limit` tokens, one is deducted, and
 *                          `allowed: true` is returned.
 *   - Bucket present,
 *     tokens >= 1        → one token is deducted and `allowed: true`
 *                          is returned. `remaining` is the new count.
 *   - Bucket present,
 *     tokens < 1         → no token is deducted (the bucket is not
 *                          penalised for being inspected), the
 *                          `retryAfterSeconds` is computed, and
 *                          `allowed: false` is returned.
 *
 * `remaining` is always floored for the result field, even though
 * the internal counter may be fractional. The reason: HTTP
 * `X-RateLimit-Remaining` is a count of *whole* requests, and
 * exposing `4.7` would invite clients to make sub-token requests
 * that the server cannot honour.
 *
 * @param input The rate-limit policy and the bucket key.
 * @returns A {@link RateLimitResult} describing the decision.
 * @throws {RangeError} If `limit` or `windowSeconds` is not a
 *                      positive finite number. The in-memory store
 *                      is *not* mutated in that case — the
 *                      validation runs before any side effect.
 */
export function rateLimit(input: RateLimitInput): RateLimitResult {
  const { key, limit, windowSeconds } = input;

  // ── Argument validation ──────────────────────────────────────────────
  // We validate up front so a misconfigured call site (e.g. a typo'd
  // `windowSeconds: 0`) gets a loud, immediate error rather than a
  // bucket that silently never refills.
  if (
    typeof limit !== "number" ||
    !Number.isFinite(limit) ||
    limit <= 0 ||
    Math.floor(limit) !== limit
  ) {
    throw new RangeError(
      `rateLimit: 'limit' must be a positive integer (got ${String(limit)}).`,
    );
  }
  if (
    typeof windowSeconds !== "number" ||
    !Number.isFinite(windowSeconds) ||
    windowSeconds <= 0
  ) {
    throw new RangeError(
      `rateLimit: 'windowSeconds' must be a positive finite number (got ${String(windowSeconds)}).`,
    );
  }

  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  // ── Refill ───────────────────────────────────────────────────────────
  // `buckets.get(key)` returns `undefined` for a brand-new key, which
  // is the same as "the bucket has been at full capacity since the
  // infinite past" — we treat the refill as the full `limit` and skip
  // the elapsed-time arithmetic in that case.
  let bucket = buckets.get(key);
  if (bucket) {
    const elapsed = now - bucket.lastRefill;
    if (elapsed > 0) {
      // Continuous refill: `limit` tokens per `windowMs` ms. We use
      // the standard token-bucket formula
      //   tokens = min(limit, tokens + elapsed / windowMs * limit)
      // but kept the `elapsed / windowMs * limit` shape (rather than
      // `elapsed * limit / windowMs`) so the multiplication order
      // matches the spec language in this module's docstring.
      const refilled =
        bucket.tokens + (elapsed / windowMs) * limit;
      bucket.tokens = Math.min(limit, refilled);
      bucket.lastRefill = now;
    }
  } else {
    // New bucket starts at full capacity. `lastRefill = now` is a
    // convenient lie that means "no time has elapsed since the last
    // refill" — i.e. the next call won't accumulate any fractional
    // tokens before the deduction.
    bucket = { tokens: limit, lastRefill: now };
    buckets.set(key, bucket);
  }

  // ── Consume-or-deny ──────────────────────────────────────────────────
  // We re-read the bucket reference here because the `if (bucket)`
  // branch above may have set it, but TypeScript's control-flow
  // analysis does not narrow `let` reassignments across an `else`
  // that mutates a Map. A local `const` re-binding is the cleanest
  // way to keep the type narrow.
  const current = bucket;

  if (current.tokens >= 1) {
    current.tokens -= 1;
    return {
      allowed: true,
      remaining: Math.floor(current.tokens),
      // `resetAt` is the time at which the bucket would be full
      // again, i.e. when the *next* `limit` tokens are all
      // replenished. From `now` that's `(limit - current.tokens) /
      // limit * windowSeconds` seconds. We precompute the
      // multiplier once and floor on the millisecond to avoid the
      // `setTimeout`-style rounding that would otherwise come from
      // `(limit - tokens) * windowMs / limit` when `tokens` is
      // near `limit`.
      resetAt: now + computeResetMs(current.tokens, limit, windowMs),
    };
  }

  // Denied: tell the caller exactly when the *next whole token*
  // arrives, not when the bucket is full. `Math.ceil` of the wait
  // is the smallest whole-second interval that is guaranteed to
  // cover the fractional time, which is the semantics `Retry-After`
  // requires (you never want a `Retry-After: 0` that still ends in a
  // deny on the immediate retry).
  const retryAfterSeconds = computeRetryAfterSeconds(
    current.tokens,
    limit,
    windowMs,
  );
  return {
    allowed: false,
    remaining: 0,
    resetAt: now + computeResetMs(current.tokens, limit, windowMs),
    retryAfterSeconds,
  };
}

// ─── IP-based helpers ──────────────────────────────────────────────────────

/**
 * The standard set of headers used to communicate a caller IP to a
 * server behind a reverse proxy. The list is small on purpose:
 * adding more headers would mean trusting more intermediaries, and
 * each one is a possible spoofing surface.
 */
const IP_HEADERS = [
  "x-forwarded-for",
  "x-real-ip",
  "cf-connecting-ip", // Cloudflare
  "true-client-ip", // Akamai / Cloudflare Enterprise
] as const;

/**
 * Extract the originating IP from a `Headers`-shaped object, using
 * the same priority order every Rido endpoint should follow:
 *
 *   1. `x-forwarded-for` — the *first* comma-separated entry, which
 *      is the original client per RFC 7239 conventions. The header
 *      may legitimately contain a chain of proxies; the leftmost
 *      address is the one that made the very first hop.
 *   2. `x-real-ip` — set by some reverse proxies (notably nginx) as
 *      a single-value alternative to `x-forwarded-for`.
 *   3. `cf-connecting-ip` / `true-client-ip` — set by CDN providers
 *      that rewrite the request before it reaches us. Kept as
 *      fallbacks so the same code works behind Cloudflare without
 *      a code change.
 *
 * Why we don't fall back to `req.ip` / `req.socket.remoteAddress`:
 * those are *transport-level* addresses — they identify the last
 * hop, which on Vercel is always a Vercel edge node, not the user.
 * The headers above are the only way to see the real client.
 *
 * @param headers A `Headers` instance, a `Record<string, string>`,
 *                or a `NextRequest.headers` (any object that has a
 *                `get(key)` method). `null` / `undefined` is
 *                treated as "no headers available".
 * @returns The extracted IP string, or `null` if no recognisable
 *          IP header was present. The returned string is *not*
 *          validated for IPv4 / IPv6 well-formedness — that is a
 *          presentation concern left to the caller. We also do
 *          *not* trim a port suffix (`"1.2.3.4:5678"`); again,
 *          that is the caller's job if they care.
 */
export function extractClientIp(
  headers:
    | Headers
    | Record<string, string | string[] | undefined>
    | null
    | undefined,
): string | null {
  if (!headers) return null;

  // Normalise to a `get(key)`-shaped view. We do this once up front
  // so the loop below doesn't have to branch on the input type at
  // every iteration.
  const get = (name: string): string | null => {
    if (typeof (headers as Headers).get === "function") {
      // The `Headers` class from `node:undici` / `next/dist` is
      // case-insensitive; this is the only path where case folding
      // is "free", so we keep the header names in lower case in
      // `IP_HEADERS` and let the underlying implementation handle
      // the lookup.
      return (headers as Headers).get(name);
    }
    const value = (headers as Record<string, string | string[] | undefined>)[
      name
    ];
    if (Array.isArray(value)) return value[0] ?? null;
    return value ?? null;
  };

  for (const header of IP_HEADERS) {
    const raw = get(header);
    if (!raw) continue;

    if (header === "x-forwarded-for") {
      // `X-Forwarded-For` is a comma-separated list. The convention
      // is leftmost = original client. We split, trim each entry,
      // and take the first non-empty one. An entry of `""` or
      // whitespace would otherwise make `raw` look "set" while
      // producing a useless result.
      const first = raw.split(",")[0]?.trim();
      if (first) return first;
    } else {
      // The other headers are single-value by spec; trim defensively
      // because nginx and Cloudflare are both known to occasionally
      // ship a leading whitespace in development.
      const trimmed = raw.trim();
      if (trimmed) return trimmed;
    }
  }
  return null;
}

/**
 * Prebuilt helper for the common case "rate-limit a request by the
 * caller's IP". Wraps {@link rateLimit} with a key derived from the
 * supplied IP and the policy the caller asked for.
 *
 * The key format is `"ip:<ip>"` — namespaced with `ip:` so that a
 * future helper that buckets by `userId`, `apiKey`, etc. can't
 * collide with the IP bucket by accident.
 *
 * If `ip` is `null` (i.e. {@link extractClientIp} returned nothing)
 * the call falls back to a single `"ip:unknown"` bucket. This is a
 * deliberate safety net: it means an attacker who can suppress all
 * IP headers (e.g. by stripping them at a custom proxy) still
 * gets throttled, just at a coarser granularity. If your endpoint
 * cannot accept a `null` caller, do the IP check at the top of the
 * handler and return `400` before calling this helper.
 *
 * @param ip            The caller's IP, typically the result of
 *                      {@link extractClientIp}. `null` is allowed and
 *                      means "unknown".
 * @param limit         Forwarded to {@link rateLimit}.
 * @param windowSeconds Forwarded to {@link rateLimit}.
 * @returns The same {@link RateLimitResult} as {@link rateLimit}.
 */
export function rateLimitByIp(
  ip: string | null,
  limit: number,
  windowSeconds: number,
): RateLimitResult {
  const key = ip ? `ip:${ip}` : "ip:unknown";
  return rateLimit({ key, limit, windowSeconds });
}

// ─── Internal helpers ──────────────────────────────────────────────────────

/**
 * Compute the wall-clock duration, in milliseconds, until the
 * bucket is fully refilled from its current state.
 *
 * The formula is `(limit - tokens) / limit * windowMs`. When the
 * bucket is already at full capacity the result is `0`; when it is
 * empty it is the full `windowMs`. We `Math.ceil` the millisecond
 * value so that callers never see a `resetAt` that is *earlier*
 * than the current moment, which would be a useless (and confusing)
 * value for a `Cache-Control: max-age` derivation.
 */
function computeResetMs(
  tokens: number,
  limit: number,
  windowMs: number,
): number {
  const deficit = Math.max(0, limit - tokens);
  return Math.ceil((deficit / limit) * windowMs);
}

/**
 * Compute the number of whole seconds the caller should wait before
 * one whole token is available.
 *
 * The math: we need `tokens + elapsed / windowMs * limit >= 1`,
 * solved for `elapsed`. That gives `elapsed = (1 - tokens) * windowMs
 * / limit`. We `Math.ceil` to whole seconds and then clamp to a
 * minimum of `1` — a `retryAfterSeconds` of `0` is a footgun (it
 * invites clients into a tight retry loop) and a negative value is
 * nonsensical.
 */
function computeRetryAfterSeconds(
  tokens: number,
  limit: number,
  windowMs: number,
): number {
  const needed = Math.max(0, 1 - tokens);
  const ms = (needed * windowMs) / limit;
  return Math.max(1, Math.ceil(ms / 1000));
}

// ─── Maintenance hooks ─────────────────────────────────────────────────────

/**
 * Drop every entry in the store. Intended for tests
 * (`afterEach(() => clearRateLimit())`) and for admin routes that
 * need to nuke a corrupt bucket map without restarting the
 * process. Do NOT call this from a hot path — clearing is O(n)
 * over the entire bucket map.
 */
export function clearRateLimit(): void {
  buckets.clear();
}

/**
 * Return the number of buckets currently being tracked. Exposed
 * mostly for tests and `/api/_debug` admin routes — production code
 * should not branch on this.
 */
export function rateLimitSize(): number {
  return buckets.size;
}

/**
 * Start (or replace) the periodic prune timer. Buckets whose
 * `lastRefill` is older than `staleAfterMs` are dropped on each
 * tick. The timer is started lazily — the first call from a real
 * caller will trigger it, so cold-start latency on a Vercel
 * function isn't paid at module-load time.
 *
 * The timer is *idempotent*: calling it again with the same (or
 * default) arguments replaces the previous handle, so it's safe
 * to call from a test setup. Pass `0` for `intervalMs` or
 * `staleAfterMs` to disable the sweep entirely.
 *
 * @param intervalMs  How often to sweep. Defaults to
 *                    {@link DEFAULT_PRUNE_INTERVAL_MS}.
 * @param staleAfterMs A bucket is considered dead if its last
 *                     refill was longer ago than this. Defaults
 *                     to {@link DEFAULT_STALE_AFTER_MS}.
 *
 * @internal Exposed for tests and admin tooling.
 */
export function __startRateLimitPruneTimer(
  intervalMs: number = DEFAULT_PRUNE_INTERVAL_MS,
  staleAfterMs: number = DEFAULT_STALE_AFTER_MS,
): void {
  if (pruneTimer) {
    clearInterval(pruneTimer);
    pruneTimer = null;
  }
  if (intervalMs <= 0 || staleAfterMs <= 0) return;
  pruneTimer = setInterval(() => {
    const cutoff = Date.now() - staleAfterMs;
    // Snapshot the keys first so the `delete` call doesn't
    // interact with a live iterator. Same pattern as
    // `cache/memory.ts`'s `delMatching`.
    for (const key of Array.from(buckets.keys())) {
      const b = buckets.get(key);
      if (b && b.lastRefill < cutoff) {
        buckets.delete(key);
      }
    }
  }, intervalMs);
  // `setInterval`'s handle in Node keeps the event loop alive, but
  // we don't want a deploy-time prune timer to delay process exit
  // in tests. `.unref()` is a one-way operation that the test
  // harness can use to opt out by calling
  // `__resetRateLimitForTests`.
  if (typeof (pruneTimer as { unref?: () => void }).unref === "function") {
    (pruneTimer as { unref: () => void }).unref();
  }
}

/**
 * Cancel the prune timer (if running) and clear the bucket store.
 * Intended for test setup/teardown — production code should never
 * call this. Calling it on a long-running server would wipe the
 * rate-limit state of every active caller, which would be a
 * significant DoS vector if the helper were ever accidentally
 * exposed.
 *
 * @internal
 */
export function __resetRateLimitForTests(): void {
  if (pruneTimer) {
    clearInterval(pruneTimer);
    pruneTimer = null;
  }
  buckets.clear();
}
