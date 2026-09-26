import type { Metadata } from "next";
import { ComingSoon } from "./coming-soon-client";
import { OG_LOCALE_EN, SITE_ORIGIN } from "@/lib/site";

export const metadata: Metadata = {
  title: "Rido — Coming Soon to the Costa del Sol",
  description:
    "Shared e-scooters and e-bikes are coming to the Costa del Sol. Join the waitlist and be first to ride when Rido launches.",
  alternates: { canonical: `${SITE_ORIGIN}/coming-soon` },
  openGraph: {
    title: "Rido — Coming Soon to the Costa del Sol",
    description:
      "Shared e-scooters and e-bikes are coming to the Costa del Sol. Join the waitlist.",
    url: `${SITE_ORIGIN}/coming-soon`,
    locale: OG_LOCALE_EN,
  },
};

export default function ComingSoonPage() {
  return <ComingSoon />;
}
