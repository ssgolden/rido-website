import type { Metadata } from "next";
import { ComingSoon } from "./coming-soon-client";
import { copyrightYear, isStaticExport } from "@/lib/site";

export const metadata: Metadata = {
  title: "Rido — Coming Soon to the Costa del Sol",
  description:
    "Shared e-scooters and e-bikes are coming to the Costa del Sol. Join the waitlist and be first to ride when Rido launches.",
  // Gate/holding page: never compete with the homepage for the brand query.
  robots: { index: false, follow: true },
  alternates: { canonical: "https://rido.bike" },
  openGraph: {
    title: "Rido — Coming Soon to the Costa del Sol",
    description:
      "Shared e-scooters and e-bikes are coming to the Costa del Sol. Join the waitlist.",
    url: "https://rido.bike/coming-soon",
  },
};

export default function ComingSoonPage() {
  // The team-access form posts to /api/gate, which only exists on a server
  // host; the static export excludes API routes, so hide the form there.
  return <ComingSoon gateAvailable={!isStaticExport} year={copyrightYear} />;
}
