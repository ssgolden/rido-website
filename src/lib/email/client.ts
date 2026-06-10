/**
 * Resend-backed email client for the Rido backend.
 *
 * This is the only place in the codebase that talks to Resend. Templates
 * produce `{ subject, html, text }` and {@link sendEmail} handles the
 * network call, the `from` / `replyTo` defaults, error wrapping, and
 * structured logging. Call sites should never instantiate `Resend`
 * directly.
 *
 * The client is lazy-initialized on first use so the module is safe to
 * import in environments that don't actually send mail (e.g. build, unit
 * tests) — `getEnv()` runs only when {@link getEmailClient} is called.
 *
 * @module src/lib/email/client
 */

import { Resend, type Tag } from "resend";

import { getEnv } from "@/lib/contract";

// ─── Public types ───────────────────────────────────────────────────────────

/**
 * Arguments to {@link sendEmail}. Mirrors the subset of Resend's
 * `CreateEmailOptions` we actually use so callers don't have to depend
 * on the SDK surface.
 */
export interface SendEmailInput {
  /** Recipient address. Multiple recipients should be joined upstream. */
  to: string;
  /** Plain-text subject line (no HTML). */
  subject: string;
  /** Fully-rendered HTML body (inline-styled). */
  html: string;
  /** Plain-text fallback body for non-HTML clients. */
  text: string;
  /** Optional `Reply-To` override (defaults to `EMAIL_REPLY_TO`). */
  replyTo?: string;
  /**
   * Optional Resend tags. Useful for analytics / filtering on the
   * dashboard (e.g. `{ name: "template", value: "waitlist" }`).
   */
  tags?: Tag[];
}

/**
 * Successful result of {@link sendEmail}. Wraps Resend's `id` so future
 * fields (e.g. a job-id for the queue) can be added without breaking
 * callers.
 */
export interface SendEmailResult {
  id: string;
}

/**
 * Error class thrown by {@link sendEmail} when Resend returns a failure
 * payload or the network call throws.
 *
 * Carries the original Resend error code / message when available so the
 * caller can decide whether to retry, surface to Sentry, or fall back.
 */
export class EmailSendError extends Error {
  public readonly code: string;
  public readonly statusCode: number | null;
  public readonly cause?: unknown;

  constructor(
    message: string,
    options: { code: string; statusCode?: number | null; cause?: unknown } = {
      code: "EMAIL_SEND_FAILED",
    },
  ) {
    super(message);
    this.name = "EmailSendError";
    this.code = options.code;
    this.statusCode = options.statusCode ?? null;
    this.cause = options.cause;
  }
}

// ─── Internal state ─────────────────────────────────────────────────────────

/**
 * Cached Resend instance, stored on `globalThis` so HMR in dev doesn't
 * keep allocating new clients. Mirrors the pattern used by `getDb` in
 * `@/lib/db/client`.
 */
type GlobalWithResend = typeof globalThis & {
  __ridoResend?: Resend;
};
const g = globalThis as GlobalWithResend;

/**
 * Minimal structured logger. Today it forwards to `console.*`; once the
 * observability agent ships a real logger (pino / Sentry) we swap this
 * implementation and every email-send call picks it up.
 *
 * The shape is intentionally tiny — just `info`, `warn`, `error` — so
 * swapping it later is mechanical.
 */
const log = {
  info: (msg: string, meta?: Record<string, unknown>) =>
    console.log(`[email] ${msg}`, meta ?? ""),
  warn: (msg: string, meta?: Record<string, unknown>) =>
    console.warn(`[email] ${msg}`, meta ?? ""),
  error: (msg: string, meta?: Record<string, unknown>) =>
    console.error(`[email] ${msg}`, meta ?? ""),
};

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Lazily build (or return the cached) Resend client.
 *
 * Reads `RESEND_API_KEY` from the validated env. We deliberately
 * construct the SDK with the key in the constructor (not in `emails.send`)
 * so a single instance is reused across every send, matching how the
 * DB client works.
 *
 * @returns A process-global {@link Resend} instance.
 * @throws If `RESEND_API_KEY` is missing from the environment.
 */
export function getEmailClient(): Resend {
  if (g.__ridoResend) return g.__ridoResend;

  const env = getEnv();
  if (!env.RESEND_API_KEY) {
    // getEnv() already validates this, but the explicit check keeps the
    // contract obvious at the call site.
    throw new EmailSendError("RESEND_API_KEY is not configured", {
      code: "EMAIL_NOT_CONFIGURED",
    });
  }

  g.__ridoResend = new Resend(env.RESEND_API_KEY);
  log.info("Resend client initialized");
  return g.__ridoResend;
}

/**
 * Reset the cached client. Intended for tests that need to swap
 * `RESEND_API_KEY` between cases — production code should never call
 * this.
 */
export function __resetEmailClientForTests(): void {
  g.__ridoResend = undefined;
}

/**
 * Send a transactional or marketing email via Resend.
 *
 * Wraps the call in `try/catch`, applies the project's `from` /
 * `replyTo` defaults from the contract env, and surfaces a typed
 * {@link EmailSendError} on failure. On success returns the Resend
 * message id, which the caller can persist for later correlation.
 *
 * @param input Email content + optional overrides. See {@link SendEmailInput}.
 * @returns The Resend `id` for the dispatched message.
 * @throws {EmailSendError} When Resend reports an error or the request
 *         throws (network failure, misconfig, etc).
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const env = getEnv();
  const from = env.EMAIL_FROM;
  const replyTo = input.replyTo ?? env.EMAIL_REPLY_TO;

  log.info("sendEmail:start", {
    to: input.to,
    subject: input.subject,
    tags: input.tags?.map((t) => t.name).join(","),
  });

  try {
    const resend = getEmailClient();
    const result = await resend.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      ...(replyTo ? { replyTo } : {}),
      ...(input.tags && input.tags.length > 0 ? { tags: input.tags } : {}),
    });

    if (result.error || !result.data) {
      const code = result.error?.name ?? "EMAIL_SEND_FAILED";
      const message = result.error?.message ?? "Resend returned no data";
      log.error("sendEmail:resend-error", {
        to: input.to,
        code,
        statusCode: result.error?.statusCode ?? null,
      });
      throw new EmailSendError(message, {
        code,
        statusCode: result.error?.statusCode ?? null,
      });
    }

    log.info("sendEmail:ok", { to: input.to, id: result.data.id });
    return { id: result.data.id };
  } catch (err) {
    // Re-throw our own typed errors unchanged so the caller can `instanceof`
    // check them. Anything else (network failure, TypeError, etc.) is
    // wrapped.
    if (err instanceof EmailSendError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : String(err);
    log.error("sendEmail:exception", { to: input.to, message });
    throw new EmailSendError(message, {
      code: "EMAIL_SEND_EXCEPTION",
      cause: err,
    });
  }
}
