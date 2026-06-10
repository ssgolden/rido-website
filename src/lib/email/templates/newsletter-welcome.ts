/**
 * Newsletter welcome email.
 *
 * Sent when a visitor subscribes to the general newsletter (the form at
 * the bottom of the landing page, blog footer, etc.). Different from the
 * waitlist confirmation because it has no city / launch promise — just a
 * warm hello and what kind of content to expect.
 *
 * @module src/lib/email/templates/newsletter-welcome
 */

import {
  buildUnsubscribeUrl,
  escape,
  escapeUrl,
} from "@/lib/email/templates/strings";

/**
 * Props for the newsletter welcome email.
 *
 * `name` is optional. `frequency` is a short, pre-localized phrase like
 * "twice a month" — the template doesn't translate it because the form
 * provides the localized string.
 */
export interface NewsletterWelcomeProps {
  name?: string | null;
  email: string;
  /**
   * Human-readable cadence phrase, e.g. "twice a month" / "dos veces al
   * mes". The form layer is responsible for the translation.
   */
  frequency: string;
  /**
   * Locale code. Kept on the shape for forward-compatibility with a
   * future Spanish variant; this template currently renders English
   * copy only.
   */
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
const SUBJECT = "Welcome to the Rido newsletter";

/**
 * Render the newsletter welcome email.
 *
 * @param props Recipient + content fields. See {@link NewsletterWelcomeProps}.
 * @returns A {@link RenderedEmail} with `subject`, inline-styled `html`,
 *          and a plain-text `text` fallback.
 */
export function renderNewsletterWelcome(
  props: NewsletterWelcomeProps,
): RenderedEmail {
  const safeName = escape((props.name ?? "").trim());
  const safeEmail = escape(props.email);
  const safeFrequency = escape((props.frequency ?? "").trim() || "regularly");
  const greeting = safeName ? `Hi ${safeName},` : "Hi there,";
  const unsub = escapeUrl(
    props.unsubscribeUrl ?? buildUnsubscribeUrl(props.email, props.siteOrigin),
  );
  const html = renderHtml({ greeting, safeEmail, safeFrequency, unsub });
  const text = renderText({ greeting, safeEmail, safeFrequency, unsub });
  return { subject: SUBJECT, html, text };
}

interface ShellProps {
  greeting: string;
  safeEmail: string;
  safeFrequency: string;
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
    "<title>Welcome to Rido</title>",
    "</head>",
    `<body style="margin:0;padding:0;background-color:${BRAND_NAVY};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:${BRAND_WHITE};-webkit-text-size-adjust:100%;">`,
    `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${BRAND_NAVY};">Welcome to the Rido newsletter — here's what to expect.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>`,
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:' + BRAND_NAVY + ';">',
    "<tr><td align=\"center\" style=\"padding:32px 16px;\">",
    '<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background-color:' + BRAND_NAVY + ';">',
    "<tr><td style=\"padding:24px 24px 8px 24px;\" align=\"left\">",
    `<span style="font-size:28px;font-weight:800;letter-spacing:-0.02em;color:${BRAND_MAGENTA};">Rido</span>`,
    "</td></tr>",
    "<tr><td style=\"padding:16px 24px 8px 24px;\" align=\"left\">",
    `<h1 style=\"margin:0;font-size:28px;line-height:1.25;font-weight:800;color:${BRAND_WHITE};letter-spacing:-0.02em;\">Welcome to Rido. 👋</h1>`,
    "</td></tr>",
    "<tr><td style=\"padding:8px 24px 0 24px;\" align=\"left\">",
    `<p style=\"margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND_WHITE};\">${p.greeting}</p>`,
    `<p style=\"margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND_WHITE};\">Thanks for subscribing. You'll get <strong>${p.safeFrequency}</strong> emails with original Rido stories, product updates, and the occasional peek at what we're building next.</p>`,
    "</td></tr>",
    "<tr><td style=\"padding:8px 24px 24px 24px;\" align=\"center\">",
    `<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"background-color:${BRAND_BG};border-radius:12px;\">`,
    "<tr><td style=\"padding:24px;\" align=\"left\">",
    `<p style=\"margin:0 0 8px 0;font-size:14px;line-height:1.5;color:${BRAND_MUTED};text-transform:uppercase;letter-spacing:0.08em;\">What's coming</p>`,
    "<ul style=\"margin:0;padding-left:20px;font-size:16px;line-height:1.7;color:" + BRAND_WHITE + ";\">",
    "<li>New city launches and how to get early access</li>",
    "<li>Behind-the-scenes product stories</li>",
    "<li>Tips for getting the most out of Rido</li>",
    "</ul>",
    "</td></tr>",
    "</table>",
    "</td></tr>",
    "<tr><td style=\"padding:8px 24px 24px 24px;\" align=\"left\">",
    `<p style=\"margin:0 0 8px 0;font-size:16px;line-height:1.6;color:${BRAND_WHITE};\">No spam, no growth-hacky funnels — just the stuff we think is worth your inbox.</p>`,
    `<p style=\"margin:0;font-size:14px;line-height:1.6;color:${BRAND_MUTED};\">Subscription: <strong style=\"color:${BRAND_WHITE};\">${p.safeEmail}</strong></p>`,
    "</td></tr>",
    "<tr><td style=\"padding:8px 24px 32px 24px;\" align=\"left\">",
    `<p style=\"margin:0 0 8px 0;font-size:12px;line-height:1.6;color:${BRAND_MUTED};\">Rido is a service of Go2 Place S.L. — Orihuela Costa, Spain.</p>`,
    `<p style=\"margin:0;font-size:12px;line-height:1.6;color:${BRAND_MUTED};\">You can <a href=\"${p.unsub}\" style=\"color:${BRAND_MAGENTA};text-decoration:underline;\">unsubscribe</a> at any time.</p>`,
    "</td></tr>",
    "</table>",
    "</td></tr>",
    "</table>",
    "</body></html>",
  ].join("");
}

function renderText(p: ShellProps): string {
  return [
    "Welcome to Rido 👋",
    "",
    p.greeting,
    "",
    "Thanks for subscribing. You'll get the following emails with original",
    "Rido stories, product updates, and the occasional peek at what we're",
    "building next:",
    `  - Cadence: ${p.safeFrequency}`,
    "  - New city launches and how to get early access",
    "  - Behind-the-scenes product stories",
    "  - Tips for getting the most out of Rido",
    "",
    "No spam, no growth-hacky funnels — just the stuff we think is worth your inbox.",
    "",
    `Subscription: ${p.safeEmail}`,
    "",
    "---",
    "Rido is a service of Go2 Place S.L. — Orihuela Costa, Spain.",
    `Unsubscribe: ${p.unsub}`,
  ].join("\n");
}
