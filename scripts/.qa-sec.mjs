import { chromium } from "playwright-core";
const OUT = process.argv[2];
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
for (const w of [360, 1366]) for (const path of ["/", "/es", "/torrevieja"]) {
  const c = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: "reduce" });
  await c.addInitScript(() => { try { localStorage.setItem("rido-consent", "declined"); } catch {} });
  const p = await c.newPage(); await p.goto("http://localhost:3000" + path, { waitUntil: "networkidle" });
  for (const id of ["download", "cities", "vehicles"]) { const el = await p.$("#" + id); if (!el) { console.log(path, w, "no #" + id); continue; } await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(500); await el.screenshot({ path: `${OUT}/sec-${path.replace(/\//g,"_")}-${id}-${w}.png` }); }
  await c.close();
}
await b.close();
