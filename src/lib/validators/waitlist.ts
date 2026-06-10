/**
 * Waitlist signup validator.
 *
 * Used by every "Join the waitlist" CTA on the site. The `source` enum below
 * MUST stay in lock-step with the button placements tracked by marketing —
 * adding a new placement means adding a new enum member (and re-deploying
 * analytics + this schema together).
 *
 * Business rules enforced here:
 *   - Email: standard format, ≤ 254 chars (RFC 5321), trimmed + lowercased.
 *   - citySlug: must be a slug from `src/data/cities.ts` (we don't accept
 *     "Other" via the public form — internal CSVs only).
 *   - source: must be one of the known CTA placements.
 *   - locale: 'en' | 'es'.
 *   - turnstileToken: optional in dev/preview, recommended in production.
 *     We don't *require* it here because Turnstile is rendered async; the
 *     server-side route handler enforces "if prod AND no token → reject".
 *   - Refine: rejects obviously fake addresses (role:, noreply@, postmaster@)
 *     that would still pass `.email()` but pollute the funnel.
 */
import { z } from "zod";
import {
  emailSchema,
  localeSchema,
  honeypotSchema,
  idempotencyKeySchemaOptional,
  citySlugSchema,
} from "./common";

// ─── Source enum (must match the waitlist form's button placements) ─────────

/**
 * Source values must match the analytics + form-button placements used
 * across the marketing site. If marketing adds a new placement (e.g. a
 * TikTok landing page), add a member here AND in the analytics event map.
 */
export const waitlistSourceSchema = z.enum([
  "hero",
  "download",
  "footer",
  "city_page",
  "exit_intent",
  "other",
]);
export type WaitlistSource = z.infer<typeof waitlistSourceSchema>;

// ─── Re-export the shared city-slug schema for convenience ──────────────────

export { citySlugSchema };
export type { CitySlug } from "./common";

// ─── Schema ─────────────────────────────────────────────────────────────────

/**
 * Validated payload for a waitlist signup.
 *
 * Accepted by both the public POST endpoint and any server action that
 * the waitlist forms call into.
 */
export const waitlistSignupSchema = z
  .object({
    email: emailSchema,
    citySlug: citySlugSchema,
    locale: localeSchema,
    source: waitlistSourceSchema,
    /** Cloudflare Turnstile token. Optional in dev; required in production. */
    turnstileToken: z.string().min(1).max(2048).optional(),
    /** Honeypot — must be empty. */
    website: honeypotSchema,
    /** Idempotency key, generated client-side, allows safe retries. */
    idempotencyKey: idempotencyKeySchemaOptional,
  })
  .refine(
    (v) => {
      // Reject role/throwaway addresses that would pass .email() but
      // pollute the funnel. This is intentionally a small list — anything
      // more aggressive lives in the server module, not the schema.
      const blocked = /^(noreply|no-reply|postmaster|abuse|admin)@/i;
      return !blocked.test(v.email);
    },
    {
      message: "That email address can't receive waitlist mail",
      path: ["email"],
    },
  );
export type WaitlistSignup = z.infer<typeof waitlistSignupSchema>;

// ─── Internal: admin CSV-import path ────────────────────────────────────────

/**
 * Schema used by the admin tool when importing a CSV of pre-collected leads
 * (e.g. from a partner event). Loosens citySlug to any known slug and skips
 * the honeypot. Keep this file-private: re-export from the barrel only if
 * another module genuinely needs it.
 */
export const waitlistCsvRowSchema = z.object({
  email: emailSchema,
  citySlug: citySlugSchema,
  locale: localeSchema,
  source: waitlistSourceSchema.default("other"),
  subscribedAt: z.coerce.date().optional(),
});
export type WaitlistCsvRow = z.infer<typeof waitlistCsvRowSchema>;
