/**
 * POST /api/webhooks/stripe
 *
 * Single entry point for every event Stripe sends to Rido. The
 * request body is Stripe's raw JSON, the `stripe-signature` header
 * carries an HMAC of that body, and we **must** verify the signature
 * before doing anything else — webhook payloads are unauthenticated
 * HTTP traffic, and trusting them opens a backend to forged
 * subscription events.
 *
 * Behaviour summary:
 *   1. Reject any non-POST method with `405 METHOD_NOT_ALLOWED` (in
 *      practice Next.js routes only see methods we export, but we
 *      double-check for clarity).
 *   2. Read the **raw** body via `req.text()`. We cannot use
 *      `req.json()` here — the signature is computed over the byte
 *      stream, and re-serialising a parsed object would change
 *      whitespace / key order and break the HMAC.
 *   3. Pull the `stripe-signature` header. Missing → `400 BAD_REQUEST`.
 *   4. Verify with {@link constructWebhookEvent}. Invalid signature
 *      → `400 BAD_REQUEST` (we do **not** leak the underlying Stripe
 *      error message to the caller).
 *   5. Dispatch on `event.type`:
 *        - `checkout.session.completed` → `// TODO store subscription in DB`
 *        - `customer.subscription.updated` → `// TODO update subscription`
 *        - `customer.subscription.deleted` → `// TODO mark cancelled`
 *        - everything else → logged and acknowledged (Stripe expects
 *          a 2xx on receipt, even for events we don't act on).
 *   6. Always return `200 { received: true }` on the happy path. A
 *      4xx/5xx here tells Stripe to retry, and we don't want retries
 *      for events we've intentionally ignored.
 *
 * Runtime:
 *   The Stripe Node SDK uses `node:crypto` for signature verification
 *   and is not Edge-safe, so we pin `runtime = "nodejs"`. We also pin
 *   `dynamic = "force-dynamic"` so the route is never cached /
 *   prerendered — caching webhooks would be a disaster.
 *
 * Caching:
 *   `Cache-Control: no-store` on every response.
 *
 * Security:
 *   - The signature is the only thing we trust. A bad signature is
 *     a 400, not a 500, and we never echo the underlying error.
 *   - We do not log the raw payload (PII + payment data); we log
 *     `event.id` and `event.type` only.
 *
 * @module src/app/api/webhooks/stripe
 */

import { NextResponse, type NextRequest } from "next/server";

import { ok, err, ErrorCodes } from "@/lib/contract";
import {
  constructWebhookEvent,
  StripeConfigError,
} from "@/lib/payments";

// ─── Route config ───────────────────────────────────────────────────────────

/**
 * Run on the Node.js runtime. The Stripe Node SDK uses
 * `node:crypto` for HMAC verification of webhook signatures and is
 * not compatible with the Edge runtime.
 */
export const runtime = "nodejs";

/**
 * Never cache / never prerender this route. Webhook traffic must
 * hit the handler on every request — caching would mean we'd
 * "ack" events without processing them, and prerendering would
 * mean we'd never see any events at all.
 */
export const dynamic = "force-dynamic";

// ─── Constants ──────────────────────────────────────────────────────────────

/** Standard `Cache-Control: no-store` value applied to every response. */
const NO_STORE = "no-store" as const;

/** The Stripe header carrying the HMAC signature of the raw body. */
const STRIPE_SIGNATURE_HEADER = "stripe-signature";

// ─── Minimal structured logger ──────────────────────────────────────────────

/**
 * Same shape as the shim in `src/lib/payments/stripe.ts` — keep
 * them in sync so a future observability agent can swap both in
 * one PR.
 */
