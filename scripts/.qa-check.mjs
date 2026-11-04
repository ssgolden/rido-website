import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";
const OUT = process.argv[2];
const B = "http://localhost:3000";
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
const pages = ["/", "/es", "/torrevieja", "/es/torrevieja", "/app"];
for (const w of [360, 1366]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, reducedMotion: "reduce", userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130 Safari/537.36" });
  const p = await ctx.newPage();
  for (const path of pages) {
    await p.goto(B + path, { waitUntil: "networkidle" });
    await p.waitForTimeout(800);
    // hide cookie banner
    await p.evaluate(() => { document.querySelectorAll('[role="dialog"],[aria-label*="ookie" i]').forEach(e => { if (e.closest('footer')) return; e.style.display = "none"; }); });
    const name = (path === "/" ? "home" : path.replace(/\//g, "_")) + "-" + w;
    await p.screenshot({ path: `${OUT}/${name}-fold.png` });
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const badges = await p.$$eval('a[href*="apps.apple.com"],a[href*="play.google.com"]', as => as.map(a => { const r = a.getBoundingClientRect(); const i = a.querySelector("img"); return { lbl: a.getAttribute("aria-label"), x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height), src: i?.getAttribute("src"), nat: i ? i.naturalWidth : null }; }));
    console.log(w, path, "overflow", overflow, JSON.stringify(badges));
    // badges screenshots
    const lists = await p.$$('ul[aria-label*="app" i]');
    let k = 0; for (const l of lists) { await l.scrollIntoViewIfNeeded(); await l.screenshot({ path: `${OUT}/${name}-badges${k++}.png` }).catch(()=>{}); }
    if (w === 1366) {
      const res = await new AxeBuilder({ page: p }).analyze();
      console.log("axe", path, res.violations.map(v => `${v.impact}:${v.id}(${v.nodes.length})`).join(", ") || "none");
    }
  }
  if (w === 360) { await p.goto(B + "/", { waitUntil: "networkidle" }); await p.screenshot({ path: `${OUT}/home-360-full.png`, fullPage: true }); await p.goto(B + "/torrevieja", { waitUntil: "networkidle" }); await p.screenshot({ path: `${OUT}/torrevieja-360-full.png`, fullPage: true }); }
  if (w === 1366) { await p.goto(B + "/es", { waitUntil: "networkidle" }); await p.screenshot({ path: `${OUT}/es-1366-full.png`, fullPage: true }); }
  await ctx.close();
}
// UA redirect
for (const [n, ua, extra] of [["iphone","Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",{}],["android","Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36",{}],["desktop","Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130",{}],["es-desktop","Mozilla/5.0 (Windows NT 10.0) Chrome/130",{locale:"es-ES"}]]) {
  const ctx = await browser.newContext({ userAgent: ua, ...extra });
  const p = await ctx.newPage();
  const reqs = [];
  p.on("request", r => { if (/apple|google/.test(r.url())) reqs.push(r.url()); });
  await ctx.route(/apps\.apple\.com|play\.google\.com/, r => r.fulfill({ status: 200, body: "STORE" }));
  await p.goto(B + "/app", { waitUntil: "load" }); await p.waitForTimeout(2500);
  console.log("UA", n, p.url(), reqs.filter(u=>/apps.apple|play.google/.test(u)).slice(0,1), n.startsWith("es")||n==="desktop" ? await p.locator("h1").textContent() : "");
  if (n === "es-desktop") await p.screenshot({ path: `${OUT}/app-es-desktop.png` });
  await ctx.close();
}
// head + JSON-LD
const ctx = await browser.newContext(); const p = await ctx.newPage();
for (const path of ["/", "/es", "/torrevieja"]) {
  await p.goto(B + path);
  const info = await p.evaluate(() => ({ itunes: document.querySelector('meta[name="apple-itunes-app"]')?.content, title: document.title, desc: document.querySelector('meta[name=description]')?.content, ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => { try { const j = JSON.parse(s.textContent); return (Array.isArray(j)?j:[j]).map(x=>x["@type"]+":"+(x["@id"]||"")).join("|"); } catch (e) { return "PARSE_ERROR " + e.message; } }) }));
  console.log("HEAD", path, JSON.stringify(info));
}
await browser.close();
