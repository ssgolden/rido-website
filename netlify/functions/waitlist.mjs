/**
 * Waitlist backend for the Netlify-hosted static site (www.rido.bike).
 *
 * The static export has no Next.js API routes, so this Netlify Function
 * answers /api/waitlist instead. The waitlist forms POST JSON here when
 * NEXT_PUBLIC_WAITLIST_URL is unset.
 *
 * Storage: Netlify Blobs store "waitlist", one entry per email (key = the
 * normalised email, so re-submits are de-duplicated). A second store,
 * "waitlist-meta", holds the daily email counter.
 *
 * Double opt-in: when RESEND_API_KEY is set, each new sign-up is stored as
 * unconfirmed and sent a confirmation email (EN or ES). Its link opens
 * /waitlist-confirmed?e=<email>&t=<token> (or /es/...), where the visitor
 * presses "Confirm", which POSTs to /api/waitlist/confirm. Confirming takes a
 * click on the page, not just opening the link, so email security scanners
 * that open links cannot confirm on the visitor's behalf.
 *
 * Responses never reveal whether an address is already on the list: new and
 * existing addresses get the same body ({ ok: true, pending: true } with
 * double opt-in, { ok: true } without). If the confirmation email cannot be
 * sent, the answer is an error, so the visitor is never told to check an
 * inbox that will stay empty.
 *
 * Abuse limits: a hidden honeypot field (`company`) silently drops bots, and
 * at most WAITLIST_DAILY_EMAIL_LIMIT sign-ups per day (default 200) trigger
 * emails. Over the limit the sign-up is kept and the visitor is asked to try
 * later; a later re-submit sends the email.
 *
 * Optional env vars (Netlify → Site configuration → Environment variables):
 *   WAITLIST_ADMIN_TOKEN        enables GET /api/waitlist?format=csv with header
 *                               "Authorization: Bearer <token>" to export sign-ups.
 *   RESEND_API_KEY              turns on the confirmation email, and emails each
 *                               new sign-up to NOTIFY_EMAIL.
 *   EMAIL_FROM                  sender. Must be on a domain verified in Resend
 *                               (e.g. "Rido <hola@rido.bike>"): Resend's default
 *                               onboarding@resend.dev can only email the account
 *                               owner, so confirmations to riders would fail.
 *   NOTIFY_EMAIL                default info@rido.bike.
 *   WAITLIST_DAILY_EMAIL_LIMIT  default 200.
 *
 * On Vercel the Next.js route src/app/api/waitlist/route.ts serves this path
 * instead; this file is ignored there.
 */
import { getStore } from "@netlify/blobs";

// Keep in sync with src/lib/email.ts (the forms validate with the same rule).
const EMAIL_RE = /^[^\s@/][^\s@]{0,63}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const MAX_BODY_BYTES = 2048;
/** Minimum gap before a re-submit re-sends the confirmation email. */
const RESEND_CONFIRM_AFTER_MS = 10 * 60 * 1000;
const DEFAULT_FROM = "Rido Waitlist <onboarding@resend.dev>";
const DEFAULT_DAILY_EMAIL_LIMIT = 200;

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

const byteLength = (s) => new TextEncoder().encode(s).length;

