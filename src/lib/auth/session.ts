/**
 * Server-side session helpers for Rido.
 *
 * This module is the canonical place to read the current user from a
 * Server Component, Route Handler, or Server Action. It wraps NextAuth's
 * `getServerSession` with our typed `RidoSessionUser` so callers don't have
 * to pass `authOptions` everywhere.
 *
 * The middleware (in `src/middleware.ts`) reads the session via `getToken`
 * (JWT-based, no DB hit); these helpers are the server-render equivalent.
 *
 * @module src/lib/auth/session
 */

import { getServerSession } from "next-auth";
import type { Session } from "next-auth";

import { getAuthOptions } from "@/lib/auth/config";
import { ErrorCodes, err, ok, type ApiResponse } from "@/lib/contract";
import type { RidoSessionUser, RidoRole } from "@/lib/auth/config";

/**
 * Re-export the augmented `Session` and `User` types so consumers can
 * `import type { Session } from "@/lib/auth/session"` without reaching into
 * `next-auth` directly.
 */
export type { Session, RidoSessionUser, RidoRole };

/**
 * Read the current NextAuth session inside a Server Component / Route
 * Handler / Server Action. Returns `null` when the user is not signed in.
 *
 * The session is fetched from the encrypted JWT cookie (no DB round-trip),
 * which is the same flow the middleware uses. The only DB-touching path is
 * the very first sign-in (handled by `authorize()` in `config.ts`).
 *
 * @returns The current `Session` (with our augmented `RidoSessionUser`), or
 *          `null` if there is no signed-in user.
 */
export async function getCurrentSession(): Promise<Session | null> {
  return getServerSession(getAuthOptions());
}

/**
 * Read the current user, or `null` if not signed in. Convenience wrapper
 * around `getCurrentSession()` for the common case.
 *
 * @returns The augmented `RidoSessionUser`, or `null` if not signed in.
 */
export async function getCurrentUser(): Promise<RidoSessionUser | null> {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

/**
 * Require a signed-in user. Throws a typed `UnauthorizedError` otherwise.
 *
 * Use in route handlers that must not run for anonymous callers; the thrown
 * error is caught by the standard error envelope in `src/lib/contract.ts`.
 *
 * @returns The signed-in `RidoSessionUser`.
 * @throws `UnauthorizedError` if no session is present.
 */
export async function requireUser(): Promise<RidoSessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError("Sign-in required");
  return user;
}

/**
 * Require a user with a specific role (default `'admin'`). Use to gate
 * admin-only route handlers.
 *
 * @param role The required role. Defaults to `'admin'`.
 * @returns The signed-in user.
 * @throws `UnauthorizedError` if no session, `ForbiddenError` if wrong role.
 */
export async function requireRole(role: RidoRole = "admin"): Promise<RidoSessionUser> {
  const user = await requireUser();
  if (user.role !== role) {
    throw new ForbiddenError(`Role '${role}' required`);
  }
  return user;
}

/**
 * Shape a successful response using the contract envelope.
 *
 * @param data The payload to return.
 * @param meta Optional request id / cache metadata.
 * @returns A typed `ApiResponse<T>`.
 */
export function sessionOk<T>(data: T, meta?: { requestId?: string }): ApiResponse<T> {
  return ok(data, meta);
}

/**
 * Shape an unauthenticated/forbidden error response using the contract
 * envelope. Useful inside `try/catch` handlers that want to return JSON
 * directly rather than rethrowing.
 *
 * @param code One of `UNAUTHORIZED` / `FORBIDDEN`.
 * @param message Human-readable error message.
 * @returns A typed `ApiFailure` response.
 */
export function sessionErr(
  code: typeof ErrorCodes.UNAUTHORIZED | typeof ErrorCodes.FORBIDDEN,
  message: string,
): ApiResponse<never> {
  return err(code, message);
}

// ─── Typed errors ──────────────────────────────────────────────────────────

/**
 * Thrown by `requireUser` / `requireRole` when no session is present. Route
 * handlers in the standard error wrapper turn this into a 401 response.
 */
export class UnauthorizedError extends Error {
  public override readonly name = "UnauthorizedError";
  public readonly code: string = ErrorCodes.UNAUTHORIZED;
  public constructor(message = "Unauthorized") {
    super(message);
  }
}

/**
 * Thrown by `requireRole` when the session is present but the user lacks the
 * required role. Route handlers in the standard error wrapper turn this into
 * a 403 response.
 */
export class ForbiddenError extends Error {
  public override readonly name = "ForbiddenError";
  public readonly code: string = ErrorCodes.FORBIDDEN;
  public constructor(message = "Forbidden") {
    super(message);
  }
}
