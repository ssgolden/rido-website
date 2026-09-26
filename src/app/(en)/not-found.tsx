import type { Metadata } from "next";
import { NotFoundView } from "@/components/layout/NotFoundView";

export const metadata: Metadata = {
  title: "Page Not Found — Rido",
  description: "The page you're looking for doesn't exist. Head back to rido.bike.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundView locale="en" />;
}
