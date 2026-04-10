import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
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
  openGraph: {
    title: "Rido — Shared E-Scooters & E-Bikes in Spain",
    description:
      "Move freely across Spain with Rido's shared e-scooters and e-bikes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
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
      <body className="font-sans">{children}</body>
    </html>
  );
}