"use client";

import { useRef, useEffect } from "react";
import { createNoise2D } from "simplex-noise";
import { useReducedMotion } from "framer-motion";

/**
 * NoiseField — organic, slow-moving noise background.
 * Renders a <canvas> with a procedural noise field tinted in the brand palette.
 * Used for hero atmospheric layers, section dividers, "noise" washes.
 *
 * Falls back to a single static frame when prefers-reduced-motion is set.
 */
export interface NoiseFieldProps {
  width?: number;
  height?: number;
  speed?: number;       // animation speed, 0..1
  scale?: number;       // cell size
  className?: string;
  /** Hex color or rgba for the noise tint. */
  tint?: string;
  /** Base background color (under the noise). */
  base?: string;
  opacity?: number;     // overall canvas opacity
  ariaLabel?: string;
}

export function NoiseField({
  width = 1920,
  height = 1080,
  speed = 0.0008,
  scale = 0.0035,
  className = "",
  tint = "rgba(222, 4, 152, 0.12)",
  base = "rgba(15, 23, 42, 0)",
  opacity = 1,
  ariaLabel,
}: NoiseFieldProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const noise2D = createNoise2D();
    let frame = 0;
    let raf = 0;
    let running = true;

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, width, height);

      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;
      const t = frame * speed;

      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const n = noise2D(x * scale, y * scale + t) * 0.5 + 0.5; // 0..1
          const i = (y * width + x) * 4;
          // Parse tint rgba
          const m = tint.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
          if (m) {
            const r = +m[1], g = +m[2], b = +m[3], a = m[4] ? +m[4] : 1;
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
            data[i + 3] = Math.floor(n * 255 * a);
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);
    };

    if (reduce) {
      draw();
      return;
    }

    const loop = () => {
      if (!running) return;
      draw();
      frame++;
      raf = requestAnimationFrame(loop);
    };
    loop();

    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [width, height, speed, scale, tint, base, reduce]);

  return (
    <canvas
      ref={ref}
      className={className}
      style={{ width: "100%", height: "100%", opacity }}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    />
  );
}

/** Convenience wrapper for hero background use. */
export function HeroNoiseField(props: Omit<NoiseFieldProps, "className" | "width" | "height">) {
  return <NoiseField {...props} className="absolute inset-0 pointer-events-none" />;
}
