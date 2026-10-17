"use client";

import { useRef } from "react";
import { useScrollFrame } from "@/hooks/useScrollFrame";

/**
 * Thin reading-progress bar at the top of the page. scaleX is written straight
 * to the element once per frame while scrolling: no React re-render.
 * Decorative, so hidden from assistive tech.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollFrame((root) => {
    const max = root.scrollHeight - root.clientHeight;
    if (ref.current) ref.current.style.transform = `scaleX(${max > 0 ? Math.min(1, root.scrollTop / max) : 0})`;
  });
  return <div ref={ref} className="scroll-progress" style={{ transform: "scaleX(0)" }} aria-hidden="true" />;
}
