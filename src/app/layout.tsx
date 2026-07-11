import type { Metadata, Viewport } from "next";
import { SmoothScrollProvider } from "@/components/ui/SmoothScrollProvider";
import { ClientCookieConsent } from "@/components/ui/ClientCookieConsent";
import { ConsentAwareAnalytics } from "@/components/ui/ConsentAwareAnalytics";
import { getAllSchemas } from "@/lib/schema";
import { citiesAnnounced } from "@/data/cities";
import { Toaster } from "@/components/animation/Toast";
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
    apple: "/apple-touch-icon.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Rido — Shared E-Scooters & E-Bikes on the Costa del Sol",
    description:
      "Join the waitlist and be first to ride shared e-scooters and e-bikes on the Costa del Sol. Zero emissions, zero hassle.",
    type: "website",
    url: "https://rido.bike",
    siteName: "Rido",
    locale: "en_ES",
    images: [
      {
        url: "/images/logo/rido-logo-wide.png",
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
    images: ["/images/lifestyle/rido-rider-street.jpg"],
  },
  alternates: {
    canonical: "https://rido.bike",
    languages: {
      en: "https://rido.bike",
      es: "https://rido.bike/es",
    },
  },
  other: {
    "geo.position": "36.5099;-4.8862",
    "geo.region": "ES-A",
    "geo.placename": citiesAnnounced ? "Marbella, Costa del Sol, Spain" : "Costa del Sol, Spain",
    ICBM: "36.5099, -4.8862",
  },
};

// Centralized JSON-LD structured data for SEO and AI engines
const allSchemas = getAllSchemas();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Self-hosted variable fonts, preloaded so the swap never shifts layout.
            Files live in public/fonts (copied from @fontsource-variable); the
            @font-face declarations are in globals.css — not next/font (Windows
            Turbopack bug, see AGENTS.md). */}
        <link rel="preload" href="/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/sora-latin-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="alternate" hrefLang="en" href="https://rido.bike" />
        <link rel="alternate" hrefLang="es" href="https://rido.bike/es" />
        <link rel="alternate" hrefLang="x-default" href="https://rido.bike" />

        {/* Google Search Console verification — set NEXT_PUBLIC_GSC_VERIFICATION in env to enable */}
        {process.env.NEXT_PUBLIC_GSC_VERIFICATION ? (
          <meta
            name="google-site-verification"
            content={process.env.NEXT_PUBLIC_GSC_VERIFICATION}
          />
        ) : null}

        {/* JSON-LD structured data for SEO and AI engines */}
        {allSchemas.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body className="font-sans overflow-x-hidden" suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-rido-magenta focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
        >
          Skip to content
        </a>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <ConsentAwareAnalytics />
        <ClientCookieConsent />
        <Toaster />
      </body>
    </html>
  );
}