const log = {
  info: (msg: string, meta?: Record<string, unknown>) =>
    console.log(`[webhook:stripe] ${msg}`, meta ?? ""),
  warn: (msg: string, meta?: Record<string, unknown>) =>
    console.warn(`[webhook:stripe] ${msg}`, meta ?? ""),
  error: (msg: string, meta?: Record<string, unknown>) =>
    console.error(`[webhook:stripe] ${msg}`, meta ?? ""),
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Wrap a contract envelope in a `NextResponse` with the standard
 * `Cache-Control: no-store` header applied.
 *
 * @param body The contract envelope (`ok(...)` or `err(...)` result).
 * @param status HTTP status code.
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

// ─── Route handler ──────────────────────────────────────────────────────────

/**
 * Handle a `POST /api/webhooks/stripe` request.
 *
 * See the module JSDoc for the full behaviour walk-through.
 *
 * @param req The incoming Next.js request carrying a raw Stripe
 *            event payload and a `stripe-signature` header.
 * @returns A {@link NextResponse} with the contract envelope.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Method guard. Next.js will not route non-POST methods here
  //    (we only export `POST`), but the explicit check documents
  //    intent and future-proofs against accidental re-exports.
  if (req.method !== "POST") {
    return jsonResponse(
      err(ErrorCodes.METHOD_NOT_ALLOWED, "Only POST is supported"),
      405,
    );
  }

  // 2. Read the **raw** body. Using `req.text()` returns the
  //    unparsed body string, which is what Stripe's HMAC is
  //    computed over. Using `req.json()` and re-stringifying would
  //    break the signature.
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return jsonResponse(
      err(ErrorCodes.BAD_REQUEST, "Request body could not be read"),
      400,
    );
  }

  if (!rawBody) {
    return jsonResponse(
      err(ErrorCodes.BAD_REQUEST, "Request body is empty"),
      400,
    );
  }

  // 3. Pull the signature header. We accept the typed `string` form
  //    only — if a misbehaving proxy delivers an array we treat it
  //    the same as a missing header.
  const signature = req.headers.get(STRIPE_SIGNATURE_HEADER);
  if (!signature) {
    log.warn("webhook:missing-signature");
    return jsonResponse(
      err(
        ErrorCodes.BAD_REQUEST,
        "Missing stripe-signature header",
      ),
      400,
    );
  }

  // 4. Verify the signature. This is the single trust boundary
  //    between Stripe and the Rido backend — never weaken it.
  let event;
  try {
    event = constructWebhookEvent(rawBody, signature);
  } catch (e) {
    // Both signature-mismatch and missing webhook secret land here.
    // Log enough to debug from server logs, but DO NOT echo the
    // underlying error to the caller (it can leak internals and
    // helps attackers probe for the secret).
    const message = e instanceof Error ? e.message : String(e);
    const isConfig = e instanceof StripeConfigError;
    log.warn("webhook:signature-verification-failed", {
      reason: isConfig ? "config" : "signature",
      message: isConfig ? message : undefined,
    });
    return jsonResponse(
      err(
        ErrorCodes.BAD_REQUEST,
        isConfig
          ? "Webhook is not configured on the server"
          : "Invalid signature",
      ),
      400,
    );
  }

  // 5. Dispatch. Anything we don't act on is acknowledged with a
  //    200 — Stripe retries on non-2xx and we don't want retries
  //    for events we've intentionally ignored.
  log.info("webhook:received", {
    eventId: event.id,
    eventType: event.type,
  });

  switch (event.type) {
    case "checkout.session.completed": {
      // TODO: store subscription in DB. The session object is
      // available as `event.data.object` (typed as
      // `Stripe.Checkout.Session`). Persist the
      // `subscription` / `customer` / `metadata` / `amount_total`
      // onto the matching Rido user record.
      break;
    }
    case "customer.subscription.updated": {
      // TODO: update subscription. `event.data.object` is a
      // `Stripe.Subscription`; reconcile `status`,
      // `current_period_end`, `cancel_at_period_end`, and
      // `items.data[].price.id` against the DB row.
      break;
    }
    case "customer.subscription.deleted": {
      // TODO: mark cancelled. `event.data.object` is a
      // `Stripe.Subscription`; flip the local status to
      // `cancelled` and stop the clock on any entitlements tied
      // to it.
      break;
    }
    default: {
      // Unknown / unhandled event type — log and acknowledge.
      log.info("webhook:ignored", { eventType: event.type });
      break;
    }
  }

  // 6. Acknowledge. Stripe expects a 2xx on successful receipt
  //    regardless of whether we processed the event.
  return jsonResponse(ok({ received: true }), 200);
}
