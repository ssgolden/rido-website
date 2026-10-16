"use client";

import { LazyMotion, domAnimation } from "framer-motion";

/**
 * Loads framer-motion's domAnimation feature pack (~35KB gz) instead of the
 * full bundle (~70KB gz). The landing page doesn't need layout gestures,
 * drag, or projection.
 *
 * Every motion component in src/ uses the `m.` prefix (`m.div`, `m.p`) —
 * importing `motion` anywhere pulls the full feature bundle back into the
 * client chunk and silently undoes this saving. Keep it that way.
 *
 * Mounted once in RootDocument around the whole <body> tree. An `m.` element
 * rendered outside this provider gets no features and never leaves its
 * `initial` state (it looks invisible), so anything new in a root layout
 * must sit inside it.
 */
export function LazyMotionRoot({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
