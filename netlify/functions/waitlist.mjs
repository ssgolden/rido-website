/**
 * Waitlist backend for the Netlify-hosted static site (www.rido.bike).
 *
 * The static export has no Next.js API routes, so this Netlify Function
 * answers /api/waitlist instead. Both waitlist forms (homepage DownloadCTA and
 * /coming-soon) already POST JSON there when NEXT_PUBLIC_WAITLIST_URL is unset.
 *
 * Storage: Netlify Blobs store "waitlist", one entry per email (key = the
 * normalised email, so re-submits are de-duplicated). No setup needed — Blobs
 * is available to every Netlify site. Browse entries in the Netlify UI under
 * the site's Blobs tab.
 *
 * Double opt-in: when RESEND_API_KEY is set, each new sign-up is stored as
 * unconfirmed and sent a confirmation email (EN or ES) with a link to
 * GET /api/waitlist/confirm?e=<email>&t=<token>. Following it marks the entry
 * confirmed and redirects to /waitlist-confirmed (or /es/waitlist-confirmed).
 * The response then carries `pending: true` so the form says "check your
 * inbox". Without the key, sign-ups are stored as before (single opt-in).
 *
 * Optional env vars (Netlify → Site configuration → Environment variables):
 *   WAITLIST_ADMIN_TOKEN  enables GET /api/waitlist?format=csv with header
 *                         "Authorization: Bearer <token>" to export sign-ups.
 *   RESEND_API_KEY        turns on the confirmation email, and emails each
 *                         new sign-up to NOTIFY_EMAIL.
 *   EMAIL_FROM            sender. Must be on a domain verified in Resend
 *                         (e.g. "Rido <hola@rido.bike>"): Resend's default
 *                         onboarding@resend.dev can only email the account
 *                         owner, so confirmations to riders would fail.
 *   NOTIFY_EMAIL          default info@rido.bike.
 *
 * On Vercel the Next.js route src/app/api/waitlist/route.ts serves this path
 * instead; this file is ignored there.
 */
import { getStore } from "@netlify/blobs";

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const MAX_BODY_BYTES = 2048;
/** Minimum gap before a re-submit re-sends the confirmation email. */
const RESEND_CONFIRM_AFTER_MS = 10 * 60 * 1000;
const DEFAULT_FROM = "Rido Waitlist <onboarding@resend.dev>";

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

function csvCell(value) {
  const s = String(value ?? "");
  // Quote, escape quotes, and neutralise spreadsheet formula injection.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** Sends one email through Resend. Returns true when Resend accepted it. */
async function sendEmail(message, env, fetchImpl) {
  if (!env.RESEND_API_KEY) return false;
  try {
    const res = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.EMAIL_FROM || DEFAULT_FROM, ...message }),
    });
    if (!res.ok) console.error(`resend_error status=${res.status}`);
    return res.ok;
  } catch (err) {
    console.error(`resend_error ${err instanceof Error ? err.message : "unknown"}`);
    return false;
  }
}

function notify(entry, env, fetchImpl) {
  return sendEmail(
    {
      to: [env.NOTIFY_EMAIL || "info@rido.bike"],
      subject: `New waitlist sign-up: ${entry.email}`,
      text: `Email: ${entry.email}\nLanguage: ${entry.locale}\nTime: ${entry.at}\nSource: rido.bike waitlist form`,
    },
    env,
    fetchImpl
  );
}

const confirmCopy = {
  en: {
    subject: "Confirm your place on the Rido waitlist",
    greeting: "Thanks for joining the Rido waitlist.",
    ask: "Please confirm your email address so we can tell you when Rido launches in Torrevieja:",
    button: "Confirm my email",
    ignore: "If you didn't sign up, ignore this email and you won't hear from us again.",
    sign: "The Rido team · Go2 Place S.L., Orihuela Costa · info@rido.bike",
  },
  es: {
    subject: "Confirma tu plaza en la lista de espera de Rido",
    greeting: "Gracias por unirte a la lista de espera de Rido.",
    ask: "Confirma tu correo para que podamos avisarte cuando Rido llegue a Torrevieja:",
    button: "Confirmar mi correo",
    ignore: "Si no te has apuntado tú, ignora este correo y no volveremos a escribirte.",
    sign: "El equipo de Rido · Go2 Place S.L., Orihuela Costa · info@rido.bike",
  },
};

function sendConfirmation(entry, origin, env, fetchImpl) {
  const t = confirmCopy[entry.locale] ?? confirmCopy.en;
  const link = `${origin}/api/waitlist/confirm?e=${encodeURIComponent(entry.email)}&t=${entry.token}`;
  const html = `<!doctype html><html lang="${entry.locale}"><body style="margin:0;padding:24px;background:#F5EEE4;font-family:Arial,Helvetica,sans-serif;color:#0F172A">
<div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px">
<p style="margin:0 0 24px;font-size:24px;font-weight:800;color:#DE0498">rido</p>
<p style="margin:0 0 12px;font-size:16px;line-height:1.5">${t.greeting}</p>
<p style="margin:0 0 24px;font-size:16px;line-height:1.5">${t.ask}</p>
<p style="margin:0 0 24px"><a href="${link}" style="display:inline-block;background:#DE0498;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 24px;border-radius:12px">${t.button}</a></p>
<p style="margin:0 0 24px;font-size:13px;line-height:1.5;color:#475569;word-break:break-all">${link}</p>
<p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#475569">${t.ignore}</p>
<p style="margin:0;font-size:13px;color:#475569">${t.sign}</p>
</div></body></html>`;
  return sendEmail(
    {
      to: [entry.email],
      subject: t.subject,
      html,
      text: `${t.greeting}\n\n${t.ask}\n${link}\n\n${t.ignore}\n\n${t.sign}`,
    },
    env,
    fetchImpl
  );
}

