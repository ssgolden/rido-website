/**
 * NextAuth entry point for the Rido App Router.
 *
 * `src/app/api/auth/[...nextauth]/route.ts` imports the `handlers` and
 * `auth` exports from this module, which keeps the routing file trivial and
 * centralises all NextAuth wiring here.
 *
 * This module is the single call site of `NextAuth(getAuthOptions())` — every
 * other backend file should go through `getCurrentUser` / `requireUser` /
 * `requireRole` from `@/lib/auth/session` instead of re-instantiating NextAuth.
 *
 * @module src/lib/auth/index
 */

import NextAuth from "next-auth";

import { getAuthOptions } from "@/lib/auth/config";

/**
 * Build the NextAuth instance once at module load time. Re-using the same
 * instance across route handlers is what allows NextAuth to share the JWT
 * verification key, the adapter, and the provider list without re-parsing
 * the options on every request.
 */
const nextAuth = NextAuth(getAuthOptions());

/**
 * NextAuth route handlers for the App Router. Exported under the names
 * `GET` and `POST` so a route file can do:
 *
 * ```ts
 * export { GET, POST } from "@/lib/auth";
 * ```
 *
 * The handlers cover all of NextAuth's HTTP endpoints: sign-in, sign-out,
 * callback, session, csrf, providers, etc.
 */
export const GET = nextAuth.handlers.GET;
export const POST = nextAuth.handlers.POST;

/**
 * The `auth()` function — usable inside Server Components and Server
 * Actions to get the current session in a single call. Equivalent to
 * `getServerSession(getAuthOptions())` but a touch lighter because it re-uses
 * the same NextAuth instance.
 */
export const auth = nextAuth.auth;

/**
 * Programmatic sign-in helper, exposed for use in Server Actions that need
 * to authenticate the user from a form submission. Most flows will use the
 * built-in `/api/auth/signin` page instead.
 */
export const signIn = nextAuth.signIn;

/**
 * Programmatic sign-out helper.
 */
export const signOut = nextAuth.signOut;
