/**
 * Rido Middleware (Next.js Proxy).
 *
 * This file is the SINGLE middleware entry point for the Rido app. It
 * composes two formerly-separate concerns that parallel agents built in
 * isolation:
 *
 *   1. **Auth / route protection** (originally `src/middleware.ts`,
 *      owned by agent #2). Handles:
 *      - `/admin/*` page routes require an `admin` role; non-admins are
 *        redirected to `/login?error=forbidden`.
 *      - `/api/admin/*` endpoints also require `admin` but return a
 *        401 JSON response (per the contract error envelope) instead
 *        of a redirect.
 *      - Session attachment — every request that carries a valid
 *        session gets the user projected onto it via the
 *        `x-rido-user` request header, so downstream Server
 *        Components / Route Handlers can skip the `getServerSession`
 *        round-trip when they only need the user id.
 *
 *   2. **Locale routing** (originally `src/middleware-i18n.ts`, owned
 *      by the i18n agent). Built on `next-intl`'s `createMiddleware`.
 *      Handles:
 *      - Detecting the user's preferred locale from `Accept-Language`
 *        and the `NEXT_LOCALE` cookie.
 *      - Rewriting the request path so the matched locale is on
 *        `x-next-intl-locale` for Server Components and Route
 *        Handlers to read.
 *      - Redirecting un-prefixed paths to the correct prefix when
 *        the user requests a non-default locale. With
 *        `localePrefix: 'as-needed'`, the default locale (`es`)
 *        stays un-prefixed, while `en` gets a `/en/...` prefix.
 *
 * Why one middleware, not two?
 *
 *   Next.js 16 allows exactly ONE `middleware.ts` / `proxy.ts` entry
 *   point per project. We compose the two handlers here in a single
 *   function: auth runs FIRST (admin/api-admin path matching and
 *   user attachment are security-critical, and locale routing is
 *   irrelevant for protected routes), then the i18n handler
 *   processes the remaining public paths. The `config.matcher` is
 *   the union of the two halves' matchers, so both halves see the
 *   paths they need to act on.
 *
 * Next.js 16 note: the "middleware" concept is renamed to "Proxy"
 * in Next 16. The conventional filename becomes `src/proxy.ts`
 * exporting a `proxy` function. The function below is named
 * `middleware` (and the file is named `middleware.ts`) per the
 * project convention — renaming is a follow-up.
 *
 * @module src/middleware
 */

import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import createMiddleware from "next-intl/middleware";

import { defaultLocale, localePrefix, locales } from "@/lib/i18n/config";
import { getEnv } from "@/lib/contract";

// ─── Constants ─────────────────────────────────────────────────────────────

/** Custom header used to forward the decoded user to downstream handlers. */
export const USER_HEADER = "x-rido-user";

/** Custom header used to forward the request id (matches the contract). */
export const REQUEST_ID_HEADER = "x-rido-request-id";

/**
 * Name of the cookie that holds the NextAuth JWT. Matches the value
 * set by `src/lib/auth/config.ts` — the cookie name differs in
 * production (where the `__Secure-` prefix is required) vs.
 * development (where it is not).
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

// ─── i18n routing config (the source of truth) ─────────────────────────────

/**
 * The next-intl routing config, kept as a single source of truth
 * so the matching `next-intl/navigation` helpers (used by the
 * `<Link>` wrapper and `useRouter`/`usePathname` re-exports) can
 * import the same object and stay in sync.
 */
export const routing = {
  locales,
  defaultLocale,
  localePrefix,
} as const;

/**
 * The actual i18n middleware, created via `next-intl/middleware`.
 * Exposed (in addition to being invoked from the composite
 * `middleware` below) for tests and for any code path that wants
 * to apply locale routing to a request in isolation.
 */
export const i18nMiddleware = createMiddleware(routing);

// ─── Auth helpers ──────────────────────────────────────────────────────────

/**
 * Read the session JWT from the incoming request.
 *
 * Returns `null` when the user is not signed in OR the token is invalid /
 * expired. Never throws.
 *
 * @param req The Next.js request object.
 * @returns The decoded Rido JWT, or `null`.
 */
export async function readToken(req: NextRequest): Promise<RidoJwt | null> {
  // `getToken` accepts a `NextRequest` directly. We re-read the
  // secret on every call (the contract caches it) so that env
  // changes during dev don't leave the middleware pointing at a
  // stale secret.
  const secret = getEnv().AUTH_SECRET;
  const token = await getToken({ req, secret, cookieName: SESSION_COOKIE_NAME });
  return (token as RidoJwt | null) ?? null;
}

/**
 * Build a 401 / 403 JSON response in the standard contract envelope.
 *
 * @param code The error code (`"UNAUTHORIZED"` → 401, `"FORBIDDEN"` → 403).
 * @param message Human-readable error message.
 * @returns A `NextResponse` carrying the JSON envelope with the
 *          appropriate HTTP status.
 */
export function unauthorizedJson(
  code: "UNAUTHORIZED" | "FORBIDDEN",
  message: string,
): NextResponse {
  return NextResponse.json(
    {
      ok: false,
      error: { code, message },
    },
    { status: code === "UNAUTHORIZED" ? 401 : 403 },
  );
}

/**
 * Attach the decoded user to the outgoing request headers.
 *
 * The header is JSON-serialised so we can carry more than a single id
 * without inventing a new header per field. Downstream code can read it via
 * `req.headers.get("x-rido-user")` and `JSON.parse(...)`.
 *
 * @param req The incoming request.
 * @param user The decoded JWT payload.
 * @returns A `NextResponse.next()` with the user header attached.
 */
