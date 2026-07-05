import type { MetadataRoute } from "next";
import { cities } from "@/data/cities";

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
      alternates: {
        languages: {
          en: baseUrl,
          es: `${baseUrl}/es`,
          "x-default": baseUrl,
        },
      },
    },
    {
      url: `${baseUrl}/es`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: {
          en: baseUrl,
          es: `${baseUrl}/es`,
          "x-default": baseUrl,
        },
      },
    },
    // Per-city landing pages (EN at /{slug}, ES at /es/{slug})
    ...cities.map((city) => ({
      url: `${baseUrl}/${city.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: {
        languages: {
          en: `${baseUrl}/${city.slug}`,
          es: `${baseUrl}/es/${city.slug}`,
          "x-default": `${baseUrl}/${city.slug}`,
        },
      },
    })),
    ...cities.map((city) => ({
      url: `${baseUrl}/es/${city.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: {
        languages: {
          en: `${baseUrl}/${city.slug}`,
          es: `${baseUrl}/es/${city.slug}`,
          "x-default": `${baseUrl}/${city.slug}`,
        },
      },
    })),
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
    {
      url: `${baseUrl}/politica-cookies`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
