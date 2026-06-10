/**
 * Public, type-safe type surface for the Rido frontend API client.
 *
 * This module is the single source of truth for the *shape* of every
 * payload exchanged with the Rido backend. The companion module
 * (`./index.ts`) wraps this surface in an ergonomic `ridoApi` object
 * that performs the actual `fetch()` calls.
 *
 * Design goals:
 *   - **Re-use the existing validators** wherever possible. The Zod
 *     schemas in `@/lib/validators` are the canonical contract between
 *     the frontend and the API, and TypeScript's `z.infer<>` lets us
 *     stay in lock-step without duplicating the type definitions.
 *   - **Hand-declare shapes that have no validator** (DB row types,
 *     aggregate responses, list envelopes). Where a hand-declared
 *     shape mirrors a Drizzle inference, we annotate the JSDoc with
 *     a `@see` pointer to the source of truth.
 *   - **Never use `any`.** All public types are `readonly`-shaped where
 *     possible so consumers can pass them straight into React state
 *     without losing referential stability on re-renders.
 *   - **Match the contract envelope** from `@/lib/contract`. The
 *     client functions in `./index.ts` unwrap the `ApiResponse<T>` and
 *     throw an {@link ApiClientError} on `ApiFailure`, so callers
 *     receive a plain `T` from the success path and structured error
 *     info from the failure path.
 *
 * @module src/lib/api-client/types
 */

import type { Vehicle as DbVehicle } from "@/lib/db";
import type {
  ContactSubmission,
  NewsletterSubscribe,
  NewsletterSubscribeResult,
  WaitlistSignup,
  City as CityValidator,
  IdempotencyKey,
  Email,
  CitySlug,
  Locale,
  WaitlistSource,
} from "@/lib/validators";
import type { AnalyticsEventInput as AnalyticsEventInputSchema } from "@/lib/analytics/server";

// ─── Re-exports from the contract ──────────────────────────────────────────

/**
 * The standard success / failure envelope returned by every Rido
 * backend route. Re-exported here so consumers of `@/lib/api-client`
 * never need a second import path.
 */
export type { ApiResponse, ApiSuccess, ApiFailure } from "@/lib/contract";

// ─── Waitlist ─────────────────────────────────────────────────────────────

/**
 * Request body for `POST /api/waitlist`.
 *
 * Sourced directly from the canonical Zod validator so client and
 * server can never drift on the field set. The `idempotencyKey` field
 * is **branded** (`IdempotencyKey`) — callers are expected to mint a
 * fresh, URL-safe key per submission attempt.
 */
export type WaitlistSignupRequest = WaitlistSignup;

/**
 * Response body for `POST /api/waitlist` on the 201 Created path.
 *
 * Mirrors the subset of the DB row that the route is allowed to
 * surface to the client:
 *   - `id`        — UUID of the new `waitlist_signups` row.
 *   - `email`     — the normalised (lowercased + trimmed) email.
 *   - `city`      — the city slug, identical to the request's `citySlug`.
 *   - `createdAt` — ISO-8601 timestamp of insertion.
 *
 * On the 409 duplicate path the route returns an `ApiFailure`
 * envelope (see `@/lib/contract`) and the client throws an
 * {@link ApiClientError} — no separate response type is needed.
 */
export interface WaitlistSignupResponse {
  /** UUID of the new waitlist row. */
  readonly id: string;
  /** Normalised email address that was inserted. */
  readonly email: string;
  /** City slug the signup is scoped to. */
  readonly city: string;
  /** ISO-8601 timestamp the row was created. */
  readonly createdAt: string;
}

/**
 * Response body for `GET /api/waitlist` (the public, unauthenticated
 * stats endpoint).
 *
 *   - `totalSignups`  — total number of rows in `waitlist_signups`,
 *                       across every status and every city.
 *   - `signupsByCity` — `{ [slug: string]: number }` map of counts per
 *                       city. Cities with zero signups are omitted;
 *                       cities outside the static catalogue (e.g. those
 *                       introduced by an admin CSV import) are included.
 *
 * No PII is exposed — safe to call from SSR or a public dashboard.
 */
export interface WaitlistStatsResponse {
  /** Total signups across all cities and statuses. */
  readonly totalSignups: number;
  /** Per-city count keyed by city slug. */
  readonly signupsByCity: Readonly<Record<string, number>>;
}

// ─── Vehicles ─────────────────────────────────────────────────────────────

