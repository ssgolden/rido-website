import { NextResponse, type NextRequest } from "next/server";

/**
 * Pre-launch access gate (Next.js 16 proxy convention).
 *
 * Behavior is controlled by the GATE_PASSWORD environment variable, which
 * lives ONLY in Vercel project settings — never in this (public) repo:
 *   - GATE_PASSWORD unset/empty  → gate OFF, site fully public
 *     (matches GitHub Pages behavior, and is the launch-day switch:
 *     delete the env var and redeploy).
 *   - GATE_PASSWORD set          → every page redirects to /coming-soon
 *     unless the browser carries the access cookie issued by /api/gate.
 *
 * This only runs on a server host (Vercel). The GitHub Pages static export
 * ignores proxies entirely, so the gate is inert there by design.
 */

const COOKIE_NAME = "rido_gate";

/** Paths that stay reachable while the gate is up. */
const OPEN_PREFIXES = ["/coming-soon", "/api/gate", "/api/waitlist"];

async function expectedCookieValue(password: string): Promise<string> {
  const data = new TextEncoder().encode(`rido-gate-v1:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const password = process.env.GATE_PASSWORD;
  if (!password) return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (OPEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  if (cookie && cookie === (await expectedCookieValue(password))) {
    return NextResponse.next();
  }

  const target = new URL("/coming-soon", req.url);
  return NextResponse.redirect(target);
}

export const config = {
  // Gate everything except Next internals and static assets (anything with
  // a file extension: images, fonts, favicon, manifest, robots, sitemap).
  matcher: ["/((?!_next|.*\\..*).*)"],
};
