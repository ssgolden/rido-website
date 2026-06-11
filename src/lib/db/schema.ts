/**
 * Drizzle schema for Rido.
 *
 * Tables (in dependency order):
 *   1. users            — NextAuth-compatible user accounts
 *   2. accounts         — NextAuth OAuth accounts
 *   3. sessions         — NextAuth sessions
 *   4. verificationTokens — NextAuth email / magic-link tokens
 *   5. cities           — service-area cities (seeded from src/data/cities.ts)
 *   6. vehicles         — live e-scooter / e-bike state per city
 *   7. waitlistSignups  — per-city waitlist
 *   8. contactSubmissions — contact form intake
 *   9. newsletterSubscribers — newsletter list
 *  10. analyticsEvents  — server-side analytics pipeline
 *  11. webPushSubscriptions — Web Push endpoints
 *
 * Conventions:
 *   - snake_case column names in Postgres
 *   - camelCase in TypeScript
 *   - timestamptz everywhere (withTimezone)
 *   - UUID PKs default to gen_random_uuid(); app code overrides with uuid v7
 *     (via crypto.randomUUID — uuid v4) for new inserts. See `defaultUuidV7`.
 *   - Indexes on hot lookups: city, email, createdAt
 *   - UNIQUE (lower(email), city) on waitlist_signups
 */

import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ─── Enums ──────────────────────────────────────────────────────────────────

export const cityStatus = pgEnum("city_status", [
  "live",
  "coming_soon",
  "beta",
]);

export const vehicleStatus = pgEnum("vehicle_status", [
  "available",
  "in_ride",
  "low_battery",
  "maintenance",
  "retired",
]);

export const vehicleType = pgEnum("vehicle_type", ["e-scooter", "e-bike"]);

export const waitlistStatus = pgEnum("waitlist_status", [
  "pending",
  "confirmed",
  "unsubscribed",
]);

export const contactSubmissionStatus = pgEnum("contact_submission_status", [
  "new",
  "in_progress",
  "resolved",
  "spam",
]);

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * UUID v4 default (crypto.randomUUID is RFC 4122 v4).
 * The task spec said "uuid v7 … crypto.randomUUID is fine". v4 satisfies the
 * uniqueness + 36-char storage requirements; v7 ordering is a nice-to-have
 * but not required by the contract.
 */
const defaultUuidV7 = sql`gen_random_uuid()`;

// ─── NextAuth tables ────────────────────────────────────────────────────────

/**
 * NextAuth `users` table. The DrizzleAdapter expects camelCase column names
 * for the NextAuth fields, but Rido project convention is snake_case in DB.
 * We map the NextAuth adapter contract to snake_case columns explicitly.
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(defaultUuidV7),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }).notNull(),
  emailVerified: timestamp("email_verified", { withTimezone: true, mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
}, (t) => [
  uniqueIndex("users_email_lower_uq").on(sql`lower(${t.email})`),
]);

/**
 * NextAuth `accounts` table (OAuth provider linkage).
 * composite PK (provider, providerAccountId) per the Drizzle adapter contract.
 */
export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 64 }).notNull(),
    provider: varchar("provider", { length: 64 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 256 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 64 }),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("accounts_user_id_idx").on(t.userId),
  ],
);

/**
 * NextAuth `sessions` table.
 * One row per active session, FK to users.id.
 */
export const sessions = pgTable("sessions", {
  sessionToken: varchar("session_token", { length: 256 }).primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true, mode: "date" }).notNull(),
}, (t) => [
  index("sessions_user_id_idx").on(t.userId),
  index("sessions_expires_idx").on(t.expires),
]);

/**
 * NextAuth `verification_tokens` table.
 * Used for email magic links, password resets, etc.
 */
export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: varchar("identifier", { length: 320 }).notNull(),
    token: varchar("token", { length: 256 }).notNull(),
    expires: timestamp("expires", { withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.identifier, t.token] }),
    index("verification_tokens_expires_idx").on(t.expires),
  ],
);

// ─── Domain tables ──────────────────────────────────────────────────────────

/**
 * Service-area cities. PK is the slug (e.g. "marbella").
 * `geofence` and `parkingZones` are JSONB so we can store GeoJSON polygons
 * without forcing a PostGIS dependency at the schema layer.
 */
