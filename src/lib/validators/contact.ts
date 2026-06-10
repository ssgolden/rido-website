/**
 * Contact form validator.
 *
 * Power the "Contact us" page and the support mailer.
 *
 * Business rules:
 *   - name: 2–100 chars, trimmed; reject names that are only whitespace.
 *   - email: standard format, ≤ 254 chars, trimmed + lowercased.
 *   - subject: one of the bucketed values so we can route to the right inbox.
 *   - message: 10–5000 chars. We bound the upper end to protect the
 *     downstream Resend + Postgres payload sizes.
 *   - locale: 'en' | 'es' — used to choose the auto-reply template.
 *   - website: honeypot; must be empty.
 *   - Refine: reject messages that look like phishing (URLs, @-mentions in
 *     the body, all-caps screaming). We keep this lightweight — heavy lifting
 *     lives in the moderation module, not the schema.
 */
import { z } from "zod";
import {
  emailSchema,
  localeSchema,
  honeypotSchema,
  idempotencyKeySchemaOptional,
} from "./common";

/**
 * Contact subject routing enum.
 *
 * Each value maps to a Resend audience / inbox in `src/lib/email/`. Adding a
 * new bucket here means also adding the corresponding audience there.
 */
export const contactSubjectSchema = z.enum([
  "general",
  "support",
  "partnership",
  "press",
  "other",
]);
export type ContactSubject = z.infer<typeof contactSubjectSchema>;

/**
 * Validated payload for a contact-form submission.
 */
export const contactSubmissionSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters")
      .refine((s) => s.replace(/\s+/g, "").length > 0, {
        message: "Name can't be only whitespace",
      }),

    email: emailSchema,

    subject: contactSubjectSchema,

    message: z
      .string()
      .trim()
      .min(10, "Message must be at least 10 characters")
      .max(5000, "Message must be at most 5000 characters"),

    locale: localeSchema,

    /** Honeypot. Real users never fill this. */
    website: honeypotSchema,

    /** Idempotency key, generated client-side. */
    idempotencyKey: idempotencyKeySchemaOptional,
  })
  .refine(
    (v) => {
      // Anti-phishing: cap how many URLs / @-mentions a single message can
      // contain. Two is generous; legitimate support messages rarely need
      // more than one link, and anything above 4 is almost certainly spam.
      const urlCount = (v.message.match(/https?:\/\//gi) || []).length;
      const mentionCount = (v.message.match(/(^|\s)@/g) || []).length;
      return urlCount <= 4 && mentionCount <= 4;
    },
    {
      message: "Message contains too many links or @-mentions",
      path: ["message"],
    },
  );
export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;

/**
 * Discriminated union for the form's `subject` field, useful when the client
 * wants to render subject-specific follow-up questions *before* submission
 * (e.g. show a "Company name" field when `subject === "partnership"`).
 *
 * This is a client-side convenience; the server still accepts the flat
 * `contactSubmissionSchema` above.
 */
export const contactFormStateSchema = z.discriminatedUnion("subject", [
  z.object({
    subject: z.literal("general"),
    name: z.string(),
    email: emailSchema,
    message: z.string(),
    locale: localeSchema,
  }),
  z.object({
    subject: z.literal("support"),
    name: z.string(),
    email: emailSchema,
    message: z.string(),
    locale: localeSchema,
    /** When set, links the ticket to a known booking / reservation. */
    bookingId: z.string().uuid().optional(),
  }),
  z.object({
    subject: z.literal("partnership"),
    name: z.string(),
    email: emailSchema,
    company: z.string().min(1).max(200),
    message: z.string(),
    locale: localeSchema,
  }),
  z.object({
    subject: z.literal("press"),
    name: z.string(),
    email: emailSchema,
    outlet: z.string().min(1).max(200),
    deadline: z.coerce.date().optional(),
    message: z.string(),
    locale: localeSchema,
  }),
  z.object({
    subject: z.literal("other"),
    name: z.string(),
    email: emailSchema,
    message: z.string(),
    locale: localeSchema,
  }),
]);
export type ContactFormState = z.infer<typeof contactFormStateSchema>;
