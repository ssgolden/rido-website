/**
 * Stripe SDK wrapper for the Rido backend.
 *
 * This is the only module in the codebase that instantiates the Stripe
 * Node SDK. Call sites import the helpers exposed from
 * `@/lib/payments` (re-exported from here) and never touch the raw SDK
 * directly, so we can keep the lazy-init / error / logging concerns in
 * one place.
 *
 * Design notes:
 *   - The {@link Stripe} client is **lazy-initialised** on first use and
 *     cached on `globalThis` so Next.js hot-reloads do not allocate a
 *     fresh client on every request in development.
 *   - The secret key is read from {@link getEnv} (`STRIPE_SECRET_KEY`).
 *     If the env is unconfigured, the module throws a typed
 *     {@link StripeConfigError} — we never silently fall back to a
 *     placeholder key.
 *   - Webhook signature verification is exposed as
 *     {@link constructWebhookEvent} so the route handler can stay
 *     agnostic of the SDK and we can swap the underlying crypto
 *     provider in one place if we ever need to.
 *   - Structured logging is intentionally minimal (mirrors
 *     `src/lib/email/client.ts`); a future observability agent can swap
 *     the implementation without changing call sites.
 *
 * @module src/lib/payments/stripe
 */

import Stripe from "stripe";

import { getEnv } from "@/lib/contract";

// ─── Public types ───────────────────────────────────────────────────────────

/**
 * Arguments accepted by {@link createCheckoutSession}. The set is kept
 * tight on purpose — Rido's pricing / entitlement logic lives elsewhere
 * and only the minimum needed to start a Stripe Checkout flow is exposed
 * here.
 */
export interface CreateCheckoutSessionInput {
  /** Stripe Price ID (`price_…`) the customer is buying. */
  priceId: string;
  /**
   * Pre-fills the checkout email field. Stripe still requires the
   * customer to confirm or change it; we do not assume the address
   * is verified just because we pre-filled it.
   */
  customerEmail: string;
  /** URL Stripe redirects to on a successful payment. */
  successUrl: string;
  /** URL Stripe redirects to if the customer cancels. */
  cancelUrl: string;
  /**
   * Free-form key/value pairs attached to the session. Useful for
   * reconciling the webhook back to a Rido user / plan in the
   * `checkout.session.completed` handler.
   */
  metadata?: Record<string, string>;
  /**
   * Stripe Customer ID (`cus_…`) to associate the session with. When
   * omitted Stripe creates an anonymous customer from the email
   * and we can resolve it later via the session object.
   */
  customerId?: string;
  /**
   * Quantity for the priced item. Defaults to 1 (single-seat / single
   * subscription). Ignored for tiered / metered prices.
   */
  quantity?: number;
}

/** Result of {@link createCheckoutSession}. */
export interface CheckoutSessionResult {
  /** The hosted Stripe Checkout URL the browser should redirect to. */
  url: string;
  /** Stripe Checkout Session ID (`cs_…`). */
  sessionId: string;
}

/** Arguments accepted by {@link createCustomerPortalSession}. */
export interface CreatePortalSessionInput {
  /** Stripe Customer ID (`cus_…`) we are opening the portal for. */
  customerId: string;
  /** URL the user is bounced to when they click "Back to Rido". */
  returnUrl: string;
}

/** Result of {@link createCustomerPortalSession}. */
export interface PortalSessionResult {
  /** The hosted Stripe Customer Portal URL. */
  url: string;
}

/**
 * Typed error thrown by every helper in this module when the Stripe
 * client is requested but `STRIPE_SECRET_KEY` is missing.
 *
 * Carries a stable `code` so the route handler / upstream caller can
 * branch on it (`instanceof StripeConfigError`) without parsing
 * messages.
 */
export class StripeConfigError extends Error {
  public readonly code: string;
  public readonly cause?: unknown;

  constructor(message: string, options: { code?: string; cause?: unknown } = {}) {
    super(message);
    this.name = "StripeConfigError";
    this.code = options.code ?? "STRIPE_NOT_CONFIGURED";
    this.cause = options.cause;
  }
}

