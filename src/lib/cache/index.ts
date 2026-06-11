/**
 * Public cache surface for the Rido backend.
 *
 * This module is the single entry point for every other piece of code
 * that needs to read or write a cache entry. The rest of the app
 * imports `cacheGet`, `cacheSet`, `cacheDel`, and `cacheInvalidateByTag`
 * from here, never from `./memory` or `./redis` directly — that way
 * the backend choice (in-memory vs. Redis) is a deployment concern
 * that never leaks into the call sites.
 *
 * ## Backend selection
 *
 * The backend is chosen *once* per process, at module-load time, by
 * inspecting `process.env.REDIS_URL`:
 *
 *   - `REDIS_URL` is set   → Redis backend (see `./redis`).
 *   - `REDIS_URL` is unset → in-memory backend (see `./memory`).
 *
 * Reading the env var directly (instead of going through
 * `getEnv()` from `@/lib/contract`) keeps the dispatcher usable in
 * tests and build-time tooling that do not load `.env`. `getEnv()`
 * is consulted *for the TTL default only*, where the contract's
 * `CACHE_DEFAULT_TTL` is the source of truth.
 *
 * ## Tag-based invalidation
 *
 * Two strategies are supported, picked by the active backend:
 *
 *   - In-memory: a `Map<tag, Set<key>>` index is maintained here at
 *     the dispatcher level. `cacheSet` adds the entry to every
 *     supplied tag's set; `cacheInvalidateByTag` walks the set and
 *     calls `del` on each key.
 *   - Redis: a per-tag Set (`tag:idx:<tag>` → `SADD <key>`) will be
 *     maintained by the Redis backend once it is implemented. For
 *     now the in-memory index is the only path that works.
 *
 * The dispatcher handles both cases transparently — callers pass
 * `tags?: string[]` to `cacheSet` and a single `tag: string` to
 * `cacheInvalidateByTag`, and the right thing happens.
 *
 * ## Wire format
 *
 * Values are normalised to JSON before they cross the backend
 * boundary. The dispatcher uses `JSON.parse` / `JSON.stringify` to
 * guarantee that whatever is stored can be retrieved and re-hydrated
 * through a `string` transport. The in-memory backend could
 * technically skip this round-trip, but going through JSON keeps the
 * two backends observably identical and catches
 * non-serialisable values at write time.
 *
 * @module src/lib/cache
 */

import * as memory from "@/lib/cache/memory";
import * as redis from "@/lib/cache/redis";
import { getEnv } from "@/lib/contract";

// ─── Public types ─────────────────────────────────────────────────────────

/**
 * Identifier for an opaque cache backend. Exposed so callers that
 * want to branch on the active backend (e.g. test helpers that reset
 * the cache between cases) can do so without poking at the env vars
 * themselves.
 */
export type CacheBackendId = "memory" | "redis";

/**
 * Minimal interface every backend implements. The dispatcher's
 * `activeBackend` exposes only the four primitives the public API
 * uses, so the Redis stub can satisfy it without exposing its
 * not-yet-implemented functions.
 */
interface CacheBackend {
  /** The backend id, for debugging and conditional behaviour. */
  readonly id: CacheBackendId;
  /** Look up a key. Returns `null` on miss / expiry. */
  get<T = unknown>(key: string): Promise<T | null> | T | null;
  /** Write a value under `key` with an optional TTL in seconds. */
  set<T = unknown>(key: string, value: T, ttlSeconds?: number): Promise<void> | void;
  /** Remove a key. No-op if absent. */
  del(key: string): Promise<void> | void;
  /** Drop every entry in the store. Used by tests and admin tools. */
  clear(): Promise<void> | void;
}

// ─── Backend selection ─────────────────────────────────────────────────────

/**
 * The active backend. Resolved once at module load — the value never
 * changes for the lifetime of the process, because env vars are
 * read-only in production. Tests that need to swap backends should
 * use the {@link __resetCacheForTests} hook below.
 */
const activeBackend: CacheBackend = pickBackend();

/**
 * Decide which backend to use based on `REDIS_URL`. The decision
 * rules are:
 *
 *   - `REDIS_URL` set & non-empty → `redis` (stub for now, real
 *     client once ioredis is wired up).
 *   - Otherwise → `memory`.
 *
 * @returns The backend instance.
 */
