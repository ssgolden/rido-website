/**
 * CSRF (Cross-Site Request Forgery) token helpers for the Rido
 * backend.
 *
 * CSRF is the threat model where a malicious site causes a
 * logged-in user's browser to submit a request to Rido that the
 * user did not intend. The standard mitigation is a per-session
 * secret that the attacker cannot read (because of the
 * same-origin policy) embedded in a form or header on every
 * state-changing request. This module is the canonical place to
 * mint, verify, and read that secret.
 *
 * The token is delivered to the server in a `x-rido-csrf-token`
 * custom header (see {@link getCsrfTokenFromHeaders}). The
 * server compares the value in the header on every
 * state-changing request to a per-session value it has stored
 * elsewhere (in a signed cookie, a Redis blob, or a database
 * row). The actual per-session storage is *not* the concern of
 * this module — it exports pure helpers that the storage layer
 * composes.
 *
 * Why a custom header rather than a hidden form field or a
 * double-submit cookie:
 *
 *   1. The browser will not let a cross-origin attacker *set*
 *      a custom request header without a successful CORS
 *      preflight, and our CORS layer in `./cors` rejects
 *      everything except the production allowlist. So just the
 *      act of *sending* `x-rido-csrf-token` from a browser
 *      proves the request was either same-origin or
 *      pre-authorised by us.
 *   2. The header travels with `fetch`, `XMLHttpRequest`, and
 *      modern `<form>` submissions (via the `FormData`
 *      enctype), so we do not need a parallel form-field code
 *      path.
 *   3. The verification is identical across HTML forms and
 *      JavaScript callers, which keeps the surface area small.
 *
 * The constant-time comparison in {@link verifyCsrfToken} is
 * non-negotiable: a naive `===` compare returns as soon as it
 * finds a mismatched byte, which leaks the position of the
 * first mismatch through the response time. Node's
 * `crypto.timingSafeEqual` runs in time proportional to the
 * buffer length regardless of the byte values, closing the
 * side channel.
 *
 * @module src/lib/security/csrf
 */

import { randomBytes, timingSafeEqual } from "node:crypto";

// ─── Internal constants ────────────────────────────────────────────────────

/**
 * Number of random bytes used to derive a CSRF token. 32 bytes
 * (256 bits) is the conventional choice for a session-bound
 * secret: it is well past the threshold where brute-force
 * guessing is a practical concern, and the resulting 64-char
 * hex string is short enough to round-trip through cookies,
 * headers, and form fields without bloating the request.
 */
const CSRF_TOKEN_BYTES = 32;

/**
 * The header name used to carry the CSRF token on every
 * state-changing request. Lower-case because the Fetch spec
 * says header names are case-insensitive, and the `Headers` API
 * in both the browser and Node does the right thing with
 * either case. Exported so callers and tests can refer to the
 * single source of truth.
 */
export const CSRF_HEADER = "x-rido-csrf-token";

// ─── Public API: token minting ─────────────────────────────────────────────

/**
 * Mint a fresh, cryptographically-random CSRF token. The
 * returned string is the hex encoding of 32 random bytes, i.e.
 * 64 hex characters, drawn from `crypto.randomBytes` (CSPRNG;
 * suitable for security purposes).
 *
 * The hex encoding is chosen over base64 because:
 *
 *   - It is URL-safe without further escaping.
 *   - It has only one canonical case (HTTP headers are
 *     case-insensitive, but cookies and form fields are
 *     case-sensitive — a hex token survives both equally).
 *   - It round-trips through HTML attributes and JSON without
 *     triggering any quote-escape rules.
 *
 * The caller is responsible for storing the returned token
 * against the user's session and presenting it back to the
 * client (typically in a `meta` tag, an HttpOnly cookie, or a
 * dedicated API endpoint). The storage layer is out of scope
 * for this module.
 *
 * @returns A 64-character hex string. Each call returns a
 *          freshly-minted value with no relationship to any
 *          previous or future value.
 */
export function generateCsrfToken(): string {
  return randomBytes(CSRF_TOKEN_BYTES).toString("hex");
}

