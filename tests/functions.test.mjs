// Unit tests for the Netlify Functions (pure handlers + in-memory Blobs doubles).
// Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { handleWaitlist } from "../netlify/functions/waitlist.mjs";
import { handleEvents } from "../netlify/functions/events.mjs";

const memStore = () => {
  const m = new Map();
  return {
    m,
    get: async (k) => m.get(k) ?? null,
    setJSON: async (k, v) => void m.set(k, v),
    list: async ({ prefix = "" } = {}) => ({ blobs: [...m.keys()].filter((k) => k.startsWith(prefix)).map((key) => ({ key })) }),
  };
};
const post = (path, body) => new Request(`https://www.rido.bike${path}`, { method: "POST", body: JSON.stringify(body) });

function setup({ env = { RESEND_API_KEY: "k", WAITLIST_ADMIN_TOKEN: "admin" }, sendOk = true } = {}) {
  const sent = [];
  let t = Date.UTC(2026, 9, 16);
  const deps = {
    store: memStore(),
    meta: memStore(),
    env,
    now: () => new Date(t),
    newToken: () => "tok-1234",
    fetchImpl: async (_url, init) => {
      sent.push(JSON.parse(init.body));
      return { ok: sendOk, status: sendOk ? 200 : 500 };
    },
  };
  return { deps, sent, advance: (ms) => (t += ms) };
}
const call = async (req, deps) => {
  const res = await handleWaitlist(req, deps);
  return { status: res.status, body: res.headers.get("content-type")?.includes("json") ? await res.json() : null, res };
};

test("new sign-up with double opt-in: pending, confirmation + notification sent", async () => {
  const { deps, sent } = setup();
  const r = await call(post("/api/waitlist", { email: "A@x.com", locale: "es" }), deps);
  assert.deepEqual(r.body, { ok: true, pending: true });
  assert.equal(sent.length, 2);
  assert.match(sent[0].text, /https:\/\/www\.rido\.bike\/es\/waitlist-confirmed\?e=a%40x\.com&t=tok-1234/);
  assert.equal(deps.store.m.get("a@x.com").confirmed, false);
});

test("existing and new addresses get identical responses (no enumeration)", async () => {
  const { deps } = setup();
  const first = await call(post("/api/waitlist", { email: "a@x.com" }), deps);
  const again = await call(post("/api/waitlist", { email: "a@x.com" }), deps);
  assert.deepEqual(first.body, again.body);
  assert.equal(first.status, again.status);
});

test("re-submit re-sends only after 10 minutes", async () => {
  const { deps, sent, advance } = setup();
  await call(post("/api/waitlist", { email: "a@x.com" }), deps);
  await call(post("/api/waitlist", { email: "a@x.com" }), deps);
  assert.equal(sent.length, 2); // confirmation + notification, no resend yet
  advance(11 * 60 * 1000);
  await call(post("/api/waitlist", { email: "a@x.com" }), deps);
  assert.equal(sent.length, 3);
});

test("failed confirmation email is an error, and a later re-submit retries", async () => {
  const { deps } = setup({ sendOk: false });
  const r = await call(post("/api/waitlist", { email: "a@x.com" }), deps);
  assert.equal(r.status, 502);
  assert.deepEqual(r.body, { ok: false, error: "email_failed" });
  assert.ok(deps.store.m.has("a@x.com"));
});

test("honeypot submissions look accepted but are not stored or emailed", async () => {
  const { deps, sent } = setup();
  const r = await call(post("/api/waitlist", { email: "bot@x.com", company: "Acme" }), deps);
  assert.deepEqual(r.body, { ok: true, pending: true });
  assert.equal(deps.store.m.size, 0);
  assert.equal(sent.length, 0);
});

test("daily email limit returns busy and keeps the sign-up", async () => {
  const { deps } = setup({ env: { RESEND_API_KEY: "k", WAITLIST_DAILY_EMAIL_LIMIT: "1" } });
  assert.equal((await call(post("/api/waitlist", { email: "a@x.com" }), deps)).status, 200);
  const r = await call(post("/api/waitlist", { email: "b@x.com" }), deps);
  assert.equal(r.status, 503);
  assert.deepEqual(r.body, { ok: false, error: "busy" });
  assert.ok(deps.store.m.has("b@x.com"));
});

