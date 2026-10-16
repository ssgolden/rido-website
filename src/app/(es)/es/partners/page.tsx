import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { SiteShell } from "@/components/layout/SiteShell";
import { Footer } from "@/components/layout/Footer";
import { Partners } from "@/components/sections/Partners";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { OG_LOCALE_EN, OG_LOCALE_ES, SITE_ORIGIN } from "@/lib/site";

export const metadata: Metadata = {
  title: "Colabora con Rido — Opera patinetes compartidos en tu ciudad",
  description:
    "Movilidad compartida llave en mano para ciudades españolas: flota certificada por la DGT, app, seguro y manual de operaciones. Tú pones el equipo local.",
  alternates: {
    canonical: `${SITE_ORIGIN}/es/partners`,
    languages: { en: `${SITE_ORIGIN}/partners`, es: `${SITE_ORIGIN}/es/partners`, "x-default": `${SITE_ORIGIN}/partners` },
  },
  openGraph: {
    title: "Colabora con Rido",
    description: "Movilidad compartida llave en mano para ciudades españolas.",
    url: `${SITE_ORIGIN}/es/partners`,
    locale: OG_LOCALE_ES,
    alternateLocale: [OG_LOCALE_EN],
    images: [{ url: "/images/og/rido-og.jpg", width: 1200, height: 630, alt: "Rido — patinetes y bicis eléctricas compartidas" }],
  },
};

export default function PartnersPageEs() {
  return (
    <LocaleProvider locale="es">
      <SiteShell header={<Navbar />}>
        <main id="main-content">
          <Partners asPage />
        </main>
        <Footer locale="es" />
      </SiteShell>
    </LocaleProvider>
  );
}
