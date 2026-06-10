/**
 * English waitlist confirmation email.
 *
 * Sent immediately after a visitor signs up on the landing page or city
 * page. The intent is short, warm, and brand-forward — confirm what just
 * happened, tell them what's next, and remind them they can leave at any
 * time. We keep the layout single-column and max-width 600px so it reads
 * well on every major client (Gmail, Outlook, Apple Mail, mobile).
 *
 * @module src/lib/email/templates/waitlist-confirmation
 */

import {
  buildUnsubscribeUrl,
  escape,
  escapeUrl,
} from "@/lib/email/templates/strings";

// ─── Types ──────────────────────────────────────────────────────────────────

/**
 * Props for the English waitlist confirmation template.
 *
 * `name` and `city` are both optional — the form allows anonymous signups
 * and a generic "Other" city. We render a friendly fallback for each so
 * the copy never reads "Hi ,".
 */
export interface WaitlistConfirmationProps {
  /** Recipient's first name, if they gave one. */
  name?: string | null;
  /** Recipient's email address. Echoed back so they know it's theirs. */
  email: string;
  /** City they signed up for, human-readable (e.g. "Valencia"). */
  city?: string | null;
  /**
   * Locale code, used to select the right variant. This template handles
   * `"en"`; the `.es` variant handles `"es"`. Any other value falls back
   * to English so callers don't have to branch.
   */
  locale: "en" | "es";
  /**
   * Full URL to the unsubscribe endpoint. If omitted, a site-relative
   * `/api/unsubscribe?email=…` link is generated from {@link email}.
   */
  unsubscribeUrl?: string;
  /**
   * Optional site origin used when {@link unsubscribeUrl} is omitted
   * (e.g. `https://rido.bike`).
   */
  siteOrigin?: string;
}

/** Shape of the rendered email, ready to hand to `sendEmail`. */
export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const BRAND_MAGENTA = "#DE0498";
const BRAND_NAVY = "#0F172A";
const BRAND_WHITE = "#FFFFFF";
const BRAND_MUTED = "#94A3B8"; // slate-400, used for footer / legal copy
const BRAND_BG = "#1E293B"; // slate-800, used for the CTA card
const SUBJECT = "You're on the Rido waitlist 🚲";

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Render the English waitlist confirmation email.
 *
 * @param props Recipient + content fields. See {@link WaitlistConfirmationProps}.
 * @returns A {@link RenderedEmail} with `subject`, inline-styled `html`,
 *          and a plain-text `text` fallback for clients that disable HTML.
 */
export function renderWaitlistConfirmation(
  props: WaitlistConfirmationProps,
): RenderedEmail {
  const safeName = escape((props.name ?? "").trim());
  const safeCity = escape((props.city ?? "").trim());
  const safeEmail = escape(props.email);
  const greeting = safeName ? `Hi ${safeName},` : "Hi there,";
  const cityLine = safeCity
    ? `We're getting Rido ready to launch in <strong>${safeCity}</strong> — you'll be among the first to know when it's time to ride.`
    : "We're getting Rido ready to launch in your city — you'll be among the first to know when it's time to ride.";
  const unsub = escapeUrl(
    props.unsubscribeUrl ?? buildUnsubscribeUrl(props.email, props.siteOrigin),
  );
  const html = renderHtml({
    greeting,
    cityLine,
    safeEmail,
    unsub,
  });
  const text = renderText({ greeting, cityLine, safeEmail, unsub });
  return { subject: SUBJECT, html, text };
}

// ─── HTML ───────────────────────────────────────────────────────────────────

interface ShellProps {
  greeting: string;
  cityLine: string;
  safeEmail: string;
  unsub: string;
}

