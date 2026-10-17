"use client";

import { resetConsent } from "@/lib/consent";

/**
 * Footer control to change or withdraw cookie consent (GDPR Art. 7(3):
 * withdrawing must be as easy as giving consent). Clears the stored choice,
 * which stops analytics and shows the banner again.
 */
export function CookieSettingsButton({ label, className }: { label: string; className?: string }) {
  return (
    <button type="button" onClick={resetConsent} className={className}>
      {label}
    </button>
  );
}
