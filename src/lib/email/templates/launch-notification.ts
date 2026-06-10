/**
 * Launch notification email.
 *
 * Sent the day Rido goes live in a new city. Sent to all waitlist
 * subscribers for that city with an invite / promo code. We render the
 * code prominently because it's the reason they signed up.
 *
 * @module src/lib/email/templates/launch-notification
 */

import {
  buildUnsubscribeUrl,
  escape,
  escapeUrl,
} from "@/lib/email/templates/strings";

/**
 * Props for the launch notification email.
 *
 * `name` is optional, `promoCode` defaults to a friendly placeholder so
 * the template still renders if marketing forgot to pass a code.
 */
export interface LaunchNotificationProps {
  name?: string | null;
  email: string;
  /** City the launch is for, human-readable (e.g. "Valencia"). */
  city: string;
  /**
   * Invite / promo code granted for being on the waitlist. Rendered
   * verbatim, so callers should sanitize at the call site if needed.
   */
  promoCode?: string | null;
  /**
   * Locale code. Today this template ships only in English; passing
   * `"es"` still produces English copy because a launch email is high-
   * stakes and we don't want machine-translated release news. The
   * `locale` prop is kept on the shape so future translations are a
   * drop-in.
   */
  locale: "en" | "es";
  /**
   * URL to the Rido app / download page. Inlined as a CTA button.
   * Defaults to `/` when omitted.
   */
  ctaUrl?: string;
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

/**
 * Render the launch notification email.
 *
 * @param props Recipient + content fields. See {@link LaunchNotificationProps}.
 * @returns A {@link RenderedEmail} with `subject`, inline-styled `html`,
 *          and a plain-text `text` fallback.
 */
export function renderLaunchNotification(
  props: LaunchNotificationProps,
): RenderedEmail {
  const safeName = escape((props.name ?? "").trim());
  const safeCity = escape((props.city ?? "").trim() || "your city");
  const safeCode = escape((props.promoCode ?? "").trim() || "RIDO");
  const safeEmail = escape(props.email);
  const greeting = safeName ? `Hi ${safeName},` : "Hi there,";
  const subject = `Rido just launched in ${props.city} 🚲`;
  const cta = escapeUrl(props.ctaUrl ?? "/");
  const unsub = escapeUrl(
    props.unsubscribeUrl ?? buildUnsubscribeUrl(props.email, props.siteOrigin),
  );
  const html = renderHtml({
    greeting,
    safeCity,
    safeCode,
    safeEmail,
    cta,
    unsub,
  });
  const text = renderText({
    greeting,
    safeCity,
    safeCode,
    safeEmail,
    cta,
    unsub,
  });
  return { subject, html, text };
}

interface ShellProps {
  greeting: string;
  safeCity: string;
  safeCode: string;
  safeEmail: string;
  cta: string;
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
    "<title>Rido is live!</title>",
    "</head>",
    `<body style="margin:0;padding:0;background-color:${BRAND_NAVY};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:${BRAND_WHITE};-webkit-text-size-adjust:100%;">`,
    `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${BRAND_NAVY};">Rido just launched in your city — here's your waitlist code.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>`,
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:' + BRAND_NAVY + ';">',
    "<tr><td align=\"center\" style=\"padding:32px 16px;\">",
    '<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background-color:' + BRAND_NAVY + ';">',
    "<tr><td style=\"padding:24px 24px 8px 24px;\" align=\"left\">",
    `<span style="font-size:28px;font-weight:800;letter-spacing:-0.02em;color:${BRAND_MAGENTA};">Rido</span>`,
    "</td></tr>",
    "<tr><td style=\"padding:16px 24px 8px 24px;\" align=\"left\">",
    `<h1 style=\"margin:0;font-size:32px;line-height:1.2;font-weight:800;color:${BRAND_WHITE};letter-spacing:-0.02em;\">Rido is live in ${p.safeCity}! 🚲</h1>`,
    "</td></tr>",
    "<tr><td style=\"padding:8px 24px 0 24px;\" align=\"left\">",
    `<p style=\"margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND_WHITE};\">${p.greeting}</p>`,
    `<p style=\"margin:0 0 24px 0;font-size:16px;line-height:1.6;color:${BRAND_WHITE};\">You waited. We built. Now let's ride. Rido is officially available in <strong>${p.safeCity}</strong>, and as a waitlist VIP your first ride is on us.</p>`,
    "</td></tr>",
    // Promo code card
    "<tr><td style=\"padding:0 24px 24px 24px;\" align=\"center\">",
    `<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"background-color:${BRAND_BG};border:2px dashed ${BRAND_MAGENTA};border-radius:12px;\">`,
    "<tr><td style=\"padding:24px;\" align=\"center\">",
    `<p style=\"margin:0 0 8px 0;font-size:12px;line-height:1.5;color:${BRAND_MUTED};text-transform:uppercase;letter-spacing:0.12em;\">Your waitlist code</p>`,
    `<p style=\"margin:0;font-family:'SF Mono',Menlo,Consolas,monospace;font-size:32px;font-weight:800;letter-spacing:0.08em;color:${BRAND_MAGENTA};\">${p.safeCode}</p>`,
    "</td></tr>",
    "</table>",
    "</td></tr>",
    // CTA button
    "<tr><td style=\"padding:8px 24px 24px 24px;\" align=\"center\">",
    `<table role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\">`,
    "<tr><td style=\"background-color:" + BRAND_MAGENTA + ";border-radius:8px;\" align=\"center\">",
    `<a href=\"${p.cta}\" target=\"_blank\" rel=\"noopener\" style=\"display:inline-block;padding:14px 32px;font-size:16px;font-weight:700;color:${BRAND_WHITE};text-decoration:none;letter-spacing:0.02em;\">Open the Rido app</a>`,
    "</td></tr>",
    "</table>",
    "</td></tr>",
    "<tr><td style=\"padding:8px 24px 24px 24px;\" align=\"left\">",
    `<p style=\"margin:0;font-size:14px;line-height:1.6;color:${BRAND_MUTED};\">The code was sent to <strong style=\"color:${BRAND_WHITE};\">${p.safeEmail}</strong>. It can be redeemed once per account and is valid for 30 days from today.</p>`,
    "</td></tr>",
    "<tr><td style=\"padding:8px 24px 32px 24px;\" align=\"left\">",
    `<p style=\"margin:0 0 8px 0;font-size:12px;line-height:1.6;color:${BRAND_MUTED};\">Rido is a service of Go2 Place S.L. — Orihuela Costa, Spain.</p>`,
    `<p style=\"margin:0;font-size:12px;line-height:1.6;color:${BRAND_MUTED};\">You can <a href=\"${p.unsub}\" style=\"color:${BRAND_MAGENTA};text-decoration:underline;\">unsubscribe</a> from launch announcements at any time.</p>`,
    "</td></tr>",
    "</table>",
    "</td></tr>",
    "</table>",
    "</body></html>",
  ].join("");
}

function renderText(p: ShellProps): string {
  return [
    `Rido is live in ${p.safeCity}! 🚲`,
    "",
    p.greeting,
    "",
    "You waited. We built. Now let's ride. Rido is officially available in",
    `${p.safeCity}, and as a waitlist VIP your first ride is on us.`,
    "",
    `Your waitlist code: ${p.safeCode}`,
    "",
    `Open the Rido app: ${p.cta}`,
    "",
    `The code was sent to: ${p.safeEmail}`,
    "It can be redeemed once per account and is valid for 30 days from today.",
    "",
    "---",
    "Rido is a service of Go2 Place S.L. — Orihuela Costa, Spain.",
    `Unsubscribe: ${p.unsub}`,
  ].join("\n");
}
