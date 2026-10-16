"use client";

import { useEffect, useState } from "react";

/**
 * WaitlistProof — fetches the live count from the Apps Script web app
 * (GET returns `{count: number}`) and renders it as plain text.
 *
 * When NEXT_PUBLIC_WAITLIST_URL is unset (local dev / static preview), the
 * component renders a no-count version of the kicker instead of fabricating
 * a number. Never displays a fake count, and no invented avatars either —
 * real rider photos can be added once real riders exist.
 */

const WAITLIST_URL = process.env.NEXT_PUBLIC_WAITLIST_URL || "";

export function WaitlistProof({
  singular,
  plural,
  fallbackKicker,
}: {
  singular: string; // "1 person on the waitlist"
  plural: string; // "{count} people on the waitlist"
  fallbackKicker: string; // "Waitlist now open — be first to ride" (used when URL unset)
}) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!WAITLIST_URL) return;
    let cancelled = false;
    fetch(WAITLIST_URL)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && typeof data.count === "number" && data.count >= 0) {
          setCount(data.count);
        }
      })
      .catch(() => {
        /* backend unreachable — leave null, render fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!WAITLIST_URL || count === null || count === 0) {
    return <span>{fallbackKicker}</span>;
  }

  const headline = count === 1 ? singular.replace("{count}", "1") : plural.replace("{count}", String(count));
  return <span>{headline}</span>;
}
