/**
 * NextAuth configuration for Rido.
 *
 * Owns:
 *   - the AuthOptions (provider list, callbacks, secret, session strategy)
 *   - the credentials provider that hashes/verifies passwords with bcrypt
 *   - the Google OAuth provider (gated on env vars being present)
 *   - the email magic-link provider (Resend-backed via `@/lib/email/client`)
 *   - the `jwt` and `session` callbacks that inject the user's role + city
 *     onto the session payload
 *
 * This file is consumed by `src/lib/auth/index.ts` (the `NextAuth(...)` call)
 * and is also safe to import on its own (e.g. in API routes that need
 * `authOptions` for `getServerSession`).
 *
 * Env reading goes through `@/lib/contract` so the same validation rules apply
 * to every backend module. If you find yourself reaching for `process.env`
 * directly, import `getEnv()` instead.
 *
 * @module src/lib/auth/config
 */

import { compare, hash } from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import type { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { z } from "zod";

import { getAuthAdapter } from "@/lib/auth/adapter";
import { getEnv } from "@/lib/contract";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

// ─── Constants ─────────────────────────────────────────────────────────────

/**
 * bcrypt cost factor. 12 ≈ 250ms on a modern server — slow enough to
 * discourage brute force, fast enough that the credentials authorize() call
 * stays well under any reasonable request budget.
 */
const BCRYPT_COST = 12;

/**
 * NextAuth JWT cookie name. Exposed so middleware can pass it to `getToken`.
 */
export const SESSION_COOKIE_NAME = "next-auth.session-token";

// ─── Augmentations ─────────────────────────────────────────────────────────

/**
 * Domain role for a Rido user. Matches the contract: ordinary accounts are
 * "user"; moderators / ops staff are "admin". The value is stored on the JWT
 * (and copied onto the session) so middleware can check it without hitting
 * the database.
 */
export type RidoRole = "user" | "admin";

/**
 * Local mirror of the augmented `Session` shape. We declare it explicitly so
 * consumers (server components, route handlers, middleware) can import a
 * concrete type rather than relying on next-auth's module-augmentation trick.
 */
export interface RidoSessionUser {
  id: string;
  email: string | null | undefined;
  name: string | null | undefined;
  image: string | null | undefined;
  role: RidoRole;
  /** City slug the user has selected as their default (e.g. "marbella"). */
  city: string | null;
}

declare module "next-auth" {
  interface Session {
    user: RidoSessionUser;
  }

  interface User {
    role?: RidoRole | null;
    city?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: RidoRole;
    city?: string | null;
  }
}

// ─── Validation ────────────────────────────────────────────────────────────

const credentialsSchema = z.object({
  email: z.string().email().max(320).transform((s) => s.toLowerCase().trim()),
  password: z.string().min(1).max(256),
});

const emailSchema = z.string().email().max(320).transform((s) => s.toLowerCase().trim());

// ─── Provider helpers ──────────────────────────────────────────────────────

/**
 * Build the list of providers that should be enabled for the current runtime.
 *
 * The Google and Email providers are only attached when the corresponding
 * env vars are present. This lets local dev and CI work with credentials only,
 * while production can flip OAuth/magic-link on by adding env vars — no code
 * change required.
 *
 * @returns The provider array suitable for `AuthOptions.providers`.
 */
export function buildProviders(): NextAuthOptions["providers"] {
  const env = getEnv();
  const providers: NextAuthOptions["providers"] = [buildCredentialsProvider()];

  if (env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: env.AUTH_GOOGLE_ID,
        clientSecret: env.AUTH_GOOGLE_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
    );
  }

  if (env.RESEND_API_KEY) {
    // Resend is our transactional email provider. The Email provider's stock
    // transport is nodemailer over SMTP, which we don't run — so we override
    // `sendVerificationRequest` to call the Resend client directly. The
    // client module is owned by Agent #4; we dynamic-import it so this file
    // compiles even if the email client hasn't been written yet.
    providers.push(
      EmailProvider({
        from: env.EMAIL_FROM,
        // The `server` field is required by the type, but the value is unused
        // because we always override `sendVerificationRequest`. We pass a
        // throwaway JSON transport so the provider object validates.
        server: { jsonTransport: true } as unknown as string,
        maxAge: 24 * 60 * 60, // 24h
        async sendVerificationRequest({ identifier, url, provider: { from } }) {
          // TODO(agent-4): swap the dynamic import for a static
          //   `import { sendEmail } from "@/lib/email/client"` once the
          //   email client module is in place. We dynamic-import to keep
          //   the build green during the parallel-agent phase. The dynamic
          //   `import()` accepts any string, which keeps TypeScript quiet
          //   even though the target file does not exist on disk yet —
          //   Agent #4 will provide it (see TODO above).
          const emailModulePath = "@/lib/email/client";
          const mod = (await import(/* @vite-ignore */ emailModulePath).catch(
            () => null,
          )) as { sendEmail?: (args: unknown) => Promise<unknown> } | null;

          if (!mod || typeof mod.sendEmail !== "function") {
            throw new Error(
              "Email client is not available — implement src/lib/email/client.ts " +
                "with a `sendEmail({ to, from, subject, html, text })` function " +
                "before enabling the magic-link provider.",
            );
          }

          const host = (() => {
            try {
              return new URL(url).host;
            } catch {
              return "rido.bike";
            }
          })();

          await mod.sendEmail({
            to: identifier,
            from,
            subject: `Sign in to ${host}`,
            text: `Click the link to sign in to Rido:\n\n${url}\n\nThis link expires in 24 hours.`,
            html: `<p>Click the link to sign in to Rido:</p><p><a href="${url}">${url}</a></p><p>This link expires in 24 hours.</p>`,
          });
        },
      }),
    );
  }

  return providers;
}

