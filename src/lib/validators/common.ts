/**
 * Common, reusable Zod schemas for the Rido platform.
 *
 * These are the building blocks used by feature-specific validators
 * (waitlist, contact, newsletter, vehicle, city). Anything that more than
 * one form or API route needs lives here so we keep a single source of truth.
 *
 * The pagination schema and Pagination type are re-exported from the shared
 * contract so consumers can `import` them from the validators barrel without
 * needing a second import path.
 */
import { z } from "zod";
import { paginationSchema, type Pagination } from "@/lib/contract";
import { cities } from "@/data/cities";

// ─── Re-exports from the shared contract ────────────────────────────────────

export { paginationSchema };
export type { Pagination };

// ─── City slug (derived from src/data/cities.ts) ───────────────────────────

/**
 * Canonical city-slug enum, built from `src/data/cities.ts`. Used by every
 * validator that needs to reference a city (waitlist, vehicle, etc.). We sort
 * the slugs so the enum order is stable across builds.
 *
 * The public form rejects "Other" — internal CSVs use a separate schema.
 */
const citySlugs = Array.from(new Set(cities.map((c) => c.slug))).sort();

export const citySlugSchema = z.enum(citySlugs as [string, ...string[]]);
export type CitySlug = z.infer<typeof citySlugSchema>;

// ─── Locale ─────────────────────────────────────────────────────────────────

/**
 * Locale codes Rido currently ships in.
 *
 * Keep in sync with the routing in `src/i18n/` and the messages catalogues.
 * If we add a third language, both ends (router + this enum) must be updated
 * together to keep `Locale` as a tight, exhaustively-checked type.
 */
export const localeSchema = z.enum(["en", "es"]);
export type Locale = z.infer<typeof localeSchema>;

/**
 * Optional locale — used by forms that can be submitted before we know the
 * visitor's resolved language (e.g. pre-hydration server actions).
 * Falls back to "en" at the application layer when missing.
 */
export const localeSchemaOptional = localeSchema.optional();
export type LocaleOptional = z.infer<typeof localeSchemaOptional>;

// ─── Idempotency key ────────────────────────────────────────────────────────

/**
 * Client-supplied idempotency key used to safely retry non-idempotent
 * operations (waitlist signups, contact submissions) without creating
 * duplicates.
 *
 * Conventions:
 *   - 8–128 chars
 *   - URL-safe: `[A-Za-z0-9_-]` only (we use the value directly in a header
 *     and as a Redis key suffix, so we keep the charset tight)
 *   - No leading/trailing whitespace
 *
 * The string is *branded* (`IdempotencyKey`) so call sites can't accidentally
 * pass a raw user-supplied field where a vetted key is expected.
 */
export const idempotencyKeySchema = z
  .string()
  .min(8, "Idempotency key must be at least 8 characters")
  .max(128, "Idempotency key must be at most 128 characters")
  .regex(
    /^[A-Za-z0-9_-]+$/,
    "Idempotency key may only contain letters, digits, '_' and '-'",
  )
  .brand<"IdempotencyKey">();
export type IdempotencyKey = z.infer<typeof idempotencyKeySchema>;

/** Optional variant for clients that don't supply one — server will mint one. */
export const idempotencyKeySchemaOptional = idempotencyKeySchema.optional();

// ─── Email (shared) ─────────────────────────────────────────────────────────

/**
 * Canonical email validator used across all forms.
 *
 * Rules:
 *   - Standard RFC-style email (Zod's built-in `.email()`)
 *   - 254 char max (RFC 5321 SMTP path limit; longer addresses are rejected
 *     by most MTAs anyway, so we surface the error early)
 *   - Trimmed + lowercased before validation so the casing of "Foo@Bar.com"
 *     never produces two distinct rows
 */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Email is too short")
  .max(254, "Email must be at most 254 characters")
  .email("Please enter a valid email address");
export type Email = z.infer<typeof emailSchema>;

// ─── Branded ID types ───────────────────────────────────────────────────────

/**
 * Generic branded-ID helper. We use `z.brand<"Foo">()` to give primitive
 * strings nominal types so we can't accidentally pass a `UserId` where a
 * `WaitlistId` is expected.
 *
 * Use as:
 *   `z.string().uuid().brand<"UserId">()`
 */
export const idSchema = z.string().uuid();
export type Id = z.infer<typeof idSchema>;

// ─── Honeypot ───────────────────────────────────────────────────────────────

/**
 * Honeypot field for bot deterrence.
 *
 * Convention: the form renders a hidden input named e.g. `company`. Real users
 * never see/fill it; bots usually do. The refine below rejects the submission
 * if the field is non-empty. We do *not* call out the failure to the client —
 * the API still returns 200 to the bot, but no row is written.
 */
export const honeypotSchema = z
  .string()
  .max(0, "Bot detected")
  .optional()
  .default("");
export type Honeypot = z.infer<typeof honeypotSchema>;

// ─── Combined pagination + locale query ─────────────────────────────────────

/**
 * Common GET-query shape for endpoints that are paginated *and* localised.
 * Used as a starting point that feature modules extend with their own fields.
 */
export const paginatedLocaleQuerySchema = paginationSchema.extend({
  locale: localeSchema.optional(),
});
export type PaginatedLocaleQuery = z.infer<typeof paginatedLocaleQuerySchema>;
