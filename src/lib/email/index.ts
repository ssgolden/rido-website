/**
 * Barrel export for `@/lib/email`.
 *
 * Everything the rest of the backend needs to send a Rido email is
 * re-exported from here:
 *
 * ```ts
 * import {
 *   sendEmail,
 *   renderWaitlistConfirmation,
 *   type SendEmailInput,
 * } from "@/lib/email";
 * ```
 *
 * The internal `RenderedEmail` shape is re-exported as `EmailTemplate` so
 * callers have a stable type for the tuple returned by every renderer.
 *
 * @module src/lib/email
 */

// ─── Client ────────────────────────────────────────────────────────────────
export {
  EmailSendError,
  getEmailClient,
  sendEmail,
  __resetEmailClientForTests,
  type SendEmailInput,
  type SendEmailResult,
} from "@/lib/email/client";

// ─── Templates ─────────────────────────────────────────────────────────────
export {
  renderWaitlistConfirmation,
  type WaitlistConfirmationProps,
} from "@/lib/email/templates/waitlist-confirmation";

export {
  renderWaitlistConfirmationEs,
  type WaitlistConfirmationEsProps,
} from "@/lib/email/templates/waitlist-confirmation.es";

export {
  renderContactNotification,
  type ContactNotificationProps,
} from "@/lib/email/templates/contact-notification";

export {
  renderContactNotificationEs,
  type ContactNotificationEsProps,
} from "@/lib/email/templates/contact-notification.es";

export {
  renderLaunchNotification,
  type LaunchNotificationProps,
} from "@/lib/email/templates/launch-notification";

export {
  renderNewsletterWelcome,
  type NewsletterWelcomeProps,
} from "@/lib/email/templates/newsletter-welcome";

// ─── Shared types & helpers ────────────────────────────────────────────────
export {
  buildUnsubscribeUrl,
  escape,
  escapeUrl,
} from "@/lib/email/templates/strings";

/**
 * The shape returned by every template renderer — `{ subject, html, text }`.
 * Use this type when you want to thread a rendered email through your own
 * pipeline before handing it to {@link sendEmail}.
 */
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Locale code accepted by the templates. Today Rido ships in English
 * and Spanish; the contact and waitlist templates ship a per-locale
 * renderer, others fall back to English.
 */
export type EmailLocale = "en" | "es";
