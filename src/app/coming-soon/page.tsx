import type { Metadata } from "next";
import { ComingSoon } from "./coming-soon-client";

export const metadata: Metadata = {
  title: "Rido — Coming Soon to the Costa del Sol",
  description:
    "Shared e-scooters and e-bikes are coming to the Costa del Sol. Join the waitlist and be first to ride when Rido launches.",
  alternates: { canonical: "https://rido.bike/coming-soon" },
  openGraph: {
    title: "Rido — Coming Soon to the Costa del Sol",
    description:
      "Shared e-scooters and e-bikes are coming to the Costa del Sol. Join the waitlist.",
    url: "https://rido.bike/coming-soon",
  },
};

export default function ComingSoonPage() {
  return <ComingSoon />;
}
