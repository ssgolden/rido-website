"use client";

import { useSyncExternalStore } from "react";
import dynamic from "next/dynamic";

import { CONSENT_EVENT, readConsentRecord } from "@/lib/consent";

function readConsent(): boolean {
  return readConsentRecord()?.accepted === true;
}

// Dynamically import Analytics so it (and its network calls) only loads
// on the client AND only after the user has accepted cookies.
const Analytics = dynamic(
  () => import("@vercel/analytics/react").then((m) => ({ default: m.Analytics })),
  { ssr: false }
);

/**
 * Renders Vercel Analytics only after the user has explicitly accepted
 * cookies. This satisfies GDPR/ePrivacy requirements for the EU (Spain).
 */
export function ConsentAwareAnalytics() {
  const hasConsent = useSyncExternalStore(
    // Subscribe to storage events so consent changes are picked up.
    (callback) => {
      // "storage" only fires in OTHER tabs; CONSENT_EVENT covers this tab.
      window.addEventListener("storage", callback);
      window.addEventListener(CONSENT_EVENT, callback);
      return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener(CONSENT_EVENT, callback);
      };
    },
    () => readConsent(), // client snapshot
    () => false // SSR snapshot — never load analytics during SSR
  );

  if (!hasConsent) return null;
  return <Analytics />;
}