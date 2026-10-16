/**
 * Conversion events for www.rido.bike (Netlify Function at /api/events).
 *
 * The browser only calls this after the visitor accepted the consent banner
 * (src/lib/analytics.ts). Each event is stored anonymously in the Netlify
 * Blobs store "events" under `YYYY-MM-DD/<random id>`: event name, placement,
 * locale and page path. No IP, user agent, cookie or other identifier is kept.
 *
 * Read the daily counts with the same admin token as the waitlist export:
 *   curl -H "Authorization: Bearer $WAITLIST_ADMIN_TOKEN" \
 *     "https://www.rido.bike/api/events?days=30"
 */
import { getStore } from "@netlify/blobs";

const EVENTS = new Set(["waitlist_view", "waitlist_submit", "waitlist_success", "waitlist_error", "share_click"]);
const PLACEMENTS = new Set(["hero", "closing", "city-hero", "confirmed"]);
const PATH_RE = /^\/[a-z0-9\-/]{0,80}$/i;
const DETAIL_RE = /^[a-z0-9_-]{1,24}$/;
const MAX_BODY_BYTES = 1024;

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

const day = (d) => d.toISOString().slice(0, 10);

/** Pure handler; `store` needs setJSON/get/list. Exported for tests. */
export async function handleEvents(req, { store, env = {}, now = () => new Date(), id = () => crypto.randomUUID() }) {
  if (req.method === "POST") {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return json(413, { ok: false, error: "too_large" });
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return json(400, { ok: false, error: "invalid" });
    }
    const { event, placement, path } = body ?? {};
    if (!EVENTS.has(event) || !PLACEMENTS.has(placement) || typeof path !== "string" || !PATH_RE.test(path)) {
      return json(422, { ok: false, error: "invalid_event" });
    }
    const entry = {
      event,
      placement,
      path,
      locale: body.locale === "es" ? "es" : "en",
      ...(typeof body.detail === "string" && DETAIL_RE.test(body.detail) ? { detail: body.detail } : {}),
    };
    await store.setJSON(`${day(now())}/${id()}`, entry);
    return json(200, { ok: true });
  }

  if (req.method === "GET") {
    const token = env.WAITLIST_ADMIN_TOKEN;
    if (!token || (req.headers.get("authorization") || "") !== `Bearer ${token}`) {
      return json(401, { ok: false, error: "unauthorized" });
    }
    const requested = Number(new URL(req.url).searchParams.get("days") || 30);
    const days = Math.min(90, Math.max(1, Number.isFinite(requested) ? Math.floor(requested) : 30));
    const today = now();
    const counts = {};
    for (let i = 0; i < days; i++) {
      const d = day(new Date(today.getTime() - i * 86_400_000));
      const { blobs } = await store.list({ prefix: `${d}/` });
      if (blobs.length === 0) continue;
      const entries = (await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))).filter(Boolean);
      for (const e of entries) {
        const key = [e.event, e.placement, e.locale, e.path, e.detail].filter(Boolean).join(" · ");
        counts[d] ??= {};
        counts[d][key] = (counts[d][key] ?? 0) + 1;
      }
    }
    return json(200, { ok: true, days, counts });
  }

  return new Response(null, { status: 405, headers: { allow: "GET, POST" } });
}

export default async function events(req) {
  return handleEvents(req, { store: getStore({ name: "events" }), env: process.env });
}

export const config = { path: "/api/events" };
