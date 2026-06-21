"use client";

import { useEffect, useState } from "react";
import { useCountUp } from "@/hooks/useCountUp";

/**
 * WaitlistCounter — client-only counter for the hero social-proof kicker.
 *
 * Strategy:
 * - SSR/initial render: shows the static base count (1,200).
 * - On client mount: reads `rido.waitlist.count` from localStorage. If absent,
 *   seeds it with a small offset based on visit timestamp so the displayed
 *   number grows organically (1200 + minutes-since-2026-01-01).
 * - Each subsequent mount bumps the stored count by 1 and re-renders.
 * - Animates the count change via the existing `useCountUp` hook.
 */
const STORAGE_KEY = "rido.waitlist.count";
const BASE_COUNT = 1200;
const EPOCH = new Date("2026-01-01T00:00:00Z").getTime();

function readCount(): number {
  if (typeof window === "undefined") return BASE_COUNT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const n = parseInt(raw, 10);
      if (Number.isFinite(n) && n >= BASE_COUNT) return n;
    }
  } catch {
    /* localStorage disabled (private mode, quota, etc.) */
  }
  // Seed: base + minutes since epoch (mod 48 so it stays bounded).
  const minutes = Math.floor((Date.now() - EPOCH) / 60000);
  const seed = BASE_COUNT + (minutes % 48);
  try {
    window.localStorage.setItem(STORAGE_KEY, String(seed));
  } catch {
    /* ignore */
  }
  return seed;
}

function bumpCount(): number {
  if (typeof window === "undefined") return BASE_COUNT;
  try {
    const current = readCount();
    const next = current + 1;
    window.localStorage.setItem(STORAGE_KEY, String(next));
    return next;
  } catch {
    return BASE_COUNT;
  }
}

export function WaitlistCounter({ className }: { className?: string }) {
  const [count, setCount] = useState<number>(BASE_COUNT);
  // useCountUp animates from 0 -> `count` once mounted + in view.
  const { count: displayed, ref, visible } = useCountUp(count, { duration: 1400 });

  useEffect(() => {
    // Hydrate from localStorage, then bump so each visit increments by 1.
    const initial = readCount();
    const bumped = bumpCount();
    // Defer to a microtask so we don't trigger a cascading-render warning.
    queueMicrotask(() => setCount(bumped > initial ? bumped : initial));
  }, []);

  return (
    <span ref={ref} className={className} style={{ opacity: visible ? 1 : 1 }} suppressHydrationWarning>
      {displayed.toLocaleString("en-US")}
      <span aria-hidden>+</span>
      <span className="sr-only"> and growing</span>
    </span>
  );
}