#!/usr/bin/env node
/**
 * Fails if an unannounced town leaks into the static export.
 *
 * Reads the planned towns from src/data/cities.planned.ts (names and slugs),
 * then searches every text file in the export directory (HTML, JS, RSC
 * payloads, JSON, XML, TXT) for them, with and without accents. Also checks
 * that the per-region counts in src/data/cities.ts (`plannedTowns`) match the
 * planned list, so the "N towns planned" copy stays honest.
 *
 * Usage: node scripts/check-town-leak.mjs [outDir]   (default: out)
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const outDir = process.argv[2] ?? "out";
const planned = readFileSync("src/data/cities.planned.ts", "utf8");
const publicCities = readFileSync("src/data/cities.ts", "utf8");

const towns = [...planned.matchAll(/name:\s*"([^"]+)",\s*region:\s*"([^"]+)"[^}]*?slug:\s*"([^"]+)"/g)].map((m) => ({
  name: m[1],
  region: m[2],
  slug: m[3],
}));
if (towns.length === 0) {
  console.log("[town-leak] no planned towns listed — nothing to check");
}

let failures = 0;

// Counts in cities.ts must match the planned list.
const counted = Object.fromEntries(
  [...publicCities.matchAll(/\{\s*region:\s*"([^"]+)",\s*count:\s*(\d+)\s*\}/g)].map((m) => [m[1], Number(m[2])])
);
const actual = towns.reduce((acc, t) => ({ ...acc, [t.region]: (acc[t.region] ?? 0) + 1 }), {});
for (const region of new Set([...Object.keys(counted), ...Object.keys(actual)])) {
  if ((counted[region] ?? 0) !== (actual[region] ?? 0)) {
    console.error(`[town-leak] FAIL plannedTowns says ${counted[region] ?? 0} for ${region}, cities.planned.ts lists ${actual[region] ?? 0}`);
    failures++;
  }
}

const fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
const needles = [...new Set(towns.flatMap((t) => [t.name, fold(t.name), t.slug]))];

const TEXT = new Set([".html", ".js", ".txt", ".json", ".xml", ".css", ".webmanifest", ".svg"]);
function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (TEXT.has(extname(p))) yield p;
  }
}

for (const file of walk(outDir)) {
  const body = readFileSync(file, "utf8");
  for (const needle of needles) {
    if (body.includes(needle)) {
      console.error(`[town-leak] FAIL "${needle}" found in ${file}`);
      failures++;
    }
  }
}

if (failures) {
  console.error(`[town-leak] ${failures} problem(s). Unannounced towns must never reach the build.`);
  process.exit(1);
}
console.log(`[town-leak] ok — ${towns.length} planned town(s) absent from ${outDir}/`);
