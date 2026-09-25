"use client";

import { MotionConfig } from "framer-motion";

/**
 * Applies the visitor's reduced-motion preference to every framer-motion
 * component (menus, dialogs, banners, FAQ accordion, tab indicator) without
 * each one having to gate itself. Looping/scroll-driven animations are still
 * gated explicitly with usePrefersReducedMotion() per the project rules.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
