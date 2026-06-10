/**
 * CORS (Cross-Origin Resource Sharing) helpers for the Rido
 * backend.
 *
 * Rido is a single-page Next.js app served from `rido.bike` and
 * `www.rido.bike`; the only legitimate cross-origin callers of
 * the JSON API are those two origins. Every other origin must be
 * rejected at the CORS layer, both for defence in depth and to
 * prevent accidental data leakage through misconfigured reverse
 * proxies.
 *
 * The allowlist is read from the `ALLOWED_ORIGINS` environment
 * variable, which is a comma-separated list of fully-qualified
 * origins (e.g. `"https://rido.bike,https://www.rido.bike"`).
 * The full schema is defined in `src/lib/contract.ts`; the
 * default value is the production allowlist.
 *
 * The two exported functions split the responsibility cleanly:
 *
 *   - {@link isOriginAllowed} is a pure, side-effect-free
 *     predicate that takes the `allowed` value as a parameter
 *     (so tests do not need to mutate `process.env`).
 *   - {@link getCorsHeaders} is the ergonomic one-shot helper
 *     that reads the env, runs the check, and returns a
 *     ready-to-spread header bag.
 *
 * The match is **exact** (per the contract spec). Origin
 * comparisons in CORS are inherently exact — the browser sends
 * the full `scheme + host + port` string, and the allowlist
 * must match that string verbatim. Subdomain wildcards, regex
 * matches, and similar are not supported and are deliberately
 * not implemented here: every well-known CORS bypass in the
 * wild started as a "we'll just allow `*.rido.bike`" shortcut.
 *
 * @module src/lib/security/cors
 */

// ─── Public types ──────────────────────────────────────────────────────────

/**
 * The full set of CORS response headers produced by
 * {@link getCorsHeaders}. The four keys are exactly the four
 * keys the spec calls for: ACAO for simple responses, plus the
 * preflight trio (methods, headers, max-age).
 *
 * `Access-Control-Allow-Credentials` is intentionally *not* in
 * this set: when the Rido API is consumed from a first-party
 * origin (the standard case) credentials are not needed, and
 * exposing the `*` wildcard in `Allow-Origin` is mutually
 * exclusive with `Allow-Credentials: true` per the Fetch spec.
 * Callers that need credentialed CORS should set the header
 * manually.
 */
export interface CorsHeaders {
  /** Origin allowlist response. Empty string means "deny". */
  "Access-Control-Allow-Origin": string;
  /** Preflight: which HTTP verbs the API supports. */
  "Access-Control-Allow-Methods": string;
  /** Preflight: which request headers the API will accept. */
  "Access-Control-Allow-Headers": string;
  /** Preflight: how long the result may be cached, in seconds. */
  "Access-Control-Max-Age": string;
}

// ─── Public API: predicate ─────────────────────────────────────────────────

/**
 * Check whether `origin` is on the allowlist described by
 * `allowed`. The match is **exact**: an origin must equal one
 * of the parsed entries, character for character, including
 * scheme, host, and (where present) port.
 *
 * The `allowed` parameter accepts either the raw env-var string
 * (comma-separated) or a pre-parsed array. This dual shape lets
 * the production caller stay terse
 * (`isOriginAllowed(origin, process.env.ALLOWED_ORIGINS)`) and
 * the test caller stay explicit
 * (`isOriginAllowed(origin, ["https://rido.bike"])`) without
 * either side having to do parsing.
 *
 * The function is pure: it does not read the environment, does
 * not perform I/O, and does not throw. The caller is
 * responsible for supplying a sane `allowed` value.
 *
 * Edge cases:
 *
 *   - `origin` is `null` / `undefined` / empty string → `false`.
 *     An attacker that can suppress the `Origin` header is
 *     treated as if the header were missing, which on the
 *     server side is the deny-by-default path.
 *   - `allowed` is `null` / `undefined` / empty string → `false`.
 *     No allowlist means deny everything.
 *   - Entries in `allowed` are trimmed of surrounding
 *     whitespace; empty entries (from a stray `","` in the env)
 *     are dropped.
 *   - Comparison is case-sensitive on the scheme and host. This
 *     matches the Fetch spec, which lower-cases the host but
 *     preserves the scheme's case. The standard convention in
 *     the wild is to write allowlist entries in lower-case
 *     scheme, which means a case-sensitive compare is the
 *     "do what I mean" behaviour for normal config files.
 *
 * @param origin  The `Origin` request header value. Typically
 *                a fully-qualified URL like
 *                `"https://rido.bike"`. `null` and `undefined`
 *                are accepted and always return `false`.
 * @param allowed The allowlist, either as the raw
 *                `ALLOWED_ORIGINS` env value (comma-separated)
 *                or as a `string[]`. `null` and `undefined`
 *                are accepted and always return `false`.
 * @returns `true` iff `origin` matches one of the parsed
 *          entries exactly.
 */
