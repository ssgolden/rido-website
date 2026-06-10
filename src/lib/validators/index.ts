/**
 * Barrel export for every validator in `@/lib/validators`.
 *
 * Import site:
 *   import { waitlistSignupSchema, type WaitlistSignup } from "@/lib/validators";
 *
 * Keep this file thin — its only job is to re-export. Each sub-module is
 * self-contained and JSDoc'd so editors can jump straight to the schema
 * they need.
 */

// ─── Common building blocks ─────────────────────────────────────────────────
export {
  // re-exported from the shared contract
  paginationSchema,
  type Pagination,
  // locale
  localeSchema,
  localeSchemaOptional,
  type Locale,
  type LocaleOptional,
  // idempotency
  idempotencyKeySchema,
  idempotencyKeySchemaOptional,
  type IdempotencyKey,
  // email
  emailSchema,
  type Email,
  // ids + honeypot
  idSchema,
  type Id,
  honeypotSchema,
  type Honeypot,
  // combined
  paginatedLocaleQuerySchema,
  type PaginatedLocaleQuery,
} from "./common";

// ─── Waitlist ───────────────────────────────────────────────────────────────
export {
  waitlistSignupSchema,
  waitlistSourceSchema,
  citySlugSchema,
  waitlistCsvRowSchema,
  type WaitlistSignup,
  type WaitlistSource,
  type CitySlug,
  type WaitlistCsvRow,
} from "./waitlist";

// ─── Contact ────────────────────────────────────────────────────────────────
export {
  contactSubmissionSchema,
  contactSubjectSchema,
  contactFormStateSchema,
  type ContactSubmission,
  type ContactSubject,
  type ContactFormState,
} from "./contact";

// ─── Newsletter ─────────────────────────────────────────────────────────────
export {
  newsletterSubscribeSchema,
  newsletterSubscribeResultSchema,
  type NewsletterSubscribe,
  type NewsletterSubscribeResult,
} from "./newsletter";

// ─── Vehicle ────────────────────────────────────────────────────────────────
export {
  vehicleQuerySchema,
  vehicleTypeSchema,
  brandedVehicleTypeSchema,
  vehicleCatalogQuerySchema,
  type VehicleQuery,
  type VehicleType,
  type BrandedVehicleType,
  type VehicleCatalogQuery,
} from "./vehicle";

// ─── City ───────────────────────────────────────────────────────────────────
export {
  cityQuerySchema,
  cityAdminQuerySchema,
  citySchema,
  cityListResponseSchema,
  type CityQuery,
  type CityAdminQuery,
  type City,
  type CityListResponse,
} from "./city";
