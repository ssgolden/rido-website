/**
 * Spanish (es) variant of the contact form notification email.
 *
 * Same layout as the English version, copy translated. Sent to the
 * visitor as a courtesy acknowledgement.
 *
 * @module src/lib/email/templates/contact-notification.es
 */

import {
  buildUnsubscribeUrl,
  escape,
  escapeUrl,
} from "@/lib/email/templates/strings";

/** Props for the Spanish contact notification template. */
export interface ContactNotificationEsProps {
  name?: string | null;
  email: string;
  /** Original message body submitted by the visitor. */
  message: string;
  /** Locale code. This template handles `"es"`. */
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
const SUBJECT = "Hemos recibido tu mensaje — Rido";

/**
 * Render the Spanish contact notification email.
 *
 * @param props Recipient + content fields. See {@link ContactNotificationEsProps}.
 * @returns A {@link RenderedEmail} with `subject`, inline-styled `html`,
 *          and a plain-text `text` fallback.
 */
export function renderContactNotificationEs(
  props: ContactNotificationEsProps,
): RenderedEmail {
  const safeName = escape((props.name ?? "").trim());
  const safeEmail = escape(props.email);
  const maxMessage = 1500;
  const trimmed = (props.message ?? "").trim();
  const safeMessage = escape(
    trimmed.length > maxMessage ? trimmed.slice(0, maxMessage) + "…" : trimmed,
  );
  const greeting = safeName ? `Hola ${safeName},` : "Hola:";
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
    '<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">',
    "<head>",
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    '<meta name="x-apple-disable-message-reformatting" />',
    "<title>Hemos recibido tu mensaje</title>",
    "</head>",
    `<body style="margin:0;padding:0;background-color:${BRAND_NAVY};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:${BRAND_WHITE};-webkit-text-size-adjust:100%;">`,
    `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${BRAND_NAVY};">Gracias por escribirnos — hemos recibido tu mensaje y te responderemos en un día laborable.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>`,
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:' + BRAND_NAVY + ';">',
    "<tr><td align=\"center\" style=\"padding:32px 16px;\">",
    '<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background-color:' + BRAND_NAVY + ';">',
    "<tr><td style=\"padding:24px 24px 8px 24px;\" align=\"left\">",
    `<span style="font-size:28px;font-weight:800;letter-spacing:-0.02em;color:${BRAND_MAGENTA};">Rido</span>`,
    "</td></tr>",
    "<tr><td style=\"padding:16px 24px 8px 24px;\" align=\"left\">",
    `<h1 style=\"margin:0;font-size:28px;line-height:1.25;font-weight:800;color:${BRAND_WHITE};letter-spacing:-0.02em;\">Hemos recibido tu mensaje. ✉️</h1>`,
    "</td></tr>",
    "<tr><td style=\"padding:8px 24px 0 24px;\" align=\"left\">",
    `<p style=\"margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND_WHITE};\">${p.greeting}</p>`,
    `<p style=\"margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND_WHITE};\">Gracias por escribirnos. Una persona del equipo de Rido ha sido avisada y te responderemos en <strong>${p.safeEmail}</strong> en un plazo de un día laborable.</p>`,
    "</td></tr>",
    "<tr><td style=\"padding:8px 24px 24px 24px;\" align=\"center\">",
    `<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"background-color:${BRAND_BG};border-radius:12px;\">`,
    "<tr><td style=\"padding:24px;\" align=\"left\">",
    `<p style=\"margin:0 0 8px 0;font-size:14px;line-height:1.5;color:${BRAND_MUTED};text-transform:uppercase;letter-spacing:0.08em;\">Tu mensaje</p>`,
    `<p style=\"margin:0;font-size:16px;line-height:1.6;color:${BRAND_WHITE};white-space:pre-wrap;\">${p.safeMessage}</p>`,
    "</td></tr>",
    "</table>",
    "</td></tr>",
    "<tr><td style=\"padding:8px 24px 24px 24px;\" align=\"left\">",
    `<p style=\"margin:0 0 8px 0;font-size:16px;line-height:1.6;color:${BRAND_WHITE};\">¿Necesitas añadir algo? Solo responde a este correo — llega directamente a nuestra bandeja.</p>`,
    "</td></tr>",
    "<tr><td style=\"padding:8px 24px 32px 24px;\" align=\"left\">",
    `<p style=\"margin:0 0 8px 0;font-size:12px;line-height:1.6;color:${BRAND_MUTED};\">Rido es un servicio de Go2 Place S.L. — Orihuela Costa, España.</p>`,
    `<p style=\"margin:0;font-size:12px;line-height:1.6;color:${BRAND_MUTED};\">Puedes <a href=\"${p.unsub}\" style=\"color:${BRAND_MAGENTA};text-decoration:underline;\">cancelar tu suscripción</a> a las comunicaciones no esenciales en cualquier momento.</p>`,
    "</td></tr>",
    "</table>",
    "</td></tr>",
    "</table>",
    "</body></html>",
  ].join("");
}

function renderText(p: ShellProps): string {
  return [
    "Hemos recibido tu mensaje ✉️",
    "",
    p.greeting,
    "",
    "Gracias por escribirnos. Una persona del equipo de Rido ha sido avisada",
    `y te responderemos en ${p.safeEmail} en un plazo de un día laborable.`,
    "",
    "--- Tu mensaje ---",
    p.safeMessage,
    "--- fin ---",
    "",
    "¿Necesitas añadir algo? Solo responde a este correo — llega directamente a nuestra bandeja.",
    "",
    "---",
    "Rido es un servicio de Go2 Place S.L. — Orihuela Costa, España.",
    `Cancelar suscripción: ${p.unsub}`,
  ].join("\n");
}
