/**
 * Server-side analytics helpers for the Rido platform.
 *
 * This module owns:
 *   1. The Zod schema that validates the `/api/analytics` request body.
 *   2. The PII / secret sanitisation step that runs on `properties` BEFORE
 *      the row is written to the `analytics_events` table.
 *   3. A thin `recordAnalyticsEvent` helper that does the DB insert and is
 *      consumed by `src/app/api/analytics/route.ts`.
 *
 * The client-side hook (`useAnalyticsEvent` / a fire-and-forget beacon)
 * is owned by another agent and is intentionally NOT defined here.
 *
 * @module src/lib/analytics/server
 */

import { z } from "zod";
import { getDb, analyticsEvents, type NewAnalyticsEvent } from "@/lib/db";

// ─── Request shape ──────────────────────────────────────────────────────────

/**
 * Raw, pre-validation body shape for `POST /api/analytics`.
 *
 * - `name`        : the event name (e.g. `"cta_clicked"`, `"page_viewed"`).
 *                   Tracked separately from the optional `properties` blob
 *                   so the column can be indexed for cheap per-event queries.
 * - `properties`  : optional free-form JSON payload. Sanitised in
 *                   {@link sanitizeProperties} before persistence — keys that
 *                   look like PII / secrets are stripped.
 * - `sessionId`   : a client-generated identifier that links multiple events
 *                   from the same browser session. Not validated as a UUID
 *                   because some clients (e.g. the marketing site) use a
 *                   short opaque token; we cap the length instead.
 */
export const analyticsEventSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Event name is required")
    .max(128, "Event name must be at most 128 characters"),
  properties: z
    .record(z.string(), z.unknown())
    .optional()
    .default({}),
  sessionId: z
    .string()
    .trim()
    .min(1, "sessionId is required")
    .max(128, "sessionId must be at most 128 characters"),
});
export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;

/**
 * Validated, post-sanitisation event body. `properties` has been stripped of
 * any key starting with `_` or containing a sensitive substring, so the
 * caller can safely forward it to the DB.
 */
export type SanitizedAnalyticsEvent = {
  name: string;
  properties: Record<string, unknown>;
  sessionId: string;
};

// ─── Sanitisation ───────────────────────────────────────────────────────────

/**
 * Lower-cased substrings that, when present in a property key, mark the
 * value as a likely secret and require it to be dropped before persistence.
 *
 * The match is case-insensitive — see {@link sanitizeProperties}.
 */
const SENSITIVE_KEY_SUBSTRINGS: readonly string[] = [
  "password",
  "token",
  "secret",
  "apikey",
  "authorization",
];

/**
 * Decide whether a single property key should be stripped from the event
 * payload.
 *
 * A key is considered sensitive if either of the following is true:
 *   1. It starts with an underscore (`_`). Convention: underscored keys
 *      carry private / server-only data and must never reach the analytics
 *      table (this is the same rule that Vercel Analytics, PostHog, etc.
 *      use for "redacted" fields).
 *   2. Its lowercased form contains one of the substrings in
 *      {@link SENSITIVE_KEY_SUBSTRINGS} (`password`, `token`, `secret`,
 *      `apikey`, `authorization`). The substring match (rather than
 *      equality) catches keys like `userPassword`, `id_token`,
 *      `stripe_api_key`, `apiKeyHash`, and `Authorization-Header` without
 *      us having to enumerate every variant.
 *
 * @param key The property key from the request body.
 * @returns `true` if the key should be dropped from the event payload.
 */
export function isSensitiveKey(key: string): boolean {
  if (typeof key !== "string" || key.length === 0) return true;
  if (key.startsWith("_")) return true;
  const lower = key.toLowerCase();
  for (const needle of SENSITIVE_KEY_SUBSTRINGS) {
    if (lower.includes(needle)) return true;
  }
  return false;
}

