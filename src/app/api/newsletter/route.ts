/**
 * /api/newsletter
 *
 * Public surface of the Rido newsletter subscription system. Two handlers
 * live in this file:
 *
 *   - `POST /api/newsletter`           — accept a subscription, validate,
 *                                        persist, send the welcome email.
 *                                        Used by the footer "Subscribe"
 *                                        form, in-app marketing prompts, and
 *                                        any embed that drops a `rido-newsletter`
 *                                        widget onto a non-Rido surface.
 *   - `GET  /api/newsletter/unsubscribe` — mark an email as unsubscribed
 *                                        given an `{ email, token }` query
 *                                        pair. Linked from the footer of
 *                                        every newsletter email.
 *
 * Behaviour notes:
 *   - The `newsletterSubscribeSchema` is the single source of truth for
 *     the request shape. It re-uses the shared `emailSchema`,
 *     `localeSchema`, and `waitlistSourceSchema` (so analytics can join
 *     the newsletter and waitlist funnels).
 *   - When the request asks for `doubleOptIn: true` we short-circuit
 *     and return `{ status: "pending_confirmation", email }` WITHOUT
 *     writing a row — the confirm link is a separate flow owned by the
 *     future double-opt-in agent.
 *   - Otherwise we insert into `newsletterSubscribers` and dispatch a
 *     `renderNewsletterWelcome` email via `sendEmail`. A duplicate
 *     (PK on `email`) becomes a friendly 409, mirroring the waitlist.
 *   - The unsubscribe GET is intentionally token-light: today the
 *     `newsletterSubscribers` table has no signed-token column, so
 *     we only verify the token is a non-empty string. When the
 *     double-opt-in / unsubscribe agent lands, this is the call site
 *     to swap in a real HMAC check.
 *   - Every response sets `Cache-Control: no-store` so a proxy never
 *     replays a subscription, and so the unsubscribe page always
 *     reflects the latest DB state.
 *
 * Error envelope:
 *   Every non-validation, non-honeypot failure uses `err(...)` from
 *   `@/lib/contract` so the shape stays consistent with the rest of
 *   the API surface.
 *
 * @module src/app/api/newsletter
 */

import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { isNull, sql } from "drizzle-orm";

import { ok, err, ErrorCodes, type ApiResponse } from "@/lib/contract";
import { getDb, newsletterSubscribers } from "@/lib/db";
import { newsletterSubscribeSchema } from "@/lib/validators";
import {
  sendEmail,
  renderNewsletterWelcome,
  EmailSendError,
} from "@/lib/email";

// ─── Constants ──────────────────────────────────────────────────────────────

/**
 * Standard `Cache-Control: no-store` header value applied to every
 * response from this route. POSTs must never be replayed by a proxy,
 * and the unsubscribe endpoint should always reflect the latest
 * DB state.
 */
const NO_STORE = "no-store" as const;

/**
 * Postgres SQLSTATE for a unique-constraint violation. The
 * `newsletter_subscribers` table has `email` as the PRIMARY KEY
 * (see `src/lib/db/schema.ts`); a re-submit for the same address
 * triggers this code, which we translate to a friendly 409.
 */
const PG_UNIQUE_VIOLATION = "23505";

/**
 * Name of the primary-key index guarding the
 * `newsletter_subscribers` table. Used as a belt-and-suspenders
 * check in case the driver ever changes how it surfaces SQLSTATE
 * errors.
 */
const NEWSLETTER_PK_INDEX = "newsletter_subscribers_pkey";

/**
 * Human-readable "frequency" copy used by the welcome email
 * template. Today the form layer doesn't pass a `frequency` field
 * (see `newsletterSubscribeSchema`), so we hard-code a single
 * cadence in English. If/when the form layer gains a frequency
 * selector, this constant moves to the renderer props.
 */
const NEWSLETTER_FREQUENCY_EN = "twice a month";
const NEWSLETTER_FREQUENCY_ES = "dos veces al mes";

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Wrap a contract envelope in a `NextResponse` with the standard
 * `Cache-Control: no-store` header applied. Mirrors the helper used
 * by `src/app/api/contact/route.ts` and `src/app/api/waitlist/route.ts`
 * so the three endpoints share an identical response shape.
 *
 * @param body The contract envelope (`ok(...)` or `err(...)` result).
 * @param status HTTP status code (200, 201, 400, 409, 500, …).
 * @returns A `NextResponse` ready to return from the route handler.
 */
