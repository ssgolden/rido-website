#!/usr/bin/env node
/**
 * Page sweep: loads every public page at phone, "desktop site on a phone"
 * and desktop widths and fails on regressions that the axe and visual QA
 * gates do not catch:
 * - console errors, page errors and 4xx/5xx same-origin responses
 * - horizontal overflow of the scroll lane (the page scrolls sideways)
 * - broken internal links and in-page #anchors
 * - <img> without alt, <section> without id or an accessible name
 * Tap targets under 24px are reported as warnings only; links inside running
 * text are skipped (WCAG 2.5.8 allows inline links to be small).
 *
 * Usage: node scripts/sweep.mjs [baseUrl]   (default http://localhost:3000)
 * QA_STATIC=1 skips server-only routes, as in visual-qa.mjs.
 */
import { chromium } from "playwright-core";

const B = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const PAGES = [
  "/", "/es", "/torrevieja", "/es/torrevieja", "/partners", "/es/partners", "/careers",
  "/privacy", "/terms", "/politica-cookies", "/waitlist-confirmed", "/es/waitlist-confirmed",
  ...(process.env.QA_STATIC ? [] : ["/coming-soon"]),
];
const VIEWPORTS = [
  { width: 390, height: 844, mobile: true },
  { width: 980, height: 1700, mobile: true },
  { width: 1440, height: 900, mobile: false },
];
// Third-party hosts the sandbox or CI may block; never a site defect.
const IGNORED_CONSOLE = /openfreemap|ERR_TUNNEL|net::ERR|ERR_NAME_NOT_RESOLVED/;

const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium",
});
const failures = [];
const warnings = [];
const internalLinks = new Set();

for (const vp of VIEWPORTS) {
  for (const path of PAGES) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
    });
    const errors = [];
    page.on("console", (m) => {
      if (m.type() === "error" && !IGNORED_CONSOLE.test(m.text())) errors.push(m.text().slice(0, 160));
    });
    page.on("pageerror", (e) => errors.push(`pageerror ${e.message.slice(0, 160)}`));
    page.on("response", (r) => {
      if (r.status() >= 400 && r.url().startsWith(B)) errors.push(`${r.status()} ${r.url()}`);
    });
    await page.goto(B + path, { waitUntil: "networkidle" });
    // Scroll the lane so lazy and reveal-driven content mounts.
    await page.evaluate(async () => {
      const el = document.getElementById("page-scroll") ?? document.scrollingElement;
      for (let y = 0; y < el.scrollHeight; y += 400) {
        el.scrollTop = y;
        await new Promise((r) => setTimeout(r, 50));
      }
    });
    const r = await page.evaluate((w) => {
      const lane = document.getElementById("page-scroll");
      const overflow = Math.max(document.documentElement.scrollWidth, lane?.scrollWidth ?? 0) - w;
      const small = [...document.querySelectorAll("a,button,summary,input,select")]
        .filter((e) => {
          const b = e.getBoundingClientRect();
          if (e.tagName === "A" && e.closest("p, li, dd, td, label, blockquote")) return false;
          return b.width > 0 && getComputedStyle(e).visibility !== "hidden" && (b.height < 24 || b.width < 24);
        })
        .map((e) => `${e.tagName.toLowerCase()} "${(e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 24)}"`);
      const imgsNoAlt = document.querySelectorAll("img:not([alt])").length;
      const badSections = [...document.querySelectorAll("section")]
        .filter((s) => !s.id || !(s.getAttribute("aria-label") || s.getAttribute("aria-labelledby")))
        .map((s) => s.id || "(no id)");
      const links = [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href"));
      const anchors = links
        .filter((h) => h.startsWith("#") && h.length > 1)
        .filter((h) => !document.getElementById(decodeURIComponent(h.slice(1))));
      return { overflow, small, imgsNoAlt, badSections, links, anchors };
    }, vp.width);
    r.links.forEach((l) => { if (l.startsWith("/")) internalLinks.add(l.split("#")[0].split("?")[0]); });
    const tag = `${vp.width}px ${path}`;
    if (errors.length) failures.push(`${tag}: ${[...new Set(errors)].join(" | ")}`);
    if (r.overflow > 1) failures.push(`${tag}: page ${r.overflow}px wider than the viewport`);
    if (r.imgsNoAlt) failures.push(`${tag}: ${r.imgsNoAlt} <img> without alt`);
    if (r.badSections.length) failures.push(`${tag}: sections without id/aria-label: ${r.badSections.join(", ")}`);
    if (r.anchors.length) failures.push(`${tag}: broken #anchors: ${r.anchors.join(", ")}`);
    if (vp.mobile && r.small.length) warnings.push(`${tag}: small tap targets: ${r.small.slice(0, 6).join(", ")}`);
    await page.close();
  }
}

const probe = await browser.newPage();
for (const l of [...internalLinks].sort()) {
  const res = await probe.request.get(B + l);
  if (res.status() >= 400) failures.push(`broken internal link ${l} -> ${res.status()}`);
}
await browser.close();

console.log(`[sweep] ${PAGES.length} pages x ${VIEWPORTS.length} widths, ${internalLinks.size} internal links`);
for (const w of warnings) console.log(`[sweep] warn ${w}`);
for (const f of failures) console.log(`[sweep] FAIL ${f}`);
if (failures.length) {
  console.log(`[sweep] ${failures.length} failure(s)`);
  process.exit(1);
}
console.log("[sweep] gate passed");