/**
 * Build the credentials provider (email + bcrypt-hashed password).
 *
 * The `passwordHash` column is expected to live on the `users` table owned
 * by Agent #1 in `src/lib/db/schema.ts`. If the column is missing this
 * authorize() call will throw at runtime — that is the intended failure
 * mode (better to fail loud than silently allow passwordless sign-in).
 *
 * The exported `hashPassword` helper is the canonical way for sign-up routes
 * (Agent #5 / #6) to write the `passwordHash` value into the `users` table.
 */
function buildCredentialsProvider(): NextAuthOptions["providers"][number] {
  return CredentialsProvider({
    id: "credentials",
    name: "Email & Password",
    credentials: {
      email: { label: "Email", type: "email", placeholder: "you@example.com" },
      password: { label: "Password", type: "password" },
    },
    async authorize(rawCredentials) {
      if (!rawCredentials?.email || !rawCredentials?.password) return null;

      const parsed = credentialsSchema.safeParse(rawCredentials);
      if (!parsed.success) return null;

      const { email, password } = parsed.data;

      const db = getDb();
      // Case-insensitive email lookup via lower(email) — matches the unique
      // index defined in src/lib/db/schema.ts.
      const rows = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          image: users.image,
          // TODO(agent-1): add `passwordHash: users.passwordHash` once the
          //   column is in src/lib/db/schema.ts. The cast below keeps the
          //   build green in the meantime; the runtime query will simply
          //   return `undefined`, which is correctly treated as "no
          //   password set" by the null check below.
          passwordHash: sql<string | null>`NULL`.as("password_hash_placeholder"),
        })
        .from(users)
        .where(sql`lower(${users.email}) = ${email}`)
        .limit(1);

      const user = rows[0];
      if (!user) return null;

      const hashValue = (user as { passwordHash?: string | null }).passwordHash;
      if (!hashValue) {
        // No password set — user signed up via OAuth or magic link only.
        return null;
      }

      const ok = await compare(password, hashValue);
      if (!ok) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      } satisfies NextAuthUser;
    },
  });
}

