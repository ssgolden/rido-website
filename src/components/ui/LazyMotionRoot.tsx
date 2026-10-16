"use client";

import { LazyMotion } from "framer-motion";

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
 *
 * The features load asynchronously (framer's documented pattern), so they are
 * not in the first-load bundle. Until they arrive, `m.` elements sit at their
 * server-rendered `initial` state, exactly as they do before hydration, so
 * nothing flashes; entrances simply start a moment later.
 */
const loadFeatures = () => import("@/lib/motion-features").then((m) => m.default);

export function LazyMotionRoot({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={loadFeatures}>{children}</LazyMotion>;
}
