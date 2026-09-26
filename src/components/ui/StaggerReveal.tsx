"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
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

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={{
        ...containerVariants,
        show: { transition: { staggerChildren: staggerDelay, delayChildren: delay } },
      }}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
    >
      {children}
    </motion.div>
  );
}

export const StaggerItem = forwardRef<HTMLDivElement, {
  children: React.ReactNode;
  className?: string;
}>(function StaggerItem({ children, className }, externalRef) {
  return (
    <motion.div ref={externalRef} variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
});
