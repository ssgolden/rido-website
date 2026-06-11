#!/usr/bin/env node
/**
 * Build wrapper for Rido.
 *
 * - Server build (default, used by Vercel):
 *     npm run build            -> plain `npx next build`, API routes included.
 *
 * - Static export build (GitHub Pages):
 *     NEXT_OUTPUT=export npm run build
 *   API route handlers cannot be statically exported, so src/app/api is
 *   temporarily moved OUTSIDE src (to .export-excluded-api/) for the duration
 *   of the build and ALWAYS restored afterwards (try/finally + signal +
 *   exit handlers), even if the build fails or is interrupted.
 *
 * Uses only Node built-ins. Do not run `next build` directly for export builds.
 */

import { spawnSync } from "node:child_process";
import { existsSync, renameSync, rmSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const apiDir = path.join(root, "src", "app", "api");
const excludedDir = path.join(root, ".export-excluded-api");

const extraArgs = process.argv.slice(2);

function log(message) {
  console.log(`[build] ${message}`);
}

function runNextBuild() {
  const result = spawnSync("npx", ["next", "build", ...extraArgs], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
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
// Static export build: exclude src/app/api while `next build` runs.
// ---------------------------------------------------------------------------

let apiMoved = false;

/** Move src/app/api back into place. Idempotent — safe to call multiple times. */
function restoreApiDir() {
  if (!apiMoved) return;
  if (!existsSync(excludedDir)) {
    apiMoved = false;
    return;
  }
  if (existsSync(apiDir)) {
    console.error(
      "[build] WARNING: both src/app/api and .export-excluded-api exist; " +
        "leaving .export-excluded-api in place for manual inspection."
    );
    return;
  }
  renameSync(excludedDir, apiDir);
  apiMoved = false;
  log("Restored src/app/api from .export-excluded-api");
}

// Recover from a previously crashed/killed run that left the api dir excluded.
if (existsSync(excludedDir)) {
  if (existsSync(apiDir)) {
    log("Found stale .export-excluded-api alongside src/app/api; deleting stale copy");
    rmSync(excludedDir, { recursive: true, force: true });
  } else {
    log("Recovering from previous interrupted run: restoring src/app/api");
    renameSync(excludedDir, apiDir);
  }
}

// Restore on interruption. spawnSync blocks, but Ctrl+C is delivered to the
// whole process group: the child exits, spawnSync returns, and these handlers
// then run before we exit.
for (const [signal, code] of [
  ["SIGINT", 130],
  ["SIGTERM", 143],
]) {
  process.on(signal, () => {
    restoreApiDir();
    process.exit(code);
  });
}

// Last-resort safety net (renameSync is synchronous, so it is allowed here).
process.on("exit", restoreApiDir);

let exitCode = 1;
try {
  if (existsSync(apiDir)) {
    log("Static export build: excluding src/app/api -> .export-excluded-api");
    renameSync(apiDir, excludedDir);
    apiMoved = true;
  } else {
    log("src/app/api not found; nothing to exclude");
  }
  exitCode = runNextBuild();
} finally {
  restoreApiDir();
}
process.exit(exitCode);
