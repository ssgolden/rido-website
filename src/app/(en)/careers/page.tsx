import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { Briefcase } from "lucide-react";
import { OG_LOCALE_EN, SITE_ORIGIN } from "@/lib/site";

export const metadata: Metadata = {
  title: "Careers — Rido",
  description:
    "Rido is launching shared e-scooters and e-bikes on the Costa del Sol. No roles are listed right now. Send a CV to info@rido.bike with the subject Careers.",
  alternates: { canonical: `${SITE_ORIGIN}/careers` },
  openGraph: {
    title: "Careers — Rido",
    description:
      "No roles are listed right now. Rido is launching on the Costa del Sol. Send a CV to info@rido.bike with the subject Careers.",
    url: `${SITE_ORIGIN}/careers`,
    locale: OG_LOCALE_EN,
  },
};

export default function CareersPage() {
  return (
    <LegalPage title="Careers">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
              { "@type": "ListItem", position: 2, name: "Careers", item: `${SITE_ORIGIN}/careers` },
            ],
          }),
        }}
      />
      <section id="careers" aria-label="Careers">
        <div className="legal-highlight">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="w-5 h-5 text-rido-magenta shrink-0" aria-hidden="true" />
            <h2 className="!mt-0 !mb-0 text-white font-bold">No open roles right now</h2>
          </div>
          <p className="!mb-0">
            Rido is launching shared e-scooters and e-bikes on the Costa del Sol. We are not listing any roles yet.
          </p>
        </div>
        <p>
          If you still want to send a CV, email{" "}
          <a href="mailto:info@rido.bike?subject=Careers" className="cursor-pointer">
            info@rido.bike
          </a>{" "}
          with the subject line Careers.
        </p>
      </section>
    </LegalPage>
  );
}
