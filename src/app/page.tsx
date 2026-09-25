import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { citiesAnnounced } from "@/data/cities";
import { getHomeSchemas } from "@/lib/schema";
import { jsonLd } from "@/lib/jsonld";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { BackToTop } from "@/components/ui/BackToTop";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://rido.bike",
    languages: {
      en: "https://rido.bike",
      es: "https://rido.bike/es",
      "x-default": "https://rido.bike",
    },
  },
};

// Page-level JSON-LD (WebPage, FAQPage, Products, Service) in English.
const homeSchemas = getHomeSchemas("en");

// No `loading` fallbacks on purpose: this page is fully prerendered, and a
// fallback makes Next emit every section inside a hidden Suspense segment
// that only an inline script reveals — non-rendering crawlers then see only
// the hero. Plain dynamic() keeps the code-splitting without hiding the HTML.
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

function Divider() {
  return <div className="section-divider max-w-7xl mx-auto" />;
}

export default function Home() {
  return (
    <>
      <Navbar />
      <ScrollProgress />
      <main id="main-content">
        {homeSchemas.map((schema, i) => (
          <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
        ))}
        <noscript>
          <div style={{ padding: "2rem", textAlign: "center", color: "#fff" }}>
            <p><strong>Rido — Shared E-Scooters & E-Bikes on the Costa del Sol</strong></p>
            <p>Join the waitlist and be first to ride with Rido&apos;s shared e-scooters and e-bikes on the Costa del Sol. Zero emissions, zero hassle.</p>
            <p>
              {citiesAnnounced
                ? "Coming soon to Marbella, San Pedro de Alcántara, Cancelada, Estepona, and El Paraíso."
                : "Coming soon to the Costa del Sol — launch cities announced soon."}
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
      <Footer />
      <BackToTop />
    </>
  );
}
