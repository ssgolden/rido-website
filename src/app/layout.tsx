import type { Metadata, Viewport } from "next";
import { SmoothScrollProvider } from "@/components/ui/SmoothScrollProvider";
import { ClientCookieConsent } from "@/components/ui/ClientCookieConsent";
import { ConsentAwareAnalytics } from "@/components/ui/ConsentAwareAnalytics";
import { getAllSchemas } from "@/lib/schema";
import { Toaster } from "@/components/animation/Toast";
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
  description:
    "Shared e-scooters and e-bikes coming to the Costa del Sol. Join the Rido waitlist and be first to ride in Marbella, Estepona, and more. Zero emissions, zero hassle.",
  keywords: [
    "rido",
    "e-scooter",
    "e-bike",
    "shared mobility",
    "Spain",
    "Costa del Sol",
    "Marbella",
    "Estepona",
    "San Pedro de Alcántara",
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
  },
  other: {
    "geo.position": "36.5099;-4.8862",
    "geo.region": "ES-A",
    "geo.placename": "Marbella, Costa del Sol, Spain",
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
        {/* Custom font loaded via <link> — next/font/google fails on Windows with Turbopack */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable @next/next/no-page-custom-font */}
        {/* App Router layout is the correct place for global fonts; next/font/google fails on Windows + Turbopack */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@9..40,400..900&display=swap"
          rel="stylesheet"
        />
        {/* eslint-enable @next/next/no-page-custom-font */}
        <link rel="alternate" hrefLang="en" href="https://rido.bike" />
        {/* Spanish hreflang removed — no Spanish version exists yet. Add <link rel="alternate" hrefLang="es" href="https://rido.bike/es" /> when localized */}
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