export function isOriginAllowed(
  origin: string | null | undefined,
  allowed: string | readonly string[] | null | undefined,
): boolean {
  if (typeof origin !== "string" || origin.length === 0) return false;
  if (allowed === null || allowed === undefined) return false;

  const list: readonly string[] = Array.isArray(allowed)
    ? (allowed as readonly string[])
    : splitCsv(allowed as string);

  if (list.length === 0) return false;

  for (const entry of list) {
    if (typeof entry === "string" && entry === origin) return true;
  }
  return false;
}

// ─── Public API: header builder ────────────────────────────────────────────

/**
 * Build the CORS response headers for a given request `Origin`.
 *
 * The function reads `ALLOWED_ORIGINS` from the environment
 * itself, so the call site is a single line:
 *
 * ```ts
 * const headers = getCorsHeaders(req.headers.get("origin"));
 * response.headers.set("Access-Control-Allow-Origin", headers["Access-Control-Allow-Origin"]);
 * // ...or simply spread `headers` into a NextResponse.
 * ```
 *
 * When `origin` is on the allowlist, `Access-Control-Allow-Origin`
 * echoes the origin back (the Fetch spec's only valid value for
 * a dynamic allowlist; `*` is *not* used). When `origin` is
 * *not* on the allowlist, `Access-Control-Allow-Origin` is set
 * to the empty string, which makes the response fail the CORS
 * check on the client side.
 *
 * The other three keys are always populated: they apply to
 * preflight `OPTIONS` responses, which the browser sends
 * regardless of whether the eventual simple request will be
 * allowed. Their values are:
 *
 *   - `Allow-Methods` — the full set of HTTP verbs the Rido
 *     API supports.
 *   - `Allow-Headers` — `Content-Type`, `Authorization`,
 *     `X-Requested-With`, and the two `x-rido-*` custom
 *     headers from `@/lib/contract`.
 *   - `Max-Age` — 24 hours, the maximum the spec allows in
 *     practice. This avoids the cost of a preflight on every
 *     cross-origin request.
 *
 * @param origin The `Origin` request header value. `null` is
 *               accepted and produces the same "deny" shape as
 *               an unrecognised origin.
 * @returns A {@link CorsHeaders} object suitable for spreading
 *          into a response. When the origin is allowed,
 *          `Access-Control-Allow-Origin` is the origin itself;
 *          when not, it is the empty string.
 */
export function getCorsHeaders(
  origin: string | null | undefined,
): CorsHeaders {
  // Reading the env directly (rather than `getEnv()`) keeps this
  // module free of a dependency on the rest of the contract and
  // makes it usable in tests that do not load `.env`. The Zod
  // schema in `src/lib/contract.ts` guarantees the var is set
  // in production; an unset value is treated as "deny
  // everything", which is the safe default.
  const allowed = process.env.ALLOWED_ORIGINS ?? "";
  const isAllowed = isOriginAllowed(origin, allowed);

  return {
    "Access-Control-Allow-Origin": isAllowed && origin ? origin : "",
    "Access-Control-Allow-Methods":
      "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With, x-rido-csrf-token, x-rido-request-id",
    "Access-Control-Max-Age": "86400",
  };
}

// ─── Internal helpers ──────────────────────────────────────────────────────

/**
 * Split a comma-separated allowlist string into a clean array
 * of trimmed, non-empty entries. Tolerates the kinds of
 * whitespace accidents that always end up in production env
 * files: a leading space after the comma, a trailing space at
 * the end of the line, and an empty entry from a stray `","`.
 *
 * Kept module-private because the only legitimate caller is
 * {@link isOriginAllowed}; exposing it would invite other
 * modules to roll their own CSV parsing for the same string.
 *
 * @param raw The raw `ALLOWED_ORIGINS` env value. Non-string
 *            inputs return `[]` (defensive — `process.env`
 *            values are always strings, but the function is
 *            exported-friendly).
 * @returns The list of non-empty trimmed entries, in the order
 *          they appeared in the source.
 */
function splitCsv(raw: string): readonly string[] {
  if (typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
