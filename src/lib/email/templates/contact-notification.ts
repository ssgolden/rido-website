/**
 * English "we received your message" contact form notification.
 *
 * Sent to the **visitor** (not the team) as a courtesy reply acknowledging
 * that their contact form submission was received. The team is notified
 * separately via the API/inbox flow.
 *
 * Includes the original message body so the visitor has a record of what
 * they sent — useful when the conversation is picked up asynchronously.
 *
 * @module src/lib/email/templates/contact-notification
 */

import {
  buildUnsubscribeUrl,
  escape,
  escapeUrl,
} from "@/lib/email/templates/strings";

/**
 * Props for the English contact notification email.
 *
 * `name` is optional because the contact form allows anonymous
 * submissions; we fall back to "there" so the greeting always reads
 * naturally.
 */
export interface ContactNotificationProps {
  name?: string | null;
  email: string;
  /**
   * The original message body submitted by the visitor. Already
   * validated server-side but still escaped before render.
   */
  message: string;
  /** Locale code — `"en"` picks this template, `"es"` picks the variant. */
  locale: "en" | "es";
  /** Optional fully-qualified unsubscribe URL. */
  unsubscribeUrl?: string;
  /** Optional site origin (e.g. `https://rido.bike`). */
  siteOrigin?: string;
}

/** Shape of the rendered email, ready to hand to `sendEmail`. */
export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const BRAND_MAGENTA = "#DE0498";
const BRAND_NAVY = "#0F172A";
const BRAND_WHITE = "#FFFFFF";
const BRAND_MUTED = "#94A3B8";
const BRAND_BG = "#1E293B";
const SUBJECT = "We got your message — Rido support";

/**
 * Render the English contact notification email.
 *
 * @param props Recipient + content fields. See {@link ContactNotificationProps}.
 * @returns A {@link RenderedEmail} with `subject`, inline-styled `html`,
 *          and a plain-text `text` fallback.
 */
export function renderContactNotification(
  props: ContactNotificationProps,
): RenderedEmail {
  const safeName = escape((props.name ?? "").trim());
  const safeEmail = escape(props.email);
  // Truncate long messages so they don't blow up the email layout.
  const maxMessage = 1500;
  const trimmed = (props.message ?? "").trim();
  const safeMessage = escape(
    trimmed.length > maxMessage ? trimmed.slice(0, maxMessage) + "…" : trimmed,
  );
  const greeting = safeName ? `Hi ${safeName},` : "Hi there,";
  const unsub = escapeUrl(
    props.unsubscribeUrl ?? buildUnsubscribeUrl(props.email, props.siteOrigin),
  );
  const html = renderHtml({ greeting, safeEmail, safeMessage, unsub });
  const text = renderText({ greeting, safeEmail, safeMessage, unsub });
  return { subject: SUBJECT, html, text };
}

interface ShellProps {
  greeting: string;
  safeEmail: string;
  safeMessage: string;
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
    "<title>We got your message</title>",
    "</head>",
    `<body style="margin:0;padding:0;background-color:${BRAND_NAVY};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:${BRAND_WHITE};-webkit-text-size-adjust:100%;">`,
    `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${BRAND_NAVY};">Thanks for reaching out — we received your message and will reply within one business day.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>`,
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:' + BRAND_NAVY + ';">',
    "<tr><td align=\"center\" style=\"padding:32px 16px;\">",
    '<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background-color:' + BRAND_NAVY + ';">',
    "<tr><td style=\"padding:24px 24px 8px 24px;\" align=\"left\">",
    `<span style="font-size:28px;font-weight:800;letter-spacing:-0.02em;color:${BRAND_MAGENTA};">Rido</span>`,
    "</td></tr>",
    "<tr><td style=\"padding:16px 24px 8px 24px;\" align=\"left\">",
    `<h1 style=\"margin:0;font-size:28px;line-height:1.25;font-weight:800;color:${BRAND_WHITE};letter-spacing:-0.02em;\">We've got your message. ✉️</h1>`,
    "</td></tr>",
    "<tr><td style=\"padding:8px 24px 0 24px;\" align=\"left\">",
    `<p style=\"margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND_WHITE};\">${p.greeting}</p>`,
    `<p style=\"margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND_WHITE};\">Thanks for reaching out. A real person on the Rido team has been notified, and we'll get back to you at <strong>${p.safeEmail}</strong> within one business day.</p>`,
    "</td></tr>",
    "<tr><td style=\"padding:8px 24px 24px 24px;\" align=\"center\">",
    `<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"background-color:${BRAND_BG};border-radius:12px;\">`,
    "<tr><td style=\"padding:24px;\" align=\"left\">",
    `<p style=\"margin:0 0 8px 0;font-size:14px;line-height:1.5;color:${BRAND_MUTED};text-transform:uppercase;letter-spacing:0.08em;\">Your message</p>`,
    `<p style=\"margin:0;font-size:16px;line-height:1.6;color:${BRAND_WHITE};white-space:pre-wrap;\">${p.safeMessage}</p>`,
    "</td></tr>",
    "</table>",
    "</td></tr>",
    "<tr><td style=\"padding:8px 24px 24px 24px;\" align=\"left\">",
    `<p style=\"margin:0 0 8px 0;font-size:16px;line-height:1.6;color:${BRAND_WHITE};\">Need to add something? Just reply to this email — it goes straight to our inbox.</p>`,
    "</td></tr>",
    "<tr><td style=\"padding:8px 24px 32px 24px;\" align=\"left\">",
    `<p style=\"margin:0 0 8px 0;font-size:12px;line-height:1.6;color:${BRAND_MUTED};\">Rido is a service of Go2 Place S.L. — Orihuela Costa, Spain.</p>`,
    `<p style=\"margin:0;font-size:12px;line-height:1.6;color:${BRAND_MUTED};\">You can <a href=\"${p.unsub}\" style=\"color:${BRAND_MAGENTA};text-decoration:underline;\">unsubscribe</a> from non-essential updates at any time.</p>`,
    "</td></tr>",
    "</table>",
    "</td></tr>",
    "</table>",
    "</body></html>",
  ].join("");
}

function renderText(p: ShellProps): string {
  return [
    "We've got your message ✉️",
    "",
    p.greeting,
    "",
    "Thanks for reaching out. A real person on the Rido team has been notified,",
    `and we'll get back to you at ${p.safeEmail} within one business day.`,
    "",
    "--- Your message ---",
    p.safeMessage,
    "--- end ---",
    "",
    "Need to add something? Just reply to this email — it goes straight to our inbox.",
    "",
    "---",
    "Rido is a service of Go2 Place S.L. — Orihuela Costa, Spain.",
    `Unsubscribe: ${p.unsub}`,
  ].join("\n");
}
