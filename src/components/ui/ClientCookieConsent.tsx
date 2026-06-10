"use client";

import dynamic from "next/dynamic";

const CookieConsent = dynamic(
  () => import("@/components/ui/CookieConsent").then((m) => ({ default: m.CookieConsent })),
  { ssr: false }
);

export function ClientCookieConsent() {
  return <CookieConsent />;
}