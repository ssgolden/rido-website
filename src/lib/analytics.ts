import { readConsent } from "@/lib/consent";

/**
 * Consent-gated conversion events.
 *
 * Events go to our own endpoint (`/api/events`, served by
 * netlify/functions/events.mjs on www.rido.bike), which stores anonymous
 * daily counts: event name, placement, locale and page path. No cookies, no
 * identifiers, no IP or user agent. Nothing is sent unless the visitor
 * accepted the consent banner (same `rido-cookie-consent` entry that gates
 * Vercel Analytics).
 *
 * On hosts without the endpoint (GitHub Pages mirror, local dev) the request
 * fails silently.
 */

export type AnalyticsEvent =
  | "waitlist_view"
  | "waitlist_submit"
  | "waitlist_success"
  | "waitlist_error"
  | "share_click";

/** Where on the page the form or button sits, so placements can be compared. */
export type Placement = "hero" | "closing" | "city-hero" | "confirmed";

const EVENTS_URL = "/api/events";

export function hasAnalyticsConsent(): boolean {
  return readConsent() === "accepted";
}

export function track(event: AnalyticsEvent, props: { placement: Placement; locale: string; detail?: string }): void {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return;
  const body = JSON.stringify({ event, path: window.location.pathname, ...props });
  try {
    if (navigator.sendBeacon?.(EVENTS_URL, new Blob([body], { type: "application/json" }))) return;
  } catch {
    // Fall through to fetch.
  }
  fetch(EVENTS_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
}