function sameToken(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const redirect = (location) => new Response(null, { status: 303, headers: { location, "cache-control": "no-store" } });

async function confirm(req, store, now) {
  const params = new URL(req.url).searchParams;
  const email = (params.get("e") || "").trim().toLowerCase();
  const entry = EMAIL_RE.test(email) ? await store.get(email, { type: "json" }) : null;
  const home = entry?.locale === "es" ? "/es" : "";
  if (!entry || (!entry.confirmed && !sameToken(params.get("t"), entry.token))) {
    return redirect(`${home}/waitlist-confirmed?status=invalid`);
  }
  if (!entry.confirmed) {
    await store.setJSON(email, { ...entry, confirmed: true, confirmedAt: now().toISOString() });
    console.log(JSON.stringify({ type: "waitlist_confirmed", email }));
  }
  return redirect(`${home}/waitlist-confirmed`);
}

/**
 * Pure request handler. `store` needs get/setJSON/list (a Netlify Blobs store
 * or a test double). Exported for tests; the default export wires real deps.
 */
export async function handleWaitlist(
  req,
  { store, env = {}, fetchImpl = fetch, now = () => new Date(), newToken = () => crypto.randomUUID() }
) {
  const url = new URL(req.url);
  if (url.pathname.endsWith("/confirm")) {
    return req.method === "GET" ? confirm(req, store, now) : new Response(null, { status: 405, headers: { allow: "GET" } });
  }
  const doubleOptIn = Boolean(env.RESEND_API_KEY);

  if (req.method === "POST") {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return json(413, { ok: false, error: "too_large" });

    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return json(400, { ok: false, error: "invalid" });
    }
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const locale = body?.locale === "es" ? "es" : "en";
    if (!EMAIL_RE.test(email) || email.length > 254) {
      return json(422, { ok: false, error: "invalid_email" });
    }

    const existing = await store.get(email, { type: "json" });
    if (existing) {
      // Unconfirmed re-submit: re-send the confirmation, at most every 10 minutes.
      if (doubleOptIn && existing.confirmed === false && existing.token) {
        const last = Date.parse(existing.confirmSentAt || "") || 0;
        if (now().getTime() - last < RESEND_CONFIRM_AFTER_MS) return json(200, { ok: true, duplicate: true, pending: true });
        const sent = await sendConfirmation(existing, url.origin, env, fetchImpl);
        if (sent) await store.setJSON(email, { ...existing, confirmSentAt: now().toISOString() });
        return json(200, { ok: true, duplicate: true, pending: sent });
      }
      return json(200, { ok: true, duplicate: true });
    }

    const at = now().toISOString();
    const entry = doubleOptIn ? { email, locale, at, confirmed: false, token: newToken() } : { email, locale, at };
    await store.setJSON(email, entry);
    console.log(JSON.stringify({ type: "waitlist_signup", email, locale, at }));
    let pending = false;
    if (doubleOptIn) {
      pending = await sendConfirmation(entry, url.origin, env, fetchImpl);
      if (pending) await store.setJSON(email, { ...entry, confirmSentAt: now().toISOString() });
    }
    await notify(entry, env, fetchImpl);
    return json(200, pending ? { ok: true, pending: true } : { ok: true });
  }

  if (req.method === "GET") {
    const token = env.WAITLIST_ADMIN_TOKEN;
    const auth = req.headers.get("authorization") || "";
    if (!token || auth !== `Bearer ${token}`) return json(401, { ok: false, error: "unauthorized" });

    const { blobs } = await store.list();
    const entries = (
      await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))
    ).filter(Boolean);
    entries.sort((a, b) => String(a.at).localeCompare(String(b.at)));

    const format = new URL(req.url).searchParams.get("format");
    if (format === "csv") {
      // confirmed: yes / no (awaiting the email link) / blank (signed up before double opt-in).
      const confirmed = (e) => (e.confirmed === true ? "yes" : e.confirmed === false ? "no" : "");
      const csv = [
        "email,locale,signed_up_at,confirmed,confirmed_at",
        ...entries.map((e) => [e.email, e.locale, e.at, confirmed(e), e.confirmedAt].map(csvCell).join(",")),
      ].join("\n");
      return new Response(csv + "\n", {
        status: 200,
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": `attachment; filename="rido-waitlist-${now().toISOString().slice(0, 10)}.csv"`,
          "cache-control": "no-store",
        },
      });
    }
    // Tokens stay server-side.
    const safe = entries.map((e) => {
      const rest = { ...e };
      delete rest.token;
      return rest;
    });
    return json(200, { ok: true, count: entries.length, entries: safe });
  }

  return new Response(null, { status: 405, headers: { allow: "GET, POST" } });
}

export default async function waitlist(req) {
  return handleWaitlist(req, {
    store: getStore({ name: "waitlist", consistency: "strong" }),
    env: process.env,
  });
}

export const config = { path: ["/api/waitlist", "/api/waitlist/confirm"] };
