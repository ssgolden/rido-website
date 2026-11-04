import { APP_STORE_ID } from "@/data/apps";
import type { Metadata } from "next";
import { RootDocument, rootViewport } from "@/components/layout/RootDocument";
import { OG_LOCALE_EN, OG_LOCALE_ES, SITE_ORIGIN } from "@/lib/site";
import { primaryCity } from "@/data/cities";
import "../globals.css";

export const viewport = rootViewport;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: "Rido — Shared E-Scooters in Torrevieja, Live Now",
  description:
    "Shared e-scooters, live now in Torrevieja on the Costa Blanca, with the Costa del Sol to follow. Download the Rido app on the App Store or Google Play and ride today. Zero emissions, zero hassle.",
  keywords: [
    "rido",
    "e-scooter",
    "shared mobility",
    "Spain",
    "Torrevieja",
    "Costa Blanca",
    "Costa del Sol",
    "electric scooter",
    "micromobility",
    "rent scooter Spain",
    "alquiler patinete",
    "alquiler patinete Torrevieja",
    "e-scooter Torrevieja",
  ],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      // Google Search wants a square multiple of 48 px (or an SVG) for the result icon.
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
  manifest: "/manifest.json",
  // iPhone Safari shows the Smart App Banner ("Open in the App Store").
  itunes: { appId: APP_STORE_ID },
  openGraph: {
    title: "Rido — Shared E-Scooters in Torrevieja, Live Now",
    description:
      "Live now in Torrevieja. Download the Rido app and ride shared e-scooters today. Zero emissions, zero hassle.",
    type: "website",
    url: SITE_ORIGIN,
    siteName: "Rido",
    locale: OG_LOCALE_EN,
    alternateLocale: [OG_LOCALE_ES],
    images: [
      {
        url: "/images/og/rido-og.jpg",
        width: 1200,
        height: 630,
        alt: "Rido — Shared e-scooters, live now in Torrevieja",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rido — Shared E-Scooters in Torrevieja, Live Now",
    description: "Live now in Torrevieja. Download the Rido app and ride shared e-scooters today. Zero emissions, zero hassle.",
    images: ["/images/og/rido-og.jpg"],
  },
  other: primaryCity
    ? {
        "geo.position": `${primaryCity.lat};${primaryCity.lng}`,
        "geo.region": primaryCity.isoRegion,
        "geo.placename": `${primaryCity.name}, ${primaryCity.region}, Spain`,
        ICBM: `${primaryCity.lat}, ${primaryCity.lng}`,
      }
    : {},
};

export default function EnglishLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootDocument lang="en">{children}</RootDocument>;
}
