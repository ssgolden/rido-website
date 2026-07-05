"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: React.ReactNode;
  before: string;
  highlight: string;
  after?: string;
  as?: "h1" | "h2";
  className?: string;
  highlightClass?: string;
  stagger?: number;
}

const wordVariants = {
  hidden: { opacity: 0, filter: "blur(10px)", y: 20 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

function AnimatedWord({ text, className }: { text: string; className?: string }) {
  return (
    <motion.span
      className={cn("inline-block will-change-transform", className)}
      variants={wordVariants}
    >
      {text}
    </motion.span>
  );
}

function WordGroup({
  text,
  highlight,
  after,
  highlightClass = "text-gradient-brand",
}: {
  text: string;
  highlight: string;
  after?: string;
  highlightClass?: string;
}) {
  const beforeWords = text.trim().split(" ");
  const highlightWords = highlight.trim().split(" ");
  const afterWords = after?.trim().split(" ") ?? [];

  return (
    <>
      {beforeWords.map((w, i) => (
        <span key={`b-${i}`} className="inline-block mr-[0.25em]">
          <AnimatedWord text={w} />
        </span>
      ))}
      {highlightWords.map((w, i) => (
        <AnimatedWord key={`h-${i}`} text={w} className={cn("mr-[0.25em]", highlightClass)} />
      ))}
      {afterWords.map((w, i) => (
        <span key={`a-${i}`} className="inline-block mr-[0.25em]">
          <AnimatedWord text={w} />
        </span>
      ))}
    </>
  );
}

export function SectionHeading({
  eyebrow,
  before,
  highlight,
  after,
  as: Tag = "h2",
  className,
  highlightClass,
  stagger,
}: SectionHeadingProps) {
  const shouldReduce = useReducedMotion();

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger ?? 0.08,
      },
    },
  };

  if (shouldReduce) {
    const fullText = [before, highlight, after].filter(Boolean).join(" ");
    return (
      <>
        {eyebrow && (
          <p className="text-rido-magenta-light text-sm font-semibold uppercase tracking-wider mb-3">{eyebrow}</p>
        )}
        <Tag className={className}>{fullText}</Tag>
      </>
    );
  }

  return (
    <>
      {eyebrow && (
        <motion.p
          className="text-rido-magenta-light text-sm font-semibold uppercase tracking-wider mb-3"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          {eyebrow}
        </motion.p>
      )}
      <Tag className={cn("inline-block", className)}>
        <motion.span
          className="inline-flex flex-wrap justify-center"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          aria-label={[before, highlight, after].filter(Boolean).join(" ")}
        >
          <WordGroup
            text={before}
            highlight={highlight}
            after={after}
            highlightClass={highlightClass}
          />
        </motion.span>
      </Tag>
    </>
  );
}
