"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

/**
 * Hydration-safe replacement for framer-motion's `useReducedMotion()`.
 *
 * framer's hook returns `null` on the server but `true` on the very first
 * client render, so any component that returns a *different element tree*
 * for reduced motion produces a hydration mismatch for every reduced-motion
 * visitor (React 19 then discards the server DOM and re-renders the root).
 *
 * `useSyncExternalStore` guarantees the hydration render uses the server
 * snapshot (`false`); React then re-renders once with the real preference.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
}
