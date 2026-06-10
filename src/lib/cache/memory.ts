/**
 * In-memory cache backend.
 *
 * The simplest possible implementation: a `Map<string, CacheEntry<T>>`
 * keyed by string, with a per-entry expiry timestamp so reads can do a
 * single `get` + compare to return a value or `null`/`undefined` on a
 * miss. The map lives for the lifetime of the Node process — on Vercel
 * that means "per warm instance", on `next dev` it means "until the
 * process is restarted".
 *
 * Scope and limits:
 *   - Process-local only. No cross-instance coordination, no persistence,
 *     no max-size eviction. This is fine for a single-instance dev
 *     server and for low-stakes caching in production (e.g. the static
 *     cities list); a high-cardinality or shared cache should use the
 *     Redis backend in {@link ./redis}.
 *   - No LRU. The {@link clear} helper exists so tests and admin routes
 *     can nuke the cache, but the map will grow unboundedly in
 *     long-running processes. A future hardening pass can swap the
 *     backing `Map` for an LRU without changing the public surface.
 *   - No concurrent-write races. JavaScript is single-threaded, so a
 *     `set` cannot be interrupted mid-write, but a second `set` to the
 *     same key can clobber the first. That is intentional.
 *   - No tag index is maintained *inside* this module. Tag-based
 *     invalidation is implemented in {@link ./index} on top of the
 *     `get/set/del` primitives, so a future backend (Redis) can swap
 *     the in-memory tag index for a SCAN-based implementation without
 *     touching this file.
 *
 * Wire format:
 *   Values are stored as `unknown` and round-tripped through `JSON.parse`
 *   on read so that the public surface in {@link ./index} can advertise
 *   `get<T>`/`set<T>` over a uniform `string` transport. This is good
 *   enough for the JSON-serialisable payloads the rest of the backend
 *   emits; passing a `Date`, `Map`, or class instance would silently
 *   lose type fidelity — see the docs on {@link set} below.
 *
 * @module src/lib/cache/memory
 */

/**
 * Single cache entry: the JSON-serialised value and the wall-clock
 * time at which it should be considered stale.
 *
 * `expiresAt` is the *absolute* expiry time in `Date.now()` milliseconds,
 * not a relative TTL. Storing the absolute timestamp lets `get` do a
 * single `Date.now() > expiresAt` check without remembering the TTL.
 *
 * `value` is typed as `unknown` so the same entry shape works for every
 * payload. The casting happens at the public-API boundary in
 * {@link ./index}.
 */
interface CacheEntry {
  /** The cached value, as it was last passed to {@link set}. */
  value: unknown;
  /** `Date.now()`-compatible millisecond timestamp past which the entry is stale. */
  expiresAt: number;
}

/**
 * Module-level map. The cache is intentionally a singleton — every
 * caller shares the same store, which is the whole point. A future
 * addition of a per-tenant or per-namespace cache would either key
 * the map with the namespace prefix or maintain parallel maps; both
 * are out of scope for v1.
 */
const store = new Map<string, CacheEntry>();

/**
 * @returns The current number of live (and possibly-expired) entries
 *          in the store. Exposed mostly for tests and `/api/_debug`
 *          admin routes — production code should not branch on this.
 */
export function size(): number {
  return store.size;
}

/**
 * Look up a key and return its value if it is still fresh.
 *
 * Behaviour:
 *   - Key not present      → returns `null`.
 *   - Key present, expired → the entry is dropped eagerly and `null`
 *                            is returned. Eager eviction keeps the map
 *                            from accumulating dead entries.
 *   - Key present, fresh   → returns the stored value, cast to `T` so
 *                            the caller can use a single signature for
 *                            every payload type.
 *
 * The `T` parameter is *advisory* — the function cannot verify that the
 * stored JSON payload actually matches the requested shape, so a bad
 * `T` annotation will surface as a runtime error at the *use* site, not
 * here.
 *
 * @param key The cache key. Conventionally namespaced (e.g. `"city:slug:madrid"`)
 *            so that an inverse-lookup on a tag can find it again.
 * @returns The cached value, or `null` if the key is missing or expired.
 *
 * @typeParam T The shape the caller expects the value to have. Inferred
 *              from the call site's assignment; the function itself
 *              does no runtime validation.
 */
