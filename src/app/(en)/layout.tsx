import type { Metadata } from "next";
import { RootDocument, rootViewport } from "@/components/layout/RootDocument";
import { OG_LOCALE_EN, OG_LOCALE_ES, SITE_ORIGIN } from "@/lib/site";
import { primaryCity } from "@/data/cities";
import "../globals.css";

export const viewport = rootViewport;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: "Rido — Shared E-Scooters & E-Bikes in Torrevieja & the Costa del Sol",
  description:
    "Shared e-scooters and e-bikes launching in Torrevieja on the Costa Blanca in the coming weeks, with the Costa del Sol to follow. Join the Rido waitlist and be first to ride. Zero emissions, zero hassle.",
  keywords: [
    "rido",
    "e-scooter",
    "e-bike",
    "shared mobility",
    "Spain",
    "Torrevieja",
    "Costa Blanca",
    "Costa del Sol",
    "electric scooter",
    "electric bike",
    "micromobility",
    "rent scooter Spain",
    "alquiler patinete",
    "alquiler bici eléctrica",
    "alquiler patinete Torrevieja",
    "e-scooter Torrevieja",
  ],
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Rido — Shared E-Scooters & E-Bikes in Torrevieja & the Costa del Sol",
    description:
      "Launching in Torrevieja in the coming weeks. Join the waitlist and be first to ride shared e-scooters and e-bikes. Zero emissions, zero hassle.",
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
        alt: "Rido — Shared e-scooters and e-bikes, launching soon in Torrevieja",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rido — Shared E-Scooters & E-Bikes in Torrevieja & the Costa del Sol",
    description: "Launching in Torrevieja in the coming weeks. Join the waitlist and be first to ride. Zero emissions, zero hassle.",
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
