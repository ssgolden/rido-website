import { NextResponse, type NextRequest } from "next/server";

/**
 * Team-access endpoint for the pre-launch gate. Accepts the password,
 * sets the HttpOnly access cookie the proxy checks, and never reveals
 * whether the gate is even configured. See src/proxy.ts for the design.
 */

const COOKIE_NAME = "rido_gate";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function expectedCookieValue(password: string): Promise<string> {
  const data = new TextEncoder().encode(`rido-gate-v1:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const gatePassword = process.env.GATE_PASSWORD;

  let submitted = "";
  try {
    const body = await req.json();
    submitted = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Small constant delay narrows the brute-force and timing surface.
  await new Promise((r) => setTimeout(r, 400));

  if (!gatePassword || !submitted || !timingSafeEqual(submitted, gatePassword)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, await expectedCookieValue(gatePassword), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}