/**
 * Public, on-the-wire shape of a single vehicle record.
 *
 * The DB row is the source of truth (see `Vehicle` in
 * `src/lib/db/schema.ts`); the `GET /api/vehicles/[id]` endpoint
 * returns the full row *as-is* — `lat` and `lng` stay as strings
 * because the v1 schema stores them in a `text` column (a deliberate
 * simplification that avoids a PostGIS dependency at the schema layer).
 *
 * When the `GET /api/vehicles` list endpoint returns vehicles it
 * augments each row with a `distanceMeters` field; see
 * {@link VehicleWithDistance}.
 */
export type Vehicle = DbVehicle;

/**
 * A {@link Vehicle} augmented with a precomputed great-circle distance
 * (in metres) from the caller's anchor point. Returned exclusively by
 * `GET /api/vehicles` for queries that supply `lat` / `lng` /
 * `radiusMeters`.
 */
export interface VehicleWithDistance extends Vehicle {
  /** Distance in metres from the query anchor, sorted ascending. */
  readonly distanceMeters: number;
}

/**
 * Response body for `GET /api/vehicles`.
 *
 *   - `vehicles`     — array of {@link VehicleWithDistance}, sorted
 *                      ascending by `distanceMeters` (or by
 *                      `lastSeenAt` when no anchor is supplied).
 *   - `total`        — post-filter count (i.e. how many vehicles fall
 *                      inside the requested radius, NOT how many
 *                      exist in the city).
 *   - `limit`        — echo of the validated `limit` query param.
 *   - `radiusMeters` — echo of the validated `radiusMeters` query param.
 */
export interface VehicleListResponse {
  readonly vehicles: readonly VehicleWithDistance[];
  readonly total: number;
  readonly limit: number;
  readonly radiusMeters: number;
}

// ─── Cities ───────────────────────────────────────────────────────────────

/**
 * The public, on-the-wire shape of a city in the catalogue list
 * (`GET /api/cities`).
 *
 * `lat` and `lng` are always serialised as `number` — the DB column
 * is `text` (see the schema), but the route coerces on the way out.
 * `status` is the lifecycle enum from the DB: `'live' | 'coming_soon'
 * | 'beta'`. `launchedAt` is the ISO-8601 launch timestamp, or `null`
 * for pre-launch cities.
 *
 * The detail endpoint (`GET /api/cities/[slug]`) adds two extra
 * fields: `geofence` and `parkingZones`. See {@link CityDetail}.
 */
export interface City {
  /** Stable, URL-safe identifier (e.g. `"marbella"`). */
  readonly slug: string;
  /** Display name (e.g. `"Marbella"`). */
  readonly name: string;
  /** Region / province within the country. */
  readonly region: string;
  /** ISO 3166-1 alpha-2 country code. */
  readonly country: string;
  /** City-centre latitude in decimal degrees. */
  readonly lat: number;
  /** City-centre longitude in decimal degrees. */
  readonly lng: number;
  /**
   * Lifecycle status:
   *   - `'live'`        — publicly bookable.
   *   - `'coming_soon'` — pre-launch; signups accepted via waitlist.
   *   - `'beta'`        — limited pilot.
   */
  readonly status: "live" | "coming_soon" | "beta";
  /** ISO-8601 launch timestamp, or `null` for pre-launch cities. */
  readonly launchedAt: string | null;
}

/**
 * Response body for `GET /api/cities` (the catalogue list).
 *
 *   - `cities` — array of {@link City}, ordered by `name` ascending
 *                on the DB path (the static path preserves the order
 *                of `src/data/cities.ts`).
 *   - `total`  — count of cities in `cities` (so the client doesn't
 *                have to read `.length` to know the size).
 */
export interface CityListResponse {
  readonly cities: readonly City[];
  readonly total: number;
}

/**
 * Single-city detail record returned by `GET /api/cities/[slug]`.
 *
 * Extends {@link City} with the two GeoJSON fields that the list
 * endpoint omits:
 *   - `geofence`     — the service-area polygon as GeoJSON, or `null`
 *                      for static / pre-launch cities.
 *   - `parkingZones` — the array of designated parking polygons as
 *                      GeoJSON, or `null` for static cities.
 *
 * Both fields are typed as `unknown` at the API boundary (the maps
 * agent owns the GeoJSON validator). Consumers that need a tighter
 * type should validate at the call site.
 */
export interface CityDetail extends City {
  /**
   * GeoJSON service-area polygon (or `null` for static / pre-launch
   * cities that have not yet had a polygon authored).
   */
  readonly geofence: unknown;
  /**
   * Array of GeoJSON parking-zone polygons (or `null` for static
   * cities that have not yet had parking zones authored).
   */
  readonly parkingZones: unknown;
}

// ─── Contact ──────────────────────────────────────────────────────────────

