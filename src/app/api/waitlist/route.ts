/**
 * /api/waitlist
 *
 * Public surface of the Rido waitlist. Two handlers live in this file:
 *
 *   - `POST`  — accept a waitlist signup, validate, persist, email a
 *               confirmation. This is what every "Join the waitlist"
 *               CTA on the marketing site calls.
 *   - `GET`   — unauthenticated stats endpoint. Returns the total number
 *               of signups and a per-city breakdown so the landing page
 *               can render a live "people are waiting in {city}" widget
 *               without exposing any PII.
 *
 * Behaviour notes:
 *   - Both responses set `Cache-Control: no-store` so the public stats
 *     are always fresh and signup POSTs are never cached by a proxy.
 *   - The POST handler is rate-limited (5/min per IP). Today the rate
 *     limit is a deliberate no-op stub with a `TODO` pointing at the
 *     future `src/lib/security/rate-limit` module. When that module
 *     lands this is the call site.
 *   - Duplicate signups for the same `(lower(email), city)` pair are
 *     returned as `409 CONFLICT` with a locale-aware friendly message
 *     — we never 500 on a duplicate.
 *   - Email failure does NOT roll back the DB row: the signup is
 *     durable in the queue, and we surface a 500 with the `UPSTREAM`
 *     code so the client can show a useful message and retry.
 *
 * @module src/app/api/waitlist
 */

import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { count, desc } from "drizzle-orm";

import { ok, err, ErrorCodes, type ApiResponse } from "@/lib/contract";
import { getDb, waitlistSignups, type WaitlistSignup } from "@/lib/db";
import { waitlistSignupSchema, type CitySlug } from "@/lib/validators";
import {
  sendEmail,
  renderWaitlistConfirmation,
  renderWaitlistConfirmationEs,
  EmailSendError,
} from "@/lib/email";
import { cities } from "@/data/cities";

// ─── Constants ──────────────────────────────────────────────────────────────

/**
 * Standard `Cache-Control: no-store` header value applied to every
 * response from this route. POSTs must never be replayed by a proxy,
 * and the public stats endpoint should always reflect the latest
 * row count.
 */
const NO_STORE = "no-store" as const;

/**
 * Reserved for the (yet-to-land) `src/lib/security/rate-limit` module.
 * Kept as a named constant so the future wiring only has to swap the
 * implementation in one place.
 */
const RATE_LIMIT_PER_MIN = 5;

/**
 * Postgres SQLSTATE for a unique-constraint violation. The waitlist
 * has `UNIQUE (lower(email), city)` (see `src/lib/db/schema.ts`); a
 * re-submit triggers this code, which we translate to a friendly 409.
 */
const PG_UNIQUE_VIOLATION = "23505";

/**
 * Name of the unique index guarding `(lower(email), city)`. Used as a
 * belt-and-suspenders check in case the driver ever changes how it
 * surfaces SQLSTATE errors.
 */
const WAITLIST_UQ_INDEX = "waitlist_signups_email_city_uq";

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Look up the human-readable city name for a slug from the static
 * `src/data/cities.ts` list. Falls back to the slug itself if the city
 * isn't in the static list (e.g. an admin CSV import introduced it).
 *
 * @param slug The city slug stored on the waitlist row.
 * @returns The display name (e.g. "Marbella"), or the slug if unknown.
 */
function cityNameFor(slug: CitySlug | string): string {
  const found = cities.find((c) => c.slug === slug);
  return found?.name ?? slug;
}

/**
 * Decide whether a thrown error is a unique-constraint violation on
 * the waitlist's `(lower(email), city)` index.
 *
 * Drizzle wraps the underlying `postgres` driver error; the
 * SQLSTATE lives on `error.cause.code` (and on a few older versions
 * directly on the error). We check both, and additionally confirm
 * the constraint name when it's available so we don't accidentally
 * treat, e.g., a future unique index on a different column as the
 * "duplicate waitlist signup" signal.
 *
 * @param e The error thrown by `db.insert(...).values(...)`.
 * @returns `true` if the failure is a duplicate waitlist signup.
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
        // Match either an explicit waitlist index, or any 23505 from
        // the waitlist table (constraint name may be undefined on
        // some driver versions — in that case we fall through to the
        // caller-side check below).
        if (name === WAITLIST_UQ_INDEX) return true;
        if (name.startsWith("waitlist_signups_")) return true;
      } else {
        // No constraint name available; trust the SQLSTATE on the
        // assumption that this is the only unique index on the
        // waitlist table at the moment.
        return true;
      }
    }
  }
  return false;
}

/**
 * Build the friendly "you already signed up" message in the visitor's
 * locale, using the city's display name (not the slug) wherever
 * possible.
 *
 * @param locale The validated `body.locale` (en | es).
 * @param city The validated `body.citySlug`.
 * @returns A human-readable, localized 409 message.
 */
