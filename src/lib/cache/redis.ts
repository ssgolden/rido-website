/**
 * Redis cache backend.
 *
 * // TODO stub — interface only.
 *
 * `ioredis` is installed (see `package.json`) but no concrete
 * implementation is wired up yet. The functions in this file are the
 * *signatures* the rest of the cache module expects to call when
 * `REDIS_URL` is set; they exist so the dispatcher in {@link ./index}
 * can resolve a backend at module-load time without crashing.
 *
 * Why a stub instead of a real implementation:
 *   1. Rido's hosting target (Vercel serverless) requires a
 *      long-lived Redis client (Upstash, Redis Cloud, etc.) that the
 *      deploy environment must provision separately. Wiring that
 *      connection is a deployment concern, not a code one, and the
 *      project owner wants the surface locked down first.
 *   2. The tag-invalidation strategy on Redis needs a real design
 *      call — `SCAN MATCH tag:<tag>:*` is correct but slow on large
 *      keyspaces; a dedicated Set per tag (`SADD tag:<tag>:<id> key`)
 *      is faster but needs an extra write on every `set`. That is a
 *      decision for the observability/perf pass, not for v1.
 *   3. ioredis is a top-level import; in environments without a real
 *      Redis URL we never want to open a socket. Keeping the file a
 *      pure-shape stub lets us *not* import ioredis at all until the
 *      first real call.
 *
 * Behaviour of the stub:
 *   - {@link isConfigured} returns `true` iff `REDIS_URL` is set in
 *     the environment, mirroring the dispatcher's branching rule.
 *   - Every other exported function throws an `Error` whose message
 *     names the function and points to this file. The dispatcher
 *     only ever calls the stub if the operator explicitly configured
 *     Redis, so an accidental call is loud and debuggable rather than
 *     silently serving stale in-memory data.
 *
 * @module src/lib/cache/redis
 */

/**
 * Resolve `REDIS_URL` from the environment. Reads the raw `process.env`
 * rather than the Zod-parsed `Env` from `@/lib/contract` so that this
 * file has no runtime dependency on the rest of the contract module —
 * a hard requirement for the dispatcher, which needs to ask "is
 * Redis configured?" before it knows whether it is safe to call
 * `getEnv()`.
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
 * @returns `true` if `REDIS_URL` is set in the environment. Used by
 *          the dispatcher in {@link ./index} to decide which backend
 *          to instantiate.
 */
export function isConfigured(): boolean {
  return getRedisUrl() !== null;
}

/**
 * Look up a key in Redis. **Not implemented in this stub.**
 *
 * @param _key The cache key.
 * @returns Would return the stored value, or `null` on miss. The
 *          stub never returns.
 * @throws {Error} Always. The message names the function so the
 *                 dispatcher's call site is easy to identify in
 *                 logs.
 */
export function get<T = unknown>(_key: string): Promise<T | null> {
  throw new Error(
    "lib/cache/redis: `get` is not implemented. " +
      "REDIS_URL is set; wire up an ioredis client to enable this backend.",
  );
}

/**
 * Store `value` under `key` in Redis. **Not implemented in this stub.**
 *
 * @param _key        The cache key.
 * @param _value      The value to cache. The future implementation
 *                    will `JSON.stringify` and `SET` with `EX ttlSeconds`.
 * @param _ttlSeconds Optional time-to-live in seconds. `0` / negative
 *                    would map to "no expiry" in the future
 *                    implementation.
 * @throws {Error} Always.
 */
export function set<T = unknown>(
  _key: string,
  _value: T,
  _ttlSeconds?: number,
): Promise<void> {
  throw new Error(
    "lib/cache/redis: `set` is not implemented. " +
      "REDIS_URL is set; wire up an ioredis client to enable this backend.",
  );
}

/**
 * Remove a single key from Redis. **Not implemented in this stub.**
 *
 * @param _key The key to drop.
 * @throws {Error} Always.
 */
export function del(_key: string): Promise<void> {
  throw new Error(
    "lib/cache/redis: `del` is not implemented. " +
      "REDIS_URL is set; wire up an ioredis client to enable this backend.",
  );
}

/**
 * Drop every key in the current Redis logical database.
 *
 * **Not implemented in this stub.** When implemented, this should use
 * `SCAN MATCH *` (or `FLUSHDB` if the operator is comfortable with
 * the global side effect). The dispatcher intentionally does *not*
 * call this from a hot path.
 *
 * @throws {Error} Always.
 */
export function clear(): Promise<void> {
  throw new Error(
    "lib/cache/redis: `clear` is not implemented. " +
      "REDIS_URL is set; wire up an ioredis client to enable this backend.",
  );
}

/**
 * Build the key pattern that `cacheInvalidateByTag` will scan for on
 * the Redis backend. Exposed here so the dispatcher can use a
 * consistent scheme when it is implemented.
 *
 * Convention: a key whose value was tagged with `tag` is stored as
 * `tag:idx:<tag>` (a Set) holding one entry per key, and the value
 * itself lives under its original key. The future implementation of
 * `set` will `SADD tag:idx:<tag> key` alongside the `SET`; the future
 * implementation of `delByTag` will `SMEMBERS tag:idx:<tag>` then
 * `DEL` the listed keys plus the index key itself.
 *
 * @param tag The tag, as produced by one of the helpers in
 *            {@link ./tags}.
 * @returns The index-set key, e.g. `"tag:idx:city:madrid"`.
 */
export function tagIndexKey(tag: string): string {
  return `tag:idx:${tag}`;
}
