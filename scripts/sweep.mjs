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
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";

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

// Same lookup as visual-qa.mjs and a11y-audit.mjs: the sandbox's bundled
// Chromium, a system one, else playwright-core's own resolution (CI).
function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  for (const c of ["/opt/pw-browsers/chromium", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome"]) {
    if (!existsSync(c)) continue;
    try {
      if (execSync(`test -d ${c} && echo dir || echo file`).toString().trim() !== "dir") return c;
      const bin = execSync(`find ${c} -maxdepth 3 -name chrome -o -maxdepth 3 -name chromium 2>/dev/null | head -1`).toString().trim();
      if (bin) return bin;
    } catch {
      /* keep looking */
    }
  }
  return null;
}

const executablePath = findChromium();
const browser = await chromium.launch(executablePath ? { executablePath } : {});
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

// Interaction gates on phones: the consent card must leave the hero form clear
// on a short phone, and the mobile menu must behave as a modal.
{
  const page = await browser.newPage({ viewport: { width: 390, height: 667 }, isMobile: true, hasTouch: true });
  await page.goto(B + "/", { waitUntil: "networkidle" });
  const banner = page.locator('[role="dialog"][aria-labelledby="cookie-consent-title"] > div');
  if (await banner.count()) {
    const card = await banner.boundingBox();
    const submit = await page.locator("#hero form button[type=submit]").first().boundingBox();
    if (card && submit && submit.y + submit.height > card.y) {
      failures.push(`390x667 /: consent card (top ${Math.round(card.y)}px) covers the hero form (bottom ${Math.round(submit.y + submit.height)}px)`);
    }
    if (card && card.height > 180) warnings.push(`390x667 /: consent card is ${Math.round(card.height)}px tall`);
  } else {
    failures.push("390x667 /: consent card did not render");
  }
  await page.close();
}
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.addInitScript(() => localStorage.setItem("rido-cookie-consent", JSON.stringify({ accepted: false, timestamp: 1 })));
  await page.goto(B + "/", { waitUntil: "networkidle" });
  const burger = page.locator("button[aria-controls='mobile-menu']");
  if (!(await burger.count())) {
    failures.push("390 /: the hamburger has no aria-controls=mobile-menu");
  } else {
    await burger.click();
    await page.waitForTimeout(300);
    if (!(await page.evaluate(() => document.getElementById("page-scroll")?.hasAttribute("inert")))) {
      failures.push("390 /: the page is not inert while the menu is open");
    }
    let escaped = false;
    for (let i = 0; i < 12 && !escaped; i++) {
      await page.keyboard.press("Tab");
      escaped = !(await page.evaluate(() => Boolean(document.activeElement?.closest("nav"))));
    }
    if (escaped) failures.push("390 /: focus leaves the open menu on Tab");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    const closed = await page.evaluate(
      () => !document.getElementById("mobile-menu") && document.activeElement?.getAttribute("aria-controls") === "mobile-menu"
    );
    if (!closed) failures.push("390 /: Escape does not close the menu and return focus to the hamburger");
  }
  await page.close();
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
