import type { Metadata } from "next";
import { RootDocument, rootViewport } from "@/components/layout/RootDocument";
import { OG_LOCALE_EN, OG_LOCALE_ES, SITE_ORIGIN } from "@/lib/site";
import "../globals.css";

export const viewport = rootViewport;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
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
  openGraph: {
    siteName: "Rido",
    locale: OG_LOCALE_ES,
    alternateLocale: [OG_LOCALE_EN],
    images: [
      {
        url: "/images/og/rido-og.jpg",
        width: 1200,
        height: 630,
        alt: "Rido — Patinetes y bicis eléctricas compartidas, muy pronto en Torrevieja",
        type: "image/jpeg",
      },
    ],
  },
};

export default function SpanishLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootDocument lang="es">{children}</RootDocument>;
}
