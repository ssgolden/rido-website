import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/site";

// Force static generation so this route is compatible with `output: "export"`
export const dynamic = "force-static";

/** Sandbox URLs. Not in the static export; disallowed so Allow: / does not cover them. */
const SANDBOX_PATHS = ["/motion-lab", "/coming-soon", "/waitlist-admin"];

const publicCrawl = {
  allow: "/",
  disallow: SANDBOX_PATHS,
};

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", ...publicCrawl },
      { userAgent: "GPTBot", ...publicCrawl },
      { userAgent: "ClaudeBot", ...publicCrawl },
      { userAgent: "PerplexityBot", ...publicCrawl },
      { userAgent: "Google-Extended", ...publicCrawl },
      { userAgent: "ChatGPT-User", ...publicCrawl },
      { userAgent: "OAI-SearchBot", ...publicCrawl },
      { userAgent: "BraveBot", ...publicCrawl },
    ],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
    host: SITE_ORIGIN,
  };
}
