/**
 * Rido Proxy (Next.js 16 `proxy.ts` convention, formerly middleware).
 *
 * Gates ONLY the admin surfaces:
 *   - `/api/admin/*` — 401 / 403 JSON per the contract envelope.
 *   - `/admin/*`     — redirect unauthenticated / non-admin users to `/`.
 *
 * Public routes must NEVER enter this proxy — the matcher is the safety
 * guarantee. Any failure here (missing env, bad rewrite) would otherwise
 * take down every page on the site.
 *
 * Reads `process.env.AUTH_SECRET` directly; if it is missing the request
 * is treated as unauthenticated (denied). This file must never throw.
 */

import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/** Header used to forward the decoded user to downstream handlers. */
const USER_HEADER = "x-rido-user";

/**
 * Name of the cookie that holds the NextAuth JWT. The `__Secure-` prefix
 * is required in production, absent in development.
 */
const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

/** Type for the JWT payload we read from the cookie. */
interface RidoJwt {
  id?: string;
  role?: "user" | "admin";
  city?: string | null;
  email?: string | null;
  name?: string | null;
  picture?: string | null;
}

/**
 * Read the session JWT from the incoming request. Returns `null` when the
 * user is not signed in, the token is invalid / expired, or AUTH_SECRET is
 * unset. Never throws.
 */
async function readToken(req: NextRequest): Promise<RidoJwt | null> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  try {
    const token = await getToken({
      req,
      secret,
      cookieName: SESSION_COOKIE_NAME,
    });
    return (token as RidoJwt | null) ?? null;
  } catch {
    return null;
  }
}

/** Build a 401 / 403 JSON response in the standard contract envelope. */
function errorJson(
  code: "UNAUTHORIZED" | "FORBIDDEN",
  message: string,
): NextResponse {
  return NextResponse.json(
    { ok: false, error: { code, message } },
    { status: code === "UNAUTHORIZED" ? 401 : 403 },
  );
}

/**
 * Attach the decoded user to the outgoing request headers (JSON-serialised)
 * so downstream handlers can read it without re-decoding the JWT.
 */
function attachUser(req: NextRequest, user: RidoJwt): NextResponse {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(USER_HEADER, JSON.stringify(user));
  return NextResponse.next({ request: { headers: requestHeaders } });
}

/**
 * Proxy entry point. Only ever sees `/admin/*` and `/api/admin/*`
 * (see `config.matcher` below).
 */
export async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const token = await readToken(req);

  // /api/admin/*: JSON 401 / 403 instead of a redirect, per the contract.
  if (pathname.startsWith("/api/admin")) {
    if (!token) return errorJson("UNAUTHORIZED", "Sign-in required");
    if (token.role !== "admin") {
      return errorJson("FORBIDDEN", "Admin role required");
    }
    return attachUser(req, token);
  }

  // /admin/*: page routes — send unauthenticated / non-admin users home.
  if (!token || token.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return attachUser(req, token);
}

/** Admin surfaces only — public pages must never enter the proxy. */
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