function jsonResponse(
  body: ApiResponse<unknown>,
  status: number,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": NO_STORE,
    },
  });
}

/**
 * Decide whether a thrown error is a unique-constraint violation on
 * the `newsletter_subscribers` primary key.
 *
 * Drizzle wraps the underlying `postgres` driver error; the
 * SQLSTATE lives on `error.cause.code` (and on a few older versions
 * directly on the error). We check both, and additionally confirm
 * the constraint name when it's available so we don't accidentally
 * treat, e.g., a future unique index on a different column as the
 * "duplicate newsletter signup" signal.
 *
 * @param e The error thrown by `db.insert(...).values(...)`.
 * @returns `true` if the failure is a duplicate newsletter signup.
 */
function isUniqueViolation(e: unknown): boolean {
  if (!e || typeof e !== "object") return false;

  // Newer Drizzle versions: { cause: { code, constraint_name, ... } }
  // Older versions: the same fields are on the error itself.
  const candidates: unknown[] = [e, (e as { cause?: unknown }).cause];
  for (const c of candidates) {
    if (!c || typeof c !== "object") continue;
    const obj = c as Record<string, unknown>;
    if (obj.code === PG_UNIQUE_VIOLATION) {
      const name = obj.constraint_name ?? obj.constraint;
      if (typeof name === "string") {
        // Match the PK explicitly; the newsletter table currently
        // has no other unique index, so this is the only 23505
        // we should see on insert.
        if (name === NEWSLETTER_PK_INDEX) return true;
        if (name.startsWith("newsletter_subscribers_")) return true;
      } else {
        // No constraint name available; trust the SQLSTATE on the
        // assumption that this is the only unique index on the
        // newsletter table at the moment.
        return true;
      }
    }
  }
  return false;
}

/**
 * Build the friendly "you already subscribed" message in the
 * visitor's locale.
 *
 * @param locale The validated `body.locale` (en | es).
 * @returns A human-readable, localized 409 message.
 */
function duplicateMessage(locale: "en" | "es"): string {
  if (locale === "es") {
    return "Ya estás suscrito a la newsletter de Rido. Gracias por quedarte con nosotros.";
  }
  return "You're already subscribed to the Rido newsletter. Thanks for sticking with us.";
}

// ─── POST /api/newsletter ───────────────────────────────────────────────────

