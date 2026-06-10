import type { MetadataRoute } from "next";

// Force static generation so this route is compatible with `output: "export"`
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://rido.bike/sitemap.xml",
  };
}