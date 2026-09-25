import type { Metadata } from "next";
import { WaitlistAdmin } from "./waitlist-admin-client";

// Operator-only utility page: never indexed, never linked, no canonical.
export const metadata: Metadata = {
  title: "Waitlist Admin — Rido",
  description: "Operator utility for exporting locally captured waitlist emails.",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: "https://rido.bike/waitlist-admin" },
};

export default function WaitlistAdminPage() {
  return <WaitlistAdmin />;
}