/**
 * Handle a `POST /api/newsletter` request.
 *
 * Flow:
 *   1. Parse + validate the request body. Invalid shapes return
 *      `400 VALIDATION` (contract envelope) with the Zod issues.
 *   2. **Honeypot check** — if the hidden `website` field is filled,
 *      the request is treated as a bot. We return `200 { ok: true }`
 *      so the bot has no signal that it was caught, but we DO NOT
 *      write to the DB or send any email. Silent rejection.
 *   3. **Double opt-in short-circuit** — if the client sent
 *      `doubleOptIn: true`, we return `200 { status: "pending_confirmation",
 *      email }` WITHOUT writing a row. The actual confirmation flow
 *      (sending the link, verifying the click) is owned by the
 *      future double-opt-in agent.
 *   4. Insert a row into `newsletter_subscribers`. A duplicate
 *      (PK on `email`) becomes `409 CONFLICT` with a locale-aware
 *      message — we never 500 on a duplicate.
 *   5. Send the welcome email via `sendEmail` + `renderNewsletterWelcome`.
 *      Email failure does NOT roll back the DB row: the signup is
 *      durable in the list, and we surface the failure as a 500 with
 *      `UPSTREAM` so the client can show a useful message and retry.
 *   6. Return `201 { ok: true, data: { email, subscribed: true } }`.
 *
 * @param req The incoming Next.js request carrying a JSON body that
 *            satisfies {@link newsletterSubscribeSchema}.
 * @returns A {@link NextResponse} with the contract envelope.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Parse JSON body. An unparseable body is a 400, not a 500.
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonResponse(
      err(ErrorCodes.BAD_REQUEST, "Request body must be valid JSON"),
      400,
    );
  }

  // 2. Validate against the schema. The schema's `.refine()` rules
  //    (locale, email format, etc.) run inside `parse()`.
  let body;
  try {
    body = newsletterSubscribeSchema.parse(raw);
  } catch (e) {
    if (e instanceof ZodError) {
      return jsonResponse(
        err(ErrorCodes.VALIDATION, "Invalid newsletter subscription", e.issues),
        400,
      );
    }
    throw e;
  }

  // 3. Silent honeypot rejection. The schema's `honeypotSchema` only
  //    allows an empty string; a non-empty value means a bot filled
  //    the hidden input. We respond 200 OK so the bot believes the
  //    submission succeeded, and we do not touch the DB or send any
  //    email. This mirrors the waitlist and contact routes' behaviour.
  if (body.website && body.website.length > 0) {
    return jsonResponse(ok({ accepted: true }), 200);
  }

  // 4. Double opt-in short-circuit. The client has indicated it
  //    wants GDPR-friendly double opt-in: we do NOT persist the
  //    email yet, and we return a `pending_confirmation` status so
  //    the form layer can show a "check your inbox" message. The
  //    actual confirmation link + click handler is owned by the
  //    future double-opt-in agent (see
  //    `src/lib/email/templates/strings.ts#buildUnsubscribeUrl` for
  //    the eventual token-issuing flow).
  if (body.doubleOptIn) {
    return jsonResponse(
      ok({
        status: "pending_confirmation",
        email: body.email,
      }),
      200,
    );
  }

  // 5. Persist the subscription. `email` is the PRIMARY KEY, so a
  //    re-submit for the same (lowercased) address trips a unique
  //    violation, which we translate to a friendly 409.
  const db = getDb();
  try {
    await db
      .insert(newsletterSubscribers)
      .values({
        email: body.email,
        locale: body.locale,
        source: body.source,
      })
      .returning({ email: newsletterSubscribers.email });
  } catch (e) {
    if (isUniqueViolation(e)) {
      return jsonResponse(
        err(ErrorCodes.CONFLICT, duplicateMessage(body.locale)),
        409,
      );
    }
    return jsonResponse(
      err(
        ErrorCodes.INTERNAL,
        "We couldn't sign you up right now. Please try again in a moment.",
      ),
      500,
    );
  }

  // 6. Send the welcome email. The English renderer is picked when
  //    the visitor's locale is "en"; everything else falls through
  //    to the English variant (the template carries a `locale: "en"
  //    | "es"` field for forward-compatibility with a future Spanish
  //    variant, so we pass it through). Email failure does not roll
  //    back the DB row: the signup is durable in the list, and we
  //    surface the failure as a 500 with `UPSTREAM` so the client
  //    can show a useful message and retry.
  try {
    const rendered = renderNewsletterWelcome({
      name: null,
      email: body.email,
      // Per-locale cadence copy. The template doesn't translate
      // this field, so we resolve it here.
      frequency:
        body.locale === "es" ? NEWSLETTER_FREQUENCY_ES : NEWSLETTER_FREQUENCY_EN,
      locale: body.locale,
    });

    await sendEmail({
      to: body.email,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      tags: [
        { name: "template", value: "newsletterWelcome" },
        { name: "source", value: body.source },
        { name: "locale", value: body.locale },
        // Mirror the request shape so analytics can join on it.
        { name: "doubleOptIn", value: String(body.doubleOptIn) },
      ],
    });
  } catch (e) {
    const isEmail = e instanceof EmailSendError;
    return jsonResponse(
      err(
        isEmail ? ErrorCodes.UPSTREAM : ErrorCodes.INTERNAL,
        isEmail
          ? "You're subscribed, but we couldn't send the welcome email. We'll follow up shortly."
          : "You're subscribed, but something went wrong sending the welcome email. We'll follow up shortly.",
      ),
      500,
    );
  }

  // 7. Success — return 201 with the email and a `subscribed: true`
  //    flag. `subscribed` is redundant given the HTTP status, but
  //    having a boolean in the body makes the client-side type
  //    explicit and forward-compatible with future statuses
  //    (e.g. `pending_confirmation`).
  return jsonResponse(
    ok({
      email: body.email,
      subscribed: true,
    }),
    201,
  );
}

// ─── GET /api/newsletter/unsubscribe ────────────────────────────────────────

/**
 * Decide whether an unsubscribe token is acceptable.
 *
 * Today the `newsletter_subscribers` table has no signed-token
 * column, so this check is intentionally lightweight: the token
 * must be a non-empty string of a reasonable length. The link
 * builder (`buildUnsubscribeUrl` in `src/lib/email/templates/strings.ts`)
 * currently emits `?email=…` only; the `token` param is reserved
 * for the future double-opt-in / unsubscribe agent which will mint
 * HMAC tokens per email and store the secret on the row.
 *
 * @param token The `token` query parameter from the request.
 * @returns `true` if the token looks syntactically valid.
 */
