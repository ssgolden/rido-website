import type { CSSProperties } from "react";
import { DURATION } from "@/lib/motion";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
}

/**
 * Fades and slides its content in when it scrolls into view.
 *
 * Pure markup plus CSS (globals.css [data-reveal]): no client JavaScript of
 * its own, so it works inside server components. One shared observer
 * (RevealObserver, mounted in RootDocument) sets `data-shown` when the block
 * enters the viewport. Content is only hidden once that observer is ready
 * (the `reveal-ready` class), so it stays visible without JavaScript, and
 * reduced motion shows everything immediately.
 */
export function ScrollReveal({ children, className, delay = 0, direction = "up", duration = DURATION.entrance }: ScrollRevealProps) {
  const style = { "--reveal-delay": `${delay}s`, "--reveal-duration": `${duration}s` } as CSSProperties;
  return (
    <div data-reveal={direction} className={className} style={style}>
      {children}
    </div>
  );
}
