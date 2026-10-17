#!/usr/bin/env node
/**
 * Build wrapper for Rido.
 *
 * - Server build (default, used by Vercel):
 *     npm run build            -> plain `next build`, API routes included.
 *
 * - Static export build (Netlify and GitHub Pages):
 *     NEXT_OUTPUT=export npm run build
 *   Route handlers cannot be statically exported, and the sandbox routes
 *   (coming-soon, waitlist-admin) must 404 on the public site. The build runs
 *   in a throwaway copy of the project (.export-build/) with those routes
 *   left out, then moves its `out/` back to the project root. The real `src/`
 *   is never touched, so a lint, type check or dev server running at the same
 *   time always sees the full tree.
 *
 *   After a successful export it runs scripts/check-town-leak.mjs, so every
 *   host that builds the export (Netlify included) fails the deploy if an
 *   unannounced town would ship.
 *
 * Uses only Node built-ins. Do not run `next build` directly for export builds.
 */

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const extraArgs = process.argv.slice(2);

function log(message) {
  console.log(`[build] ${message}`);
}

function runNextBuild(cwd = root) {
  // Run Next's CLI with this Node directly: `npx` in the export copy would look
  // for a node_modules next to its package.json, which the copy doesn't have.
  const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
  const result = spawnSync(process.execPath, [nextBin, "build", ...extraArgs], {
    cwd,
    stdio: "inherit",
    env: process.env,
  });
  if (result.error) {
    console.error(`[build] Failed to spawn next build: ${result.error.message}`);
    return 1;
  }
  if (result.signal) {
    // Child was killed by a signal (e.g. Ctrl+C) — mirror conventional code.
    return 128 + (result.signal === "SIGINT" ? 2 : result.signal === "SIGTERM" ? 15 : 1);
  }
  return result.status ?? 1;
}

// ---------------------------------------------------------------------------
// Non-export builds: pass straight through to `next build`.
// ---------------------------------------------------------------------------
if (process.env.NEXT_OUTPUT !== "export") {
  process.exit(runNextBuild());
}

// ---------------------------------------------------------------------------
// Static export build: build a copy without API routes and sandbox pages.
// ---------------------------------------------------------------------------

const buildDir = path.join(root, ".export-build");

/** What the copy needs. node_modules is not copied: resolution walks up to root. */
const projectFiles = ["src", "public", "package.json", "next.config.ts", "tsconfig.json", "postcss.config.mjs", "next-env.d.ts"];

/** Routes left out of the static export (relative to src/app). */
const excludedRoutes = ["api", "(en)/coming-soon", "(en)/waitlist-admin"].map((r) => path.join(root, "src", "app", r));

function prepareCopy() {
  // Fresh copy every run (a file deleted from public/ must not linger); only
  // .export-build/.next survives, as the build cache.
  for (const name of [...projectFiles, "out"]) rmSync(path.join(buildDir, name), { recursive: true, force: true });
  mkdirSync(buildDir, { recursive: true });
  for (const name of projectFiles) {
    const from = path.join(root, name);
    if (!existsSync(from)) continue;
    cpSync(from, path.join(buildDir, name), {
      recursive: true,
      filter: (src) => !excludedRoutes.includes(src),
    });
  }
  for (const route of excludedRoutes) log(`Static export build: excluding ${path.relative(root, route)}`);
}

prepareCopy();
let exitCode = runNextBuild(buildDir);
if (exitCode === 0) {
  rmSync(path.join(root, "out"), { recursive: true, force: true });
  renameSync(path.join(buildDir, "out"), path.join(root, "out"));
  log("Export written to out/");
  const leak = spawnSync(process.execPath, [path.join(root, "scripts", "check-town-leak.mjs"), "out"], {
    cwd: root,
    stdio: "inherit",
  });
  exitCode = leak.status ?? 1;
}
process.exit(exitCode);
