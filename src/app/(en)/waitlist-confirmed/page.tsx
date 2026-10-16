import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { SiteShell } from "@/components/layout/SiteShell";
import { Footer } from "@/components/layout/Footer";
import { WaitlistConfirmed } from "@/components/sections/WaitlistConfirmed";

/** Double opt-in landing page. Reached only from the confirmation email, so kept out of search. */
export const metadata: Metadata = {
  title: "Waitlist confirmed — Rido",
  robots: { index: false, follow: false },
};

export default function WaitlistConfirmedPage() {
  return (
    <SiteShell header={<Navbar />}>
      <main id="main-content">
        <WaitlistConfirmed />
      </main>
      <Footer />
    </SiteShell>
  );
}