// ─── Internal state ─────────────────────────────────────────────────────────

/**
 * Cached Stripe instance, stored on `globalThis` so HMR in dev doesn't
 * keep allocating new clients. Mirrors the pattern used by
 * `getEmailClient` in `@/lib/email/client` and `getDb` in
 * `@/lib/db/client`.
 */
type GlobalWithStripe = typeof globalThis & {
  __ridoStripe?: Stripe;
};
const g = globalThis as GlobalWithStripe;

/**
 * Minimal structured logger. Today it forwards to `console.*`; once the
 * observability agent ships a real logger (pino / Sentry) we swap this
 * implementation and every Stripe call picks it up.
 *
 * Shape mirrors `src/lib/email/client.ts` so the swap is mechanical.
 */
const log = {
  info: (msg: string, meta?: Record<string, unknown>) =>
    console.log(`[stripe] ${msg}`, meta ?? ""),
  warn: (msg: string, meta?: Record<string, unknown>) =>
    console.warn(`[stripe] ${msg}`, meta ?? ""),
  error: (msg: string, meta?: Record<string, unknown>) =>
    console.error(`[stripe] ${msg}`, meta ?? ""),
};

// ─── Client lifecycle ───────────────────────────────────────────────────────

/**
 * Lazily build (or return the cached) Stripe client.
 *
 * Reads `STRIPE_SECRET_KEY` from the validated env. We pass the key to
 * the SDK constructor (not to individual calls) so a single instance
 * is reused across the process, matching how the DB and Resend
 * clients are organised.
 *
 * @returns A process-global {@link Stripe} instance.
 * @throws {StripeConfigError} If `STRIPE_SECRET_KEY` is missing from
 *         the environment.
 */
export function getStripe(): Stripe {
  if (g.__ridoStripe) return g.__ridoStripe;

  const env = getEnv();
  if (!env.STRIPE_SECRET_KEY) {
    throw new StripeConfigError("STRIPE_SECRET_KEY is not configured", {
      code: "STRIPE_NOT_CONFIGURED",
    });
  }

  g.__ridoStripe = new Stripe(env.STRIPE_SECRET_KEY, {
    // We deliberately do NOT pin `apiVersion` — letting the SDK use
    // the version it was built against means we always have matching
    // types, and we don't have to coordinate a bump across the
    // codebase when Stripe rolls a new release.
    typescript: true,
    // Stripe's Node SDK already has sensible retry defaults; we
    // surface the option here so an SRE can tune it without touching
    // call sites.
    maxNetworkRetries: 1,
  });
  log.info("Stripe client initialised", {
    apiVersion: Stripe.API_VERSION,
    packageVersion: Stripe.PACKAGE_VERSION,
  });
  return g.__ridoStripe;
}

/**
 * Reset the cached client. Intended for tests that need to swap
 * `STRIPE_SECRET_KEY` between cases — production code should never
 * call this.
 */
