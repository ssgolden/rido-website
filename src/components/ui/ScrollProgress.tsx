"use client";

import { m, useScroll } from "framer-motion";
import { useScrollContainerRef } from "@/components/ui/SmoothScrollProvider";

/**
 * Thin reading-progress bar at the top of the page. Driven by a framer motion
 * value as a GPU transform (scaleX): no React re-render and no layout read per
 * scroll event. Decorative, so hidden from assistive tech.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll({ container: useScrollContainerRef() });
  return <m.div className="scroll-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />;
}
