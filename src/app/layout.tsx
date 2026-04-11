import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { basePath } from "@/lib/basePath";
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
    icon: `${basePath}/favicon.svg`,
    apple: `${basePath}/apple-touch-icon.svg`,
  },
  manifest: `${basePath}/manifest.json`,
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
        url: "/images/lifestyle/rido-rider-street.jpg",
        width: 1200,
        height: 630,
        alt: "Rido — Ride Spain",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rido — Shared E-Scooters & E-Bikes in Spain",
    description: "Move freely across Spain with shared e-scooters and e-bikes.",
    images: ["/images/lifestyle/rido-rider-street.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
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
      </head>
      <body className="font-sans overflow-x-hidden" suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-rido-magenta focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
        >
          Skip to content
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}