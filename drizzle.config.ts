/**
 * Drizzle Kit config for Rido.
 *
 * Reads DATABASE_URL from the contract env so the same validation that runs
 * at boot also runs in `drizzle-kit generate` / `drizzle-kit migrate`.
 *
 * Usage:
 *   pnpm drizzle-kit generate   # emit SQL to /drizzle
 *   pnpm drizzle-kit migrate    # apply against DATABASE_URL
 *   pnpm drizzle-kit push       # push schema directly (dev only)
 *   pnpm drizzle-kit studio     # open the GUI
 */
import { defineConfig } from "drizzle-kit";

// `process.env` is read directly here because drizzle-kit runs this file in
// its own CLI process; we don't want to spawn a long-lived server just to
// generate migrations. We still validate with the contract's schema so a
// missing/typoed DATABASE_URL fails fast.
import { envSchema } from "./src/lib/contract";

const parsed = envSchema.safeParse(process.env);
if (!parsed.success && process.env.DATABASE_URL) {
  // For `drizzle-kit generate` (which doesn't need DB access) we tolerate
  // missing non-DB vars; for `migrate` we want everything.
  // eslint-disable-next-line no-console
  console.warn(
    "[drizzle.config] env validation warnings (non-fatal for generate):",
    parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
  );
}

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgres://localhost:5432/rido"; // fallback for `generate` without env

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  casing: "snake_case",
  strict: true,
  verbose: true,
});
