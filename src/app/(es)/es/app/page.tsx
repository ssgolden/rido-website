import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { SiteShell } from "@/components/layout/SiteShell";
import { Footer } from "@/components/layout/Footer";
import { AppRedirect } from "@/components/sections/AppRedirect";
import { LocaleProvider } from "@/lib/i18n/locale-context";

/** Spanish twin of /app (smart link): phones are sent to their store. Kept out of search. */
export const metadata: Metadata = {
  title: "Descarga la app de Rido",
  description: "Descarga Rido en el App Store o Google Play. Patinetes eléctricos compartidos, ya en Torrevieja.",
  robots: { index: false, follow: true },
  alternates: { languages: { en: "/app", es: "/es/app" } },
};

export default function AppPageEs() {
  return (
    <LocaleProvider locale="es">
      <SiteShell header={<Navbar />}>
        <main id="main-content">
          <AppRedirect locale="es" />
        </main>
        <Footer locale="es" />
      </SiteShell>
    </LocaleProvider>
  );
}
