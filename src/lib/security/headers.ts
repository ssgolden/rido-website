/**
 * Security response headers for the Rido backend.
 *
 * Every public HTTP response from a Rido route handler, middleware,
 * or edge function should include the headers returned by
 * {@link getSecurityHeaders}. Together they implement the standard
 * "defense in depth" baseline:
 *
 *   - Clickjacking protection (`X-Frame-Options` + CSP
 *     `frame-ancestors`).
 *   - MIME-sniffing protection (`X-Content-Type-Options`).
 *   - Legacy XSS auditor opt-in (`X-XSS-Protection`) for the older
 *     browsers that still respect the header.
 *   - Referrer leakage control (`Referrer-Policy`).
 *   - Powerful-feature gating (`Permissions-Policy`).
 *   - TLS enforcement (`Strict-Transport-Security`).
 *   - Inline-script / third-party-script lockdown
 *     (`Content-Security-Policy`).
 *
 * The CSP is generated per call with a fresh random nonce, which
 * lets inline `<script nonce={...}>` blocks (Next.js's hydration
 * scripts, in particular) be allowed individually while keeping
 * every other inline script rejected. The recommended call
 * pattern is:
 *
 * ```ts
 * import { generateNonce, getSecurityHeaders } from "@/lib/security/headers";
 *
 * const nonce = generateNonce();
 * const headers = getSecurityHeaders(nonce);
 * // Pass `nonce` to <Script nonce={nonce}> in your JSX, and
 * // spread `headers` into the response.
 * ```
 *
 * If the caller does not supply a nonce, {@link getSecurityHeaders}
 * mints a fresh one internally. The internally-minted nonce is
 * *not* returned to the caller, however — so callers that need to
 * use the nonce in rendered HTML must mint it themselves via
 * {@link generateNonce} and pass it in.
 *
 * @module src/lib/security/headers
 */

import { randomBytes } from "node:crypto";

// ─── Internal constants ────────────────────────────────────────────────────

/**
 * Number of random bytes used to derive a CSP nonce. 16 bytes
 * (128 bits) is well past the threshold at which the CSP
 * `base64-value` grammar needs to be unguessable in practice; 16
 * bytes also keeps the resulting base64 string short enough to be
 * safely embedded in every `<script>` tag of a typical page.
 */
const NONCE_BYTES = 16;

/**
 * Origin that hosts the Vercel Web Analytics beacon. Listed
 * separately so the two directive lists that need it (`script-src`
 * for the page-load ping and `connect-src` for the XHR beacon)
 * stay in sync. The hostname is the public, documented one from
 * Vercel — it is not customer-specific, so hard-coding it here is
 * safe.
 */
const VERCEL_INSIGHTS_ORIGIN = "https://vitals.vercel-insights.com";

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Determine whether the current process is running in production.
 * Used to decide whether `'unsafe-eval'` is included in the
 * generated CSP: the directive is necessary for `next dev`'s
 * webpack runtime, but should be omitted in production builds
 * where the runtime has been pre-compiled.
 *
 * Reads `process.env.NODE_ENV` directly (rather than going through
 * `getEnv()` from `@/lib/contract`) so this module has no
 * dependency on the rest of the contract. The default is
 * `"development"` to match the Zod schema in `src/lib/contract.ts`.
 *
 * @returns `true` when `NODE_ENV === "production"`, `false`
 *          otherwise.
 */
function isProduction(): boolean {
  return (process.env.NODE_ENV ?? "development") === "production";
}

/**
 * Mint a fresh, cryptographically-random nonce suitable for use
 * as a CSP `script-src` directive. The returned string is the
 * standard-base64 encoding of 16 random bytes — i.e. a
 * `base64-value` per the CSP grammar (W3C CSP3), so it can be
 * used directly inside `'nonce-...'` without further encoding.
 *
 * Callers should generate a *new* nonce for every HTTP response
 * (or at least for every distinct document that needs to mount an
 * inline script). Reusing a nonce across responses would allow
 * an attacker who exfiltrated it once to keep injecting scripts.
 *
 * @returns A 24-character base64 string (no padding stripped).
 */
export function generateNonce(): string {
  return randomBytes(NONCE_BYTES).toString("base64");
}

