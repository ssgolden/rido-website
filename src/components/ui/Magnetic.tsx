"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";

/**
 * Magnetic — wraps a primary CTA so it subtly attracts toward the cursor.
 *
 * - Active ONLY on `(pointer: fine)` devices (mouse/trackpad) — never touch.
 * - Off under prefers-reduced-motion (checked at pointer time, so server and
 *   client HTML always match).
 * - Transform-only (translate) written straight to the element, eased by a CSS
 *   transition: zero layout shift and no React re-render per pointer move.
 * - Purely presentational wrapper: the child keeps all of its own semantics,
 *   focus behavior, and event handlers.
 */

const MAX_PULL_PX = 8;

interface MagneticProps {
  children: ReactNode;
  /** Layout classes for the wrapper. Defaults to a shrink-wrapped inline-block. */
  className?: string;
}

export function Magnetic({ children, className = "inline-block" }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    const update = () => {
      enabled.current = mq.matches;
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!enabled.current || !el) return;
    const rect = el.getBoundingClientRect();
    const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    const clamp = (v: number) => Math.max(-1, Math.min(1, v)) * MAX_PULL_PX;
    el.style.translate = `${clamp(relX)}px ${clamp(relY)}px`;
  };

  const settle = () => {
    if (ref.current) ref.current.style.translate = "";
  };

  return (
    <div
      ref={ref}
      className={`${className} transition-[translate] duration-200 ease-out`}
      onPointerMove={handlePointerMove}
      onPointerLeave={settle}
      onPointerCancel={settle}
    >
      {children}
    </div>
  );
}
