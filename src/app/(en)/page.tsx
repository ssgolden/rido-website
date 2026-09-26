import dynamic from "next/dynamic";
import { citiesAnnounced } from "@/data/cities";
import { Navbar } from "@/components/layout/Navbar";
import { SiteShell } from "@/components/layout/SiteShell";
import { Hero } from "@/components/sections/Hero";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { BackToTop } from "@/components/ui/BackToTop";

/**
 * Placeholder shown while a dynamic chunk is being fetched. Mirrors the real
 * section's vertical footprint so layout doesn't shift when content lands
 * (CLS prevention on slow networks).
 */
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

function Divider() {
  return <div className="section-divider max-w-7xl mx-auto" />;
}

export default function Home() {
  return (
    <SiteShell header={<Navbar />}>
      <ScrollProgress />
      <main id="main-content">
        <noscript>
          <div style={{ padding: "2rem", textAlign: "center", color: "#fff" }}>
            <h1>Rido — Shared E-Scooters & E-Bikes in Spain</h1>
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
    </SiteShell>
  );
}
