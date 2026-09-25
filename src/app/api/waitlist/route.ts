import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

/**
 * Waitlist sign-up endpoint (server host only — the GitHub Pages static
 * export excludes API routes via scripts/build.mjs).
 *
 * Every valid submission is logged as structured JSON with the address
 * redacted (only a short hash is kept for de-duplication in log searches).
 * When RESEND_API_KEY is set, each sign-up is emailed to NOTIFY_EMAIL
 * (default info@rido.bike).
 */

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL ?? "info@rido.bike";

const Body = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .regex(/^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/, "invalid_email"),
  locale: z.enum(["en", "es"]).catch("en"),
});

// Best-effort per-instance rate limit: 5 sign-ups per IP per 10 minutes.
// Serverless instances do not share memory, so this bounds a single hot
// instance; use the platform WAF for a hard limit.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // crude memory cap
  return false;
}

async function shortHash(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest).slice(0, 6))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Same-origin only: browsers always send Origin on cross-site POSTs.
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.nextUrl.host) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 422 });
  }
  const { email, locale } = parsed.data;

  // Durable trace in function logs without storing the address itself.
  console.log(
    JSON.stringify({ type: "waitlist_signup", emailHash: await shortHash(email), locale, at: new Date().toISOString() })
  );

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM ?? "Rido Waitlist <onboarding@resend.dev>",
          to: [NOTIFY_EMAIL],
          subject: "New waitlist sign-up",
          text: `Email: ${email}\nLanguage: ${locale}\nTime: ${new Date().toISOString()}\nSource: rido.bike`,
        }),
      });
      if (!resp.ok) {
        console.error(`resend_error status=${resp.status}`);
      }
    } catch (err) {
      console.error(`resend_error ${err instanceof Error ? err.message : "unknown"}`);
      // Sign-up is still recorded in logs; don't fail the visitor.
    }
  }

  return NextResponse.json({ ok: true });
}
