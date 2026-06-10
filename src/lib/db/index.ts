/**
 * Barrel export for the Rido database layer.
 *
 * Anything outside `src/lib/db/*` that needs to talk to the DB should import
 * from `@/lib/db` — never reach into schema/client directly. That keeps the
 * surface area narrow and makes it easy to swap drivers later.
 */

// Re-export the entire schema module (tables, enums, inferred types).
export * from "@/lib/db/schema";

// Client factory + lifecycle
export { getDb, closeDb, type Db } from "@/lib/db/client";
export { schema } from "@/lib/db/client";

// Boot helpers (idempotent — safe to call multiple times)
export { runMigrations } from "@/lib/db/migrations-runner";
export { seedDatabase } from "@/lib/db/seed";
