"use client";

import { useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { readConsent, subscribeConsent } from "@/lib/consent";

// Dynamically import Analytics so it (and its network calls) only loads
// on the client AND only after the user has accepted cookies.
const Analytics = dynamic(
  () => import("@vercel/analytics/react").then((m) => ({ default: m.Analytics })),
  { ssr: false }
);

/**
 * Renders Vercel Analytics only after the user has explicitly accepted
 * cookies (GDPR/ePrivacy). Reacts to the choice in the same tab, so accepting
 * starts it immediately and withdrawing via "Cookie settings" stops it.
 */
export function ConsentAwareAnalytics() {
  const hasConsent = useSyncExternalStore(
    subscribeConsent,
    () => readConsent() === "accepted", // client snapshot
    () => false // SSR snapshot — never load analytics during SSR
  );

  if (!hasConsent) return null;
  return <Analytics />;
}
