/**
 * Newsletter subscription validator.
 *
 * Used by the footer "Subscribe" form and the in-app marketing prompts.
 *
 * Business rules:
 *   - email: standard format, ≤ 254 chars, trimmed + lowercased.
 *   - locale: 'en' | 'es' — used to pick the right Resend template.
 *   - source: which surface captured the signup (kept in lock-step with the
 *     waitlist source enum so analytics can join the two funnels).
 *   - doubleOptIn: required boolean (must be explicitly set). When true, the
 *     server triggers a confirmation email before writing the row.
 */
import { z } from "zod";
import {
  emailSchema,
  localeSchema,
  honeypotSchema,
  idempotencyKeySchemaOptional,
} from "./common";
import { waitlistSourceSchema } from "./waitlist";

/**
 * Validated payload for a newsletter subscription.
 *
 * Note: `doubleOptIn` is required (not defaulted) on purpose — the server
 * has to make a deliberate GDPR choice, and a default value would hide it.
 */
export const newsletterSubscribeSchema = z.object({
  email: emailSchema,
  locale: localeSchema,
  source: waitlistSourceSchema,
  doubleOptIn: z.boolean({
    error: "doubleOptIn must be true or false",
  }),
  /** Honeypot. */
  website: honeypotSchema,
  /** Idempotency key. */
  idempotencyKey: idempotencyKeySchemaOptional,
});
export type NewsletterSubscribe = z.infer<typeof newsletterSubscribeSchema>;

/**
 * Server-side response shape: what the API returns to the client after
 * a successful subscribe. Lives here so the client and server share one type.
 */
export const newsletterSubscribeResultSchema = z.object({
  status: z.enum(["pending_confirmation", "subscribed", "already_subscribed"]),
  email: emailSchema,
});
export type NewsletterSubscribeResult = z.infer<
  typeof newsletterSubscribeResultSchema
>;
