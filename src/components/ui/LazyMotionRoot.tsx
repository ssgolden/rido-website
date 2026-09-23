"use client";

import { LazyMotion, domAnimation } from "framer-motion";

/**
 * Loads framer-motion's domAnimation feature pack (~35KB gz) instead of the
 * full bundle (~70KB gz). The landing page doesn't need layout gestures,
 * drag, or projection. Motion components must use the `m.` prefix from
 * framer-motion (`m.div`, `m.section`) inside this provider to opt into the
 * lazy feature set.
 *
 * The full `motion.div` API still works — framer-motion falls back to the
 * full runtime when it detects a feature not in the pack — but every render
 * that uses `m.*` gets the slim bundle.
 */
export function LazyMotionRoot({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
