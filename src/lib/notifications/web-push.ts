/**
 * Web Push (VAPID) notifications module for Rido.
 *
 * This file is the single source of truth for everything Web Push on the
 * server side. It wraps the `web-push` npm library with Rido-specific
 * defaults, a typed error envelope, and a thin cache around `getVapidKeys()`
 * so the env vars are read at most once per process.
 *
 * Responsibilities:
 *   - {@link getVapidKeys} — return the VAPID public/private key pair read
 *     from env. Used by both the server (this file) and the client (via
 *     the public key passed through `NEXT_PUBLIC_VAPID_PUBLIC_KEY`).
 *   - {@link setVapidDetailsOnce} — call `web-push.setVapidDetails(...)`
 *     lazily, the first time anything actually needs to send a push.
 *     Idempotent; safe to call from many concurrent requests.
 *   - {@link sendNotification} — send a single push to a single
 *     subscription. Wraps `web-push.sendNotification` so the rest of the
 *     codebase can depend on a tight, Rido-flavoured signature, and
 *     re-throws a {@link WebPushError} carrying the upstream status code
 *     for cleaner 4xx vs 5xx translation at the API boundary.
 *
 * The module is intentionally transport-agnostic: nothing in this file
 * imports Next.js, Drizzle, or the DB. It's safe to call from any Node
 * runtime context (route handler, queue worker, cron job, script).
 *
 * Env contract (see `src/lib/contract.ts`):
 *   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` — URL-safe base64 VAPID public key.
 *     This file uses it server-side to sign JWTs.
 *   - `VAPID_PRIVATE_KEY`            — URL-safe base64 VAPID private key.
 *     Server-only. Never expose to the client.
 *   - `VAPID_SUBJECT`                — Optional. `mailto:…` or `https:…`
 *     value used as the JWT `sub` claim. Defaults to `mailto:info@rido.bike`.
 *
 * @module src/lib/notifications/web-push
 */

import {
  sendNotification as webpushSendNotification,
  setVapidDetails as webpushSetVapidDetails,
  type PushSubscription,
  type SendResult,
  WebPushError as UpstreamWebPushError,
} from "web-push";

import { getEnv } from "@/lib/contract";
import { getLogger } from "@/lib/observability";

// ─── Public types ──────────────────────────────────────────────────────────

/**
 * The VAPID key pair used to sign Web Push JWTs.
 *
 * Both fields are URL-safe base64 encoded strings, exactly as returned by
 * `web-push.generateVAPIDKeys()` and as stored in env. The contract in
 * `src/lib/contract.ts` guarantees `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is a
 * non-empty string and `VAPID_PRIVATE_KEY` is a non-empty string — both
 * are declared `.optional()` at the schema level because fresh dev
 * environments may not have generated a pair yet; this module surfaces
 * the missing-key case as a thrown `Error` so the API layer can return
 * a clear 500 with `NOT_IMPLEMENTED`.
 */
export interface VapidKeys {
  /** URL-safe base64 VAPID public key (safe to expose to the browser). */
  publicKey: string;
  /** URL-safe base64 VAPID private key. Server-only. */
  privateKey: string;
}

/**
 * Input shape for {@link sendNotification}.
 *
 * The subscription is the exact JSON shape that the browser's
 * `PushSubscription.toJSON()` produces, i.e. `{ endpoint, keys: { p256dh,
 * auth } }`. We accept it verbatim so the client side can pass the
 * `PushSubscription` it got from `pushManager.subscribe()` without any
 * re-shaping.
 */
export interface SendNotificationInput {
  /**
   * The browser's `PushSubscription` for the recipient. Must include a
   * non-empty `endpoint` and a `keys` object with both `p256dh` and
   * `auth` populated (the standard Web Push encryption material).
   */
  subscription: PushSubscription;
  /**
   * Optional string payload to deliver to the client. If omitted the
   * push service is hit with an empty body, which is valid — the client
   * will still receive a `push` event, and the service worker decides
   * what (if anything) to display.
   */
  payload?: string;
  /**
   * Optional Time-To-Live in seconds, forwarded to the push service as
   * the `TTL` header. If the device is offline, the push service will
   * keep the message for at most this many seconds before giving up.
   * Defaults to `DEFAULT_TTL_SECONDS` (4 weeks, per the Web Push spec).
   */
  ttl?: number;
}

/**
 * Result of a successful {@link sendNotification} call.
 *
 * This is a thin re-shape of `web-push`'s `SendResult`: the `body`,
 * `headers`, and `statusCode` come straight from the upstream push
 * service, and we add a `sentAt` ISO-8601 timestamp for log correlation.
 */
export interface SendNotificationResult {
  /** HTTP status code returned by the push service (typically 201). */
  statusCode: number;
  /** Raw response body from the push service (often empty). */
  body: string;
  /** Response headers from the push service. */
  headers: Record<string, string>;
  /** ISO-8601 timestamp captured at the moment of the successful send. */
  sentAt: string;
}

// ─── Custom error ──────────────────────────────────────────────────────────

