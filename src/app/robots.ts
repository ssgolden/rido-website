import type { MetadataRoute } from "next";

// Force static generation so this route is compatible with `output: "export"`
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/api/",
        crawlDelay: 1,
      },
    ],
    sitemap: "https://rido.bike/sitemap.xml",
    // Crawl-delay is a non-standard field; Next.js types include it
    // but TypeScript may not. We cast through `unknown` to keep strict mode happy.
  } as unknown as MetadataRoute.Robots;
}