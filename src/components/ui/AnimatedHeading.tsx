"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type AnimatedHeadingProps = {
  text: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span" | "p";
  className?: string;
  variant?: "chars" | "words";
  stagger?: number;
  duration?: number;
  once?: boolean;
  blurAmount?: number;
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};

const wordContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    filter: "blur(10px)",
    y: 20,
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
  },
};

export function AnimatedHeading({
  text,
  as: Tag = "h2",
  className,
  variant = "chars",
  stagger,
  duration = 0.5,
  once = true,
  blurAmount = 10,
}: AnimatedHeadingProps) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return <Tag className={className}>{text}</Tag>;
  }

  const parts = variant === "words" ? text.split(" ") : text.split("");

  const container = variant === "words" ? wordContainerVariants : containerVariants;
  const customStagger = stagger !== undefined ? { ...container, visible: { ...container.visible, transition: { ...container.visible.transition, staggerChildren: stagger } } } : container;

  return (
    <Tag className={cn("inline-block", className)}>
      <motion.span
        className="inline-flex flex-wrap"
        variants={customStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: "-50px" }}
        aria-label={text}
      >
        {parts.map((part, i) => {
          const isSpace = part === " ";
          if (variant === "words" && i < parts.length - 1) {
            return (
              <motion.span
                key={`${part}-${i}`}
                className="inline-block will-change-transform"
                variants={{
                  hidden: { opacity: 0, filter: `blur(${blurAmount}px)`, y: 20 },
                  visible: { opacity: 1, filter: "blur(0px)", y: 0 },
                }}
                transition={{ duration, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {part}
                <span className="inline-block">&nbsp;</span>
              </motion.span>
            );
          }

          if (isSpace) {
            return (
              <span key={`space-${i}`} className="inline-block">
                &nbsp;
              </span>
            );
          }

          return (
            <motion.span
              key={`${part}-${i}`}
              className="inline-block will-change-transform"
              variants={{
                hidden: { opacity: 0, filter: `blur(${blurAmount}px)`, y: 20 },
                visible: { opacity: 1, filter: "blur(0px)", y: 0 },
              }}
              transition={{ duration, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {part}
            </motion.span>
          );
        })}
      </motion.span>
    </Tag>
  );
}
