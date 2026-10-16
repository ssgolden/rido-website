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
 * Optional env vars (Netlify → Site configuration → Environment variables):
 *   WAITLIST_ADMIN_TOKEN  enables GET /api/waitlist?format=csv with header
 *                         "Authorization: Bearer <token>" to export sign-ups.
 *   RESEND_API_KEY        emails each new sign-up to NOTIFY_EMAIL.
 *   NOTIFY_EMAIL          default info@rido.bike.
 *   EMAIL_FROM            default "Rido Waitlist <onboarding@resend.dev>".
 *
 * On Vercel the Next.js route src/app/api/waitlist/route.ts serves this path
 * instead; this file is ignored there.
 */
import { getStore } from "@netlify/blobs";

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const MAX_BODY_BYTES = 2048;

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

async function notify(entry, env, fetchImpl) {
  if (!env.RESEND_API_KEY) return;
  try {
    const res = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.EMAIL_FROM || "Rido Waitlist <onboarding@resend.dev>",
        to: [env.NOTIFY_EMAIL || "info@rido.bike"],
        subject: `New waitlist sign-up: ${entry.email}`,
        text: `Email: ${entry.email}\nLanguage: ${entry.locale}\nTime: ${entry.at}\nSource: rido.bike waitlist form`,
      }),
    });
    if (!res.ok) console.error(`resend_error status=${res.status}`);
  } catch (err) {
    console.error(`resend_error ${err instanceof Error ? err.message : "unknown"}`);
  }
}

/**
 * Pure request handler. `store` needs get/setJSON/list (a Netlify Blobs store
 * or a test double). Exported for tests; the default export wires real deps.
 */
export async function handleWaitlist(req, { store, env = {}, fetchImpl = fetch, now = () => new Date() }) {
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
    if (existing) return json(200, { ok: true, duplicate: true });

    const entry = { email, locale, at: now().toISOString() };
    await store.setJSON(email, entry);
    console.log(JSON.stringify({ type: "waitlist_signup", email, locale, at: entry.at }));
    await notify(entry, env, fetchImpl);
    return json(200, { ok: true });
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
      const csv = ["email,locale,signed_up_at", ...entries.map((e) => [e.email, e.locale, e.at].map(csvCell).join(","))].join("\n");
      return new Response(csv + "\n", {
        status: 200,
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": `attachment; filename="rido-waitlist-${now().toISOString().slice(0, 10)}.csv"`,
          "cache-control": "no-store",
        },
      });
    }
    return json(200, { ok: true, count: entries.length, entries });
  }

  return new Response(null, { status: 405, headers: { allow: "GET, POST" } });
}

export default async function waitlist(req) {
  return handleWaitlist(req, {
    store: getStore({ name: "waitlist", consistency: "strong" }),
    env: process.env,
  });
}

export const config = { path: "/api/waitlist" };
