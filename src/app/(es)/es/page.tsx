import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/Navbar";
import { SiteShell } from "@/components/layout/SiteShell";
import { Hero } from "@/components/sections/Hero";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { BackToTop } from "@/components/ui/BackToTop";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { citiesAnnounced } from "@/data/cities";
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
const Cities = dynamic(() => import("@/components/sections/Cities").then((m) => ({ default: m.Cities })), { loading });
const Safety = dynamic(() => import("@/components/sections/Safety").then((m) => ({ default: m.Safety })), { loading });
const Sustainability = dynamic(() => import("@/components/sections/Sustainability").then((m) => ({ default: m.Sustainability })), { loading });
const Pricing = dynamic(() => import("@/components/sections/Pricing").then((m) => ({ default: m.Pricing })), { loading });
const FAQ = dynamic(() => import("@/components/sections/FAQ").then((m) => ({ default: m.FAQ })), { loading });
const About = dynamic(() => import("@/components/sections/About").then((m) => ({ default: m.About })), { loading });
const Partners = dynamic(() => import("@/components/sections/Partners").then((m) => ({ default: m.Partners })), { loading });
const DownloadCTA = dynamic(() => import("@/components/sections/DownloadCTA").then((m) => ({ default: m.DownloadCTA })), { loading });
const Footer = dynamic(() => import("@/components/layout/Footer").then((m) => ({ default: m.Footer })), { loading });

export const metadata: Metadata = {
  title: "Rido — Patinetes y bicicletas eléctricas compartidas en la Costa del Sol",
  description: citiesAnnounced
    ? "Patinetes y bicicletas eléctricas compartidas llegan a la Costa del Sol. Únete a la lista de espera de Rido y sé de los primeros en montar en Marbella, Estepona y más. Cero emisiones, cero complicaciones."
    : "Patinetes y bicicletas eléctricas compartidas llegan a la Costa del Sol. Las ciudades de lanzamiento se anunciarán muy pronto — únete a la lista de espera de Rido y sé de los primeros en montar. Cero emisiones, cero complicaciones.",
  alternates: {
    canonical: `${SITE_ORIGIN}/es`,
    languages: {
      en: SITE_ORIGIN,
      es: `${SITE_ORIGIN}/es`,
      "x-default": SITE_ORIGIN,
    },
  },
  openGraph: {
    title: "Rido — Patinetes y bicicletas eléctricas compartidas en la Costa del Sol",
    description:
      "Únete a la lista de espera y sé de los primeros en montar en patinetes y bicicletas eléctricas compartidas en la Costa del Sol. Cero emisiones, cero complicaciones.",
    type: "website",
    url: `${SITE_ORIGIN}/es`,
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
  twitter: {
    card: "summary_large_image",
    title: "Rido — Patinetes y bicicletas eléctricas compartidas en la Costa del Sol",
    description:
      "Únete a la lista de espera y sé de los primeros en montar en la Costa del Sol. Cero emisiones, cero complicaciones.",
    images: ["/images/og/rido-og.png"],
  },
};

function Divider() {
  return <div className="section-divider max-w-7xl mx-auto" />;
}

export default function HomeEs() {
  return (
    <LocaleProvider locale="es">
      <SiteShell header={<Navbar />}>
      <ScrollProgress />
      <main id="main-content">
        <noscript>
          <div style={{ padding: "2rem", textAlign: "center", color: "#fff" }}>
            <h1>Rido — Patinetes y bicicletas eléctricas compartidas en España</h1>
            <p>Únete a la lista de espera y sé de los primeros en montar con los patinetes y bicicletas eléctricas compartidas de Rido en la Costa del Sol. Cero emisiones, cero complicaciones.</p>
            <p>
              {citiesAnnounced
                ? "Muy pronto en Marbella, San Pedro de Alcántara, Cancelada, Estepona y El Paraíso."
                : "Muy pronto en la Costa del Sol — las ciudades de lanzamiento se anunciarán en breve."}
            </p>
          </div>
        </noscript>
        <Hero />
        <Divider />
        <HowItWorks />
        <Divider />
        <Vehicles />
        <Divider />
        <Cities />
        <Divider />
        <Safety />
        <Divider />
        <Sustainability />
        <Divider />
        <Pricing />
        <Divider />
        <FAQ />
        <Divider />
        <About />
        <Divider />
        <Partners />
        <Divider />
        <DownloadCTA />
      </main>
      <Footer locale="es" />
      <BackToTop />
      </SiteShell>
    </LocaleProvider>
  );
}