function duplicateMessage(locale: "en" | "es", city: string): string {
  const displayCity = cityNameFor(city);
  if (locale === "es") {
    return `Ya estás en la lista de espera de ${displayCity}. Te avisaremos cuando lancemos.`;
  }
  return `You're already on the waitlist for ${displayCity}. We'll let you know the moment we launch.`;
}

/**
 * Wrap a contract envelope in a `NextResponse` with the standard
 * `Cache-Control: no-store` header applied. Mirrors the helper used
 * by `src/app/api/contact/route.ts` so the two endpoints share an
 * identical response shape.
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
 * Best-effort client IP extraction for the rate-limit key and the
 * audit `ip` column on `waitlist_signups`. We prefer the left-most
 * X-Forwarded-For (the original client when behind Vercel's edge),
 * then fall back to the standard Vercel header, then to a literal
 * "unknown" so the rest of the pipeline never receives `null`.
 *
 * @param req The incoming Next.js request.
 * @returns A non-empty IP-ish string, or `"unknown"`.
 */
function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

// ─── POST /api/waitlist ──────────────────────────────────────────────────────

/**
 * Handle a `POST /api/waitlist` request.
 *
 * @param req The incoming Next.js request carrying a JSON body that
 *            satisfies {@link waitlistSignupSchema}.
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
  //    (role addresses, max length, etc.) run inside `parse()`.
  let body;
  try {
    body = waitlistSignupSchema.parse(raw);
  } catch (e) {
    if (e instanceof ZodError) {
      return jsonResponse(
        err(ErrorCodes.VALIDATION, "Invalid waitlist signup", e.issues),
        400,
      );
    }
    throw e;
  }

  // 3. Silent honeypot rejection. The schema's `honeypotSchema` only
  //    allows an empty string; a non-empty value means a bot filled
  //    the hidden input. We respond 200 OK so the bot believes the
  //    submission succeeded, and we do not touch the DB or send any
  //    email. This mirrors the contact route's behaviour.
  if (body.website && body.website.length > 0) {
    return jsonResponse(ok({ accepted: true }), 200);
  }

  // 4. Rate limiting — STUB for now. The task spec says "5 requests
  //    per minute per IP", and asks us to noop until the rate-limit
  //    module ships. When `src/lib/security/rate-limit` lands, this
  //    is the call site: it should consume a token keyed on the
  //    visitor's IP and throw / return a 429 with `RATE_LIMITED` on
  //    exhaustion.
  //
  // TODO: agent rate-limit — call
  //   `await checkRateLimit({ key: "waitlist:signup", identifier:
  //   clientIp, limit: RATE_LIMIT_PER_MIN, window: "1m" })` here.
  //   Until then, the 5/min budget is unenforced and we accept the
  //   spam risk in development. The constant is kept so the wiring
  //   is a one-line change.
  const ip = clientIp(req);
  void ip;
  void RATE_LIMIT_PER_MIN;

  // 5. Persist the signup. The unique index on
  //    `(lower(email), city)` is the only constraint we have to
  //    translate into a friendly 409 — everything else is a 500.
  const db = getDb();
  let inserted: Pick<WaitlistSignup, "id" | "email" | "city" | "createdAt">;
  try {
    const [row] = await db
      .insert(waitlistSignups)
      .values({
        email: body.email,
        city: body.citySlug,
        locale: body.locale,
        source: body.source,
        ip,
        userAgent: req.headers.get("user-agent") ?? null,
      })
      .returning({
        id: waitlistSignups.id,
        email: waitlistSignups.email,
        city: waitlistSignups.city,
        createdAt: waitlistSignups.createdAt,
      });

    if (!row) {
      throw new Error("Insert returned no row");
    }
    inserted = row;
  } catch (e) {
    if (isUniqueViolation(e)) {
      return jsonResponse(
        err(
          ErrorCodes.CONFLICT,
          duplicateMessage(body.locale, body.citySlug),
        ),
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

  // 6. Send the confirmation email. The Spanish renderer is picked
  //    when the visitor's locale is "es"; everything else gets the
  //    English variant (the English template already declares a
  //    `locale: "en" | "es"` field, so we pass it through). Email
  //    failure does not roll back the DB row: the signup is durable
  //    in the queue, and we surface the failure with `UPSTREAM` so
  //    the client can show a useful message and retry.
  try {
    const rendered =
      body.locale === "es"
        ? renderWaitlistConfirmationEs({
            name: null,
            email: body.email,
            city: cityNameFor(body.citySlug),
            locale: body.locale,
          })
        : renderWaitlistConfirmation({
            name: null,
            email: body.email,
            city: cityNameFor(body.citySlug),
            locale: body.locale,
          });

    await sendEmail({
      to: body.email,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      tags: [
        { name: "template", value: "waitlistConfirmation" },
        { name: "city", value: body.citySlug },
        { name: "source", value: body.source },
        { name: "locale", value: body.locale },
      ],
    });
  } catch (e) {
    const isEmail = e instanceof EmailSendError;
    return jsonResponse(
      err(
        isEmail ? ErrorCodes.UPSTREAM : ErrorCodes.INTERNAL,
        isEmail
          ? "You're on the waitlist, but we couldn't send the confirmation email. We'll follow up by email shortly."
          : "You're on the waitlist, but something went wrong sending the confirmation. We'll follow up shortly.",
      ),
      500,
    );
  }

  // 7. Success — return 201 with the new row's id, email, city, and
  //    createdAt timestamp (serialised as ISO-8601 for the client).
  return jsonResponse(
    ok({
      id: inserted.id,
      email: inserted.email,
      city: inserted.city,
      createdAt: inserted.createdAt.toISOString(),
    }),
    201,
  );
}

// ─── GET /api/waitlist ───────────────────────────────────────────────────────

/**
 * Handle a `GET /api/waitlist` request.
 *
 * Returns aggregate, public-safe statistics:
 *   - `totalSignups`     — total number of rows in `waitlist_signups`.
 *   - `signupsByCity`    — `{ [slug: string]: number }` map of counts
 *                          per city slug. Cities with zero signups are
 *                          omitted; cities outside `src/data/cities.ts`
 *                          (e.g. from admin CSV imports) are included
 *                          because the DB is the source of truth.
 *
 * No authentication is required: the response contains no PII, only
 * counts, so it is safe to call from the marketing site's SSR
 * pipeline or a public dashboard.
 *
 * @returns A {@link NextResponse} with the contract envelope.
 */
export async function GET(): Promise<NextResponse> {
  const db = getDb();

  try {
    // Total count of every signup (any status). The `count()` helper
    // emits a single `SELECT count(*) AS "count"` query.
    const [totalRow] = await db
      .select({ value: count() })
      .from(waitlistSignups);
    const totalSignups = Number(totalRow?.value ?? 0);

    // Per-city counts. We `group by` the city column and project the
    // result into a plain `{ [slug]: number }` map for the client.
    // The `desc()` ordering is for stability / readability of the
    // underlying query plan; the client can re-order as it likes.
    const rows = await db
      .select({
        city: waitlistSignups.city,
        value: count(),
      })
      .from(waitlistSignups)
      .groupBy(waitlistSignups.city)
      .orderBy(desc(count()));

    const signupsByCity: Record<string, number> = {};
    for (const r of rows) {
      signupsByCity[r.city] = Number(r.value);
    }

    return jsonResponse(
      ok({
        totalSignups,
        signupsByCity,
      }),
      200,
    );
  } catch {
    return jsonResponse(
      err(
        ErrorCodes.INTERNAL,
        "We couldn't load the waitlist stats right now. Please try again in a moment.",
      ),
      500,
    );
  }
}