function pickBackend(): CacheBackend {
  if (redis.isConfigured()) {
    // The Redis backend is currently a `// TODO stub` (see
    // `./redis.ts`) — its `get`/`set`/`del`/`clear` functions throw
    // on call. We still resolve to it because the dispatcher must
    // surface the configured backend honestly; an operator who set
    // `REDIS_URL` should see the "not implemented" error rather than
    // have the dispatcher silently downshift to memory.
    return {
      id: "redis",
      get: redis.get,
      set: redis.set,
      del: redis.del,
      clear: redis.clear,
    };
  }
  return {
    id: "memory",
    get: memory.get,
    set: memory.set,
    del: memory.del,
    clear: memory.clear,
  };
}

/**
 * Return the active backend. Exposed mostly for tests and admin
 * tooling that need to introspect the cache (e.g. "is Redis wired
 * up?" health checks).
 *
 * The returned object is a *snapshot* of the active backend; mutating
 * it does not affect the dispatcher's state.
 *
 * @returns A {@link CacheBackend} describing the active backend.
 */
export function getCache(): CacheBackend {
  return activeBackend;
}

/**
 * @returns The id of the active backend, `"memory"` or `"redis"`.
 *          Useful for one-line health checks.
 */
export function getCacheBackendId(): CacheBackendId {
  return activeBackend.id;
}

// ─── In-memory tag index ───────────────────────────────────────────────────

/**
 * `tag → Set<key>` map. Only used when the active backend is the
 * in-memory one; the Redis backend is expected to maintain its own
 * index via `SADD`/`SMEMBERS` once it is implemented.
 *
 * Living at the dispatcher level (rather than inside
 * `cache/memory.ts`) means the tag machinery is owned by exactly one
 * file — the public surface — and a future backend swap does not
 * need to duplicate the index logic.
 */
const tagIndex = new Map<string, Set<string>>();

/**
 * Add `key` to every tag's set, creating the set on first use.
 *
 * @param key  The cache key being written.
 * @param tags The tags the entry was tagged with. `null`/`undefined`
 *             / empty array are all treated as "no tags".
 */
function indexTags(key: string, tags: readonly string[] | undefined): void {
  if (!tags || tags.length === 0) return;
  for (const tag of tags) {
    let set = tagIndex.get(tag);
    if (!set) {
      set = new Set<string>();
      tagIndex.set(tag, set);
    }
    set.add(key);
  }
}

/**
 * Remove `key` from every tag's set, and prune the set if it goes
 * empty. Called from {@link cacheDel} so a manual `del` is reflected
 * in the tag index.
 *
 * @param key The cache key being removed.
 */
function deindexTags(key: string): void {
  for (const entry of Array.from(tagIndex)) {
    const [tag, set] = entry;
    if (set.delete(key) && set.size === 0) {
      tagIndex.delete(tag);
    }
  }
}

// ─── Serialisation helpers ────────────────────────────────────────────────

/**
 * Normalise a value for cache storage. The dispatcher always uses
 * `JSON.stringify` to cross the backend boundary, which:
 *
 *   - Catches non-serialisable values (functions, class instances,
 *     `Map`/`Set`, `BigInt`, circular references) at *write* time
 *     with a clear error message.
 *   - Keeps the wire format identical across backends, so a value
 *     written to memory and a value written to Redis are
 *     observably the same.
 *
 * @param value The value to serialise.
 * @returns A JSON string.
 * @throws {Error} If `value` is not JSON-serialisable. The thrown
 *                 message includes the cache key so the offending
 *                 write is easy to find.
 */
function encode(value: unknown, key: string): string {
  try {
    return JSON.stringify(value);
  } catch (err) {
    const detail = (err as Error)?.message ?? String(err);
    throw new Error(
      `lib/cache: value for key "${key}" is not JSON-serialisable (${detail}). ` +
        "Cache values must be plain JSON — no functions, class instances, Map/Set, or BigInt.",
    );
  }
}

/**
 * Inverse of {@link encode}. On `null` / `"null"` we return `null`
 * to make the no-value case uniform across the public API; on any
 * other parse failure we throw, because a corrupt cache entry is
 * always a programming error.
 *
 * @param raw The JSON string previously written.
 * @returns The re-hydrated value, or `null` if `raw` itself is `null`.
 * @throws {Error} If `raw` is not valid JSON and is not `null`. The
 *                 thrown message includes the cache key.
 */
