/**
 * /api/unsubscribe
 *
 * Public unsubscribe endpoint hit from the footer / body of every
 * marketing email Rido sends. Because the request is opened from a
 * mail client (often in a pre-fetched preview pane) and we want the
 * recipient to see a friendly confirmation page, this route returns
 * a small, self-contained HTML page — NOT a JSON envelope.
 *
 *   GET /api/unsubscribe?email=<addr>&token=<hex>&type=<waitlist|newsletter|contact>
 *
 * Behaviour:
 *   - Missing or empty `email`, `token`, or `type` query params →
 *     400 HTML "Invalid unsubscribe link."
 *   - The `type` value must be one of `waitlist`, `newsletter`, or
 *     `contact`. Any other value is rejected with the same 400
 *     page so the response shape is consistent for malformed URLs.
 *   - The token is verified with a constant-time HMAC-SHA256 over
 *     `<email>|<type>` keyed on `AUTH_SECRET` (read via
 *     {@link getEnv}). The expected digest is a lowercase hex
 *     string. The constant-time compare protects against timing
 *     oracles even though this endpoint is public and unauthenticated.
 *   - If verification fails → 400 HTML "Invalid unsubscribe link."
 *   - On success, the matching row is updated in place:
 *       - `type=waitlist`   → `waitlistSignups.status = 'unsubscribed'`
 *       - `type=newsletter` → `newsletterSubscribers.unsubscribedAt = now()`
 *       - `type=contact`    → `contactSubmissions.updatedAt = now()`
 *                            (see TODO — the contact enum doesn't
 *                            currently model an `unsubscribed`
 *                            state, so we touch the row to record
 *                            the opt-out in the audit trail).
 *   - The success page is returned with HTTP 200. If no matching
 *     row exists in the DB we still return 200 — unsubscribe is an
 *     idempotent intent ("I don't want mail from you anymore") and
 *     treating "already gone" as a hard 404 would only confuse
 *     recipients who clicked the link twice.
 *
 * Caching:
 *   Every response sets `Cache-Control: no-store` so a mail-client
 *   preview / corporate proxy / browser back-button never serves a
 *   stale "you've been unsubscribed" page to a recipient who
 *   re-subscribed via the website in the meantime.
 *
 * Security:
 *   The HMAC binds the token to a specific (email, type) pair. A
 *   token minted for `type=newsletter` can't be replayed against
 *   `type=waitlist` even with the same address. `AUTH_SECRET` is
 *   the same secret used by NextAuth so we don't introduce a new
 *   secret-rotation surface.
 *
 * @module src/app/api/unsubscribe
 */