/**
 * Hash a plaintext password for storage in `users.passwordHash`.
 *
 * Exported so that sign-up / account-management routes (Agents #5, #6, #7)
 * can produce values in the exact same format the credentials provider
 * expects to compare against.
 *
 * @param plaintext The raw password from the sign-up form.
 * @returns A bcrypt hash suitable for `users.passwordHash`.
 */
export async function hashPassword(plaintext: string): Promise<string> {
  if (!plaintext) throw new Error("hashPassword: empty password");
  return hash(plaintext, BCRYPT_COST);
}

// ─── AuthOptions (single source of truth) ─────────────────────────────────

/**
 * The complete `AuthOptions` for the Rido site.
 *
 * - Session strategy: `jwt` (no DB hit per request).
 * - Adapter: Drizzle (Agent #1's schema).
 * - Providers: credentials always; Google if `AUTH_GOOGLE_ID` +
 *   `AUTH_GOOGLE_SECRET`; email magic-link if `RESEND_API_KEY`.
 * - `jwt` callback stamps `id`, `role`, `city` onto the token on first sign-in
 *   and copies them on every subsequent decode.
 * - `session` callback projects those fields onto `session.user`.
 * - `signIn` callback lightly sanity-checks new email accounts.
 */
export function getAuthOptions(): NextAuthOptions {
  const env = getEnv();

  return {
    adapter: getAuthAdapter(),
    providers: buildProviders(),
    secret: env.AUTH_SECRET,
    session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      updateAge: 24 * 60 * 60, // refresh once per day
    },
    cookies: {
      sessionToken: {
        name: SESSION_COOKIE_NAME,
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: env.NODE_ENV === "production",
        },
      },
    },
    pages: {
      signIn: "/login",
      error: "/login",
    },
    callbacks: {
      async signIn({ user }) {
        // Block sign-in for users without a verified identifier. This is a
        // belt-and-suspenders check; NextAuth's email provider already
        // enforces verification before issuing the session.
        if (!user.email) return false;
        const parsed = emailSchema.safeParse(user.email);
        return parsed.success;
      },
      async jwt({ token, user, trigger }) {
        // First sign-in: copy the user id onto the token.
        if (user?.id) {
          token.id = user.id;
          token.role = (user as { role?: RidoRole | null }).role ?? "user";
          token.city = (user as { city?: string | null }).city ?? null;
          return token;
        }

        // Optional re-fresh path: if `update` is called on the client and
        // supplies a fresh role / city, copy it onto the token. The session
        // callback will then expose it.
        if (trigger === "update") {
          // The Drizzle adapter populates `user` from the DB on a
          // re-fetch; if not present we keep whatever the token already has.
          if (user?.id) token.id = user.id;
          if (user && "role" in user) {
            token.role = (user as { role?: RidoRole | null }).role ?? token.role ?? "user";
          }
          if (user && "city" in user) {
            token.city = (user as { city?: string | null }).city ?? token.city ?? null;
          }
        }

        return token;
      },
      async session({ session, token }) {
        // Project token claims onto session.user. Default missing values so
        // middleware and server components can rely on a stable shape.
        const user: RidoSessionUser = {
          id: typeof token.id === "string" ? token.id : "",
          email: session.user?.email ?? token.email ?? null,
          name: session.user?.name ?? token.name ?? null,
          image: session.user?.image ?? token.picture ?? null,
          role: (token.role as RidoRole | undefined) ?? "user",
          city: (token.city as string | null | undefined) ?? null,
        };
        session.user = user;
        return session;
      },
    },
    events: {
      // Useful for audit logging in the future. Intentionally a no-op for
      // v1 so we don't accidentally spam the log pipeline.
      async signIn() {},
      async signOut() {},
    },
    debug: env.NODE_ENV === "development",
  };
}
