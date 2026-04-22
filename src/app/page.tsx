import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Vehicles } from "@/components/sections/Vehicles";
import { Cities } from "@/components/sections/Cities";
import { Safety } from "@/components/sections/Safety";
import { Sustainability } from "@/components/sections/Sustainability";
import { Pricing } from "@/components/sections/Pricing";
import { FAQ } from "@/components/sections/FAQ";
import { About } from "@/components/sections/About";
import { DownloadCTA } from "@/components/sections/DownloadCTA";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { BackToTop } from "@/components/ui/BackToTop";

function Divider() {
  return <div className="section-divider max-w-7xl mx-auto" />;
}

export default function Home() {
  return (
    <>
      <Navbar />
      <ScrollProgress />
      <main id="main-content">
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
