import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/Navbar";
import { SiteShell } from "@/components/layout/SiteShell";
import { Hero } from "@/components/sections/Hero";
import { heroCopy, heroImage } from "@/components/sections/Hero.copy";
import { howItWorksCopy } from "@/components/sections/HowItWorks.copy";
import { phoneCopy } from "@/components/ui/PhoneScreens.copy";
import { vehiclesCopy, getFleet } from "@/components/sections/Vehicles.copy";
import { faqCopy } from "@/components/sections/FAQ.copy";
import { faqItemsByLocale } from "@/data/faq";
import { Launch } from "@/components/sections/Launch";
import { Safety } from "@/components/sections/Safety";
import { DownloadCTA } from "@/components/sections/DownloadCTA";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { BackToTop } from "@/components/ui/BackToTop";
import { JsonLd } from "@/components/layout/JsonLd";
import { getHomeSchemas } from "@/lib/schema";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { OG_LOCALE_EN, OG_LOCALE_ES, SITE_ORIGIN } from "@/lib/site";

function SectionSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div
      className={`${tall ? "min-h-[80vh]" : "min-h-[50vh]"} py-12 sm:py-24 px-4 sm:px-6 flex items-center justify-center`}
      aria-hidden="true"
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="mx-auto max-w-md space-y-3">
          <div className="h-3 w-32 mx-auto rounded bg-white/5" />
          <div className="h-8 w-3/4 mx-auto rounded bg-white/5" />
          <div className="h-4 w-full mx-auto rounded bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}

const loading = () => <SectionSkeleton />;

const HowItWorks = dynamic(() => import("@/components/sections/HowItWorks").then((m) => ({ default: m.HowItWorks })), { loading });
const Vehicles = dynamic(() => import("@/components/sections/Vehicles").then((m) => ({ default: m.Vehicles })), { loading });
const FAQ = dynamic(() => import("@/components/sections/FAQ").then((m) => ({ default: m.FAQ })), { loading });
const Footer = dynamic(() => import("@/components/layout/Footer").then((m) => ({ default: m.Footer })), { loading });

export const metadata: Metadata = {
  title: "Rido — Patinetes y bicis eléctricas compartidas en Torrevieja y la Costa del Sol",
  description:
    "Patinetes y bicicletas eléctricas compartidas que llegan a Torrevieja, en la Costa Blanca, en las próximas semanas, y después a la Costa del Sol. Únete a la lista de espera de Rido y sé de los primeros en montar. Cero emisiones, cero complicaciones.",
  alternates: {
    canonical: `${SITE_ORIGIN}/es`,
    languages: {
      en: SITE_ORIGIN,
      es: `${SITE_ORIGIN}/es`,
      "x-default": SITE_ORIGIN,
    },
  },
  openGraph: {
    title: "Rido — Patinetes y bicis eléctricas compartidas en Torrevieja y la Costa del Sol",
    description:
      "Llegamos a Torrevieja en las próximas semanas. Únete a la lista de espera y sé de los primeros en montar. Cero emisiones, cero complicaciones.",
    type: "website",
    url: `${SITE_ORIGIN}/es`,
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
  twitter: {
    card: "summary_large_image",
    title: "Rido — Patinetes y bicis eléctricas compartidas en Torrevieja y la Costa del Sol",
    description:
      "Llegamos a Torrevieja en las próximas semanas. Únete a la lista de espera y sé de los primeros en montar. Cero emisiones, cero complicaciones.",
    images: ["/images/og/rido-og.jpg"],
  },
};


export default function HomeEs() {
  return (
    <LocaleProvider locale="es">
      <SiteShell header={<Navbar />}>
      <ScrollProgress />
      <main id="main-content">
        <JsonLd schemas={getHomeSchemas("es")} />
        <noscript>
          <div style={{ padding: "2rem", textAlign: "center", color: "#fff" }}>
            <h1>Rido — Patinetes y bicis eléctricas compartidas en Torrevieja y la Costa del Sol</h1>
            <p>Únete a la lista de espera y sé de los primeros en montar con los patinetes y bicicletas eléctricas compartidas de Rido. Cero emisiones, cero complicaciones.</p>
            <p>Llegamos a Torrevieja, en la Costa Blanca, en las próximas semanas, y después a la Costa del Sol.</p>
          </div>
        </noscript>
        {/* Order: Hero → How it works → Fleet → Launch map → Safety → FAQ → Waitlist. Keep the Navbar links in sync. */}
        <Hero t={heroCopy.es} image={heroImage} />
        <HowItWorks t={howItWorksCopy.es} phone={phoneCopy.es} />
        <Vehicles t={vehiclesCopy.es} fleet={getFleet("es")} />
        <Launch locale="es" />
        <Safety locale="es" />
        <FAQ t={faqCopy.es} items={faqItemsByLocale.es} />
        <DownloadCTA locale="es" />
      </main>
      <Footer locale="es" />
      <BackToTop />
      </SiteShell>
    </LocaleProvider>
  );
}
