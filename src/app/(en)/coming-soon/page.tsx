import type { Metadata } from "next";
import { ComingSoon } from "./coming-soon-client";
import { OG_LOCALE_EN, SITE_ORIGIN } from "@/lib/site";

export const metadata: Metadata = {
  title: "Rido — Coming Soon to Torrevieja & the Costa del Sol",
  description:
    "Shared e-scooters and e-bikes are launching in Torrevieja in the coming weeks, with the Costa del Sol to follow. Join the waitlist and be first to ride.",
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_ORIGIN}/coming-soon` },
  openGraph: {
    title: "Rido — Coming Soon to Torrevieja & the Costa del Sol",
    description:
      "Shared e-scooters and e-bikes are launching in Torrevieja in the coming weeks. Join the waitlist.",
    url: `${SITE_ORIGIN}/coming-soon`,
    locale: OG_LOCALE_EN,
  },
};

export default function ComingSoonPage() {
  return <ComingSoon />;
}