function renderHtml(p: ShellProps): string {
  return [
    '<!doctype html>',
    '<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">',
    "<head>",
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    '<meta name="x-apple-disable-message-reformatting" />',
    "<title>You're on the Rido waitlist</title>",
    "</head>",
    `<body style="margin:0;padding:0;background-color:${BRAND_NAVY};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:${BRAND_WHITE};-webkit-text-size-adjust:100%;">`,
    // Preheader (hidden in inbox preview)
    `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${BRAND_NAVY};">Thanks for joining the Rido waitlist — here's what happens next.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>`,
    // Outer wrapper
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:' + BRAND_NAVY + ';">',
    "<tr><td align=\"center\" style=\"padding:32px 16px;\">",
    // 600px container
    '<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background-color:' + BRAND_NAVY + ';">',
    // Header / logo
    "<tr><td style=\"padding:24px 24px 8px 24px;\" align=\"left\">",
    `<span style="font-size:28px;font-weight:800;letter-spacing:-0.02em;color:${BRAND_MAGENTA};">Rido</span>`,
    "</td></tr>",
    // Hero headline
    "<tr><td style=\"padding:16px 24px 8px 24px;\" align=\"left\">",
    `<h1 style=\"margin:0;font-size:28px;line-height:1.25;font-weight:800;color:${BRAND_WHITE};letter-spacing:-0.02em;\">You're on the list. 🎉</h1>`,
    "</td></tr>",
    // Greeting + body copy
    "<tr><td style=\"padding:8px 24px 0 24px;\" align=\"left\">",
    `<p style=\"margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND_WHITE};\">${p.greeting}</p>`,
    `<p style=\"margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND_WHITE};\">Thanks for signing up for the Rido waitlist. ${p.cityLine}</p>`,
    `<p style=\"margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND_WHITE};\">While you wait, we'll keep you posted on:</p>`,
    "<ul style=\"margin:0 0 16px 24px;padding:0;font-size:16px;line-height:1.7;color:" + BRAND_WHITE + ";\">",
    "<li>Launch dates in your city</li>",
    "<li>Early-bird pricing and invite codes</li>",
    "<li>Behind-the-scenes product updates</li>",
    "</ul>",
    "</td></tr>",
    // CTA card
    "<tr><td style=\"padding:8px 24px 24px 24px;\" align=\"center\">",
    `<table role="presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"background-color:${BRAND_BG};border-radius:12px;\">`,
    "<tr><td style=\"padding:24px;\" align=\"left\">",
    `<p style=\"margin:0 0 8px 0;font-size:14px;line-height:1.5;color:${BRAND_MUTED};text-transform:uppercase;letter-spacing:0.08em;\">Your spot is reserved</p>`,
    `<p style=\"margin:0;font-size:16px;line-height:1.6;color:${BRAND_WHITE};\">We sent this confirmation to <strong>${p.safeEmail}</strong>. If that isn't right, just reply to this email and we'll fix it.</p>`,
    "</td></tr>",
    "</table>",
    "</td></tr>",
    // Footer
    "<tr><td style=\"padding:8px 24px 32px 24px;\" align=\"left\">",
    `<p style=\"margin:0 0 8px 0;font-size:12px;line-height:1.6;color:${BRAND_MUTED};\">Rido is a service of Go2 Place S.L. — Orihuela Costa, Spain.</p>`,
    `<p style=\"margin:0;font-size:12px;line-height:1.6;color:${BRAND_MUTED};\">You can <a href=\"${p.unsub}\" style=\"color:${BRAND_MAGENTA};text-decoration:underline;\">unsubscribe</a> from waitlist updates at any time.</p>`,
    "</td></tr>",
    "</table>",
    "</td></tr>",
    "</table>",
    "</body></html>",
  ].join("");
}

// ─── Plain text ─────────────────────────────────────────────────────────────

function renderText(p: ShellProps): string {
  return [
    "You're on the Rido waitlist 🎉",
    "",
    p.greeting,
    "",
    "Thanks for signing up for the Rido waitlist.",
    p.cityLine.replace(/<[^>]+>/g, ""),
    "",
    "While you wait, we'll keep you posted on:",
    "  - Launch dates in your city",
    "  - Early-bird pricing and invite codes",
    "  - Behind-the-scenes product updates",
    "",
    `We sent this confirmation to: ${p.safeEmail}`,
    "If that isn't right, just reply to this email and we'll fix it.",
    "",
    "---",
    "Rido is a service of Go2 Place S.L. — Orihuela Costa, Spain.",
    `Unsubscribe: ${p.unsub}`,
  ].join("\n");
}