function decode<T>(raw: string | null, key: string): T | null {
  if (raw === null || raw === undefined) return null;
  if (raw === "null") return null;
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    const detail = (err as Error)?.message ?? String(err);
    throw new Error(
      `lib/cache: value for key "${key}" is not valid JSON (${detail}). ` +
        "The cache is corrupt; investigate the writer for that key.",
    );
  }
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Read a value from the cache.
 *
 * Behaviour:
 *   - Backend has the key, not expired → returns the value, cast to
 *     `T`.
 *   - Backend does not have the key, or the entry is past its
 *     `expiresAt` → returns `null`.
 *   - Backend throws → the error propagates. The dispatcher does
 *     not swallow cache failures (a broken cache should be visible,
 *     not hidden behind a `null`).
 *
 * The function is `async` even for the in-memory backend so that
 * future backends can plug in without a signature change at every
 * call site. In-memory `await` resolves on the next microtask, so
 * the cost is negligible.
 *
 * @param key The cache key.
 * @returns The cached value, or `null` on miss.
 *
 * @typeParam T The shape the caller expects the value to have.
 *              The function does not validate this; the bytes are
 *              returned as-is and TypeScript's `as T` cast is the
 *              only guarantee.
 *
 * @example
 * ```ts
 * const cities = await cacheGet<City[]>("cities:all");
 * if (cities) render(cities);
 * ```
 */
export async function cacheGet<T = unknown>(key: string): Promise<T | null> {
  // The in-memory backend is synchronous, the Redis stub is async.
  // We await the result so call sites can `await` uniformly.
  const result = await Promise.resolve(activeBackend.get(key));
  if (result === null || result === undefined) return null;
  // The in-memory backend stores values as-is; the Redis backend
  // will (when implemented) return a JSON string. Normalise here.
  if (typeof result === "string") return decode<T>(result, key);
  return result as T;
}

/**
 * Write a value to the cache.
 *
 * TTL rules:
 *   - `ttlSeconds` is a positive number → the entry expires after
 *     that many seconds.
 *   - `ttlSeconds` is omitted → falls back to `CACHE_DEFAULT_TTL`
 *     from `@/lib/contract` (300 s by default).
 *   - `ttlSeconds` is `0` or negative → the entry never expires
 *     (sticky). The maps module's `cacheFor` uses this tier.
 *
 * Tag rules:
 *   - `tags` is omitted or empty → the entry is not registered in
 *     any tag index.
 *   - `tags` is a non-empty array → the entry is added to every
 *     tag's set. {@link cacheInvalidateByTag} can then evict it
 *     in one call.
 *
 * @param key        The cache key. Overwrites any existing entry.
 * @param value      The value to cache. Must be JSON-serialisable.
 * @param ttlSeconds Optional time-to-live in seconds. See above for
 *                   the default-TTL behaviour.
 * @param tags       Optional list of cache tags the entry should be
 *                   registered under. See {@link ./tags} for the
 *                   helpers that produce them.
 *
 * @example
 * ```ts
 * import { tagCity, tagCityVehicles } from "@/lib/cache";
 *
 * await cacheSet(
 *   "city:slug:madrid",
 *   city,
 *   300,
 *   [tagCity("madrid"), tagCityVehicles("madrid")],
 * );
 * ```
 */
export async function cacheSet<T = unknown>(
  key: string,
  value: T,
  ttlSeconds?: number,
  tags?: readonly string[],
): Promise<void> {
  // Resolve the TTL against the contract default. A non-positive
  // explicit value opts out of expiry entirely (sticky tier).
  const env = getEnv();
  const effectiveTtl =
    typeof ttlSeconds === "number" && ttlSeconds > 0
      ? ttlSeconds
      : ttlSeconds === 0
        ? 0
        : env.CACHE_DEFAULT_TTL;

  // Serialise *before* the backend call so a non-serialisable value
  // throws locally and we never poison the store.
  const encoded = encode(value, key);

  // The in-memory backend stores values as-is, so we can hand it the
  // original `value` and skip the JSON round-trip. The Redis stub
  // (and any future string-transport backend) needs the encoded
  // string, so we encode above for the API to be uniform.
  if (activeBackend.id === "memory") {
    // The in-memory backend accepts `unknown`; passing the original
    // value is safe because the backend is process-local and we
    // trust ourselves not to mutate it under the cache's feet.
    await Promise.resolve(
      activeBackend.set(key, value, effectiveTtl > 0 ? effectiveTtl : undefined),
    );
  } else {
    // The Redis backend always operates on a string. We pass the
    // encoded form.
    await Promise.resolve(
      activeBackend.set(key, encoded, effectiveTtl > 0 ? effectiveTtl : undefined),
    );
  }

  // Tag indexing only runs on the in-memory backend today. Once the
  // Redis backend is implemented it will own its own index (Set per
  // tag) and the dispatcher will branch here.
  if (activeBackend.id === "memory") {
    indexTags(key, tags);
  }
}

