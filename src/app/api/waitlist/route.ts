import { NextResponse, type NextRequest } from "next/server";

/**
 * Waitlist sign-up endpoint (server host only — the GitHub Pages static
 * export excludes API routes via scripts/build.mjs).
 *
 * Every valid submission is logged as structured JSON (visible in Vercel
 * function logs — the durable fallback). When RESEND_API_KEY is set, each
 * sign-up is additionally emailed to NOTIFY_EMAIL (default info@rido.bike).
 */

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL ?? "info@rido.bike";

export async function POST(req: NextRequest): Promise<NextResponse> {
  let email = "";
  let locale = "en";
  try {
    const body = await req.json();
    email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    locale = body?.locale === "es" ? "es" : "en";
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 422 });
  }

  // Durable trace in function logs regardless of email delivery.
  console.log(
    JSON.stringify({ type: "waitlist_signup", email, locale, at: new Date().toISOString() })
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
          subject: `New waitlist sign-up: ${email}`,
          text: `Email: ${email}\nLanguage: ${locale}\nTime: ${new Date().toISOString()}\nSource: rido.bike coming-soon page`,
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
