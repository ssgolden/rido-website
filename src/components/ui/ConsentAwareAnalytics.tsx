"use client";

import { useSyncExternalStore } from "react";
import dynamic from "next/dynamic";

const STORAGE_KEY = "rido-cookie-consent";

function readConsent(): boolean {
  try {
    if (typeof window === "undefined") return false;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed.accepted === true;
  } catch {
    return false;
  }
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
      window.addEventListener("storage", callback);
      return () => window.removeEventListener("storage", callback);
    },
    () => readConsent(), // client snapshot
    () => false // SSR snapshot — never load analytics during SSR
  );

  if (!hasConsent) return null;
  return <Analytics />;
}