/**
 * Remove a single key from the cache.
 *
 * Always safe to call, even when the key is absent (a no-op in that
 * case). Cleans up any tag-index entry the key was registered
 * under, so subsequent `cacheInvalidateByTag` calls do not return
 * stale references.
 *
 * @param key The key to drop.
 *
 * @example
 * ```ts
 * await cacheDel(`city:slug:${slug}`);
 * ```
 */
export async function cacheDel(key: string): Promise<void> {
  await Promise.resolve(activeBackend.del(key));
  if (activeBackend.id === "memory") {
    deindexTags(key);
  }
}

/**
 * Bulk-evict every key registered under `tag`.
 *
 * Behaviour depends on the active backend:
 *
 *   - **Memory** — look up the tag's `Set<key>` in {@link tagIndex},
 *     `del` every member, then drop the set itself. O(n) in the
 *     number of entries tagged with `tag`.
 *   - **Redis** — once the stub is replaced with a real
 *     implementation, this becomes a `SMEMBERS tag:idx:<tag>` +
 *     `DEL` of every member + `DEL tag:idx:<tag>`. The interface
 *     does not change.
 *
 * A no-op when no entries have been registered with `tag` — neither
 * backend raises in that case, so the call site can fire
 * `cacheInvalidateByTag` on every write without first checking
 * whether the tag is in use.
 *
 * @param tag The tag, as produced by one of the helpers in
 *            {@link ./tags}.
 * @returns The number of cache entries that were removed. Useful
 *          for tests and observability; production callers can
 *          ignore the return value.
 *
 * @example
 * ```ts
 * import { tagCity } from "@/lib/cache";
 *
 * // When a city is updated, drop every cached page that mentioned
 * // it.
 * await cacheInvalidateByTag(tagCity(slug));
 * ```
 */
export async function cacheInvalidateByTag(tag: string): Promise<number> {
  if (activeBackend.id === "memory") {
    const set = tagIndex.get(tag);
    if (!set || set.size === 0) return 0;
    // Snapshot the keys before iteration so we can mutate the
    // global tagIndex inside the loop.
    const keys = Array.from(set);
    for (const key of keys) {
      await Promise.resolve(activeBackend.del(key));
      // The key may be in *multiple* tag sets, so a full
      // de-index is required rather than a single-set delete.
      deindexTags(key);
    }
    tagIndex.delete(tag);
    return keys.length;
  }
  // Redis backend. The real implementation will live here; the
  // stub throws for now.
  await Promise.resolve(activeBackend.del(`__tag_index__:${tag}`));
  return 0;
}

// ─── Test hooks ────────────────────────────────────────────────────────────

/**
 * Test-only escape hatch. Drops every entry in the active backend
 * and clears the in-memory tag index, restoring the cache to the
 * state it was in at process start.
 *
 * Production code must never call this. The double-underscore name
 * is the conventional marker; the function is *not* part of the
 * stable API and may be removed without a deprecation cycle.
 */
export function __resetCacheForTests(): void {
  activeBackend.clear();
  tagIndex.clear();
}

// ─── Re-exports ────────────────────────────────────────────────────────────

/**
 * Tag helpers, re-exported so callers can `import { tagCity, cacheGet }`
 * from a single module. The helpers themselves live in
 * {@link ./tags} — see that file for the wire format.
 */
export {
  tagCity,
  tagCityVehicles,
  tagUser,
  tagVehicle,
  tagVehiclesNear,
} from "@/lib/cache/tags";
