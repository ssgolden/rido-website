import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { SiteShell } from "@/components/layout/SiteShell";
import { Footer } from "@/components/layout/Footer";
import { AppRedirect } from "@/components/sections/AppRedirect";

/** Smart link (QR codes, stickers, bios): phones are sent to their store. Kept out of search. */
export const metadata: Metadata = {
  title: "Get the Rido app",
  description: "Download Rido on the App Store or Google Play. Shared e-scooters, live now in Torrevieja.",
  robots: { index: false, follow: true },
  alternates: { languages: { en: "/app", es: "/es/app" } },
};

export default function AppPage() {
  return (
    <SiteShell header={<Navbar />}>
      <main id="main-content">
        <AppRedirect locale="en" />
      </main>
      <Footer />
    </SiteShell>
  );
}
