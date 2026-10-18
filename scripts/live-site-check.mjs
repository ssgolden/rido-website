#!/usr/bin/env node
/**
 * Checks the LIVE site (Netlify, https://www.rido.bike) from a machine with
 * real network access — the GitHub runner in .github/workflows/live-site-check.yml.
 *
 * What it verifies:
 * - every public page answers 200 as HTML with the right <html lang>, a
 *   <title>, the icon links from the layouts, apple-touch-icon and manifest
 * - the icon files, manifest (every icons[].src, theme_color) and llms.txt
 * - security headers on / and immutable caching on the self-hosted fonts
 * - the apex https://rido.bike redirects to https://www.rido.bike
 * - no planned (unannounced) town name reaches any fetched HTML
 * - /api/waitlist rejects an invalid email with { ok: false }
 *
 * Usage: node scripts/live-site-check.mjs [origin]   (default: https://www.rido.bike)
 *
 * LIVE_CHECK_LOCAL=1 skips the checks that only hold on Netlify (apex
 * redirect, HSTS, waitlist API) so the script can run against
 * `node scripts/serve-export.mjs`. Node 20+ built-ins only, no dependencies.
 *
 * Planned town names are read from src/data/cities.planned.ts in CI only and
 * are never printed — a failure says only which path leaked.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ORIGIN = (process.argv[2] ?? "https://www.rido.bike").replace(/\/$/, "");
const LOCAL = process.env.LIVE_CHECK_LOCAL === "1";
const APEX = "https://rido.bike";
const TIMEOUT_MS = 15_000;
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const PAGES = [
  { path: "/", lang: "en" },
  { path: "/es", lang: "es" },
  { path: "/torrevieja", lang: "en" },
  { path: "/es/torrevieja", lang: "es" },
  { path: "/privacy", lang: "en" },
  { path: "/terms", lang: "en" },
  { path: "/politica-cookies", lang: "en" },
  { path: "/partners", lang: "en" },
  { path: "/careers", lang: "en" },
  { path: "/404-nope", status: 404 },
];

/** <link> tags every 200 page must carry (rel + href, in any attribute order). */
const HEAD_LINKS = [
  { rel: "icon", href: "/favicon.svg" },
  { rel: "icon", href: "/favicon-32.png" },
  { rel: "icon", href: "/icons/icon-192.png" },
  { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
  { rel: "manifest", href: "/manifest.json" },
];

const ASSETS = [
  { path: "/favicon.svg", type: "image/svg+xml" },
  { path: "/favicon-32.png", type: "image/png" },
  { path: "/icons/icon-192.png", type: "image/png" },
  { path: "/icons/icon-512.png", type: "image/png" },
  { path: "/apple-touch-icon.png", type: "image/png" },
];

const SECURITY_HEADERS = ["content-security-policy", "x-content-type-options"];
if (!LOCAL) SECURITY_HEADERS.push("strict-transport-security");

const results = [];
const record = (ok, label, detail) => {
  results.push({ ok, label, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
};
const skip = (label, why) => console.log(`SKIP  ${label} — ${why}`);

/** fetch with a timeout, no redirects, one retry on a network error. */
async function request(url, init = {}) {
  let lastErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        redirect: "manual",
        ...init,
        signal: controller.signal,
        headers: { "user-agent": "rido-live-site-check/1 (+https://github.com/ssgolden/rido-website)", ...init.headers },
      });
      const body = init.method === "HEAD" ? null : Buffer.from(await res.arrayBuffer());
      return { status: res.status, headers: res.headers, body };
    } catch (err) {
      lastErr = err;
      if (attempt === 0) await new Promise((r) => setTimeout(r, 2000));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr;
}

/** Runs one named check; a thrown error becomes a FAIL instead of aborting the run. */
async function check(label, fn) {
  try {
    const detail = await fn();
    record(true, label, typeof detail === "string" ? detail : "");
  } catch (err) {
    record(false, label, err instanceof Error ? err.message : String(err));
  }
}

const expect = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

/** Does the HTML contain a <link> with this rel and href (attributes in any order)? */
function hasLink(html, rel, href) {
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    const relAttr = /\brel=["']([^"']+)["']/i.exec(tag)?.[1]?.trim().toLowerCase();
    const hrefAttr = /\bhref=["']([^"']+)["']/i.exec(tag)?.[1];
    if (relAttr === rel && hrefAttr === href) return true;
  }
  return false;
}

