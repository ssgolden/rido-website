import type { MetadataRoute } from "next";

// Force static generation so this route is compatible with `output: "export"`
export const dynamic = "force-static";

const baseUrl = "https://rido.bike";
// Use fixed date instead of new Date() so the sitemap is stable across builds
const lastModified = "2026-06-19";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/careers`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}