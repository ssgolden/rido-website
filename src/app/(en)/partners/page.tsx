import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { SiteShell } from "@/components/layout/SiteShell";
import { Footer } from "@/components/layout/Footer";
import { Partners } from "@/components/sections/Partners";
import { OG_LOCALE_EN, OG_LOCALE_ES, SITE_ORIGIN } from "@/lib/site";

export const metadata: Metadata = {
  title: "Partner with Rido — Run shared e-scooters in your city",
  description:
    "Turnkey shared mobility for Spanish cities: DGT-certified fleet, rider app, insurance and operations playbook. You bring the local team.",
  alternates: {
    canonical: `${SITE_ORIGIN}/partners`,
    languages: { en: `${SITE_ORIGIN}/partners`, es: `${SITE_ORIGIN}/es/partners`, "x-default": `${SITE_ORIGIN}/partners` },
  },
  openGraph: {
    title: "Partner with Rido",
    description: "Turnkey shared mobility for Spanish cities.",
    url: `${SITE_ORIGIN}/partners`,
    locale: OG_LOCALE_EN,
    alternateLocale: [OG_LOCALE_ES],
    images: [{ url: "/images/og/rido-og.jpg", width: 1200, height: 630, alt: "Rido — shared e-scooters and e-bikes" }],
  },
};

export default function PartnersPage() {
  return (
    <SiteShell header={<Navbar />}>
      <main id="main-content">
        <Partners asPage />
      </main>
      <Footer />
    </SiteShell>
  );
}
