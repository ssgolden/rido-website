import type { Viewport } from "next";
import { SmoothScrollProvider } from "@/components/ui/SmoothScrollProvider";
import { ClientCookieConsent } from "@/components/ui/ClientCookieConsent";
import { ConsentAwareAnalytics } from "@/components/ui/ConsentAwareAnalytics";
import { RevealObserver } from "@/components/ui/RevealObserver";
import { getSiteSchemas } from "@/lib/schema";
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
// Arms the scroll reveals before first paint (globals.css hides unrevealed
// blocks only under .reveal-ready). If RevealObserver has not started within
// 4s (script error, blocked chunk) the class is dropped so nothing stays hidden.
const REVEAL_BOOT =
  "document.documentElement.classList.add('reveal-ready');setTimeout(function(){if(!window.__ridoRevealReady)document.documentElement.classList.remove('reveal-ready')},4000)";

export function RootDocument({
  lang,
  children,
}: {
  lang: Locale;
  children: React.ReactNode;
}) {
  // Site-wide JSON-LD only; page-specific blocks render on their own pages.
  const schemas = getSiteSchemas();

  return (
    <html lang={lang} className="dark" suppressHydrationWarning>
      {/* Font preloads and JSON-LD are not covered by the Metadata API. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: REVEAL_BOOT }} />
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
        {/* First in the tab order after the skip link: consent is reachable before the page. */}
        <ClientCookieConsent />
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <RevealObserver />
        {/* Vercel Analytics only works on Vercel's hosting (it loads /_vercel/insights,
            which Netlify does not serve). VERCEL is set by Vercel's build environment. */}
        {process.env.VERCEL ? <ConsentAwareAnalytics /> : null}
      </body>
    </html>
  );
}
