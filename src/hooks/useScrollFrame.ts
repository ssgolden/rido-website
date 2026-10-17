"use client";

import { useEffect, useRef } from "react";
import { useScrollRootNode } from "@/components/ui/SmoothScrollProvider";

/**
 * Calls `onFrame(root)` at most once per animation frame while the page's
 * scroll lane (#page-scroll) scrolls or resizes, and once on mount. For effects
 * that must read scroll position: write styles straight to elements in the
 * callback rather than setting React state every frame.
 */
export function useScrollFrame(onFrame: (root: HTMLElement) => void) {
  const root = useScrollRootNode();
  const callback = useRef(onFrame);
  useEffect(() => {
    callback.current = onFrame;
  });

  useEffect(() => {
    if (!root) return;
    let frame = 0;
    const run = () => {
      frame = 0;
      callback.current(root);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(run);
    };
    run();
    root.addEventListener("scroll", schedule, { passive: true });
    const ro = new ResizeObserver(schedule);
    ro.observe(root);
    return () => {
      root.removeEventListener("scroll", schedule);
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [root]);
}
