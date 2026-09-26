import type { Metadata } from "next";
import { RootDocument, rootViewport } from "@/components/layout/RootDocument";
import { OG_LOCALE_EN, OG_LOCALE_ES, SITE_ORIGIN } from "@/lib/site";
import { citiesAnnounced } from "@/data/cities";
import "../globals.css";

export const viewport = rootViewport;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: "Rido — Shared E-Scooters & E-Bikes on the Costa del Sol, Spain",
  description: citiesAnnounced
    ? "Shared e-scooters and e-bikes coming to the Costa del Sol. Join the Rido waitlist and be first to ride in Marbella, Estepona, and more. Zero emissions, zero hassle."
    : "Shared e-scooters and e-bikes coming to the Costa del Sol. Launch cities announced soon — join the Rido waitlist and be first to ride. Zero emissions, zero hassle.",
  keywords: [
    "rido",
    "e-scooter",
    "e-bike",
    "shared mobility",
    "Spain",
    "Costa del Sol",
    ...(citiesAnnounced ? ["Marbella", "Estepona", "San Pedro de Alcántara"] : []),
    "electric scooter",
    "electric bike",
    "micromobility",
    "rent scooter Spain",
    "alquiler patinete",
    "alquiler bici eléctrica",
  ],
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Rido — Shared E-Scooters & E-Bikes on the Costa del Sol",
    description:
      "Join the waitlist and be first to ride shared e-scooters and e-bikes on the Costa del Sol. Zero emissions, zero hassle.",
    type: "website",
    url: SITE_ORIGIN,
    siteName: "Rido",
    locale: OG_LOCALE_EN,
    alternateLocale: [OG_LOCALE_ES],
    images: [
      {
        url: "/images/og/rido-og.png",
        width: 1200,
        height: 630,
        alt: "Rido — Shared E-Scooters & E-Bikes on Spain's Costa del Sol",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rido — Shared E-Scooters & E-Bikes on the Costa del Sol",
    description: "Join the waitlist and be first to ride on the Costa del Sol. Zero emissions, zero hassle.",
    images: ["/images/og/rido-og.png"],
  },
  alternates: {
    canonical: SITE_ORIGIN,
    languages: {
      en: SITE_ORIGIN,
      es: `${SITE_ORIGIN}/es`,
      "x-default": SITE_ORIGIN,
    },
  },
  other: {
    "geo.position": "36.5099;-4.8862",
    "geo.region": "ES-A",
    "geo.placename": citiesAnnounced ? "Marbella, Costa del Sol, Spain" : "Costa del Sol, Spain",
    ICBM: "36.5099, -4.8862",
  },
};

export default function EnglishLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootDocument lang="en">{children}</RootDocument>;
}
