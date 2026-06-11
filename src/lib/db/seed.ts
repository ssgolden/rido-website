/**
 * First-run seeder for the Rido `cities` table.
 *
 * Pulls the canonical 5-city list from `src/data/cities.ts` (the same source
 * the front-end uses) and upserts each one into Postgres. Safe to call on
 * every boot:
 *   - If a row with the slug already exists, its mutable fields are refreshed
 *     (name, region, lat, lng, country, vehicles flag) but `status`,
 *     `launched_at`, `geofence`, and `parking_zones` are NOT overwritten —
 *     ops may have updated them and we don't want a deploy to clobber.
 *   - If the table is empty, every city is inserted as `status = 'live'`
 *     with `launched_at = now()` so the marketing site has something to
 *     render immediately.
 *
 * Usage:
 *   import { seedDatabase } from "@/lib/db/seed";
 *   await seedDatabase();
 */

import { sql } from "drizzle-orm";

import { cities as citiesTable } from "@/lib/db/schema";
import { getDb, closeDb, type Db } from "@/lib/db/client";
import { cities as citySeedData } from "@/data/cities";

export type SeedResult = {
  inserted: string[];
  updated: string[];
  unchanged: string[];
  totalInDb: number;
};

type SeedOptions = {
  /** Reuse an existing Drizzle client (e.g. in tests). */
  db?: Db;
  /**
   * If true, runs even when the table already has rows.
   * If false (default), still runs an UPSERT to refresh mutable fields.
   */
  force?: boolean;
};

/**
 * Insert / refresh the 5 canonical Rido cities.
 */
export async function seedDatabase(opts: SeedOptions = {}): Promise<SeedResult> {
  const ownClient = !opts.db;
  const db = opts.db ?? getDb();

  try {
    const inserted: string[] = [];
    const updated: string[] = [];
    const unchanged: string[] = [];

    // Detect a truly empty database so we can default new rows to "live".
    const [{ count }] = await db.execute<{ count: string }>(
      sql`select count(*)::text as count from ${citiesTable}`,
    );
    const totalInDb = Number.parseInt(count, 10);
    const isFirstRun = totalInDb === 0;

    for (const c of citySeedData) {
      // Was this slug already in the DB? We use a simple SELECT first so we
      // can report the right outcome (inserted vs updated vs unchanged).
      const existing = await db
        .select({ slug: citiesTable.slug })
        .from(citiesTable)
        .where(sql`${citiesTable.slug} = ${c.slug}`)
        .limit(1);

      if (existing.length === 0) {
        await db.insert(citiesTable).values({
          slug: c.slug,
          name: c.name,
          region: c.region,
          country: "ES",
          lat: c.lat.toString(),
          lng: c.lng.toString(),
          status: isFirstRun ? "live" : "coming_soon",
          launchedAt: isFirstRun ? new Date() : null,
        });
        inserted.push(c.slug);
      } else {
        // Refresh mutable display fields only. Preserve status / launchedAt /
        // geofence / parkingZones in case ops have customised them.
        const result = await db
          .update(citiesTable)
          .set({
            name: c.name,
            region: c.region,
            country: "ES",
            lat: c.lat.toString(),
            lng: c.lng.toString(),
            updatedAt: new Date(),
          })
          .where(sql`${citiesTable.slug} = ${c.slug}`)
          .returning({ slug: citiesTable.slug });

        if (result.length > 0) updated.push(c.slug);
        else unchanged.push(c.slug);
      }
    }

    return { inserted, updated, unchanged, totalInDb };
  } finally {
    if (ownClient) await closeDb();
  }
}

/**
 * CLI entry point: `pnpm tsx src/lib/db/seed.ts`
 * Useful for local dev — runs the seeder against DATABASE_URL.
 */
async function runCli(): Promise<void> {
   
  console.log("[seed] starting…");
  const result = await seedDatabase();
   
  console.log("[seed] done", result);
  process.exit(0);
}

// Only run the CLI when this file is the entry point (not when imported).
const invokedDirectly =
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1] !== undefined &&
  process.argv[1].endsWith("seed.ts");

if (invokedDirectly) {
  runCli().catch((err) => {
     
    console.error("[seed] failed", err);
    process.exit(1);
  });
}
