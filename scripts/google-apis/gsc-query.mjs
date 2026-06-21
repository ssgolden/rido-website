/**
 * Query Google Search Console performance data.
 *
 * Usage:
 *   node scripts/google-apis/gsc-query.mjs
 */
import { google } from "googleapis";
import { readFileSync } from "fs";
import { URL } from "url";

function loadEnv(path) {
  const text = readFileSync(path, "utf8");
  return Object.fromEntries(
    text
      .split("\n")
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const [k, ...v] = line.split("=");
        return [k.trim(), v.join("=").trim()];
      })
  );
}

const env = loadEnv(new URL(".env", import.meta.url).pathname);

const auth = new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET);
auth.setCredentials({ refresh_token: env.GOOGLE_REFRESH_TOKEN });

const gsc = google.webmasters({ version: "v3", auth });

async function main() {
  const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const res = await gsc.searchanalytics.query({
    siteUrl: env.GSC_SITE_URL,
    requestBody: {
      startDate: daysAgo(28),
      endDate: daysAgo(1),
      dimensions: ["query", "page"],
      rowLimit: 50,
    },
  });

  console.log("Search Console data (last 28 days):");
  console.table(
    res.data.rows?.map((row) => ({
      query: row.keys[0],
      page: row.keys[1],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: `${(row.ctr * 100).toFixed(2)}%`,
      position: row.position?.toFixed(1),
    })) || []
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
