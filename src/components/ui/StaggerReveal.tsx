"use client";

import { motion, useInView } from "framer-motion";
import { forwardRef, useRef } from "react";
import { DUR, EASE_BRAND } from "@/lib/motion";

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.entrance, ease: EASE_BRAND },
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
  staggerDelay = 0.1,
}: StaggerRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

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