// ─── Public API: token verification ────────────────────────────────────────

/**
 * Compare a candidate CSRF token against the expected
 * per-session value, in **constant time**.
 *
 * The constant-time guarantee is provided by Node's
 * `crypto.timingSafeEqual`, which runs in time proportional to
 * the buffer length regardless of the byte values. This closes
 * the timing side channel that a naive `===` or
 * `Buffer.compare` would expose.
 *
 * Edge cases:
 *
 *   - Either input is not a string → `false`. The function
 *     does not throw on type mismatches because the call site
 *     is typically a hot path that should fail closed (return
 *     `false`) rather than 500 the request.
 *   - Either input is the empty string → `false`. Same
 *     reasoning as the type-mismatch path.
 *   - The two strings have different lengths → `false`. This
 *     *does* leak the length of the expected token, but the
 *     expected token's length is fixed at 64 characters (see
 *     {@link generateCsrfToken}), so the leak carries no
 *     information. Padding to a fixed length and comparing
 *     would only add complexity without closing a real
 *     channel.
 *
 * @param token    The candidate token, typically pulled from
 *                 the `x-rido-csrf-token` request header via
 *                 {@link getCsrfTokenFromHeaders}.
 * @param expected The expected per-session token, typically
 *                 loaded from the user's session blob.
 * @returns `true` iff the two values are byte-for-byte
 *          identical. Always constant-time with respect to the
 *          byte values, conditional on the inputs having the
 *          same length.
 */
export function verifyCsrfToken(
  token: string | null | undefined,
  expected: string | null | undefined,
): boolean {
  if (typeof token !== "string" || typeof expected !== "string") return false;
  if (token.length === 0 || expected.length === 0) return false;
  if (token.length !== expected.length) return false;

  const a = Buffer.from(token, "utf8");
  const b = Buffer.from(expected, "utf8");

  // `Buffer.from` of two UTF-8 strings with the same code-point
  // count will produce the same byte length *unless* one string
  // contains multi-byte characters that the other does not. Two
  // equal-length hex strings (the only form
  // {@link generateCsrfToken} produces) always encode to the
  // same byte length, so this guard is unreachable in practice
  // — but it is cheap and makes the function safe to call with
  // arbitrary user input. `timingSafeEqual` throws on
  // mismatched lengths, so the guard is also required for
  // correctness, not just style.
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

// ─── Public API: header extraction ─────────────────────────────────────────

/**
 * Read the `x-rido-csrf-token` request header and return its
 * value as a string. The function accepts both the
 * platform-standard `Headers` instance and a plain
 * `Record<string, string | string[]>` shape, so it works
 * uniformly for:
 *
 *   - `NextRequest.headers` (a `Headers` instance),
 *   - raw `Request.headers` in the Edge runtime, and
 *   - in-memory record shapes from unit tests.
 *
 * The `Headers` path is the production path: the Web Fetch
 * spec says `Headers.get` is case-insensitive, so the caller
 * does not have to know the canonical case of the header
 * name. The record path is case-sensitive on the key, which
 * matches what `headers["..."]` would do in JavaScript.
 *
 * @param headers A `Headers`-like object, or a
 *                `Record<string, string | string[] | undefined>`.
 *                `null` and `undefined` are accepted and
 *                produce `null`.
 * @returns The header value, or `null` if the header is
 *          absent. The value is returned as-is (no trim, no
 *          case folding) so the caller can compare it
 *          byte-for-byte against the expected token.
 */
export function getCsrfTokenFromHeaders(
  headers:
    | Headers
    | Record<string, string | string[] | undefined>
    | null
    | undefined,
): string | null {
  if (!headers) return null;

  // `Headers` instances have a `get` method; plain records do
  // not. Branching on the method's presence is more reliable
  // than `instanceof Headers`, which fails in environments
  // with multiple `Headers` copies (e.g. a bundler that pulls
  // in a polyfill).
  if (typeof (headers as Headers).get === "function") {
    return (headers as Headers).get(CSRF_HEADER);
  }

  const value = (headers as Record<string, string | string[] | undefined>)[
    CSRF_HEADER
  ];
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}
