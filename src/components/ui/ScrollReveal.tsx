"use client";

import { m, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { DURATION, EASE, REVEAL, SCROLL_MARGIN } from "@/lib/motion";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = DURATION.entrance,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: SCROLL_MARGIN });
  const reduce = useReducedMotion();

  const directionOffset = {
    up: { y: REVEAL.y },
    down: { y: -REVEAL.y },
    left: { x: REVEAL.x },
    right: { x: -REVEAL.x },
    none: {},
  };

  // Same element and start state on server and client (useReducedMotion() is
  // null during SSR), so hydration always matches. Reduced motion shows the
  // content immediately with a zero-length transition — nothing moves.
  const shown = isInView || Boolean(reduce);
  return (
    <m.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...directionOffset[direction] }}
      animate={shown ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...directionOffset[direction] }}
      transition={reduce ? { duration: 0 } : { duration, delay, ease: EASE }}
    >
      {children}
    </m.div>
  );
}
