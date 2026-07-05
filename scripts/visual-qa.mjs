#!/usr/bin/env node
/**
 * Visual QA harness — screenshots key pages at phone/tablet/desktop widths.
 *
 * Usage:
 *   node scripts/visual-qa.mjs [baseUrl] [outDir]
 *
 * Defaults: baseUrl http://localhost:3000, outDir .visual-qa/
 * Requires the app to be running (npm run build && npx next start).
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
  { path: "/marbella", name: "city-marbella", fullPage: true },
  { path: "/#pricing", name: "pricing-anchor", fullPage: false },
  { path: "/politica-cookies", name: "cookie-policy", fullPage: false },
  { path: "/privacy", name: "privacy", fullPage: false },
  { path: "/terms", name: "terms", fullPage: false },
  { path: "/careers", name: "careers", fullPage: false },
];

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
for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile,
    hasTouch: vp.isMobile,
    deviceScaleFactor: vp.isMobile ? 2 : 1,
    colorScheme: "dark",
    reducedMotion: "reduce", // deterministic screenshots — no mid-animation frames
  });
  const page = await context.newPage();

  for (const target of PAGES) {
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

await browser.close();
console.log(
  failures === 0
    ? `[visual-qa] done — screenshots in ${outDir}/`
    : `[visual-qa] done with ${failures} failure(s)`
);
process.exit(failures === 0 ? 0 : 1);
