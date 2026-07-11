import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { BackToTop } from "@/components/ui/BackToTop";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { citiesAnnounced } from "@/data/cities";

const HowItWorks = dynamic(() => import("@/components/sections/HowItWorks").then((m) => ({ default: m.HowItWorks })));
const Vehicles = dynamic(() => import("@/components/sections/Vehicles").then((m) => ({ default: m.Vehicles })));
const Cities = dynamic(() => import("@/components/sections/Cities").then((m) => ({ default: m.Cities })));
const Safety = dynamic(() => import("@/components/sections/Safety").then((m) => ({ default: m.Safety })));
const Sustainability = dynamic(() => import("@/components/sections/Sustainability").then((m) => ({ default: m.Sustainability })));
const Pricing = dynamic(() => import("@/components/sections/Pricing").then((m) => ({ default: m.Pricing })));
const FAQ = dynamic(() => import("@/components/sections/FAQ").then((m) => ({ default: m.FAQ })));
const About = dynamic(() => import("@/components/sections/About").then((m) => ({ default: m.About })));
const DownloadCTA = dynamic(() => import("@/components/sections/DownloadCTA").then((m) => ({ default: m.DownloadCTA })));
const Footer = dynamic(() => import("@/components/layout/Footer").then((m) => ({ default: m.Footer })));

export const metadata: Metadata = {
  title: "Rido — Patinetes y bicicletas eléctricas compartidas en la Costa del Sol",
  description: citiesAnnounced
    ? "Patinetes y bicicletas eléctricas compartidas llegan a la Costa del Sol. Únete a la lista de espera de Rido y sé de los primeros en montar en Marbella, Estepona y más. Cero emisiones, cero complicaciones."
    : "Patinetes y bicicletas eléctricas compartidas llegan a la Costa del Sol. Las ciudades de lanzamiento se anunciarán muy pronto — únete a la lista de espera de Rido y sé de los primeros en montar. Cero emisiones, cero complicaciones.",
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
        url: "/images/logo/rido-logo-wide.png",
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
    images: ["/images/lifestyle/rido-rider-street.jpg"],
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
        <DownloadCTA />
      </main>
      <Footer locale="es" />
      <BackToTop />
    </LocaleProvider>
  );
}