test("invalid emails are rejected with 422, including Blobs-unsafe keys", async () => {
  const { deps } = setup();
  for (const email of ["nope", "foo@gmail.c", "/x@ex.com"]) {
    const r = await call(post("/api/waitlist", { email }), deps);
    assert.equal(r.status, 422, email);
  }
});

test("storage failure keeps the { ok, error } shape", async () => {
  const { deps } = setup();
  deps.store.get = async () => {
    throw new Error("blobs down");
  };
  const r = await call(post("/api/waitlist", { email: "a@x.com" }), deps);
  assert.equal(r.status, 500);
  assert.deepEqual(r.body, { ok: false, error: "server" });
});

test("confirm: GET forwards to the page without confirming; POST confirms with the right token only", async () => {
  const { deps } = setup();
  await call(post("/api/waitlist", { email: "a@x.com", locale: "es" }), deps);
  const get = await handleWaitlist(new Request("https://www.rido.bike/api/waitlist/confirm?e=a%40x.com&t=tok-1234&l=es"), deps);
  assert.equal(get.status, 303);
  assert.equal(get.headers.get("location"), "/es/waitlist-confirmed?e=a%40x.com&t=tok-1234");
  assert.equal(deps.store.m.get("a@x.com").confirmed, false);

  const bad = await call(post("/api/waitlist/confirm", { email: "a@x.com", token: "wrong" }), deps);
  const unknown = await call(post("/api/waitlist/confirm", { email: "zz@x.com", token: "tok-1234" }), deps);
  assert.deepEqual(bad.body, unknown.body);
  assert.equal(bad.status, unknown.status);

  const ok = await call(post("/api/waitlist/confirm", { email: "a@x.com", token: "tok-1234" }), deps);
  assert.deepEqual(ok.body, { ok: true });
  assert.equal(deps.store.m.get("a@x.com").confirmed, true);
});

test("without RESEND_API_KEY: single opt-in, plain { ok: true }", async () => {
  const { deps, sent } = setup({ env: {} });
  const r = await call(post("/api/waitlist", { email: "a@x.com" }), deps);
  assert.deepEqual(r.body, { ok: true });
  assert.equal(sent.length, 0);
  assert.equal(deps.store.m.get("a@x.com").confirmed, undefined);
});

test("export needs the admin token, never includes tokens, neutralises formulas", async () => {
  const { deps } = setup();
  await call(post("/api/waitlist", { email: "a@x.com" }), deps);
  deps.store.m.set("=cmd@x.com", { email: "=cmd@x.com", locale: "en", at: "2026-10-16T00:00:01Z" });
  assert.equal((await handleWaitlist(new Request("https://www.rido.bike/api/waitlist"), deps)).status, 401);
  const auth = { headers: { authorization: "Bearer admin" } };
  const j = await call(new Request("https://www.rido.bike/api/waitlist", auth), deps);
  assert.equal(j.body.count, 2);
  assert.ok(j.body.entries.every((e) => !("token" in e)));
  const csv = await (await handleWaitlist(new Request("https://www.rido.bike/api/waitlist?format=csv", auth), deps)).text();
  assert.match(csv, /"'=cmd@x\.com"/);
});

test("events: valid events stored, invalid rejected, daily cap enforced, export needs token", async () => {
  const store = memStore();
  let i = 0;
  const deps = { store, env: { WAITLIST_ADMIN_TOKEN: "admin", EVENTS_DAILY_LIMIT: "2" }, now: () => new Date(Date.UTC(2026, 9, 16)), id: () => `id${i++}` };
  const send = (b) => handleEvents(new Request("https://x/api/events", { method: "POST", body: JSON.stringify(b) }), deps);
  const ev = { event: "waitlist_view", placement: "hero", locale: "es", path: "/es" };
  assert.equal((await send(ev)).status, 200);
  assert.equal((await send({ ...ev, event: "hack" })).status, 422);
  assert.equal((await send({ ...ev, path: "/<script>" })).status, 422);
  await send(ev);
  await send(ev); // over the cap of 2: acknowledged, not stored
  assert.equal([...store.m.keys()].filter((k) => k.startsWith("2026-10-16/")).length, 2);
  assert.equal((await handleEvents(new Request("https://x/api/events"), deps)).status, 401);
  const res = await handleEvents(new Request("https://x/api/events?days=1", { headers: { authorization: "Bearer admin" } }), deps);
  const body = await res.json();
  assert.equal(body.counts["2026-10-16"]["waitlist_view · hero · es · /es"], 2);
});