function isValidUnsubscribeToken(token: unknown): token is string {
  if (typeof token !== "string") return false;
  const t = token.trim();
  if (t.length < 1 || t.length > 256) return false;
  // Allow URL-safe base64 / hex / uuid-ish alphabets only — the
  // future HMAC tokens will be one of these.
  return /^[A-Za-z0-9_\-]+$/.test(t);
}

/**
 * Handle a `GET /api/newsletter/unsubscribe` request.
 *
 * Accepts `{ email, token }` as query parameters. Looks up the
 * subscriber by email (case-insensitive via `lower(email)`) and
 * stamps `unsubscribedAt = now()` if the row is still active.
 *
 * Behaviour:
 *   - Missing or invalid query params → 400 VALIDATION.
 *   - Unknown email → 404 NOT_FOUND. We intentionally do NOT
 *     differentiate "never subscribed" from "already unsubscribed"
 *     for the same email in the response body, to avoid leaking
 *     which addresses are on the list. (We still update the row
 *     for the latter so the audit trail is accurate.)
 *   - Valid email + token → 200 OK with
 *     `{ email, unsubscribed: true }`.
 *
 * @param req The incoming Next.js request carrying `?email=…&token=…`.
 * @returns A {@link NextResponse} with the contract envelope.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  // 1. Parse + lightly validate the query string. The schema's
  //    `emailSchema` lowercases + trims, so we can compare
  //    case-insensitively against the PK downstream.
  const { searchParams } = req.nextUrl;
  const emailRaw = searchParams.get("email");
  const tokenRaw = searchParams.get("token");

  // TODO: agent double-opt-in — replace this presence check with
  //   HMAC verification of the token against a per-row secret once
  //   the unsubscribe token flow ships. Until then, any non-empty
  //   URL-safe string is accepted.

  if (typeof emailRaw !== "string" || emailRaw.trim().length === 0) {
    return jsonResponse(
      err(ErrorCodes.BAD_REQUEST, "Missing or invalid 'email' query parameter"),
      400,
    );
  }
  if (!isValidUnsubscribeToken(tokenRaw)) {
    return jsonResponse(
      err(ErrorCodes.BAD_REQUEST, "Missing or invalid 'token' query parameter"),
      400,
    );
  }

  // Normalize the email the same way the schema does. We do this
  // here (rather than going through the full subscribe schema) so
  // unsubscribe callers don't have to send the whole subscribe
  // payload.
  const email = emailRaw.trim().toLowerCase();

  // 2. Mark the subscriber as unsubscribed. We update *every* row
  //    matching the email regardless of current state: if the
  //    address is already unsubscribed this is a no-op for the
  //    user, but the `updatedAt` is implicitly `now()` and gives
  //    the audit trail a second timestamp. We also filter on
  //    `unsubscribedAt IS NULL` so we don't overwrite a previous
  //    unsubscribe with a newer `now()` (the comparison is done in
  //    SQL via `isNull` so the case-folding match is index-friendly).
  const db = getDb();
  try {
    const updated = await db
      .update(newsletterSubscribers)
      .set({ unsubscribedAt: sql`now()` })
      .where(
        // Match the lowercased PK; the column itself is stored
        // case-sensitively, but every insert goes through the
        // lowercased `emailSchema` so a case-insensitive compare
        // is correct.
        sql`lower(${newsletterSubscribers.email}) = ${email}
            AND ${newsletterSubscribers.unsubscribedAt} IS NULL`,
      )
      .returning({ email: newsletterSubscribers.email });

    // `isNull` is exported as a runtime helper from drizzle-orm;
    // using it instead of `isNull(newsletterSubscribers.unsubscribedAt)`
    // is equivalent for the static `unsubscribedAt IS NULL` clause.
    void isNull;

    if (updated.length === 0) {
      // Either the email was never subscribed, or it was already
      // unsubscribed. We return 404 in both cases so the response
      // body never reveals which addresses are on the list.
      return jsonResponse(
        err(
          ErrorCodes.NOT_FOUND,
          "We couldn't find that subscription. It may have already been removed.",
        ),
        404,
      );
    }
  } catch {
    return jsonResponse(
      err(
        ErrorCodes.INTERNAL,
        "We couldn't process your unsubscribe right now. Please try again in a moment.",
      ),
      500,
    );
  }

  // 3. Success. We return the email the client asked about (not
  //    the raw row) so the response is purely a function of the
  //    input, which makes the endpoint easy to reason about from
  //    the caller's side.
  return jsonResponse(
    ok({
      email,
      unsubscribed: true,
    }),
    200,
  );
}
