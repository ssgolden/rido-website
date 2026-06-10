/**
 * Error capture and reporting for Rido.
 *
 * Today this is a thin wrapper that logs at `error` level and includes
 * the original stack plus any caller-supplied context. When `SENTRY_DSN`
 * is configured the Sentry transport will be plugged in here — see the
 * TODO below.
 *
 * @module observability/errors
 */
import { getEnv } from "@/lib/contract";
import { getLogger } from "./logger";

/** Caller-supplied context attached to the captured error report. */
export type ErrorContext = Record<string, unknown>;

/**
 * Capture an error: log it at `error` level with the full stack and
 * any caller context, and (TODO) forward it to Sentry if a DSN is set.
 *
 * Returns the original `err` so callers can `throw` it, re-throw, or
 * continue with fallback logic in a single statement:
 *
 * ```ts
 * try { ... }
 * catch (e) { throw captureError(e, { route: "/api/x" }); }
 * ```
 *
 * Never throws. Capture must not amplify the original failure.
 */
export function captureError(err: unknown, context?: ErrorContext): Error {
  const logger = getLogger();
  const e = err instanceof Error ? err : new Error(String(err));
  const bindings: Record<string, unknown> = { ...(context ?? {}) };
  // TODO: when SENTRY_DSN is set, also call:
  //   Sentry.captureException(e, { extra: bindings });
  // and ensure the Sentry SDK is initialised once at process boot.
  // The DSN check below is the gate; do not remove it.
  const dsn = safeReadSentryDsn();
  if (dsn) {
    // Tagged so log shippers / dashboards can group "would-be-Sentry" entries
    // even before the SDK is wired up.
    bindings.sentryForwarded = true;
  }
  logger.error({ err: e, ...bindings }, "captured error");
  return e;
}

/**
 * Read `SENTRY_DSN` from env without throwing. The logger is the very
 * first thing imported at boot, so `getEnv()` may legitimately not have
 * run yet (e.g. a startup-time crash). Fall back to the raw env var.
 */
function safeReadSentryDsn(): string | undefined {
  try {
    return getEnv().SENTRY_DSN;
  } catch {
    return process.env.SENTRY_DSN || undefined;
  }
}