export function get<T = unknown>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    // Eager eviction: a hit on an expired entry still pays the cost of
    // touching the map, so we might as well free the slot for the next
    // writer.
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

/**
 * Store `value` under `key`, replacing any existing entry.
 *
 * Values are stored as-is (no `JSON.parse`/`JSON.stringify` round-trip
 * inside this module) — the JSON normalisation lives in {@link ./index},
 * which is the one place that can decide whether to fail loudly on
 * non-serialisable values.
 *
 * If `ttlSeconds` is omitted, the entry never expires. This is the
 * "sticky" tier of the cache, suitable for things like the static
 * cities list that change at deploy time. Production callers should
 * usually pass a TTL — see {@link ./index}'s `cacheSet` for the
 * default-TTL logic.
 *
 * @param key        The cache key. Overwrites any existing entry.
 * @param value      The value to cache. Must be JSON-serialisable —
 *                   see the note above.
 * @param ttlSeconds Optional time-to-live in *seconds*. When supplied,
 *                   the entry is evicted lazily on the next read past
 *                   the deadline; pass `0` or a negative value to keep
 *                   the entry indefinitely (explicit "no expiry").
 */
export function set<T = unknown>(
  key: string,
  value: T,
  ttlSeconds?: number,
): void {
  const hasTtl = typeof ttlSeconds === "number" && ttlSeconds > 0;
  const expiresAt = hasTtl ? Date.now() + ttlSeconds * 1000 : Number.POSITIVE_INFINITY;
  store.set(key, { value, expiresAt });
}

/**
 * Remove a single entry.
 *
 * Safe to call on a missing key — it is a no-op in that case, which
 * keeps the invalidation call sites symmetric (`del` is always
 * the right call, even when you suspect the key is absent).
 *
 * Returns `void` rather than the `Map.delete` boolean so the
 * dispatcher's {@link CacheBackend} interface can be implemented by
 * both this in-memory module and the future Redis module without a
 * type-widening dance at the boundary.
 *
 * @param key The key to drop.
 */
export function del(key: string): void {
  store.delete(key);
}

/**
 * Drop every entry in the store.
 *
 * Intended for tests (`afterEach(() => cache.clear())`) and for admin
 * routes that need to nuke a corrupt cache without restarting the
 * process. Do NOT call this from a hot path — clearing is O(n) over
 * the entire cache.
 */
export function clear(): void {
  store.clear();
}

/**
 * Remove every entry whose key matches `predicate`. Used by
 * {@link ./index} to implement tag-based invalidation against the
 * in-memory backend.
 *
 * The predicate runs synchronously against the live `Map`, so it sees
 * a consistent snapshot of keys. The implementation copies the key
 * set first to avoid the "deleting during iteration" footgun.
 *
 * @param predicate A pure function that returns `true` for keys that
 *                  should be removed.
 * @returns The number of entries that were removed.
 *
 * @internal Used by {@link ./index} — not part of the public surface
 *           of the in-memory backend.
 */
export function delMatching(predicate: (key: string) => boolean): number {
  let removed = 0;
  // Snapshot the key set so we can mutate the map safely. With very
  // large caches the snapshot is a temporary array of strings, which
  // is still cheap.
  for (const key of Array.from(store.keys())) {
    if (predicate(key)) {
      store.delete(key);
      removed++;
    }
  }
  return removed;
}

/**
 * Return every key currently in the store whose key matches
 * `predicate`. Like {@link delMatching}, this is the in-memory backend's
 * "what's in the bucket?" hook for {@link ./index}.
 *
 * @param predicate A pure function that returns `true` for keys that
 *                  should be reported.
 * @returns A fresh array of matching keys. Iteration order follows
 *          `Map`'s insertion order.
 *
 * @internal Used by {@link ./index} — not part of the public surface.
 */
export function keysMatching(predicate: (key: string) => boolean): string[] {
  const out: string[] = [];
  // Materialise the key iterator with `Array.from` so the loop works
  // under the project's `target: "ES2017"` setting (which does not
  // enable `MapIterator` iteration directly).
  for (const key of Array.from(store.keys())) {
    if (predicate(key)) out.push(key);
  }
  return out;
}
