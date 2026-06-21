"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "framer-motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export interface SplitTextOptions {
  /** Selector or element to split. */
  target: string | Element;
  /** Split type: chars, words, lines, or a combination. */
  type?: "chars,words" | "chars" | "words" | "lines" | "chars,words,lines";
  /** Tag name for each fragment. Default: span. */
  tagName?: string;
  /** Class added to each fragment. */
  className?: string;
  /** Add aria-label on the wrapper for screen readers. */
  ariaLabel?: string;
}

export type SplitTextInstance = {
  chars?: HTMLElement[];
  words?: HTMLElement[];
  lines?: HTMLElement[];
  revert: () => void;
};

let _SplitText: unknown = null;

async function getSplitText(): Promise<unknown> {
  if (_SplitText) return _SplitText;
  // Premium GSAP plugin — load lazily to keep initial bundle small.
  const mod = await import("gsap/SplitText");
  _SplitText = (mod as { SplitText: unknown }).SplitText;
  gsap.registerPlugin(_SplitText as Parameters<typeof gsap.registerPlugin>[0]);
  return _SplitText;
}

/**
 * SplitText — Splits text into chars/words/lines for staggered animation.
 * Premium GSAP plugin; loaded on demand.
 *
 * Usage:
 *   const ref = useRef<HTMLDivElement>(null);
 *   useGSAP(() => {
 *     const split = splitText({ target: ref.current!, type: "chars,words" });
 *     gsap.from(split.chars, { opacity: 0, y: 20, stagger: 0.02 });
 *     return () => split.revert();
 *   }, { scope: ref });
 */
export async function splitText(opts: SplitTextOptions): Promise<SplitTextInstance> {
  const SplitText = (await getSplitText()) as new (target: Element | string, vars?: Record<string, unknown>) => {
    chars?: HTMLElement[];
    words?: HTMLElement[];
    lines?: HTMLElement[];
    revert: () => void;
  };
  const inst = new SplitText(opts.target, {
    type: opts.type ?? "chars,words",
    tagName: opts.tagName ?? "span",
    ...(opts.className ? { [opts.className]: true } : {}),
  });
  if (opts.ariaLabel) {
    const el = typeof opts.target === "string" ? document.querySelector(opts.target) : opts.target;
    el?.setAttribute("aria-label", opts.ariaLabel);
  }
  return inst;
}

export { gsap, ScrollTrigger, useGSAP, useReducedMotion };
