/**
 * Spanish (es) variant of the waitlist confirmation email.
 *
 * Mirrors the English template 1:1 — same layout, same color palette, same
 * CTA card — only the copy changes. Both variants are exported from the
 * `@/lib/email` barrel so callers can pick the right one based on the
 * recipient's `locale`.
 *
 * @module src/lib/email/templates/waitlist-confirmation.es
 */

import {
  buildUnsubscribeUrl,
  escape,
  escapeUrl,
} from "@/lib/email/templates/strings";

/**
 * Props for the Spanish waitlist confirmation template. Identical shape
 * to the English one so the caller can pass the same object into either
 * renderer.
 */
export interface WaitlistConfirmationEsProps {
  name?: string | null;
  email: string;
  city?: string | null;
  /** Locale code. This template handles `"es"`. */
  locale: "en" | "es";
  /** Full URL to the unsubscribe endpoint. */
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
const SUBJECT = "Estás en la lista de espera de Rido 🚲";

/**
 * Render the Spanish waitlist confirmation email.
 *
 * @param props Recipient + content fields. See {@link WaitlistConfirmationEsProps}.
 * @returns A {@link RenderedEmail} with `subject`, inline-styled `html`,
 *          and a plain-text `text` fallback.
 */
export function renderWaitlistConfirmationEs(
  props: WaitlistConfirmationEsProps,
): RenderedEmail {
  const safeName = escape((props.name ?? "").trim());
  const safeCity = escape((props.city ?? "").trim());
  const safeEmail = escape(props.email);
  const greeting = safeName ? `Hola ${safeName},` : "Hola:";
  const cityLine = safeCity
    ? `Estamos preparando el lanzamiento de Rido en <strong>${safeCity}</strong> — serás de los primeros en enterarte cuando llegue el momento de pedalear.`
    : "Estamos preparando el lanzamiento de Rido en tu ciudad — serás de los primeros en enterarte cuando llegue el momento de pedalear.";
  const unsub = escapeUrl(
    props.unsubscribeUrl ?? buildUnsubscribeUrl(props.email, props.siteOrigin),
  );
  const html = renderHtml({ greeting, cityLine, safeEmail, unsub });
  const text = renderText({ greeting, cityLine, safeEmail, unsub });
  return { subject: SUBJECT, html, text };
}

interface ShellProps {
  greeting: string;
  cityLine: string;
  safeEmail: string;
  unsub: string;
}

function renderHtml(p: ShellProps): string {
  return [
    '<!doctype html>',
    '<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">',
    "<head>",
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    '<meta name="x-apple-disable-message-reformatting" />',
    "<title>Estás en la lista de espera de Rido</title>",
    "</head>",
    `<body style="margin:0;padding:0;background-color:${BRAND_NAVY};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:${BRAND_WHITE};-webkit-text-size-adjust:100%;">`,
    `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${BRAND_NAVY};">Gracias por unirte a la lista de espera de Rido — esto es lo que sigue.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>`,
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:' + BRAND_NAVY + ';">',
    "<tr><td align=\"center\" style=\"padding:32px 16px;\">",
    '<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background-color:' + BRAND_NAVY + ';">',
    "<tr><td style=\"padding:24px 24px 8px 24px;\" align=\"left\">",
    `<span style="font-size:28px;font-weight:800;letter-spacing:-0.02em;color:${BRAND_MAGENTA};">Rido</span>`,
    "</td></tr>",
    "<tr><td style=\"padding:16px 24px 8px 24px;\" align=\"left\">",
    `<h1 style=\"margin:0;font-size:28px;line-height:1.25;font-weight:800;color:${BRAND_WHITE};letter-spacing:-0.02em;\">¡Estás dentro! 🎉</h1>`,
    "</td></tr>",
    "<tr><td style=\"padding:8px 24px 0 24px;\" align=\"left\">",
    `<p style=\"margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND_WHITE};\">${p.greeting}</p>`,
    `<p style=\"margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND_WHITE};\">Gracias por apuntarte a la lista de espera de Rido. ${p.cityLine}</p>`,
    `<p style=\"margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND_WHITE};\">Mientras tanto, te tendremos al tanto de:</p>`,
    "<ul style=\"margin:0 0 16px 24px;padding:0;font-size:16px;line-height:1.7;color:" + BRAND_WHITE + ";\">",
    "<li>Fechas de lanzamiento en tu ciudad</li>",
    "<li>Precios de lanzamiento y códigos de invitación</li>",
    "<li>Novedades del producto entre bastidores</li>",
    "</ul>",
    "</td></tr>",
    "<tr><td style=\"padding:8px 24px 24px 24px;\" align=\"center\">",
    `<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"background-color:${BRAND_BG};border-radius:12px;\">`,
    "<tr><td style=\"padding:24px;\" align=\"left\">",
    `<p style=\"margin:0 0 8px 0;font-size:14px;line-height:1.5;color:${BRAND_MUTED};text-transform:uppercase;letter-spacing:0.08em;\">Tu plaza está reservada</p>`,
    `<p style=\"margin:0;font-size:16px;line-height:1.6;color:${BRAND_WHITE};\">Hemos enviado esta confirmación a <strong>${p.safeEmail}</strong>. Si no es correcta, responde a este correo y lo arreglamos.</p>`,
    "</td></tr>",
    "</table>",
    "</td></tr>",
    "<tr><td style=\"padding:8px 24px 32px 24px;\" align=\"left\">",
    `<p style=\"margin:0 0 8px 0;font-size:12px;line-height:1.6;color:${BRAND_MUTED};\">Rido es un servicio de Go2 Place S.L. — Orihuela Costa, España.</p>`,
    `<p style=\"margin:0;font-size:12px;line-height:1.6;color:${BRAND_MUTED};\">Puedes <a href=\"${p.unsub}\" style=\"color:${BRAND_MAGENTA};text-decoration:underline;\">cancelar tu suscripción</a> a las novedades en cualquier momento.</p>`,
    "</td></tr>",
    "</table>",
    "</td></tr>",
    "</table>",
    "</body></html>",
  ].join("");
}

function renderText(p: ShellProps): string {
  return [
    "¡Estás dentro de la lista de espera de Rido! 🎉",
    "",
    p.greeting,
    "",
    "Gracias por apuntarte a la lista de espera de Rido.",
    p.cityLine.replace(/<[^>]+>/g, ""),
    "",
    "Mientras tanto, te tendremos al tanto de:",
    "  - Fechas de lanzamiento en tu ciudad",
    "  - Precios de lanzamiento y códigos de invitación",
    "  - Novedades del producto entre bastidores",
    "",
    `Hemos enviado esta confirmación a: ${p.safeEmail}`,
    "Si no es correcta, responde a este correo y lo arreglamos.",
    "",
    "---",
    "Rido es un servicio de Go2 Place S.L. — Orihuela Costa, España.",
    `Cancelar suscripción: ${p.unsub}`,
  ].join("\n");
}
