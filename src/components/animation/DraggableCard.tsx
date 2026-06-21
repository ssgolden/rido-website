"use client";

import { useRef, type ReactNode } from "react";
import { useDrag } from "@use-gesture/react";
import { useSpring, animated, config } from "@react-spring/web";

/**
 * DraggableCard — drag with elastic snap-back and rotation tracking.
 * Used for product cards, feature blocks, sticker-style CTAs.
 */
export function DraggableCard({
  children,
  className,
  rotationFactor = 0.05,
}: {
  children: ReactNode;
  className?: string;
  rotationFactor?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ x, y, rotateX, rotateY, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    config: config.gentle,
  }));

  useDrag(
    ({ down, movement: [mx, my], velocity: [vx], direction: [dx], target }) => {
      // Don't capture drags that started on a link/button.
      if (target && target !== ref.current && (target as HTMLElement).closest("a, button, input, textarea")) {
        return;
      }
      api.start({
        x: down ? mx : 0,
        y: down ? my : 0,
        rotateX: down ? -my * rotationFactor : 0,
        rotateY: down ? mx * rotationFactor : 0,
        scale: down ? 1.05 : 1,
        immediate: down,
      });
      // Throw on release if fast
      if (!down && vx > 1.5) {
        api.start({
          x: mx + dx * vx * 80,
          y: my + (my !== 0 ? (my > 0 ? 1 : -1) : 0) * vx * 80,
          rotateX: 0,
          rotateY: 0,
          scale: 1,
        });
      }
    },
    { target: ref, filterTaps: true }
  );

  return (
    <animated.div
      ref={ref}
      className={className}
      style={{
        x,
        y,
        rotateX,
        rotateY,
        scale,
        touchAction: "none",
        cursor: "grab",
        willChange: "transform",
      }}
    >
      {children}
    </animated.div>
  );
}
