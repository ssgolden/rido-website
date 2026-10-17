"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * True when the visitor asks for reduced motion. `null` on the server and
 * during hydration, so markup never branches on it before the client knows.
 * Prefer CSS (`motion-reduce:` / the media query) where possible; use this
 * only where behaviour, not styling, changes.
 */
export function usePrefersReducedMotion(): boolean | null {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => null
  );
}
