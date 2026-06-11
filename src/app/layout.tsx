import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SmoothScrollProvider } from "@/components/ui/SmoothScrollProvider";
import { ClientCookieConsent } from "@/components/ui/ClientCookieConsent";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0F172A",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://rido.bike"),
  title: "Rido — Shared E-Scooters & E-Bikes in Spain",
  description:
    "Move freely across Spain with Rido's shared e-scooters and e-bikes. Download the app, scan, and ride. Zero emissions, zero hassle.",
  keywords: [
    "rido",
    "e-scooter",
    "e-bike",
    "shared mobility",
    "Spain",
    "electric scooter",
    "electric bike",
    "micromobility",
    "rent scooter",
  ],
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Rido — Shared E-Scooters & E-Bikes in Spain",
    description:
      "Move freely across Spain with Rido's shared e-scooters and e-bikes.",
    type: "website",
    url: "https://rido.bike",
    siteName: "Rido",
    locale: "en_ES",
    images: [
      {
        url: "/images/logo/rido-logo-wide.png",
        width: 1200,
        height: 630,
        alt: "Rido — Shared E-Scooters & E-Bikes in Spain's Costa del Sol",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rido — Shared E-Scooters & E-Bikes in Spain",
    description: "Move freely across Spain with shared e-scooters and e-bikes.",
    images: ["/images/lifestyle/rido-rider-street.jpg"],
  },
  alternates: {
    canonical: "https://rido.bike",
  },
};

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Rido",
  "description": "Shared e-scooters and e-bikes in Spain's most vibrant cities",
  "url": "https://rido.bike",
  "logo": "https://rido.bike/images/logo/rido-logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "info@rido.bike",
    "contactType": "customer service"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Calle Eneldo 3, C4, local 22",
    "addressLocality": "Orihuela Costa",
    "addressRegion": "Alicante",
    "postalCode": "03189",
    "addressCountry": "ES"
  },
  "areaServed": [
    { "@type": "City", "name": "Marbella" },
    { "@type": "City", "name": "San Pedro de Alcántara" },
    { "@type": "City", "name": "Cancelada" },
    { "@type": "City", "name": "Estepona" },
    { "@type": "City", "name": "El Paraíso" }
  ],
  "serviceType": ["E-Scooter Rental", "E-Bike Rental"],
  "priceRange": "€",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    "name": "Rido Vehicle Rentals",
    "itemListElement": [
      {
        "@type": "Offer",
        "name": "Pay as you go",
        "itemOffered": {
          "@type": "Service",
          "name": "E-Scooter Rental",
          "description": "Shared e-scooter rental by the minute. €1.00 unlock + €0.35 per minute."
        },
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "priceCurrency": "EUR",
          "price": "0.35",
          "referenceQuantity": {
            "@type": "QuantitativeValue",
            "value": "1",
            "unitCode": "MIN"
          }
        }
      },
      {
        "@type": "Offer",
        "name": "Rido Pass",
        "itemOffered": {
          "@type": "Service",
          "name": "E-Scooter & E-Bike Rental",
          "description": "Unlimited unlocks + reduced per-minute rate. Free unlock + €0.25 per minute."
        },
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "priceCurrency": "EUR",
          "price": "0.25",
          "referenceQuantity": {
            "@type": "QuantitativeValue",
            "value": "1",
            "unitCode": "MIN"
          }
        }
      },
      {
        "@type": "Offer",
        "name": "Day Pass",
        "itemOffered": {
          "@type": "Service",
          "name": "E-Scooter & E-Bike Rental",
          "description": "Unlimited rides for 24 hours. €14.99 flat rate."
        },
        "priceSpecification": {
          "@type": "PriceSpecification",
          "price": "14.99",
          "priceCurrency": "EUR"
        }
      }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* eslint-disable @next/next/no-page-custom-font -- next/font/google fails on Windows with Turbopack due to "http2 feature is not enabled" build error */}
        <link rel="preconnect" href="https://vitals.vercel-insights.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="alternate" hrefLang="en" href="https://rido.bike" />
        {/* Spanish hreflang removed — no Spanish version exists yet. Add <link rel="alternate" hrefLang="es" href="https://rido.bike/es" /> when localized */}
        <link rel="alternate" hrefLang="x-default" href="https://rido.bike" />
        {/* eslint-enable @next/next/no-page-custom-font */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans overflow-x-hidden" suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-rido-magenta focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
        >
          Skip to content
        </a>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <Analytics />
        <ClientCookieConsent />
      </body>
    </html>
  );
}