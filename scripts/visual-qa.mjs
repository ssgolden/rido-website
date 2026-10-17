#!/usr/bin/env node
/**
 * Visual QA harness — screenshots key pages at phone/tablet/desktop widths.
 *
 * Usage:
 *   node scripts/visual-qa.mjs [baseUrl] [outDir]
 *   QA_STATIC=1 node scripts/visual-qa.mjs ...   (against the static export,
 *   e.g. scripts/serve-export.mjs: skips server-only pages)
 *
 * Defaults: baseUrl http://localhost:3000, outDir .visual-qa/
 * Requires the app to be running (npm run build && npx next start).
 *
 * Also a gate: any uncaught page error (e.g. a React hydration mismatch) or
 * Content-Security-Policy violation fails the run, checked with reduced motion
 * (the screenshot pass) and again with motion on, since the two take
 * different code paths.
 *
 * Uses playwright-core with the system Chromium. In the Claude Code cloud
 * environment the browser lives at /opt/pw-browsers/chromium; elsewhere set
 * CHROMIUM_PATH or install Chrome/Chromium on PATH.
 */
import { chromium } from "playwright-core";
import { mkdirSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

const baseUrl = process.argv[2] ?? "http://localhost:3000";
const outDir = process.argv[3] ?? ".visual-qa";

const PAGES = [
  { path: "/", name: "home", fullPage: true },
  { path: "/es", name: "home-es", fullPage: true },
  // Server-only: the export leaves it out (Vercel password gate page).
  { path: "/coming-soon", name: "coming-soon-full", fullPage: true, serverOnly: true },
  { path: "/partners", name: "partners", fullPage: true },
  { path: "/politica-cookies", name: "cookie-policy", fullPage: false },
  { path: "/privacy", name: "privacy", fullPage: false },
  { path: "/terms", name: "terms", fullPage: false },
  { path: "/careers", name: "careers", fullPage: false },
  { path: "/torrevieja", name: "city-torrevieja", fullPage: true },
  { path: "/es/torrevieja", name: "city-torrevieja-es", fullPage: true },
  { path: "/es/partners", name: "partners-es", fullPage: false },
  { path: "/waitlist-confirmed", name: "waitlist-confirmed", fullPage: false },
];

const pages = process.env.QA_STATIC ? PAGES.filter((p) => !p.serverOnly) : PAGES;

const VIEWPORTS = [
  { name: "phone", width: 390, height: 844, isMobile: true },
  { name: "tablet", width: 768, height: 1024, isMobile: true },
  { name: "desktop", width: 1440, height: 900, isMobile: false },
];

function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const candidates = [
    "/opt/pw-browsers/chromium",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
  ];
  for (const c of candidates) {
    if (existsSync(c)) {
      // /opt/pw-browsers/chromium may be a directory containing the browser
      try {
        const stat = execSync(`test -d ${c} && echo dir || echo file`).toString().trim();
        if (stat === "dir") {
          const bin = execSync(`find ${c} -maxdepth 3 -name chrome -o -maxdepth 3 -name chromium 2>/dev/null | head -1`)
            .toString()
            .trim();
          if (bin) return bin;
        } else {
          return c;
        }
      } catch {
        /* keep looking */
      }
    }
  }
  return null; // let playwright-core try its default resolution
}

const executablePath = findChromium();
console.log(`[visual-qa] browser: ${executablePath ?? "playwright default"}`);
console.log(`[visual-qa] target:  ${baseUrl}`);
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch(
  executablePath ? { executablePath } : {}
);

let failures = 0;
const pageErrors = [];
// Chromium reports blocked requests and scripts as console errors.
const isCspViolation = (msg) => msg.type() === "error" && /Content Security Policy/i.test(msg.text());
// Answer the consent banner (declined) so it never covers a screenshot.
const declineConsent = () =>
  localStorage.setItem("rido-cookie-consent", JSON.stringify({ accepted: false, timestamp: Date.now() }));

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile,
    hasTouch: vp.isMobile,
    deviceScaleFactor: vp.isMobile ? 2 : 1,
    colorScheme: "dark",
    reducedMotion: "reduce", // deterministic screenshots — no mid-animation frames
  });
  await context.addInitScript(declineConsent);
  const page = await context.newPage();
  let current = "";
  page.on("pageerror", (err) => pageErrors.push(`${current} [${vp.name}, reduced motion]: ${err.message}`));
  page.on("console", (msg) => {
    if (isCspViolation(msg)) pageErrors.push(`${current} [${vp.name}, reduced motion]: ${msg.text()}`);
  });

  for (const target of pages) {
    current = target.path;
    const url = `${baseUrl}${target.path}`;
    const file = `${outDir}/${target.name}--${vp.name}.png`;
    try {
      const res = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      // res is null for same-document (hash-only) navigations — that's fine.
      if (res && res.status() >= 400) {
        console.error(`[visual-qa] FAIL ${url} -> HTTP ${res?.status()}`);
        failures++;
        continue;
      }
      // Let lazy sections mount and fonts settle.
      await page.waitForTimeout(800);
      if (target.fullPage) {
        // Marketing pages scroll inside the SiteShell lane, not the window, so
        // a fullPage capture would only ever show the first viewport. Unclip
        // the shell and let the window scroll for the duration of the shot.
        await page.addStyleTag({
          content:
            "html,body{overflow:auto!important;height:auto!important}" +
            "[data-site-shell]{max-height:none!important;height:auto!important;overflow:visible!important}" +
            "[data-scroll-root]{overflow:visible!important;flex:none!important}",
        });
        // Scroll through the page so IntersectionObserver-driven reveals
        // (ScrollReveal/StaggerReveal) fire before a full-page capture.
        await page.evaluate(async () => {
          const step = window.innerHeight / 2;
          for (let y = 0; y <= document.body.scrollHeight; y += step) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 120));
          }
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(600);
      }
      await page.screenshot({ path: file, fullPage: target.fullPage });
      console.log(`[visual-qa] ok   ${file}`);
    } catch (err) {
      console.error(`[visual-qa] FAIL ${url}: ${err.message}`);
      failures++;
    }
  }
  await context.close();
}

// Motion-on pass: no screenshots, just load each page and catch errors.
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "no-preference" });
  await context.addInitScript(declineConsent);
  const page = await context.newPage();
  let current = "";
  page.on("pageerror", (err) => pageErrors.push(`${current} [phone, motion on]: ${err.message}`));
  page.on("console", (msg) => {
    if (isCspViolation(msg)) pageErrors.push(`${current} [phone, motion on]: ${msg.text()}`);
  });
  for (const target of pages) {
    current = target.path;
    try {
      await page.goto(`${baseUrl}${target.path}`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(500);
    } catch (err) {
      console.error(`[visual-qa] FAIL ${target.path} (motion on): ${err.message}`);
      failures++;
    }
  }
  await context.close();
}

for (const e of pageErrors) console.error(`[visual-qa] PAGE ERROR ${e}`);
failures += pageErrors.length;

await browser.close();
console.log(
  failures === 0
    ? `[visual-qa] done — screenshots in ${outDir}/`
    : `[visual-qa] done with ${failures} failure(s)`
);
process.exit(failures === 0 ? 0 : 1);