/**
 * Error thrown by {@link sendNotification} when the upstream push service
 * returns a non-2xx status code.
 *
 * The shape mirrors the upstream `web-push` `WebPushError` class so the
 * existing `try/catch` patterns the rest of the backend uses keep working,
 * but we re-export the type as a Rido-owned class so the rest of the
 * codebase can `instanceof`-check against a symbol that lives in this
 * repo, not a third-party package (a vendoring hazard if `web-push`
 * ever ships a breaking change to its error type).
 *
 * Status code semantics (per RFC 8030 and the push services' de-facto
 * conventions):
 *
 *   - `400` / `404` / `410` — the subscription is no longer valid and
 *     MUST be deleted from the DB. We surface `statusCode` verbatim so
 *     the route layer can branch on it.
 *   - `401` / `403` — VAPID misconfiguration (bad keys, wrong subject).
 *     Configuration error, not a per-subscription problem.
 *   - `429` — the push service is rate-limiting us. The caller should
 *     back off and retry later.
 *   - `5xx` — transient upstream failure. Retry with jitter.
 */
export class WebPushError extends Error {
  /**
   * The HTTP status code returned by the push service. Mirrors the
   * upstream `web-push` `WebPushError.statusCode` field verbatim.
   */
  readonly statusCode: number;
  /** Response headers from the push service. */
  readonly headers: Record<string, string>;
  /** Raw response body from the push service. */
  readonly body: string;
  /** The endpoint URL we were sending to. */
  readonly endpoint: string;
  /**
   * The upstream error's `name` (always `"WebPushError"` in the source
   * library). Preserved so log shippers / Sentry can still group by it.
   */
  readonly name = "WebPushError";

  constructor(
    message: string,
    statusCode: number,
    headers: Record<string, string>,
    body: string,
    endpoint: string,
  ) {
    super(message);
    // Keep the prototype chain intact when down-compiling to ES2017.
    Object.setPrototypeOf(this, WebPushError.prototype);
    this.statusCode = statusCode;
    this.headers = headers;
    this.body = body;
    this.endpoint = endpoint;
  }
}

// ─── Constants ─────────────────────────────────────────────────────────────

/**
 * Default `TTL` for {@link sendNotification} when the caller doesn't
 * supply one. Matches the Web Push RFC's recommended default of 4 weeks
 * (2_419_200 seconds).
 */
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 28;

/**
 * The `subject` claim used in the VAPID JWT. Per the VAPID spec this
 * must be either a `mailto:` email or an `https:` URL identifying the
 * party responsible for the push. We use the project's `info@rido.bike`
 * inbox by default; the override env var is `VAPID_SUBJECT` and is
 * intentionally NOT in `src/lib/contract.ts` because it's a hard
 * requirement (not an optional knob) once a VAPID pair is configured.
 */
const DEFAULT_VAPID_SUBJECT = "mailto:info@rido.bike";

/**
 * Resolve the VAPID `subject` claim from env. Falls back to the
 * project inbox when the env var is missing or empty. Reading
 * `process.env` directly (rather than going through `getEnv()`) is
 * intentional: `VAPID_SUBJECT` is not part of the public contract and
 * may legitimately be unset, so a missing var must not throw.
 */
function resolveVapidSubject(): string {
  const raw = process.env.VAPID_SUBJECT;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.length > 0) return trimmed;
  }
  return DEFAULT_VAPID_SUBJECT;
}

// ─── Cached state ──────────────────────────────────────────────────────────

/**
 * Process-wide cache of the VAPID keys + subject. Populated lazily on
 * the first call to {@link getVapidKeys} so the env validation cost is
 * paid once, not on every push. Cleared by the underscore-prefixed
 * test escape hatch.
 */
let cachedKeys: VapidKeys | null = null;
let cachedSubject: string | null = null;
/**
 * Tracks whether `web-push.setVapidDetails(...)` has been called for
 * the currently cached VAPID keys. We don't store the function's
 * return value — `setVapidDetails` is synchronous and idempotent —
 * but we use a single boolean to keep the "called it yet?" check
 * branch-free.
 */
let vapidDetailsConfigured = false;

// ─── Public API: VAPID keys ────────────────────────────────────────────────

/**
 * Return the VAPID key pair, reading from env (via `getEnv()`) on the
 * first call and caching the result for the lifetime of the process.
 *
 * Behaviour:
 *   - If both `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` are
 *     set and non-empty, returns them as-is.
 *   - If either is missing or empty, throws an `Error` with a clear
 *     "what to do next" message. The route layer translates this to a
 *     `500 NOT_IMPLEMENTED` because Web Push is impossible to operate
 *     without a configured key pair.
 *
 * The cache is process-global, which matches the lifecycle of
 * `getEnv()` itself (also memoized in `src/lib/contract.ts`). The
 * underscore-prefixed test escape hatch can be used to force a re-read
 * in test setups.
 *
 * @returns A {@link VapidKeys} with both fields populated.
 * @throws  {Error} if either key is missing from the env.
 */
