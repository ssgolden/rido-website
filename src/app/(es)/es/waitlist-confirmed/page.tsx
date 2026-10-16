import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { SiteShell } from "@/components/layout/SiteShell";
import { Footer } from "@/components/layout/Footer";
import { WaitlistConfirmed } from "@/components/sections/WaitlistConfirmed";
import { LocaleProvider } from "@/lib/i18n/locale-context";

/** Double opt-in landing page. Reached only from the confirmation email, so kept out of search. */
export const metadata: Metadata = {
  title: "Lista de espera confirmada — Rido",
  robots: { index: false, follow: false },
};

export default function WaitlistConfirmedPageEs() {
  return (
    <LocaleProvider locale="es">
      <SiteShell header={<Navbar />}>
        <main id="main-content">
          <WaitlistConfirmed />
        </main>
        <Footer locale="es" />
      </SiteShell>
    </LocaleProvider>
  );
}
