import type { Metadata } from "next";
import { RootDocument, rootViewport } from "@/components/layout/RootDocument";
import { OG_LOCALE_EN, OG_LOCALE_ES, SITE_ORIGIN } from "@/lib/site";
import "../globals.css";

export const viewport = rootViewport;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    siteName: "Rido",
    locale: OG_LOCALE_ES,
    alternateLocale: [OG_LOCALE_EN],
    images: [
      {
        url: "/images/og/rido-og.png",
        width: 1200,
        height: 630,
        alt: "Rido — Patinetes y bicicletas eléctricas compartidas en la Costa del Sol",
        type: "image/png",
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