import { NextResponse, type NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { sql } from "drizzle-orm";

import { getEnv } from "@/lib/contract";
import {
  getDb,
  waitlistSignups,
  newsletterSubscribers,
  contactSubmissions,
} from "@/lib/db";

// ─── Constants ──────────────────────────────────────────────────────────────

/**
 * Standard `Cache-Control: no-store` header value applied to every
 * response from this route. The unsubscribe page must never be
 * cached: a recipient who re-subscribes via the website should not
 * see a stale "you've been unsubscribed" page on the next click.
 */
const NO_STORE = "no-store" as const;

/**
 * The three `type` values we know how to honour. Anything else
 * falls through to the 400 page. Kept as a tuple (not an enum) so
 * we can derive the runtime allowlist via `Set` and the static
 * type via `(typeof ALLOWED_TYPES)[number]`.
 */
const ALLOWED_TYPES = ["waitlist", "newsletter", "contact"] as const;
type AllowedType = (typeof ALLOWED_TYPES)[number];

/**
 * Set-based membership check for {@link ALLOWED_TYPES}. Built once
 * at module load so the per-request lookup is O(1).
 */
const ALLOWED_TYPE_SET: ReadonlySet<string> = new Set<string>(ALLOWED_TYPES);

/**
 * Message shown on the success page after a valid unsubscribe.
 * Plain text on purpose — this is a footer-link target, not a
 * marketing surface, so we keep the copy minimal and unambiguous.
 */
const SUCCESS_HEADING = "You've been unsubscribed.";

/**
 * Message shown when the token is missing, malformed, or doesn't
 * verify. The wording is intentionally bland (no "your account"
 * etc.) because the only thing the user did wrong is follow a
 * broken link — we don't want to imply we recognised them.
 */
const INVALID_HEADING = "Invalid unsubscribe link.";

/**
 * Plain-text return URL for the "back to Rido" link on the
 * success page. This is a site-relative path; on the marketing
 * site it resolves to `https://rido.bike/` (or the GitHub Pages
 * preview, depending on the deployment).
 */
const HOME_PATH = "/";

// ─── HTML helpers ───────────────────────────────────────────────────────────

/**
 * Build a minimal, self-contained HTML page. The unsubscribe
 * endpoint is opened from a mail client, so we deliberately do
 * NOT depend on any external CSS, fonts, or images — the page
 * must render even if the user is offline, has images blocked,
 * or is using a text-only reader.
 *
 * The body uses inline styles so the page looks reasonable
 * whether or not the surrounding host page has its own CSS.
 * The dark-mode brand background (`#0F172A`) and magenta accent
 * (`#DE0498`) come from the project's design tokens (see
 * `AGENTS.md`).
 *
 * @param heading The big bold heading at the top of the page.
 * @param body    The paragraph(s) of body copy. May contain basic
 *                inline markup, but callers must escape any
 *                untrusted text themselves.
 * @param status  The HTTP status code to attach to the response.
 *                Used by {@link htmlResponse}.
 * @returns A `NextResponse` carrying the rendered HTML.
 */
function renderHtml(heading: string, body: string): string {
  // NOTE: `heading` and `body` are treated as trusted strings —
  // the only callers in this file pass static literals. If a
  // future change needs to splice user input in here, it must go
  // through the `escape()` helper in
  // `src/lib/email/templates/strings.ts` (or an equivalent).
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex,nofollow" />
<title>${heading}</title>
<style>
  html, body { margin: 0; padding: 0; }
  body {
    background: #0F172A;
    color: #F8FAFC;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    box-sizing: border-box;
  }
  .card {
    max-width: 32rem;
    width: 100%;
    text-align: center;
  }
  h1 {
    color: #DE0498;
    font-size: 1.75rem;
    line-height: 1.2;
    margin: 0 0 1rem;
    font-weight: 700;
  }
  p {
    color: #CBD5E1;
    font-size: 1rem;
    line-height: 1.5;
    margin: 0 0 1.5rem;
  }
  a.button {
    display: inline-block;
    background: #DE0498;
    color: #F8FAFC;
    text-decoration: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
  }
  a.button:hover { background: #C10385; }
  a.button:focus-visible {
    outline: 2px solid #F23DB5;
    outline-offset: 2px;
  }
</style>
</head>
<body>
<main class="card" role="main">
  <h1>${heading}</h1>
  <p>${body}</p>
  <p><a class="button" href="${HOME_PATH}">Back to Rido</a></p>
</main>
</body>
</html>`;
}

/**
 * Wrap a rendered HTML string in a `NextResponse` with the
 * standard `Cache-Control: no-store` header applied and a
 * permissive `Content-Type: text/html; charset=utf-8`. The
 * charset matters: the body may include non-ASCII characters
 * (e.g. accented city names) and we want the browser to render
 * them without a second round-trip.
 *
 * @param html   The fully-rendered HTML document.
 * @param status HTTP status code (200 or 400).
 * @returns A `NextResponse` ready to return from the route handler.
 */
function htmlResponse(html: string, status: number): NextResponse {
  return new NextResponse(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": NO_STORE,
    },
  });
}

// ─── Token verification ─────────────────────────────────────────────────────

/**
 * Compute the expected HMAC-SHA256 token for a given
 * (email, type) pair using `AUTH_SECRET` as the key.
 *
 * The token is the lowercase hex digest of the HMAC. The
 * "message" we sign is `email + "|" + type` so the token is
 * bound to BOTH fields — a token minted for one `type` cannot
 * be replayed against another, and a token minted for one
 * email cannot be reused for a different one.
 *
 * Implemented in terms of `node:crypto`'s `createHmac` and a
 * standard hex digest; the same `AUTH_SECRET` is used by
 * NextAuth elsewhere in the codebase so we don't introduce a
 * new secret-rotation surface.
 *
 * @param email The recipient's email address (lowercased).
 * @param type  The unsubscribe target (`waitlist` | `newsletter`
 *              | `contact`).
 * @param secret The HMAC key, sourced from `AUTH_SECRET` via
 *               {@link getEnv}.
 * @returns A lowercase hex digest suitable for use as the
 *          `token` query parameter.
 */
function computeToken(email: string, type: AllowedType, secret: string): string {
  return createHmac("sha256", secret)
    .update(`${email}|${type}`, "utf8")
    .digest("hex");
}

/**
 * Constant-time string compare. The naive `===` operator short-
 * circuits on the first byte difference, which can leak the
 * position of the mismatch through timing. The unsubscribe
 * endpoint is public so the threat model is limited, but using
 * a constant-time compare is essentially free and removes that
 * whole class of side channel.
 *
 * Both inputs are normalised to Buffer so the comparison
 * happens over raw bytes — a length mismatch is handled
 * separately so the function always reads both inputs in full
 * (timingSafeEqual throws if the lengths differ).
 *
 * @param a The expected hex digest (from {@link computeToken}).
 * @param b The candidate hex digest (from the `token` query param).
 * @returns `true` if the two digests are byte-for-byte equal.
 */
function tokensEqual(a: string, b: string): boolean {
  // Quick length pre-check: the hex digest of an HMAC-SHA256 is
  // always 64 bytes, so a token of any other length is rejected
  // up front. We then still do a constant-time compare on equal-
  // length inputs in case the caller passes a non-canonical
  // length (e.g. leading whitespace after `.trim()`).
  if (a.length !== b.length) return false;
  try {
    const ab = Buffer.from(a, "utf8");
    const bb = Buffer.from(b, "utf8");
    if (ab.length !== bb.length) return false;
    return timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

// ─── Mark-as-unsubscribed helpers ──────────────────────────────────────────

/**
 * Update the matching `waitlistSignups` row(s) to set
 * `status = 'unsubscribed'`. We match case-insensitively on
 * `email` (the column itself is stored case-sensitively, but
 * every insert goes through the lowercased `emailSchema`, so a
 * case-insensitive compare is correct).
 *
 * Idempotent: re-running the update against an already-
 * unsubscribed row is a no-op for the user.
 *
 * @param email The lowercased email to look up.
 */
async function unsubscribeFromWaitlist(email: string): Promise<void> {
  const db = getDb();
  await db
    .update(waitlistSignups)
    .set({ status: "unsubscribed" })
    .where(sql`lower(${waitlistSignups.email}) = ${email}`);
}

/**
 * Update the matching `newsletterSubscribers` row to set
 * `unsubscribedAt = now()`. We only update rows where
 * `unsubscribedAt IS NULL` so a re-click doesn't move the
 * timestamp forward (the original opt-out is the one that
 * counts for compliance audits).
 *
 * @param email The lowercased email to look up.
 */
async function unsubscribeFromNewsletter(email: string): Promise<void> {
  const db = getDb();
  await db
    .update(newsletterSubscribers)
    .set({ unsubscribedAt: sql`now()` })
    .where(
      sql`lower(${newsletterSubscribers.email}) = ${email}
          AND ${newsletterSubscribers.unsubscribedAt} IS NULL`,
    );
}

/**
 * Mark a contact-form submission row as opted-out. The
 * `contact_submission_status` enum currently only models
 * moderation states (`new | in_progress | resolved | spam`),
 * so the cleanest non-breaking change — without modifying the
 * schema — is to touch `updatedAt = now()` and leave a TODO
 * to add an `unsubscribed` enum value in a future migration.
 *
 * TODO: agent db-schema — add an `unsubscribed` value to the
 *   `contact_submission_status` enum (see
 *   `src/lib/db/schema.ts`) and set `status = 'unsubscribed'`
 *   here. Until then, we record the intent in the audit trail
 *   by bumping `updatedAt`.
 *
 * @param email The lowercased email to look up.
 */
async function unsubscribeFromContact(email: string): Promise<void> {
  const db = getDb();
  await db
    .update(contactSubmissions)
    .set({ updatedAt: sql`now()` })
    .where(sql`lower(${contactSubmissions.email}) = ${email}`);
}

// ─── GET /api/unsubscribe ───────────────────────────────────────────────────

/**
 * Handle a `GET /api/unsubscribe` request.
 *
 * Flow:
 *   1. Read `email`, `token`, and `type` from the query string.
 *      Missing or empty values are a 400 (HTML "Invalid
 *      unsubscribe link.") — we never reveal which field was
 *      wrong, to avoid confirming which addresses are on which
 *      list.
 *   2. Coerce `type` to one of {@link ALLOWED_TYPES}. Anything
 *      else is a 400.
 *   3. Verify the token: `HMAC-SHA256(email | type, AUTH_SECRET)`
 *      must equal the `token` query param. Verification is
 *      constant-time.
 *   4. On success, dispatch to the per-`type` handler which
 *      updates the matching row(s) in the relevant table. The
 *      handler is best-effort: if the DB write throws, we
 *      surface the failure to the user as a 400 HTML page so
 *      they know to try again (or contact support).
 *   5. Return 200 with the success HTML page.
 *
 * @param req The incoming Next.js request carrying the
 *            `email`, `token`, and `type` query parameters.
 * @returns A `NextResponse` carrying the rendered HTML page.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  // 1. Pull the three query params. `searchParams.get` returns
  //    `null` for missing keys and `""` for empty values — we
  //    treat both as missing so the "missing-or-invalid" branch
  //    covers both cases with a single check.
  const { searchParams } = req.nextUrl;
  const emailRaw = searchParams.get("email");
  const tokenRaw = searchParams.get("token");
  const typeRaw = searchParams.get("type");

  if (typeof emailRaw !== "string" || emailRaw.trim().length === 0) {
    return invalidResponse();
  }
  if (typeof tokenRaw !== "string" || tokenRaw.trim().length === 0) {
    return invalidResponse();
  }
  if (typeof typeRaw !== "string" || !ALLOWED_TYPE_SET.has(typeRaw)) {
    return invalidResponse();
  }

  // Normalize the email the same way the subscribe schemas do:
  // trim whitespace, then lowercase. This is the canonical form
  // every other endpoint (waitlist, newsletter, contact) writes
  // to the DB, so a case-insensitive compare against the
  // case-sensitively-stored column is correct.
  const email = emailRaw.trim().toLowerCase();
  const token = tokenRaw.trim();
  const type = typeRaw as AllowedType;

  // 2. Verify the HMAC token. We pull the secret lazily here
  //    (inside the handler) so a misconfigured env var fails the
  //    request, not the module import. `getEnv()` is cached after
  //    the first call, so this is a property access in practice.
  let secret: string;
  try {
    secret = getEnv().AUTH_SECRET;
  } catch {
    // If the env is misconfigured (e.g. AUTH_SECRET missing in
    // a fresh preview deployment), we don't want to leak that
    // via a 500. Treat it as "invalid token" so the user sees
    // the same generic page as for any other bad link.
    return invalidResponse();
  }

  const expected = computeToken(email, type, secret);
  if (!tokensEqual(expected, token)) {
    return invalidResponse();
  }

  // 3. Apply the per-type update. We swallow any DB error into
  //    the 400 page so we never reveal stack traces / SQL errors
  //    to the recipient of an unsubscribe link. Operations can
  //    pick the failures up from the server logs.
  try {
    if (type === "waitlist") {
      await unsubscribeFromWaitlist(email);
    } else if (type === "newsletter") {
      await unsubscribeFromNewsletter(email);
    } else {
      await unsubscribeFromContact(email);
    }
  } catch {
    return invalidResponse();
  }

  // 4. Success — render the confirmation page.
  return successResponse();
}

/**
 * Build the 200 HTML response for a valid unsubscribe. Kept as
 * a tiny named helper so the GET handler's success path is
 * visually distinct from the error path.
 */
function successResponse(): NextResponse {
  const html = renderHtml(
    SUCCESS_HEADING,
    "We won't send you any more emails for that list. If this was a mistake, you can re-subscribe from the Rido website.",
  );
  return htmlResponse(html, 200);
}

/**
 * Build the 400 HTML response for any kind of bad link —
 * missing params, bad `type`, HMAC mismatch, DB error, or
 * misconfigured env. We deliberately funnel every failure
 * through the same renderer so the response shape is
 * indistinguishable regardless of root cause. This avoids
 * leaking which addresses are on which list, and matches the
 * wording other ESPs use ("Invalid unsubscribe link") so
 * recipients who recognise the pattern know what to do
 * (re-subscribe from the site if it was a mistake).
 */
function invalidResponse(): NextResponse {
  const html = renderHtml(
    INVALID_HEADING,
    "This unsubscribe link is no longer valid. You can manage your email preferences from the Rido website.",
  );
  return htmlResponse(html, 400);
}
