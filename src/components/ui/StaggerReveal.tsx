"use client";

import { m, useInView, useReducedMotion } from "framer-motion";
import { forwardRef, useRef } from "react";
import { DURATION, EASE, REVEAL, SCROLL_MARGIN, STAGGER } from "@/lib/motion";

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: STAGGER.text },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: REVEAL.y },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.entrance, ease: EASE },
  },
};

const itemVariantsReduced = {
  hidden: { opacity: 0, y: REVEAL.y },
  show: { opacity: 1, y: 0, transition: { duration: 0 } },
};

interface StaggerRevealProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  /** Pause before the first child. Use so a block waits for the heading above it. */
  delay?: number;
}

export function StaggerReveal({
  children,
  className,
  staggerDelay = STAGGER.text,
  delay = 0,
}: StaggerRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: SCROLL_MARGIN });
  const reduce = useReducedMotion();

  // Same element and start state on server and client so hydration matches;
  // reduced motion reveals every child at once with zero-length transitions.
  return (
    <m.div
      ref={ref}
      className={className}
      variants={{
        ...containerVariants,
        show: { transition: reduce ? { staggerChildren: 0, delayChildren: 0 } : { staggerChildren: staggerDelay, delayChildren: delay } },
      }}
      initial="hidden"
      animate={isInView || reduce ? "show" : "hidden"}
    >
      {children}
    </m.div>
  );
}

export const StaggerItem = forwardRef<HTMLDivElement, {
  children: React.ReactNode;
  className?: string;
}>(function StaggerItem({ children, className }, externalRef) {
  const reduce = useReducedMotion();
  return (
    <m.div ref={externalRef} variants={reduce ? itemVariantsReduced : itemVariants} className={className}>
      {children}
    </m.div>
  );
});
