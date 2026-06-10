/**
 * NextAuth Drizzle adapter wiring for Rido.
 *
 * This module is the only place that knows the Drizzle adapter is in use.
 * Everything else (config, session helpers, middleware) imports `getAuthAdapter`
 * from here so the underlying storage is swappable in one spot.
 *
 * The schema (users / accounts / sessions / verificationTokens) is owned by
 * Agent #1 in `src/lib/db/schema.ts`. We re-use those exact table objects; the
 * `@auth/drizzle-adapter` package expects camelCase property names (id, name,
 * email, emailVerified, image, userId, provider, providerAccountId, …) which
 * is exactly what the Rido schema exposes.
 *
 * Column note (credentials provider):
 *   NextAuth's stock adapter does NOT store passwords. The Rido credentials
 *   provider expects a `passwordHash` column on the `users` table. That column
 *   is owned by Agent #1 (DB schema). If it is missing, the credentials
 *   authorize() call in `config.ts` will throw at runtime — see the TODO in
 *   `src/lib/auth/config.ts` and the schema comment in `src/lib/db/schema.ts`.
 *
 * @module src/lib/auth/adapter
 */

import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { Adapter } from "next-auth/adapters";

import { getDb } from "@/lib/db/client";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/lib/db/schema";

/**
 * Module-level cached adapter instance.
 *
 * NextAuth's `getServerSession` calls the adapter on every server-side render;
 * building it once per process avoids re-resolving the Drizzle client and
 * keeps the per-request overhead minimal.
 */
let cachedAdapter: Adapter | null = null;

/**
 * Return the NextAuth-compatible Drizzle adapter for Rido.
 *
 * - Uses the process-global Drizzle client from `@/lib/db/client` (which reads
 *   `DATABASE_URL` through the contract env validator).
 * - Maps the four NextAuth tables (`users`, `accounts`, `sessions`,
 *   `verificationTokens`) to the corresponding Drizzle table objects.
 * - Safe to call from both Node.js runtime and (where supported) edge runtimes.
 *
 * @returns The Drizzle adapter instance suitable for `NextAuth({ adapter })`.
 */
export function getAuthAdapter(): Adapter {
  if (cachedAdapter) return cachedAdapter;

  const db = getDb();

  cachedAdapter = DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  });

  return cachedAdapter;
}