function csvCell(value) {
  const s = String(value ?? "");
  // Quote, escape quotes, and neutralise spreadsheet formula injection.
  const safe = /^[=+\-@\t\r|]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** Constant-time string comparison (tokens, admin secret). */
function sameSecret(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
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

/**
 * Takes one unit of today's email budget. Returns false once the daily limit
 * is reached. The counter is approximate under concurrency, which is fine for
 * an abuse cap.
 */
async function takeEmailBudget(meta, env, now) {
  const limit = Number(env.WAITLIST_DAILY_EMAIL_LIMIT) || DEFAULT_DAILY_EMAIL_LIMIT;
  const key = `emails/${now().toISOString().slice(0, 10)}`;
  const used = Number((await meta.get(key, { type: "json" }))?.count) || 0;
  if (used >= limit) {
    console.error(`waitlist_email_limit_reached limit=${limit}`);
    return false;
  }
  await meta.setJSON(key, { count: used + 1 });
  return true;
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
  const page = entry.locale === "es" ? "/es/waitlist-confirmed" : "/waitlist-confirmed";
  const link = `${origin}${page}?e=${encodeURIComponent(entry.email)}&t=${entry.token}`;
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

const redirect = (location) => new Response(null, { status: 303, headers: { location, "cache-control": "no-store" } });

async function readJsonBody(req) {
  const raw = await req.text();
  if (byteLength(raw) > MAX_BODY_BYTES) return { error: json(413, { ok: false, error: "too_large" }) };
  try {
    return { body: JSON.parse(raw) };
  } catch {
    return { error: json(400, { ok: false, error: "invalid" }) };
  }
}

/**
 * /api/waitlist/confirm
 *   GET  (links in emails sent before the confirm page existed): forwards the
 *        parameters to the confirm page; it does not confirm by itself.
 *   POST { email, token }: confirms when the token matches. Every failure gets
 *        the same answer, so it reveals nothing about which addresses exist.
 */
async function confirm(req, store, now) {
  if (req.method === "GET") {
    const params = new URL(req.url).searchParams;
    const page = params.get("l") === "es" ? "/es/waitlist-confirmed" : "/waitlist-confirmed";
    const qs = new URLSearchParams({ e: params.get("e") || "", t: params.get("t") || "" });
    return redirect(`${page}?${qs}`);
  }
  if (req.method !== "POST") return new Response(null, { status: 405, headers: { allow: "GET, POST" } });

  const { body, error } = await readJsonBody(req);
  if (error) return error;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const token = typeof body?.token === "string" ? body.token : "";
  const entry = EMAIL_RE.test(email) ? await store.get(email, { type: "json" }) : null;
  if (!entry || !entry.token || !sameSecret(token, entry.token)) {
    return json(400, { ok: false, error: "invalid" });
  }
  if (!entry.confirmed) {
    await store.setJSON(email, { ...entry, confirmed: true, confirmedAt: now().toISOString() });
    console.log(JSON.stringify({ type: "waitlist_confirmed", email }));
  }
  return json(200, { ok: true });
}

async function signUp(req, { store, meta, env, fetchImpl, now, newToken }) {
  const doubleOptIn = Boolean(env.RESEND_API_KEY);
  // The same body for every accepted sign-up, new or existing.
  const accepted = () => json(200, doubleOptIn ? { ok: true, pending: true } : { ok: true });

  const { body, error } = await readJsonBody(req);
  if (error) return error;
  // Honeypot: a field real visitors never see. Bots that fill it get a normal-looking answer.
  if (typeof body?.company === "string" && body.company.trim() !== "") return accepted();

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const locale = body?.locale === "es" ? "es" : "en";
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return json(422, { ok: false, error: "invalid_email" });
  }

  const origin = new URL(req.url).origin;
  /** Sends (or re-sends) the confirmation; returns an error response, or null on success. */
  const sendFor = async (entry, { isNew }) => {
    if (!(await takeEmailBudget(meta, env, now))) return json(503, { ok: false, error: "busy" });
    if (!(await sendConfirmation(entry, origin, env, fetchImpl))) return json(502, { ok: false, error: "email_failed" });
    await store.setJSON(entry.email, { ...entry, confirmSentAt: now().toISOString() });
    if (isNew) await notify(entry, env, fetchImpl);
    return null;
  };

  const existing = await store.get(email, { type: "json" });
  if (existing) {
    // Unconfirmed re-submit: re-send the confirmation, at most every 10 minutes.
    if (doubleOptIn && existing.confirmed === false && existing.token) {
      const last = Date.parse(existing.confirmSentAt || "") || 0;
      if (now().getTime() - last >= RESEND_CONFIRM_AFTER_MS) {
        const failed = await sendFor(existing, { isNew: false });
        if (failed) return failed;
      }
    }
    return accepted();
  }

  const at = now().toISOString();
  const entry = doubleOptIn ? { email, locale, at, confirmed: false, token: newToken() } : { email, locale, at };
  await store.setJSON(email, entry);
  console.log(JSON.stringify({ type: "waitlist_signup", email, locale, at }));
  if (doubleOptIn) {
    // Kept even if sending fails: a later re-submit retries the email.
    const failed = await sendFor(entry, { isNew: true });
    if (failed) return failed;
  }
  return accepted();
}

async function exportList(req, { store, env, now }) {
  const token = env.WAITLIST_ADMIN_TOKEN;
  const auth = req.headers.get("authorization") || "";
  if (!token || !sameSecret(auth, `Bearer ${token}`)) return json(401, { ok: false, error: "unauthorized" });

  const { blobs } = await store.list();
  const entries = (await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))).filter(Boolean);
  entries.sort((a, b) => String(a.at).localeCompare(String(b.at)));

  if (new URL(req.url).searchParams.get("format") === "csv") {
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

/**
 * Pure request handler. `store` and `meta` need get/setJSON/list (Netlify Blobs
 * stores or test doubles). Exported for tests; the default export wires real deps.
 */
export async function handleWaitlist(
  req,
  { store, meta, env = {}, fetchImpl = fetch, now = () => new Date(), newToken = () => crypto.randomUUID() }
) {
  const deps = { store, meta, env, fetchImpl, now, newToken };
  try {
    if (new URL(req.url).pathname.endsWith("/confirm")) return await confirm(req, store, now);
    if (req.method === "POST") return await signUp(req, deps);
    if (req.method === "GET") return await exportList(req, deps);
    return new Response(null, { status: 405, headers: { allow: "GET, POST" } });
  } catch (err) {
    // Keep the { ok, error } contract the forms rely on, even when storage fails.
    console.error(`waitlist_error ${err instanceof Error ? err.message : "unknown"}`);
    return json(500, { ok: false, error: "server" });
  }
}

export default async function waitlist(req) {
  return handleWaitlist(req, {
    store: getStore({ name: "waitlist", consistency: "strong" }),
    meta: getStore({ name: "waitlist-meta", consistency: "strong" }),
    env: process.env,
  });
}

export const config = { path: ["/api/waitlist", "/api/waitlist/confirm"] };
