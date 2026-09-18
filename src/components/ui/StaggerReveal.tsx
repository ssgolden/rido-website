"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { forwardRef, useRef } from "react";
import { EASE, SCROLL_MARGIN, STAGGER } from "@/lib/motion";

const EASE_TUPLE = EASE as unknown as [number, number, number, number];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: STAGGER.text },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_TUPLE },
  },
};

interface StaggerRevealProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerReveal({
  children,
  className,
  staggerDelay = STAGGER.text,
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
        show: { transition: { staggerChildren: staggerDelay } },
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
