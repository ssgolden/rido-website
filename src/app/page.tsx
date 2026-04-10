import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Vehicles } from "@/components/sections/Vehicles";
import { Cities } from "@/components/sections/Cities";
import { Safety } from "@/components/sections/Safety";
import { Sustainability } from "@/components/sections/Sustainability";
import { Pricing } from "@/components/sections/Pricing";
import { About } from "@/components/sections/About";
import { DownloadCTA } from "@/components/sections/DownloadCTA";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Vehicles />
        <Cities />
        <Safety />
        <Sustainability />
        <Pricing />
        <About />
        <DownloadCTA />
      </main>
      <Footer />
    </>
  );
}