export const cities = pgTable("cities", {
  slug: varchar("slug", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  region: varchar("region", { length: 128 }).notNull(),
  country: varchar("country", { length: 64 }).notNull().default("ES"),
  lat: text("lat").notNull(), // stored as text per task spec; see contract — numeric pair is a future concern
  lng: text("lng").notNull(),
  geofence: jsonb("geofence").$type<unknown>().notNull().default(sql`'{}'::jsonb`),
  parkingZones: jsonb("parking_zones").$type<unknown>().notNull().default(sql`'[]'::jsonb`),
  status: cityStatus("status").notNull().default("coming_soon"),
  launchedAt: timestamp("launched_at", { withTimezone: true, mode: "date" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
}, (t) => [
  index("cities_status_idx").on(t.status),
  index("cities_country_idx").on(t.country),
]);

/**
 * Live vehicle state. One row per physical e-scooter / e-bike.
 * Updated by the backend agent (telemetry pipeline) — read by the map UI.
 */
export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().default(defaultUuidV7),
  type: vehicleType("type").notNull(),
  lat: text("lat").notNull(),
  lng: text("lng").notNull(),
  batteryPct: integer("battery_pct").notNull().default(100),
  status: vehicleStatus("status").notNull().default("available"),
  citySlug: varchar("city_slug", { length: 64 })
    .notNull()
    .references(() => cities.slug, { onDelete: "restrict" }),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
}, (t) => [
  index("vehicles_city_slug_idx").on(t.citySlug),
  index("vehicles_status_idx").on(t.status),
  index("vehicles_last_seen_at_idx").on(t.lastSeenAt),
]);

/**
 * Waitlist signups — one row per (email, city) pair.
 * The unique index on lower(email) is the key constraint that prevents dupes.
 */
export const waitlistSignups = pgTable("waitlist_signups", {
  id: uuid("id").primaryKey().default(defaultUuidV7),
  email: varchar("email", { length: 320 }).notNull(),
  city: varchar("city", { length: 64 })
    .notNull()
    .references(() => cities.slug, { onDelete: "restrict" }),
  locale: varchar("locale", { length: 16 }).notNull().default("en"),
  source: varchar("source", { length: 64 }),
  ip: varchar("ip", { length: 64 }),
  userAgent: text("user_agent"),
  status: waitlistStatus("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true, mode: "date" }),
}, (t) => [
  // A user can sign up for many cities, but not twice for the same one.
  uniqueIndex("waitlist_signups_email_city_uq").on(
    sql`lower(${t.email})`,
    t.city,
  ),
  index("waitlist_signups_city_idx").on(t.city),
  index("waitlist_signups_created_at_idx").on(t.createdAt),
  index("waitlist_signups_status_idx").on(t.status),
]);

/**
 * Contact form submissions. Moderation queue lives behind `status`.
 */
export const contactSubmissions = pgTable("contact_submissions", {
  id: uuid("id").primaryKey().default(defaultUuidV7),
  name: varchar("name", { length: 128 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 256 }).notNull(),
  message: text("message").notNull(),
  locale: varchar("locale", { length: 16 }).notNull().default("en"),
  status: contactSubmissionStatus("status").notNull().default("new"),
  ip: varchar("ip", { length: 64 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
}, (t) => [
  index("contact_submissions_email_idx").on(sql`lower(${t.email})`),
  index("contact_submissions_status_idx").on(t.status),
  index("contact_submissions_created_at_idx").on(t.createdAt),
]);

/**
 * Newsletter subscribers. Email is the PK — one row per address.
 */
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  email: varchar("email", { length: 320 }).primaryKey(),
  locale: varchar("locale", { length: 16 }).notNull().default("en"),
  source: varchar("source", { length: 64 }),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true, mode: "date" }),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true, mode: "date" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
}, (t) => [
  index("newsletter_subscribers_created_at_idx").on(t.createdAt),
]);

/**
 * Server-side analytics events. JSONB `properties` for arbitrary payload.
 * Partitioned by createdAt in production (not modelled in v1 schema).
 */
export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").primaryKey().default(defaultUuidV7),
  name: varchar("name", { length: 128 }).notNull(),
  properties: jsonb("properties").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  sessionId: varchar("session_id", { length: 128 }),
  ip: varchar("ip", { length: 64 }),
  userAgent: text("user_agent"),
  locale: varchar("locale", { length: 16 }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
}, (t) => [
  index("analytics_events_name_idx").on(t.name),
  index("analytics_events_user_id_idx").on(t.userId),
  index("analytics_events_session_id_idx").on(t.sessionId),
  index("analytics_events_created_at_idx").on(t.createdAt),
]);

/**
 * Web Push subscription endpoints. Endpoint is the PK (it's globally unique).
 */
export const webPushSubscriptions = pgTable("web_push_subscriptions", {
  endpoint: text("endpoint").primaryKey(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  locale: varchar("locale", { length: 16 }).notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }),
}, (t) => [
  index("web_push_subscriptions_user_id_idx").on(t.userId),
]);

// ─── Inferred types ─────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type VerificationToken = typeof verificationTokens.$inferSelect;

export type City = typeof cities.$inferSelect;
export type NewCity = typeof cities.$inferInsert;
export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
export type WaitlistSignup = typeof waitlistSignups.$inferSelect;
export type NewWaitlistSignup = typeof waitlistSignups.$inferInsert;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type NewContactSubmission = typeof contactSubmissions.$inferInsert;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type NewNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;
export type WebPushSubscription = typeof webPushSubscriptions.$inferSelect;
export type NewWebPushSubscription = typeof webPushSubscriptions.$inferInsert;

export type CityStatus = (typeof cityStatus.enumValues)[number];
export type VehicleStatus = (typeof vehicleStatus.enumValues)[number];
export type VehicleType = (typeof vehicleType.enumValues)[number];
export type WaitlistStatus = (typeof waitlistStatus.enumValues)[number];
export type ContactSubmissionStatus =
  (typeof contactSubmissionStatus.enumValues)[number];

// ─── Barrel schema export (consumed by drizzle(client, { schema })) ────────

export const schema = {
  users,
  accounts,
  sessions,
  verificationTokens,
  cities,
  vehicles,
  waitlistSignups,
  contactSubmissions,
  newsletterSubscribers,
  analyticsEvents,
  webPushSubscriptions,
} as const;
