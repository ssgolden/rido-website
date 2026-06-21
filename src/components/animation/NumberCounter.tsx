"use client";

import { useState } from "react";
import { useSpring, animated, config } from "@react-spring/web";
import { useReducedMotion } from "framer-motion";

/**
 * Format a numeric value for display using Intl.
 * Pure function — safe to call on server and client.
 */
function formatNumber(n: number, format: string): string {
  return Math.round(n).toLocaleString(format);
}

/**
 * NumberCounter — spring-physics number ticker.
 * R3F-style spring smoothing for organic-feeling count-up animations.
 *
 * SSR-safe: the rendered children are always plain strings (never a
 * react-spring Interpolation object), so Next.js' static export step
 * does not choke with
 *   "Objects are not valid as a React child (found: object with keys {...})".
 *
 * Strategy: subscribe to the spring with an `onChange` callback that
 * writes the formatted string into React state. The server renders the
 * final value (matches initial state); the client animates from 0 (or
 * the final value when reduced motion is requested).
 *
 * Usage:
 *   <NumberCounter value={1200} format="en-US" />
 */
export function NumberCounter({
  value,
  format = "en-US",
  className,
  prefix = "",
  suffix = "",
}: {
  value: number;
  duration?: number;
  format?: string;
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  const reduce = useReducedMotion();

  // When motion is reduced, start at the final value so SSR + client match
  // and no animation runs.
  const initial = reduce ? value : 0;

  const [display, setDisplay] = useState<string>(() => formatNumber(initial, format));

  useSpring({
    from: { number: initial },
    to: { number: value },
    config: { ...config.default, tension: 60, friction: 22 },
    delay: reduce ? 0 : 100,
    onChange: (result) => {
      // result.value is the current animated number; write a formatted
      // string into React state so we render plain text (no Interpolation
      // object leaking into the React tree during SSR).
      const n = (result.value as { number: number }).number;
      setDisplay(formatNumber(n, format));
    },
  });

  return (
    <span className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/**
 * FloatingElement — slow vertical bob with spring physics.
 * Use for decorative icons, badges, orbs.
 */
export function FloatingElement({
  children,
  amplitude = 12,
  duration = 3000,
  className,
}: {
  children: React.ReactNode;
  amplitude?: number;
  duration?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const styles = useSpring({
    from: { y: 0 },
    to: async (next: (step: Record<string, unknown>) => Promise<void>) => {
      if (reduce) {
        await next({ y: 0 });
        return;
      }
      while (true) {
        await next({ y: -amplitude, config: { tension: 40, friction: 8 } });
        await next({ y: amplitude, config: { tension: 40, friction: 8 } });
      }
    },
    config: { duration },
  });
  return (
    <animated.div className={className} style={styles}>
      {children}
    </animated.div>
  );
}
