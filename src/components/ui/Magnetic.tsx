"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";

/**
 * Magnetic — wraps a primary CTA so it subtly attracts toward the cursor.
 *
 * - Active ONLY on `(pointer: fine)` devices (mouse/trackpad) — never touch.
 * - Disabled entirely under prefers-reduced-motion: children render unchanged.
 * - Transform-only (translate), so there is zero layout shift.
 * - Gentle spring pulls toward the pointer (max ±8px) and settles back on leave.
 * - Purely presentational wrapper: the child keeps all of its own semantics,
 *   focus behavior, and event handlers.
 */

const MAX_PULL_PX = 8;
// Gentle spring — settles in ~200ms, no overshoot wobble (micro-interaction budget).
const SPRING = { stiffness: 150, damping: 15, mass: 0.1 };

interface MagneticProps {
  children: ReactNode;
  /** Layout classes for the wrapper. Defaults to a shrink-wrapped inline-block. */
  className?: string;
}

export function Magnetic({ children, className = "inline-block" }: MagneticProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [finePointer, setFinePointer] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING);
  const springY = useSpring(y, SPRING);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFinePointer(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Reduced motion: render children untouched — no wrapper transform at all.
  if (reduceMotion) return <>{children}</>;

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!finePointer || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    x.set(Math.max(-1, Math.min(1, relX)) * MAX_PULL_PX);
    y.set(Math.max(-1, Math.min(1, relY)) * MAX_PULL_PX);
  };

  const settle = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onPointerMove={handlePointerMove}
      onPointerLeave={settle}
      onPointerCancel={settle}
    >
      {children}
    </motion.div>
  );
}