/**
 * Build the complete Content-Security-Policy string. Exposed
 * separately from {@link getSecurityHeaders} so tests and
 * non-HTTP callers (e.g. a CSP report-only endpoint) can reuse
 * the exact same policy without round-tripping through the
 * headers bag.
 *
 * The policy covers:
 *
 *   - `default-src 'self'` — baseline deny-by-default.
 *   - `script-src` — `'self'`, `'unsafe-inline'` (Next.js
 *     injects inline `<script>` blocks during hydration),
 *     `'nonce-{nonce}'` (the per-request token from
 *     {@link generateNonce}), `'unsafe-eval'` in non-production
 *     (needed by webpack's dev runtime), and the Vercel Web
 *     Analytics endpoint.
 *   - `style-src 'self' 'unsafe-inline'` — Next.js also injects
 *     inline `<style>` blocks; the unsafe-inline directive is
 *     unavoidable in practice. Style nonces are not used here.
 *   - `img-src 'self' data: blob: https:` — Mapbox raster tiles,
 *     OpenStreetMap overlays, and Rido's own CDN are all served
 *     from arbitrary HTTPS origins; locking the directive to
 *     `'self'` would break the map page.
 *   - `font-src 'self' data:` — system fonts plus inline
 *     `data:` URIs (used by the Framer-Motion spinner).
 *   - `connect-src 'self' https://vitals.vercel-insights.com` —
 *     XHR / fetch / WebSocket allowlist, including the Vercel
 *     Web Analytics beacon endpoint.
 *   - `frame-ancestors 'none'` — defence in depth alongside
 *     `X-Frame-Options: DENY`.
 *   - `base-uri 'self'` — prevents an injected `<base>` element
 *     from re-anchoring all relative URLs.
 *   - `form-action 'self'` — prevents injected forms from
 *     posting to attacker-controlled endpoints.
 *   - `object-src 'none'` — kills `<object>`, `<embed>`, and
 *     `<applet>`, the historical Flash / Java vectors.
 *
 * If `CSP_REPORT_URI` is set in the environment (see
 * `src/lib/contract.ts`), a `report-uri` directive is appended
 * so violations land in the configured collector.
 *
 * @param nonce A nonce string, typically the result of
 *              {@link generateNonce}. Must be a `base64-value`
 *              per the CSP grammar; the function does not
 *              validate the input.
 * @param isDev `true` to include `'unsafe-eval'` in
 *              `script-src` (development / `next dev`).
 *              Defaults to `!isProduction()`.
 * @returns The full CSP header value, ready to drop into a
 *          `Content-Security-Policy` response header.
 */
export function buildContentSecurityPolicy(
  nonce: string,
  isDev: boolean = !isProduction(),
): string {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    `'nonce-${nonce}'`,
    ...(isDev ? ["'unsafe-eval'"] : []),
    VERCEL_INSIGHTS_ORIGIN,
  ].join(" ");

  const connectSrc = ["'self'", VERCEL_INSIGHTS_ORIGIN].join(" ");

  const styleSrc = ["'self'", "'unsafe-inline'"].join(" ");

  const imgSrc = ["'self'", "data:", "blob:", "https:"].join(" ");

  const fontSrc = ["'self'", "data:"].join(" ");

  const directives: string[] = [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src ${styleSrc}`,
    `img-src ${imgSrc}`,
    `font-src ${fontSrc}`,
    `connect-src ${connectSrc}`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
  ];

  // The report-uri directive is optional and only present when
  // `CSP_REPORT_URI` is set in the environment. The contract
  // declares it as a URL, so an empty string or whitespace-only
  // value is treated as "unset".
  const reportUri = process.env.CSP_REPORT_URI;
  if (typeof reportUri === "string" && reportUri.trim().length > 0) {
    directives.push(`report-uri ${reportUri.trim()}`);
  }

  return directives.join("; ");
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Build the standard Rido security response headers. The
 * returned bag is suitable for spreading into a `Response`, a
 * `NextResponse`, or any framework-specific response wrapper
 * that accepts a `Record<string, string>`.
 *
 * The Content-Security-Policy header is regenerated on every
 * call, with a fresh nonce minted if one was not supplied. This
 * is intentional: the only safe nonce is one that is
 * unpredictable to the attacker at request time, and reusing a
 * nonce across responses would let any party that exfiltrated
 * it once keep injecting scripts.
 *
 * Usage:
 *
 * ```ts
 * // In a Next.js layout.tsx or middleware.ts:
 * import { generateNonce, getSecurityHeaders } from "@/lib/security/headers";
 *
 * const nonce = generateNonce();
 * const securityHeaders = getSecurityHeaders(nonce);
 *
 * // Return `securityHeaders` as part of the response, and pass
 * // `nonce` to <Script nonce={nonce}> in JSX.
 * ```
 *
 * Or, when the nonce is not needed in rendered HTML (e.g. for a
 * pure JSON API response):
 *
 * ```ts
 * const headers = getSecurityHeaders();
 * // A fresh nonce is generated internally and embedded in the CSP.
 * ```
 *
 * @param nonce Optional. A CSP nonce to embed in `script-src`. If
 *              omitted, a fresh one is generated via
 *              {@link generateNonce}. Callers that need the
 *              nonce in rendered HTML must mint it themselves
 *              and pass it in.
 * @returns A `Record<string, string>` of response headers. The
 *          keys use the canonical mixed-case HTTP spelling
 *          (e.g. `Content-Security-Policy`), which is what every
 *          Node / Edge runtime expects.
 */
export function getSecurityHeaders(nonce?: string): Record<string, string> {
  const effectiveNonce = nonce ?? generateNonce();
  const isDev = !isProduction();

  return {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(self)",
    "Strict-Transport-Security":
      "max-age=31536000; includeSubDomains; preload",
    "Content-Security-Policy": buildContentSecurityPolicy(
      effectiveNonce,
      isDev,
    ),
  };
}
