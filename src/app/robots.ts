import type { MetadataRoute } from "next";

// Force static generation so this route is compatible with `output: "export"`
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Operator/dev pages. They also carry noindex meta tags; the disallow
        // saves crawl budget and keeps them out of link-discovery.
        disallow: ["/waitlist-admin", "/motion-lab"],
      },
    ],
    sitemap: "https://rido.bike/sitemap.xml",
  };
}