/** Planned (unannounced) town needles, read as text — nothing is imported. */
function plannedNeedles() {
  const file = join(repoRoot, "src/data/cities.planned.ts");
  if (!existsSync(file)) return null;
  const src = readFileSync(file, "utf8");
  const fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
  const names = [...src.matchAll(/name:\s*"([^"]+)"/g)].map((m) => m[1]);
  const slugs = [...src.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
  return [...new Set([...names, ...names.map(fold), ...slugs])].map((n) => n.toLowerCase());
}

async function main() {
  console.log(`Live site check: ${ORIGIN}${LOCAL ? " (LIVE_CHECK_LOCAL=1: Netlify-only checks skipped)" : ""}\n`);
  const needles = plannedNeedles();
  const htmlByPath = new Map();

  // 1. Pages
  for (const page of PAGES) {
    await check(`page ${page.path}`, async () => {
      const res = await request(ORIGIN + page.path);
      const want = page.status ?? 200;
      expect(res.status === want, `status ${res.status}, expected ${want}`);
      const type = res.headers.get("content-type") ?? "";
      expect(type.startsWith("text/html"), `content-type "${type}"`);
      const html = res.body.toString("utf8");
      htmlByPath.set(page.path, html);
      if (want !== 200) return `${res.status}`;
      const lang = /<html\b[^>]*\blang=["']([^"']+)["']/i.exec(html)?.[1];
      expect(lang === page.lang, `<html lang="${lang}">, expected "${page.lang}"`);
      expect(/<title>[^<]+<\/title>/i.test(html), "no <title>");
      const missing = HEAD_LINKS.filter((l) => !hasLink(html, l.rel, l.href)).map((l) => `${l.rel} ${l.href}`);
      expect(missing.length === 0, `missing <link>: ${missing.join(", ")}`);
      return `lang=${lang}, ${HEAD_LINKS.length} head links`;
    });
  }

  // 2. Assets
  for (const asset of ASSETS) {
    await check(`asset ${asset.path}`, async () => {
      const res = await request(ORIGIN + asset.path);
      expect(res.status === 200, `status ${res.status}`);
      const type = res.headers.get("content-type") ?? "";
      expect(type.startsWith(asset.type), `content-type "${type}", expected ${asset.type}`);
      expect(res.body.length > 0, "empty body");
      if (asset.type === "image/png") expect(res.body.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])), "not a PNG");
      return `${res.body.length} bytes`;
    });
  }

  await check("asset /manifest.json", async () => {
    const res = await request(ORIGIN + "/manifest.json");
    expect(res.status === 200, `status ${res.status}`);
    const manifest = JSON.parse(res.body.toString("utf8"));
    const local = JSON.parse(readFileSync(join(repoRoot, "public/manifest.json"), "utf8"));
    expect(manifest.theme_color === local.theme_color, `theme_color "${manifest.theme_color}", repo has "${local.theme_color}"`);
    expect(Array.isArray(manifest.icons) && manifest.icons.length > 0, "no icons[]");
    const srcs = [...new Set(manifest.icons.map((i) => i.src))];
    for (const src of srcs) {
      const icon = await request(new URL(src, ORIGIN + "/").href);
      expect(icon.status === 200 && icon.body.length > 0, `icon ${src} → ${icon.status}`);
    }
    return `theme_color ${manifest.theme_color}, ${srcs.length} icon file(s) fetch`;
  });

  await check("asset /llms.txt", async () => {
    const res = await request(ORIGIN + "/llms.txt");
    expect(res.status === 200, `status ${res.status}`);
    expect((res.headers.get("content-type") ?? "").startsWith("text/plain"), `content-type "${res.headers.get("content-type")}"`);
    expect(res.body.length > 0, "empty body");
    return `${res.body.length} bytes`;
  });

  // 3. Headers
  await check("security headers on /", async () => {
    const res = await request(ORIGIN + "/");
    const missing = SECURITY_HEADERS.filter((h) => !res.headers.get(h));
    expect(missing.length === 0, `missing: ${missing.join(", ")}`);
    return SECURITY_HEADERS.join(", ");
  });
  if (LOCAL) skip("header strict-transport-security", "Netlify only");

  await check("font caching (/fonts/* immutable)", async () => {
    const home = htmlByPath.get("/") ?? "";
    const fonts = [...new Set([...home.matchAll(/(\/fonts\/[\w.-]+\.woff2)/g)].map((m) => m[1]))];
    expect(fonts.length > 0, "homepage HTML references no /fonts/*.woff2");
    for (const font of fonts) {
      const res = await request(ORIGIN + font);
      expect(res.status === 200, `${font} → ${res.status}`);
      const cc = res.headers.get("cache-control") ?? "";
      expect(/immutable/i.test(cc), `${font} Cache-Control "${cc}"`);
    }
    return fonts.join(", ");
  });

  // 4. Apex redirect
  if (LOCAL) skip("apex redirect", "Netlify only");
  else
    await check(`apex redirect ${APEX}/ → ${ORIGIN}/`, async () => {
      const res = await request(APEX + "/");
      expect(res.status === 301 || res.status === 308, `status ${res.status}`);
      const loc = res.headers.get("location") ?? "";
      expect(loc === ORIGIN + "/" || loc === ORIGIN, `Location "${loc}"`);
      return `${res.status} → ${loc}`;
    });

  // 5. Town leak
  await check("planned towns absent from fetched HTML", async () => {
    expect(needles !== null, "src/data/cities.planned.ts not found (run from the repo)");
    if (needles.length === 0) return "no planned towns listed";
    const leaked = [];
    for (const [path, html] of htmlByPath) {
      const haystack = html.toLowerCase();
      if (needles.some((n) => haystack.includes(n))) leaked.push(path);
    }
    // Never print the names, only where one was found.
    expect(leaked.length === 0, leaked.map((p) => `planned town name found on ${p}`).join("; "));
    return `${htmlByPath.size} page(s) clean`;
  });

  // 6. Waitlist API
  if (LOCAL) skip("waitlist API", "Netlify only");
  else
    await check("waitlist API rejects an invalid email", async () => {
      const res = await request(ORIGIN + "/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "not-an-email", locale: "en", company: "" }),
      });
      const type = res.headers.get("content-type") ?? "";
      expect(type.includes("application/json"), `content-type "${type}" (status ${res.status})`);
      const json = JSON.parse(res.body.toString("utf8"));
      expect(json.ok === false, `body ${JSON.stringify(json)} (status ${res.status})`);
      return `${res.status} ${JSON.stringify(json)}`;
    });

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed${failed.length ? `, ${failed.length} FAILED` : ""}`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error(`FAIL  live site check crashed — ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
