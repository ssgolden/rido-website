"use client";

import { motion, useInView, type HTMLMotionProps } from "framer-motion";
import { forwardRef, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

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

type StaggerRevealProps = Omit<HTMLMotionProps<"div">, "variants" | "initial" | "animate"> & {
  children: React.ReactNode;
  staggerDelay?: number;
};

export function StaggerReveal({
  children,
  className,
  staggerDelay = STAGGER.text,
  ...rest
}: StaggerRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: SCROLL_MARGIN });
  const reduce = usePrefersReducedMotion();

  if (reduce) {
    return (
      <div className={className} {...(rest as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      {...rest}
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

type StaggerItemProps = Omit<HTMLMotionProps<"div">, "variants"> & {
  children: React.ReactNode;
};

/** Forwards every other prop (aria-*, id, role…) to the rendered element. */
export const StaggerItem = forwardRef<HTMLDivElement, StaggerItemProps>(function StaggerItem(
  { children, ...rest },
  externalRef
) {
  return (
    <motion.div ref={externalRef} variants={itemVariants} {...rest}>
      {children}
    </motion.div>
  );
});
