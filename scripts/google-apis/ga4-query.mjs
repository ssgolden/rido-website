/**
 * Query Google Analytics 4 real-time + standard metrics.
 *
 * Usage:
 *   node scripts/google-apis/ga4-query.mjs
 */
import { BetaAnalyticsDataClient } from "@google-analytics/data";
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

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    refresh_token: env.GOOGLE_REFRESH_TOKEN,
  },
});

async function main() {
  const propertyId = env.GA4_PROPERTY_ID.replace(/^properties\//, "");

  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
    metrics: [
      { name: "sessions" },
      { name: "activeUsers" },
      { name: "screenPageViews" },
      { name: "averageSessionDuration" },
    ],
    dimensions: [{ name: "date" }],
  });

  console.log("GA4 last 28 days:");
  console.table(
    response.rows?.map((row) => ({
      date: row.dimensionValues[0].value,
      sessions: row.metricValues[0].value,
      activeUsers: row.metricValues[1].value,
      pageViews: row.metricValues[2].value,
      avgDuration: row.metricValues[3].value,
    })) || []
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
