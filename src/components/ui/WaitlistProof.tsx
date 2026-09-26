"use client";

import { useEffect, useState } from "react";

/**
 * WaitlistProof — fetches the live count from the Apps Script web app
 * (GET returns `{count: number}`) and renders it with an avatar stack.
 *
 * When NEXT_PUBLIC_WAITLIST_URL is unset (local dev / static preview), the
 * component renders a no-count version of the kicker instead of fabricating
 * a number. Never displays a fake count.
 */

const WAITLIST_URL = process.env.NEXT_PUBLIC_WAITLIST_URL || "";

const AVATAR_PALETTE = ["#DE0498", "#F23DB5", "#22C55E", "#FDE803", "#8B5CF6"];

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold text-navy"
      style={{
        background: color,
        color: "#0F172A",
        boxShadow: "0 0 0 2px #0F172A",
        marginLeft: "-6px",
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

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

  // Show up to 5 avatar initials from a deterministic pool based on count
  const avatarCount = Math.min(5, count);
  const seeds = ["A", "M", "S", "L", "J"]; // generic — replaced once real avatars exist
  const avatars = seeds.slice(0, avatarCount);

  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-flex items-center" style={{ paddingLeft: "6px" }}>
        {avatars.map((s, i) => (
          <Avatar key={`${s}-${i}`} initials={s} color={AVATAR_PALETTE[i % AVATAR_PALETTE.length]} />
        ))}
      </span>
      <span>{headline}</span>
    </span>
  );
}