export function attachUser(req: NextRequest, user: RidoJwt): NextResponse {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(USER_HEADER, JSON.stringify(user));

  // Forward a request id (matches the standard contract header). Re-use the
  // incoming value if the upstream edge already set one.
  const existingId = req.headers.get(REQUEST_ID_HEADER);
  if (!existingId) {
    requestHeaders.set(REQUEST_ID_HEADER, cryptoRandomId());
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

/**
 * Generate a small random request id. Uses `crypto.randomUUID()` (RFC 4122
 * v4) which is available in the Next.js Edge runtime and the Node runtime.
 */
function cryptoRandomId(): string {
  // `globalThis.crypto` is the Web Crypto API, present in both runtimes.
  return globalThis.crypto.randomUUID();
}

// ─── Middleware handler ────────────────────────────────────────────────────

/**
 * Next.js middleware entry point.
 *
 * Behaviour by path:
 *   - `/api/admin/*`     — require session with `role === "admin"`; non-admins
 *                          are rejected with a 401 / 403 JSON response
 *                          (per the contract error envelope). Locale
 *                          routing is **not** applied to these paths.
 *   - `/admin/*`         — same as above but redirect (not JSON) for
 *                          unauthenticated or non-admin users. Locale
 *                          routing is **not** applied to these paths
 *                          either, so `/admin/...` is a stable URL
 *                          that does not get prefixed with `/en/`.
 *   - everything else    — fall through to the i18n handler, which
 *                          applies locale detection, rewrites, and
 *                          redirects. If a session is present, the
 *                          user is also attached to the request
 *                          headers before the response is returned.
 *
 * The function is intentionally tiny — all policy lives in the
 * helpers above so the matcher rules are easy to audit.
 *
 * @param req The incoming Next.js request.
 * @returns A `NextResponse` from either the auth path or the i18n path.
 */
export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname, search } = req.nextUrl;

  // /api/admin/*: JSON 401 / 403 instead of a redirect, per the
  // contract. Locale routing is irrelevant here — API routes are
  // not localised — so we apply the auth gate and return.
  if (pathname.startsWith("/api/admin/")) {
    const token = await readToken(req);
    if (!token) return unauthorizedJson("UNAUTHORIZED", "Sign-in required");
    if (token.role !== "admin") {
      return unauthorizedJson("FORBIDDEN", "Admin role required");
    }
    return attachUser(req, token);
  }

  // /admin/*: redirect to /login?error=forbidden for unauthenticated
  // or non-admin users. We use a redirect (not a JSON 401) because
  // these are page routes, not API endpoints. Locale routing is
  // intentionally skipped so the admin console URL stays stable
  // across locales.
  if (pathname.startsWith("/admin/")) {
    const token = await readToken(req);
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname + search);
      return NextResponse.redirect(loginUrl);
    }
    if (token.role !== "admin") {
      const forbiddenUrl = new URL("/login", req.url);
      forbiddenUrl.searchParams.set("error", "forbidden");
      return NextResponse.redirect(forbiddenUrl);
    }
    return attachUser(req, token);
  }

  // For all other paths, run the i18n handler (locale detection /
  // prefixing / redirect). If a session is also present, attach the
  // user to the request headers on the way out so downstream
  // Server Components can read it without re-decoding the JWT.
  const i18nResponse = i18nMiddleware(req);
  const token = await readToken(req);
  if (token) {
    // Re-attach the user header on top of the i18n response. We
    // can't use `attachUser()` here because that helper returns
    // `NextResponse.next()`, not the i18n-rewritten response.
    i18nResponse.headers.set(USER_HEADER, JSON.stringify(token));
    const existingId = req.headers.get(REQUEST_ID_HEADER);
    if (!existingId && !i18nResponse.headers.get(REQUEST_ID_HEADER)) {
      i18nResponse.headers.set(REQUEST_ID_HEADER, cryptoRandomId());
    }
  }
  return i18nResponse;
}

// ─── Matcher ───────────────────────────────────────────────────────────────

/**
 * Matcher config — the union of the auth matchers and the i18n
 * matchers. The two halves were authored by different agents;
 * the i18n half deliberately excludes `/admin`, `/_next`, and
 * static files (the standard next-intl recommended pattern), and
 * the auth half explicitly targets the protected paths. Combined
 * here so a single `middleware.ts` handles both concerns.
 *
 *   - `/admin/:path*`          — auth gate, no i18n
 *   - `/api/admin/:path*`      — auth gate (JSON 401), no i18n
 *   - `/api/auth/:path*`       — i18n (locales) + user header
 *                                 attachment. (The auth routes are
 *                                 themselves not localised; we let
 *                                 i18n see them so the response is
 *                                 rewritten with the matched
 *                                 locale, which is the recommended
 *                                 next-intl default.)
 *   - Everything else (public
 *     pages)                   — i18n only
 */
export const config = {
  matcher: [
    // Auth-gated paths. These short-circuit before the i18n
    // handler runs (see the `middleware` function above).
    "/admin/:path*",
    "/api/admin/:path*",

    // Public / non-admin paths — the next-intl recommended
    // matcher, plus an explicit entry for `/` so locale
    // detection kicks in for the root.
    //
    // The negative lookahead skips:
    //   - `api`        — the API routes are not localised.
    //   - `_next`      — Next.js internals.
    //   - `_vercel`    — Vercel internals.
    //   - `.*\..*`     — files containing a dot (assets, images,
    //                    favicons). The middleware would not
    //                    meaningfully act on them anyway.
    "/((?!api|_next|_vercel|.*\\..*).*)",
    "/",
  ],
};