export function __resetStripeClientForTests(): void {
  g.__ridoStripe = undefined;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Create a Stripe Checkout Session for a single line item.
 *
 * The session is configured for `subscription` mode so the
 * `checkout.session.completed` webhook carries a `subscription` ID we
 * can persist. Anonymous customers are created from the supplied
 * `customerEmail`; if you already have a Stripe Customer ID pass it
 * via `customerId` to attach the session to the existing record.
 *
 * @param input See {@link CreateCheckoutSessionInput}.
 * @returns The hosted checkout URL and session ID.
 * @throws {StripeConfigError} When `STRIPE_SECRET_KEY` is missing.
 * @throws {Stripe.errors.StripeError} When Stripe rejects the request.
 */
export async function createCheckoutSession(
  input: CreateCheckoutSessionInput,
): Promise<CheckoutSessionResult> {
  const stripe = getStripe();

  log.info("createCheckoutSession:start", {
    priceId: input.priceId,
    customerId: input.customerId ?? null,
    hasEmail: Boolean(input.customerEmail),
  });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: input.priceId,
        quantity: input.quantity ?? 1,
      },
    ],
    // Either pass the known Customer ID or let Stripe mint one from
    // the email. We never want to silently drop the email — it is the
    // primary reconciliation key on the Rido side until we have the
    // `customer.subscription.*` events.
    ...(input.customerId
      ? { customer: input.customerId }
      : { customer_email: input.customerEmail }),
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    // Metadata round-trips through every webhook the session
    // generates, so we can attach the Rido user/plan here once the
    // auth module is wired in.
    ...(input.metadata && Object.keys(input.metadata).length > 0
      ? { metadata: input.metadata }
      : {}),
    // Persist the email on the customer record even when we create
    // the customer from `customer_email` above; harmless when the
    // customer already exists.
    customer_creation: input.customerId ? undefined : "always",
    // Don't surprise users with surprising payment methods; let
    // Stripe pick the best set for the customer's locale / card.
    allow_promotion_codes: true,
  });

  if (!session.url) {
    // Stripe only returns a `url` for `payment` / `subscription`
    // modes, both of which we use. If we land here something has
    // changed upstream; surface it loudly.
    throw new StripeConfigError(
      "Stripe returned a checkout session without a URL",
      { code: "STRIPE_CHECKOUT_NO_URL" },
    );
  }

  log.info("createCheckoutSession:ok", {
    sessionId: session.id,
    customerId: session.customer ?? null,
  });

  return { url: session.url, sessionId: session.id };
}

/**
 * Create a Stripe Billing Portal session for an existing customer.
 *
 * The portal is where Rido users go to update their card, change
 * plans, download invoices, and cancel. Stripe handles all of the UI
 * and PCI surface; we just produce a one-shot signed URL.
 *
 * @param input See {@link CreatePortalSessionInput}.
 * @returns The hosted portal URL.
 * @throws {StripeConfigError} When `STRIPE_SECRET_KEY` is missing.
 * @throws {Stripe.errors.StripeError} When Stripe rejects the request.
 */
export async function createCustomerPortalSession(
  input: CreatePortalSessionInput,
): Promise<PortalSessionResult> {
  const stripe = getStripe();

  log.info("createCustomerPortalSession:start", {
    customerId: input.customerId,
  });

  const session = await stripe.billingPortal.sessions.create({
    customer: input.customerId,
    return_url: input.returnUrl,
  });

  log.info("createCustomerPortalSession:ok", { sessionId: session.id });
  return { url: session.url };
}

/**
 * Verify a Stripe webhook signature and return the parsed event.
 *
 * This is the single trust boundary between Stripe and the Rido
 * backend. **Never** parse the payload yourself, **never** trust an
 * event whose signature you haven't verified here — the rest of the
 * webhook handler is allowed to be naive about that.
 *
 * Reads `STRIPE_WEBHOOK_SECRET` from the validated env; throws a
 * {@link StripeConfigError} if it is missing (so a misconfigured
 * production deploy fails loud, not silent).
 *
 * @param payload The raw request body, exactly as Stripe sent it. Must
 *                be a string or `Buffer` — do **not** parse it as JSON
 *                first, or the signature won't match.
 * @param signature The value of the `stripe-signature` header.
 * @returns The verified {@link Stripe.Event}.
 * @throws {StripeConfigError} When `STRIPE_WEBHOOK_SECRET` is missing.
 * @throws {Stripe.errors.StripeSignatureVerificationError} When the
 *         signature does not match the payload.
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
): Stripe.Event {
  const env = getEnv();
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new StripeConfigError("STRIPE_WEBHOOK_SECRET is not configured", {
      code: "STRIPE_WEBHOOK_NOT_CONFIGURED",
    });
  }

  // Static helper on the SDK — does not require an instantiated
  // client, but we go through `getStripe()` lazily so we still get
  // the cached key + a single point of config.
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    env.STRIPE_WEBHOOK_SECRET,
  );
}
