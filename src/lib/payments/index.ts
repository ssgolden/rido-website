/**
 * Barrel export for `@/lib/payments`.
 *
 * Everything the rest of the backend needs to talk to Stripe is
 * re-exported from here:
 *
 * ```ts
 * import {
 *   createCheckoutSession,
 *   createCustomerPortalSession,
 *   constructWebhookEvent,
 *   getStripe,
 * } from "@/lib/payments";
 * ```
 *
 * The internal state (cached SDK instance, logger) stays in
 * `stripe.ts`; this file is a pure re-export so call sites have a
 * stable import surface and we can move files around internally
 * without touching every consumer.
 *
 * @module src/lib/payments
 */

// ─── Client lifecycle ───────────────────────────────────────────────────────
export {
  getStripe,
  __resetStripeClientForTests,
} from "@/lib/payments/stripe";

// ─── Public helpers ─────────────────────────────────────────────────────────
export {
  createCheckoutSession,
  createCustomerPortalSession,
  constructWebhookEvent,
  StripeConfigError,
  type CreateCheckoutSessionInput,
  type CheckoutSessionResult,
  type CreatePortalSessionInput,
  type PortalSessionResult,
} from "@/lib/payments/stripe";
