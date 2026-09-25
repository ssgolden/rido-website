import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { BackToTop } from "@/components/ui/BackToTop";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { citiesAnnounced } from "@/data/cities";
import { getHomeSchemas } from "@/lib/schema";
import { jsonLd } from "@/lib/jsonld";

const HowItWorks = dynamic(() => import("@/components/sections/HowItWorks").then((m) => ({ default: m.HowItWorks })));
const Vehicles = dynamic(() => import("@/components/sections/Vehicles").then((m) => ({ default: m.Vehicles })));
const Cities = dynamic(() => import("@/components/sections/Cities").then((m) => ({ default: m.Cities })));
const Safety = dynamic(() => import("@/components/sections/Safety").then((m) => ({ default: m.Safety })));
const Sustainability = dynamic(() => import("@/components/sections/Sustainability").then((m) => ({ default: m.Sustainability })));
const Pricing = dynamic(() => import("@/components/sections/Pricing").then((m) => ({ default: m.Pricing })));
const FAQ = dynamic(() => import("@/components/sections/FAQ").then((m) => ({ default: m.FAQ })));
const About = dynamic(() => import("@/components/sections/About").then((m) => ({ default: m.About })));
const Partners = dynamic(() => import("@/components/sections/Partners").then((m) => ({ default: m.Partners })));
const DownloadCTA = dynamic(() => import("@/components/sections/DownloadCTA").then((m) => ({ default: m.DownloadCTA })));
const Footer = dynamic(() => import("@/components/layout/Footer").then((m) => ({ default: m.Footer })));

// Page-level JSON-LD (WebPage, FAQPage, Products, Service) in Spanish.
const homeSchemas = getHomeSchemas("es");

export const metadata: Metadata = {
  title: "Rido — Patinetes y bicis eléctricas compartidas · Costa del Sol",
  description: citiesAnnounced
    ? "Patinetes y bicis eléctricas compartidas en la Costa del Sol. Únete a la lista de espera y sé de los primeros en montar en Marbella, Estepona y más."
    : "Patinetes y bicis eléctricas compartidas llegan a la Costa del Sol. Ciudades de lanzamiento muy pronto: únete a la lista de espera y sé de los primeros en montar.",
  alternates: {
    canonical: "https://rido.bike/es",
    languages: {
      en: "https://rido.bike",
      es: "https://rido.bike/es",
      "x-default": "https://rido.bike",
    },
  },
  openGraph: {
    title: "Rido — Patinetes y bicicletas eléctricas compartidas en la Costa del Sol",
    description:
      "Únete a la lista de espera y sé de los primeros en montar en patinetes y bicicletas eléctricas compartidas en la Costa del Sol. Cero emisiones, cero complicaciones.",
    type: "website",
    url: "https://rido.bike/es",
    siteName: "Rido",
    locale: "es_ES",
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
      <Navbar />
      <ScrollProgress />
      <main id="main-content">
        {homeSchemas.map((schema, i) => (
          <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
        ))}
        <noscript>
          <div style={{ padding: "2rem", textAlign: "center", color: "#fff" }}>
            <p><strong>Rido — Patinetes y bicicletas eléctricas compartidas en la Costa del Sol</strong></p>
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
    </LocaleProvider>
  );
}
