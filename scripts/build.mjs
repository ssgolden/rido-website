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
 *   Sandbox routes (coming-soon, waitlist-admin) are excluded the same way
 *   so the public static site 404s them. They stay in server builds: the
 *   Vercel password gate still redirects to /coming-soon.
 *
 * Uses only Node built-ins. Do not run `next build` directly for export builds.
 */

import { spawnSync } from "node:child_process";
import { existsSync, renameSync, rmSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Directories lifted out of src/app for the static export, then restored. */
const exclusions = [
  {
    label: "src/app/api",
    from: path.join(root, "src", "app", "api"),
    to: path.join(root, ".export-excluded-api"),
  },
  {
    label: "src/app/(en)/coming-soon",
    from: path.join(root, "src", "app", "(en)", "coming-soon"),
    to: path.join(root, ".export-excluded-coming-soon"),
  },
  {
    label: "src/app/(en)/waitlist-admin",
    from: path.join(root, "src", "app", "(en)", "waitlist-admin"),
    to: path.join(root, ".export-excluded-waitlist-admin"),
  },
];

/** Labels currently sitting in their excluded location. */
const moved = new Set();

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
// Static export build: exclude API routes and sandbox pages.
// ---------------------------------------------------------------------------

function restoreOne(item) {
  if (!moved.has(item.label)) return;
  if (!existsSync(item.to)) {
    moved.delete(item.label);
    return;
  }
  if (existsSync(item.from)) {
    console.error(
      `[build] WARNING: both ${item.label} and its excluded copy exist; ` +
        "leaving the excluded copy in place for manual inspection."
    );
    return;
  }
  renameSync(item.to, item.from);
  moved.delete(item.label);
  log(`Restored ${item.label}`);
}

function restoreAll() {
  for (const item of exclusions) restoreOne(item);
}

// Recover from a previously crashed/killed run that left a directory excluded.
for (const item of exclusions) {
  if (!existsSync(item.to)) continue;
  if (existsSync(item.from)) {
    log(`Found stale excluded copy of ${item.label}; deleting stale copy`);
    rmSync(item.to, { recursive: true, force: true });
  } else {
    log(`Recovering from previous interrupted run: restoring ${item.label}`);
    renameSync(item.to, item.from);
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
    restoreAll();
    process.exit(code);
  });
}

// Last-resort safety net (renameSync is synchronous, so it is allowed here).
process.on("exit", restoreAll);

let exitCode = 1;
try {
  for (const item of exclusions) {
    if (!existsSync(item.from)) {
      log(`${item.label} not found; nothing to exclude`);
      continue;
    }
    log(`Static export build: excluding ${item.label}`);
    renameSync(item.from, item.to);
    moved.add(item.label);
  }
  exitCode = runNextBuild();
} finally {
  restoreAll();
}
process.exit(exitCode);
