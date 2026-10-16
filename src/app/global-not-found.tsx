import type { Metadata } from "next";
import { NotFoundView } from "@/components/layout/NotFoundView";
import "./globals.css";

export const metadata: Metadata = {
  title: "Page Not Found — Rido",
  description: "The page you're looking for doesn't exist. Head back to rido.bike.",
  robots: { index: false, follow: true },
};

// Unmatched URLs match no route (and the site has two root layouts), so this
// global 404 owns the whole document (experimental.globalNotFound).
export default function GlobalNotFound() {
  return (
    <html lang="en" className="dark">
      <body className="font-sans overflow-x-hidden bg-rido-navy">
        <NotFoundView locale="en" />
      </body>
    </html>
  );
}
