import { NextResponse, type NextRequest } from "next/server";
import { EMAIL_RE } from "@/lib/email";

/**
 * Waitlist sign-up endpoint (server host only — the GitHub Pages static
 * export excludes API routes via scripts/build.mjs).
 *
 * Every valid submission is logged as structured JSON (visible in Vercel
 * function logs — the durable fallback). When RESEND_API_KEY is set, each
 * sign-up is additionally emailed to NOTIFY_EMAIL (default info@rido.bike).
 */

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL ?? "info@rido.bike";

export async function POST(req: NextRequest): Promise<NextResponse> {
  let email = "";
  let locale = "en";
  let honeypot = "";
  try {
    const body = await req.json();
    email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    locale = body?.locale === "es" ? "es" : "en";
    honeypot = typeof body?.company === "string" ? body.company.trim() : "";
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  // Honeypot field real visitors never see: answer like a success, store nothing.
  if (honeypot) return NextResponse.json({ ok: true });

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
          text: `Email: ${email}\nLanguage: ${locale}\nTime: ${new Date().toISOString()}\nSource: rido.bike waitlist form`,
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
