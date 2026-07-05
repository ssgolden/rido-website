#!/usr/bin/env node
/**
 * Accessibility gate — runs axe-core against key pages and fails on
 * serious/critical violations.
 *
 * Usage: node scripts/a11y-audit.mjs [baseUrl]
 * Default baseUrl: http://localhost:3000 (app must be running).
 * Browser resolution mirrors scripts/visual-qa.mjs (CHROMIUM_PATH env
 * or /opt/pw-browsers/chromium or system Chrome).
 */
import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";

const baseUrl = process.argv[2] ?? "http://localhost:3000";

// Representative set: EN + ES home, a city page, legal, careers, 404.
const PAGES = ["/", "/es", "/marbella", "/politica-cookies", "/privacy", "/careers"];

// Fail the gate on these impact levels only; report the rest.
const BLOCKING = new Set(["serious", "critical"]);

function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const candidates = [
    "/opt/pw-browsers/chromium",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
  ];
  for (const c of candidates) {
    if (!existsSync(c)) continue;
    try {
      const isDir = execSync(`test -d ${c} && echo dir || echo file`).toString().trim() === "dir";
      if (!isDir) return c;
      const bin = execSync(`find ${c} -maxdepth 3 -name chrome -o -maxdepth 3 -name chromium 2>/dev/null | head -1`)
        .toString()
        .trim();
      if (bin) return bin;
    } catch {
      /* keep looking */
    }
  }
  return null;
}

const executablePath = findChromium();
console.log(`[a11y] browser: ${executablePath ?? "playwright default"}`);
console.log(`[a11y] target:  ${baseUrl}`);

const browser = await chromium.launch(executablePath ? { executablePath } : {});
const context = await browser.newContext({ colorScheme: "dark", reducedMotion: "reduce" });
const page = await context.newPage();

let blockingCount = 0;
for (const path of PAGES) {
  const url = `${baseUrl}${path}`;
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(600); // let lazy sections mount

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    // The MapLibre canvas is third-party rendered content; its internal
    // controls are audited separately upstream.
    .exclude(".maplibregl-map")
    .analyze();

  const blocking = results.violations.filter((v) => BLOCKING.has(v.impact ?? ""));
  const minor = results.violations.filter((v) => !BLOCKING.has(v.impact ?? ""));

  if (blocking.length === 0) {
    console.log(`[a11y] ok   ${path} (${minor.length} minor advisories)`);
  } else {
    blockingCount += blocking.length;
    console.error(`[a11y] FAIL ${path} — ${blocking.length} serious/critical violation(s):`);
    for (const v of blocking) {
      console.error(`  - [${v.impact}] ${v.id}: ${v.help}`);
      for (const node of v.nodes.slice(0, 3)) {
        console.error(`      ${node.target.join(" ")}`);
      }
    }
  }
  for (const v of minor) {
    console.log(`  (advisory) [${v.impact}] ${v.id}: ${v.help} — ${v.nodes.length} node(s)`);
  }
}

await browser.close();
if (blockingCount > 0) {
  console.error(`[a11y] gate FAILED — ${blockingCount} blocking violation(s)`);
  process.exit(1);
}
console.log("[a11y] gate passed");
