/**
 * POST /api/contact
 *
 * Public intake endpoint for the Rido contact form (the page at
 * `/{en,es}/contact`). Accepts a JSON body, validates it with
 * {@link contactSubmissionSchema}, persists the submission to the
 * `contact_submissions` table, and notifies the support inbox.
 *
 * Behaviour summary:
 *   1. Parse + validate the request body. Invalid shapes return
 *      `400 VALIDATION` (contract envelope) with the Zod issues.
 *   2. **Honeypot check** — if the hidden `website` field is filled,
 *      the request is treated as a bot. We return `200 { ok: true }`
 *      so the bot has no signal that it was caught, but we DO NOT
 *      write to the DB or send any email. Silent rejection.
 *   3. Rate limiting is stubbed for now (TODO). When the rate-limit
 *      module ships, this is the call site.
 *   4. Insert a row into `contact_submissions` with status `new`.
 *   5. Send a notification email to the support inbox using the
 *      `contactNotification` template (English or Spanish variant,
 *      selected by the visitor's locale).
 *   6. Return `201 { ok: true, data: { id, createdAt } }`.
 *
 * Error envelope:
 *   Every non-honeypot, non-validation failure uses `err(...)` from
 *   `@/lib/contract` so the response shape stays consistent across
 *   the API surface. Status codes follow HTTP semantics:
 *     - 400  bad JSON / Zod validation failure
 *     - 429  rate limited (future)
 *     - 500  DB or email failure
 *
 * Caching:
 *   The response sets `Cache-Control: no-store` so no proxy or
 *   browser can cache the result.
 *
 * @module src/app/api/contact
 */

import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { ok, err, ErrorCodes } from "@/lib/contract";
import { getDb, contactSubmissions } from "@/lib/db";
import { contactSubmissionSchema } from "@/lib/validators";
import {
  sendEmail,
  renderContactNotification,
  renderContactNotificationEs,
  EmailSendError,
} from "@/lib/email";

// ─── Constants ──────────────────────────────────────────────────────────────

/**
 * Inbox that receives contact-form notifications. Falls back to the
 * project-level `EMAIL_REPLY_TO` env var (which itself defaults to
 * `info@rido.bike` per `src/lib/contract.ts`). The override is read
 * straight from `process.env` rather than `getEnv()` so a missing
 * var falls through cleanly to the support default.
 */
const SUPPORT_INBOX =
  process.env.EMAIL_REPLY_TO?.trim() || "support@rido.bike";

/** Common cache-busting header applied to every response. */
const NO_STORE = "no-store" as const;

// ─── Route handler ──────────────────────────────────────────────────────────

/**
 * Handle a `POST /api/contact` request.
 *
 * @param req The incoming Next.js request carrying a JSON body that
 *            satisfies {@link contactSubmissionSchema}.
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

  // 2. Validate against the schema. The schema handles the honeypot
  //    shape but NOT the honeypot "is it filled" check — we treat
  //    "passed validation" as "user is probably not a bot" and run
  //    the explicit honeypot check below before doing any real work.
  let body;
  try {
    body = contactSubmissionSchema.parse(raw);
  } catch (e) {
    if (e instanceof ZodError) {
      return jsonResponse(
        err(ErrorCodes.VALIDATION, "Invalid contact submission", e.issues),
        400,
      );
    }
    throw e;
  }

  // 3. Silent honeypot rejection. The schema accepts the field but
  //    only allows the empty string in practice; a non-empty value
  //    means a bot filled the hidden input. We respond 200 OK so the
  //    bot believes the submission succeeded, and we do not touch
  //    the DB or send any email.
  //
  //    (The schema's `honeypotSchema` already enforces the empty-
  //    string contract — this is a defence-in-depth check in case a
  //    future schema change relaxes it.)
  if (body.website && body.website.length > 0) {
    return jsonResponse(ok({ accepted: true }), 200);
  }

  // 4. Rate limiting — stubbed until the rate-limit module ships.
  //    When implemented, this should consume a token keyed on the
  //    visitor's IP and throw `RATE_LIMITED` on exhaustion.
  // TODO: agent rate-limit — call `checkRateLimit({ key: "contact",
  //   identifier: req.headers.get("x-forwarded-for") ?? "unknown" })`
  //   here. For now this is a deliberate no-op so the route works in
  //   environments where the rate-limit module is not yet wired up.

  // 5. Persist the submission. We only store the validated fields —
  //    the honeypot and idempotency key are intentionally dropped.
  const db = getDb();
  let inserted: { id: string; createdAt: Date };
  try {
    const [row] = await db
      .insert(contactSubmissions)
      .values({
        name: body.name,
        email: body.email,
        subject: body.subject,
        message: body.message,
        locale: body.locale,
      })
      .returning({ id: contactSubmissions.id, createdAt: contactSubmissions.createdAt });

    if (!row) {
      throw new Error("Insert returned no row");
    }
    inserted = row;
  } catch (e) {
    return jsonResponse(
      err(
        ErrorCodes.INTERNAL,
        "Failed to record your message. Please try again in a moment.",
        // Don't leak driver internals to the client; log on the server
        // via the structured envelope only.
        undefined,
      ),
      500,
    );
  }

  // 6. Notify the support inbox. The template's wording is visitor-
  //    facing ("we got your message") but the task spec routes the
  //    email to support@rido.bike and asks for this template. The
  //    Spanish variant is selected when the visitor's locale is "es".
  //
  //    Email failure does NOT roll back the DB row — we still have
  //    the submission in the moderation queue, and the team can pick
  //    it up from there. We surface the failure as a 500 with an
  //    `UPSTREAM` code so the client can show an appropriate message
  //    and retry.
  try {
    const rendered =
      body.locale === "es"
        ? renderContactNotificationEs({
            name: body.name,
            email: body.email,
            message: body.message,
            locale: body.locale,
          })
        : renderContactNotification({
            name: body.name,
            email: body.email,
            message: body.message,
            locale: body.locale,
          });

    await sendEmail({
      to: SUPPORT_INBOX,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      // Visitor's address so support can reply directly from their
      // mail client. Falls back to EMAIL_REPLY_TO inside sendEmail
      // if we passed nothing — but passing it explicitly is the
      // whole point of this notification.
      replyTo: body.email,
      tags: [
        { name: "template", value: "contactNotification" },
        { name: "subject", value: body.subject },
        { name: "locale", value: body.locale },
      ],
    });
  } catch (e) {
    const isEmail = e instanceof EmailSendError;
    return jsonResponse(
      err(
        isEmail ? ErrorCodes.UPSTREAM : ErrorCodes.INTERNAL,
        isEmail
          ? "Message recorded, but the notification email failed to send. Our team will follow up from the queue."
          : "Message recorded, but something went wrong while notifying the team.",
      ),
      500,
    );
  }

  // 7. Success — return 201 with the new row's id + createdAt.
  return jsonResponse(
    ok({
      id: inserted.id,
      createdAt: inserted.createdAt.toISOString(),
    }),
    201,
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Wrap a contract envelope in a `NextResponse` with the standard
 * `Cache-Control: no-store` header applied.
 *
 * @param body The contract envelope (`ok(...)` or `err(...)` result).
 * @param status HTTP status code (200, 201, 400, 500, …).
 * @returns A `NextResponse` ready to return from the route handler.
 */
function jsonResponse(
  body: ReturnType<typeof ok> | ReturnType<typeof err>,
  status: number,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": NO_STORE,
    },
  });
}