/**
 * Strip sensitive keys from an event's `properties` blob.
 *
 * Rules (mirrors {@link isSensitiveKey}):
 *   - Drop any top-level key that starts with `_`.
 *   - Drop any top-level key whose lower-cased form contains
 *     `password`, `token`, `secret`, `apikey`, or `authorization`.
 *   - Do NOT recurse into nested objects — v1 stores properties as a
 *     flat `Record<string, unknown>`, and a deeper walk is more likely
 *     to false-positive (e.g. a `userTokenCount` field inside a nested
 *     object is a metric, not a credential). If a future schema needs
 *     nested scrubbing, this is the call site.
 *   - Values for kept keys are forwarded as-is. The schema does not
 *     constrain value shape (`z.unknown()`), so primitives, arrays, and
 *     objects all pass through. Callers that need stricter typing should
 *     validate at the call site, not here.
 *
 * The function never throws and always returns a plain object, so the
 * route handler can use the result as a drop-in for `properties`.
 *
 * @param properties The raw `properties` object from the request body
 *                   (after Zod parsing, so it is guaranteed to be a
 *                   `Record<string, unknown>` if defined).
 * @returns A new object with the sensitive keys removed. Always a fresh
 *          object — the input is never mutated.
 */
export function sanitizeProperties(
  properties: Record<string, unknown> | undefined,
): Record<string, unknown> {
  if (!properties || typeof properties !== "object") return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (isSensitiveKey(key)) continue;
    out[key] = value;
  }
  return out;
}

/**
 * Validate an event payload, sanitise its `properties`, and return the
 * ready-to-persist shape. The route handler calls this once and then
 * forwards the result to {@link recordAnalyticsEvent}.
 *
 * @param raw The parsed JSON body of the request (after `req.json()`).
 * @returns The sanitised event.
 * @throws {ZodError} If `raw` does not match {@link analyticsEventSchema}.
 *         The route handler catches this and turns it into a 400 envelope.
 */
export function sanitizeAnalyticsEvent(raw: unknown): SanitizedAnalyticsEvent {
  const parsed = analyticsEventSchema.parse(raw);
  return {
    name: parsed.name,
    properties: sanitizeProperties(parsed.properties),
    sessionId: parsed.sessionId,
  };
}

// ─── Persistence ────────────────────────────────────────────────────────────

/**
 * Row payload accepted by {@link recordAnalyticsEvent}. The route handler
 * builds this from the sanitised event plus the request-scoped metadata
 * (IP, user-agent, locale) before calling the helper.
 */
export type RecordAnalyticsEventArgs = {
  /** Validated + sanitised event. */
  name: string;
  /** Sanitised properties (already filtered by {@link sanitizeProperties}). */
  properties: Record<string, unknown>;
  /** Client-supplied session id. */
  sessionId: string;
  /** Best-effort client IP, or `null` if it could not be resolved. */
  ip: string | null;
  /** User-Agent header, or `null` if missing. */
  userAgent: string | null;
  /** Resolved locale (e.g. `"en"` / `"es"`), or `null` if not provided. */
  locale: string | null;
};

/**
 * Persist a single analytics event to the `analytics_events` table.
 *
 * The function intentionally swallows DB errors at the call site
 * (see `src/app/api/analytics/route.ts`): the route returns 204 even
 * if the row write fails, so a transient DB hiccup does not break a
 * successful page load. Failures are out of scope for v1 logging —
 * adding a structured logger is a `TODO` for the observability agent.
 *
 * The insert is fire-and-forget from the caller's perspective: this
 * helper does not return the new row (the route returns 204 anyway),
 * and we deliberately skip `.returning({ id: … })` to keep the SQL
 * plan as cheap as possible. If a future caller needs the id, the
 * return type can be widened to `Promise<{ id: string }>` and the
 * `.returning(...)` added back.
 *
 * @param args The sanitised event + request metadata. See
 *             {@link RecordAnalyticsEventArgs}.
 */
export async function recordAnalyticsEvent(
  args: RecordAnalyticsEventArgs,
): Promise<void> {
  const db = getDb();
  const row: NewAnalyticsEvent = {
    name: args.name,
    properties: args.properties,
    sessionId: args.sessionId,
    ip: args.ip,
    userAgent: args.userAgent,
    locale: args.locale,
  };
  await db.insert(analyticsEvents).values(row);
}
