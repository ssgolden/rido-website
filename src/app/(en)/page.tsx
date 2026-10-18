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
import { SITE_ORIGIN } from "@/lib/site";

// Homepage canonical and language pair. Kept here, not in the root layout, so
// other English pages never inherit the homepage canonical by accident.
export const metadata: Metadata = {
  alternates: {
    canonical: SITE_ORIGIN,
    languages: { en: SITE_ORIGIN, es: `${SITE_ORIGIN}/es`, "x-default": SITE_ORIGIN },
  },
};

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
const FAQ = dynamic(() => import("@/components/sections/FAQ").then((m) => ({ default: m.FAQ })), { loading });
const Footer = dynamic(() => import("@/components/layout/Footer").then((m) => ({ default: m.Footer })), { loading });


export default function Home() {
  return (
    <SiteShell header={<Navbar />}>
      <ScrollProgress />
      <main id="main-content">
        <JsonLd schemas={getHomeSchemas("en")} />
        <noscript>
          <div style={{ padding: "2rem", textAlign: "center", color: "#fff" }}>
            <h1>Rido — Shared E-Scooters & E-Bikes in Torrevieja & the Costa del Sol</h1>
            <p>Join the waitlist and be first to ride with Rido&apos;s shared e-scooters and e-bikes. Zero emissions, zero hassle.</p>
            <p>Launching in Torrevieja on the Costa Blanca in the coming weeks, with the Costa del Sol to follow.</p>
          </div>
        </noscript>
        {/* Order: Hero → How it works → Fleet → Launch map → Safety → FAQ → Waitlist. Keep the Navbar links in sync. */}
        <Hero t={heroCopy.en} image={heroImage} />
        <HowItWorks t={howItWorksCopy.en} phone={phoneCopy.en} />
        <Vehicles t={vehiclesCopy.en} fleet={getFleet("en")} />
        <Launch locale="en" />
        <Safety locale="en" />
        <FAQ t={faqCopy.en} items={faqItemsByLocale.en} />
        <DownloadCTA locale="en" />
      </main>
      <Footer />
      <BackToTop />
    </SiteShell>
  );
}
