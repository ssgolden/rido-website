import type { Viewport } from "next";
import { SmoothScrollProvider } from "@/components/ui/SmoothScrollProvider";
import { ClientCookieConsent } from "@/components/ui/ClientCookieConsent";
import { ConsentAwareAnalytics } from "@/components/ui/ConsentAwareAnalytics";
import { LazyMotionRoot } from "@/components/ui/LazyMotionRoot";
import { getAllSchemas } from "@/lib/schema";
import { Toaster } from "@/components/animation/Toast";
import type { Locale } from "@/lib/i18n/config";

export const rootViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0F172A",
};

/**
 * Shared document shell for the English and Spanish root layouts.
 * hreflang comes from the Metadata API only — do not also emit <link rel="alternate">.
 */
export function RootDocument({
  lang,
  children,
}: {
  lang: Locale;
  children: React.ReactNode;
}) {
  const schemas = getAllSchemas(lang);

  return (
    <html lang={lang} className="dark">
      {/* Font preloads and JSON-LD are not covered by the Metadata API. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <link rel="preload" href="/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/sora-latin-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />

        {process.env.NEXT_PUBLIC_GSC_VERIFICATION ? (
          <meta
            name="google-site-verification"
            content={process.env.NEXT_PUBLIC_GSC_VERIFICATION}
          />
        ) : null}

        {schemas.map((schema, i) => (
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
          {lang === "es" ? "Saltar al contenido" : "Skip to content"}
        </a>
        <SmoothScrollProvider>
          <LazyMotionRoot>{children}</LazyMotionRoot>
        </SmoothScrollProvider>
        <ConsentAwareAnalytics />
        <ClientCookieConsent />
        <Toaster />
      </body>
    </html>
  );
}