export function getVapidKeys(): VapidKeys {
  if (cachedKeys) return cachedKeys;

  const env = getEnv();
  const publicKey = env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privateKey = env.VAPID_PRIVATE_KEY?.trim();

  if (!publicKey || !privateKey) {
    throw new Error(
      "VAPID keys are not configured. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY " +
        "and VAPID_PRIVATE_KEY in your environment to enable Web Push. " +
        "Generate a pair with `npx web-push generate-vapid-keys`.",
    );
  }

  cachedKeys = { publicKey, privateKey };
  return cachedKeys;
}

/**
 * Reset the in-process VAPID cache. Test-only escape hatch — production
 * code should never need this because `getEnv()` is itself memoized.
 *
 * Calling this drops the cached keys, the cached subject, and the
 * "setVapidDetails has been called" flag, so the next call to
 * {@link getVapidKeys} or {@link sendNotification} re-reads env and
 * re-registers with the `web-push` library.
 */
export function _resetWebPushStateForTests(): void {
  cachedKeys = null;
  cachedSubject = null;
  vapidDetailsConfigured = false;
}

// ─── Public API: sendNotification ─────────────────────────────────────────

/**
 * Send a single Web Push notification to a single browser subscription.
 *
 * Behaviour:
 *   - On the first call, lazily registers the VAPID `subject` and keys
 *     with the `web-push` library via `setVapidDetails(...)`. Subsequent
 *     calls re-use the same registration.
 *   - Forwards `payload` and `ttl` to the library verbatim. If `payload`
 *     is omitted, the push service is hit with an empty body, which the
 *     service worker can still react to (a "ping" notification).
 *   - On success, resolves to a {@link SendNotificationResult}.
 *   - On upstream failure, re-throws a {@link WebPushError} carrying the
 *     `statusCode` from the push service so the route layer can branch
 *     on 4xx (delete the subscription) vs 5xx (retry).
 *
 * @param input The subscription, optional payload, and optional TTL.
 *              See {@link SendNotificationInput}.
 * @returns A {@link SendNotificationResult} on success.
 * @throws  {WebPushError} when the upstream push service returns a
 *          non-2xx status code.
 * @throws  {Error} when VAPID keys are not configured, or when the
 *          underlying `web-push` library throws a non-`WebPushError`
 *          (e.g. network/parse failure).
 */
export async function sendNotification(
  input: SendNotificationInput,
): Promise<SendNotificationResult> {
  const { subscription, payload, ttl } = input;
  const log = getLogger().child({ module: "notifications.web-push" });

  // 1. Make sure the library is configured with our VAPID details. We
  //    do this lazily so the cost of `setVapidDetails` (one HMAC
  //    pre-parse, basically free) is paid only on the first send, not
  //    on every import of this module.
  setVapidDetailsOnce();

  // 2. Forward to the library. We use `webpush.sendNotification` (the
  //    default import) rather than the `sendNotification` symbol so we
  //    don't shadow our own function name.
  try {
    const result: SendResult = await webpushSendNotification(
      subscription,
      payload,
      {
        TTL: ttl ?? DEFAULT_TTL_SECONDS,
      },
    );

    return {
      statusCode: result.statusCode,
      body: result.body,
      headers: result.headers as Record<string, string>,
      sentAt: new Date().toISOString(),
    };
  } catch (e) {
    // 3. The library throws a `WebPushError` for any non-2xx response
    //    from the push service. Re-throw a Rido-flavoured copy so the
    //    rest of the codebase can `instanceof`-check against a symbol
    //    owned by us.
    if (e instanceof UpstreamWebPushError) {
      log.warn(
        {
          err: e,
          endpoint: subscription.endpoint,
          statusCode: e.statusCode,
        },
        "web push rejected by upstream",
      );
      throw new WebPushError(
        e.message,
        e.statusCode,
        e.headers as Record<string, string>,
        e.body,
        e.endpoint,
      );
    }

    // 4. Anything else is a transport / parse / config error. We log
    //    at `error` (this is a real failure, not an upstream rejection
    //    we can branch on) and re-throw the original error so the
    //    caller's `instanceof` checks keep working.
    log.error(
      {
        err: e,
        endpoint: subscription.endpoint,
      },
      "web push send failed",
    );
    throw e;
  }
}

// ─── Internals ─────────────────────────────────────────────────────────────

/**
 * Register the VAPID details with the `web-push` library, exactly once
 * per process. Safe to call from many concurrent requests; the
 * `vapidDetailsConfigured` flag short-circuits subsequent calls.
 *
 * If the keys change at runtime (e.g. test setup that calls
 * `_resetWebPushStateForTests`) the flag is cleared and the next call
 * re-registers with the new key pair.
 */
function setVapidDetailsOnce(): void {
  if (vapidDetailsConfigured) return;

  const { publicKey, privateKey } = getVapidKeys();
  const subject = resolveAndCacheVapidSubject();

  webpushSetVapidDetails(subject, publicKey, privateKey);
  vapidDetailsConfigured = true;
}

/**
 * Resolve and cache the VAPID subject. The env is read once per
 * process; subsequent calls reuse the cached string.
 */
function resolveAndCacheVapidSubject(): string {
  if (cachedSubject) return cachedSubject;
  cachedSubject = resolveVapidSubject();
  return cachedSubject;
}
