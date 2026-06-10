/**
 * Cache tag helpers.
 *
 * Tags are short, namespaced strings that describe a *category* of cache
 * entries rather than a single key. They are used by
 * {@link cacheInvalidateByTag} to bulk-evict groups of related entries
 * without having to enumerate every key by hand.
 *
 * The convention is `"<namespace>:<id>"`:
 *
 *   - `city:madrid`        — anything keyed by the `madrid` city slug
 *   - `vehicle:abc-123`    — the single vehicle with that id
 *   - `vehicles:near:36.5,-3.7:500` — the geo-anchored vehicle list
 *
 * Keeping the namespace prefix on every tag means {@link cacheInvalidateByTag}
 * can use a *prefix scan* (Redis `SCAN MATCH tag:<namespace>:<id>:*`) or a
 * direct membership lookup (the in-memory `tag -> Set<key>` index) to find
 * affected keys, without ever reading values out of the cache.
 *
 * Centralising the formatting in one file means:
 *   1. The wire format can never drift between writers and invalidators.
 *   2. Renaming a namespace is a one-line change.
 *   3. The same tag helpers are importable from both backend code
 *      (e.g. route handlers) and tests (which exercise the cache directly).
 *
 * @module src/lib/cache/tags
 */

/**
 * Build a tag for a single city record.
 *
 * Used by:
 *   - city-list / city-detail routes that cache by `slug`
 *   - city-aware queries (vehicles, waitlist counters) that need to
 *     bust when a city row is updated
 *
 * @param slug The city slug, as it appears in the URL and the DB
 *             primary-key column (e.g. `"madrid"`, `"valencia"`).
 * @returns The tag, e.g. `"city:madrid"`.
 *
 * @example
 * ```ts
 * await cacheSet("city:slug:madrid", value, 300, [tagCity("madrid")]);
 * await cacheInvalidateByTag(tagCity("madrid"));
 * ```
 */
export function tagCity(slug: string): string {
  return `city:${slug}`;
}

/**
 * Build a tag for a single vehicle record.
 *
 * Used by:
 *   - vehicle-detail routes that cache by `id`
 *   - the "nearby vehicles" route, which attaches a vehicle tag to
 *     every entry so that an update to a single vehicle only needs
 *     one invalidation call
 *
 * @param id The vehicle id (UUID/ULID as stored in the DB).
 * @returns The tag, e.g. `"vehicle:01HXYZ..."`.
 */
export function tagVehicle(id: string): string {
  return `vehicle:${id}`;
}

/**
 * Build a tag for a list of vehicles anchored to a geographic point
 * and radius. Two requests with the same `{ lat, lng, radiusMeters }`
 * share a tag, so updating the fleet in a neighbourhood invalidates
 * every query that targets it.
 *
 * Coordinates are rounded to 4 decimal places (~11 m of precision)
 * so that two requests 5 m apart collapse to the same bucket — the
 * cache is not the place to preserve that level of precision.
 *
 * @param lat The anchor latitude in decimal degrees.
 * @param lng The anchor longitude in decimal degrees.
 * @param radiusMeters The search radius in metres.
 * @returns The tag, e.g. `"vehicles:near:40.4168,-3.7038:500"`.
 */
export function tagVehiclesNear(
  lat: number,
  lng: number,
  radiusMeters: number,
): string {
  // toFixed(4) ≈ 11 m precision; round the radius to the nearest 10 m
  // so a radius of 500 vs 501 doesn't produce two separate buckets.
  const rLat = Number(lat.toFixed(4));
  const rLng = Number(lng.toFixed(4));
  const rRad = Math.round(radiusMeters / 10) * 10;
  return `vehicles:near:${rLat},${rLng}:${rRad}`;
}

/**
 * Build a tag for a city's active vehicle list (no geo anchor). This
 * is the bucket the public city map view hits when it asks for "all
 * scooters in Madrid right now".
 *
 * @param slug The city slug.
 * @returns The tag, e.g. `"city-vehicles:madrid"`.
 */
export function tagCityVehicles(slug: string): string {
  return `city-vehicles:${slug}`;
}

/**
 * Build a tag for a user-scoped resource. Used by private routes
 * (bookings, payment methods, etc.) that need per-user invalidation
 * without leaking entries into the global cache.
 *
 * @param userId The authenticated user's id.
 * @returns The tag, e.g. `"user:01HXYZ..."`.
 */
export function tagUser(userId: string): string {
  return `user:${userId}`;
}
