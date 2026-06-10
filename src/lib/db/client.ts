/**
 * Drizzle client factory for Rido.
 *
 * Uses the porsager `postgres` driver (the package installed as `postgres`
 * in package.json) — it speaks the Postgres wire protocol over a single TCP
 * socket and is compatible with `@vercel/postgres` and Neon serverless.
 *
 * Env is read through the contract (`src/lib/contract.ts`) so that we get the
 * same validation, the same `DATABASE_POOL_MAX`, and the same error envelope
 * as the rest of the backend.
 *
 * The connection is process-global so HMR in dev doesn't open new pools.
 */

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getEnv } from "@/lib/contract";
import * as schema from "@/lib/db/schema";

export { schema };

export type Db = PostgresJsDatabase<typeof schema>;

type GlobalWithDb = typeof globalThis & {
  __ridoPgClient?: ReturnType<typeof postgres>;
  __ridoDb?: Db;
};

const g = globalThis as GlobalWithDb;

/**
 * Create (or return the cached) Drizzle client.
 *
 * - In production / dev: opens a pooled connection using `DATABASE_URL`.
 * - In Next.js dev, the client is cached on `globalThis` so hot-reload
 *   doesn't multiply connections and exhaust the pool.
 */
export function getDb(): Db {
  if (g.__ridoDb) return g.__ridoDb;

  const env = getEnv();
  const max = env.DATABASE_POOL_MAX;

  const client =
    g.__ridoPgClient ??
    postgres(env.DATABASE_URL, {
      max,
      // Reasonable production defaults; tweakable via env if needed.
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false, // serverless / pgbouncer-friendly
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(env.NODE_ENV === "development" ? { debug: false } : {}),
    });

  const db = drizzle(client, {
    schema,
    logger: env.NODE_ENV === "development" ? false : false,
  });

  g.__ridoPgClient = client;
  g.__ridoDb = db;

  return db;
}

/**
 * Close the underlying pg client. Mostly useful in scripts (migrations, seed,
 * tests) and graceful-shutdown handlers.
 */
export async function closeDb(): Promise<void> {
  if (g.__ridoPgClient) {
    await g.__ridoPgClient.end({ timeout: 5 });
    g.__ridoPgClient = undefined;
    g.__ridoDb = undefined;
  }
}
