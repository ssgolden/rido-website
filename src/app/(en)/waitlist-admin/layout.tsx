import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Waitlist admin — Rido",
  robots: { index: false, follow: false },
};

export default function WaitlistAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