/**
 * Request body for `POST /api/contact`.
 *
 * Sourced from the Zod validator. The honeypot field (`website`)
 * and the idempotency key live in the same shape as the server
 * expects; the client SDK forwards them verbatim and the server
 * silently rejects any submission that fills the honeypot.
 */
export type ContactRequest = ContactSubmission;

/**
 * Response body for `POST /api/contact` on the 201 Created path.
 *
 * The contact route does NOT return the persisted row — only the
 * new id and the insertion timestamp. PII (name, email, message)
 * never leaves the moderation queue.
 */
export interface ContactResponse {
  /** UUID of the new `contact_submissions` row. */
  readonly id: string;
  /** ISO-8601 timestamp the row was created. */
  readonly createdAt: string;
}

// ─── Newsletter ───────────────────────────────────────────────────────────

/**
 * Request body for `POST /api/newsletter`.
 *
 * Sourced from the Zod validator. `doubleOptIn` is required (not
 * defaulted) on purpose — the server makes a deliberate GDPR
 * choice, and a default value would hide that.
 */
export type NewsletterRequest = NewsletterSubscribe;

/**
 * Response body for `POST /api/newsletter`.
 *
 * The server can return one of two shapes, both successful:
 *   - **Direct subscription** (201 Created):
 *     `{ email: string; subscribed: true }`.
 *   - **Double opt-in pending** (200 OK): a subset of
 *     {@link NewsletterSubscribeResult} with
 *     `status: "pending_confirmation"`. The actual confirmation flow
 *     (sending the link, verifying the click) is owned by the
 *     double-opt-in agent.
 *
 * Consumers should branch on `status` when present, or on
 * `subscribed` when it is not.
 */
export type NewsletterResponse =
  | NewsletterSubscribeResult
  | {
      /** The email the server just subscribed. */
      readonly email: string;
      /** Always `true` on the 201 Created path. */
      readonly subscribed: true;
    };

// ─── Analytics ────────────────────────────────────────────────────────────

/**
 * Request body for `POST /api/analytics`.
 *
 * Sourced from the Zod schema in `@/lib/analytics/server`. The
 * `properties` field is a free-form `Record<string, unknown>`; the
 * server strips keys that look like PII / secrets (`_`-prefixed
 * keys, plus any key containing `password`, `token`, `secret`,
 * `apikey`, or `authorization` case-insensitively) before
 * persistence.
 */
export type AnalyticsEventInput = AnalyticsEventInputSchema;

/**
 * Result of a successful `analytics.track()` call.
 *
 * The server returns `204 No Content`, so the SDK resolves with a
 * tiny ack object carrying the `name` and `sessionId` that were
 * forwarded. Callers that don't care can simply `await` the call
 * and ignore the resolved value.
 */
export interface AnalyticsTrackResult {
  /** Event name as forwarded to the server. */
  readonly name: string;
  /** Session id as forwarded to the server. */
  readonly sessionId: string;
}

// ─── Query-parameter types ────────────────────────────────────────────────

/**
 * Query parameters for `GET /api/vehicles`.
 *
 * Mirrors the Zod validator exactly. All numeric fields are typed
 * as `number` (the SDK coerces from `URLSearchParams` strings
 * internally before sending).
 */
export interface VehiclesListQuery {
  readonly lat: number;
  readonly lng: number;
  readonly radiusMeters: number;
  readonly type: "e-scooter" | "e-bike";
  readonly citySlug?: CitySlug;
  readonly limit?: number;
}

/**
 * Query parameters for `GET /api/cities`.
 *
 * `status` defaults to `'active'` server-side; the SDK forwards the
 * field as supplied so callers can ask for `'coming_soon'` /
 * `'all'`. The validator's `CityQuery` uses a different status
 * vocabulary (`'active' | 'coming_soon' | 'all'`), but the API
 * itself maps to the DB's `'live' | 'coming_soon' | 'beta' | 'all'`
 * enum. We hand-declare the SDK-side query type here so the type
 * matches the wire contract exactly.
 */
export interface CitiesListQuery {
  readonly status?: "active" | "coming_soon" | "all";
  readonly slug?: string;
  readonly locale?: Locale;
}

// ─── Re-export the common primitives ──────────────────────────────────────

/**
 * Branded idempotency-key type. Re-exported so consumers of
 * `@/lib/api-client` can mint keys without taking a second
 * dependency on `@/lib/validators`.
 */
export type { IdempotencyKey };

/** Branded email type. Re-exported for the same reason. */
export type { Email };

/** City slug enum. */
export type { CitySlug };

/** Locale enum (`'en' | 'es'`). */
export type { Locale };

/** Waitlist source enum (which CTA placement captured the signup). */
export type { WaitlistSource };

/** Validator-side City shape (used by the marketing site). */
export type { CityValidator };
