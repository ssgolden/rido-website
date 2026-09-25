import type { Metadata, Viewport } from "next";
import { SmoothScrollProvider } from "@/components/ui/SmoothScrollProvider";
import { ClientCookieConsent } from "@/components/ui/ClientCookieConsent";
import { ConsentAwareAnalytics } from "@/components/ui/ConsentAwareAnalytics";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { SkipLink } from "@/components/ui/SkipLink";
import { getSiteSchemas } from "@/lib/schema";
import { jsonLd } from "@/lib/jsonld";
import { citiesAnnounced } from "@/data/cities";
// Self-hosted variable fonts (bundled WOFF2, no external requests).
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0F172A",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://rido.bike"),
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
    // Town-name keywords only after the launch announcement
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
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Rido — Shared E-Scooters & E-Bikes on the Costa del Sol",
    description:
      "Join the waitlist and be first to ride shared e-scooters and e-bikes on the Costa del Sol. Zero emissions, zero hassle.",
    type: "website",
    url: "https://rido.bike",
    siteName: "Rido",
    locale: "en_GB",
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
  other: {
    "geo.position": "36.5099;-4.8862",
    "geo.region": "ES-MA",
    "geo.placename": citiesAnnounced ? "Marbella, Costa del Sol, Spain" : "Costa del Sol, Spain",
    ICBM: "36.5099, -4.8862",
  },
};

// Site-wide JSON-LD (Organization / Brand / WebSite / LocalBusiness). Page-level
// nodes (WebPage, FAQPage, Product, Service) are emitted by the pages themselves.
const siteSchemas = getSiteSchemas();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Self-hosted variable fonts live in public/fonts; the @font-face
            declarations are in globals.css, not next/font (Windows Turbopack
            bug, see AGENTS.md). Next does not preload CSS-referenced fonts, so
            they are preloaded here to avoid a late swap on the hero headline.
            hreflang/canonical are declared per page via the Metadata API. */}
        <link rel="preload" href="/fonts/sora-latin-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        {/* Google Search Console verification — set NEXT_PUBLIC_GSC_VERIFICATION in env to enable */}
        {process.env.NEXT_PUBLIC_GSC_VERIFICATION ? (
          <meta
            name="google-site-verification"
            content={process.env.NEXT_PUBLIC_GSC_VERIFICATION}
          />
        ) : null}

        {/* JSON-LD structured data for SEO and AI engines */}
        {siteSchemas.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
          />
        ))}
      </head>
      <body className="font-sans overflow-x-hidden" suppressHydrationWarning>
        <SkipLink />
        <SmoothScrollProvider>
          <MotionProvider>{children}</MotionProvider>
        </SmoothScrollProvider>
        <ConsentAwareAnalytics />
        <ClientCookieConsent />
      </body>
    </html>
  );
}
