import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { BackToTop } from "@/components/ui/BackToTop";

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

function Divider() {
  return <div className="section-divider max-w-7xl mx-auto" />;
}

export default function Home() {
  return (
    <>
      <Navbar />
      <ScrollProgress />
      <main id="main-content">
        <noscript>
          <div style={{ padding: "2rem", textAlign: "center", color: "#fff" }}>
            <h1>Rido — Shared E-Scooters & E-Bikes in Spain</h1>
            <p>Move freely across Spain with Rido&apos;s shared e-scooters and e-bikes. Download the app, scan, and ride. Zero emissions, zero hassle.</p>
            <p>Available in Marbella, San Pedro de Alcántara, Cancelada, Estepona, and El Paraíso on the Costa del Sol.</p>
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
      <Footer />
      <BackToTop />
    </>
  );
}
