/**
 * Shared contract for all Rido backend modules.
 *
 * Every agent that touches the backend reads this file first to understand:
 * - The standard error envelope
 * - The standard API response shape
 * - The standard env var names
 * - The standard logger interface
 * - The standard config object
 *
 * IF YOU CHANGE THIS FILE, all 20 agents need to be re-spawned. Don't change it
 * mid-build.
 */
import { z } from "zod";

// ─── Env var schema ─────────────────────────────────────────────────────────

export const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().describe("Postgres connection string"),
  DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),

  // Auth
  AUTH_SECRET: z.string().min(32).describe("NextAuth secret (min 32 chars)"),
  AUTH_URL: z.string().url().optional().describe("NextAuth base URL (auto-detected in most envs)"),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),

  // Email
  RESEND_API_KEY: z.string().min(1).describe("Resend API key"),
  EMAIL_FROM: z.string().email().default("Rido <hello@rido.bike>"),
  EMAIL_REPLY_TO: z.string().email().default("info@rido.bike"),

  // Maps
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().min(1).describe("Mapbox public token (browser-safe)"),
  MAPBOX_SECRET_TOKEN: z.string().optional().describe("Mapbox secret for server-side geocoding"),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1).optional().describe("Stripe secret key (sk_live_ or sk_test_)"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional().describe("Stripe webhook signing secret"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),

  // Web Push
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().min(1).optional(),
  VAPID_PRIVATE_KEY: z.string().min(1).optional(),

  // Cache
  REDIS_URL: z.string().url().optional().describe("If unset, falls back to in-memory cache"),
  CACHE_DEFAULT_TTL: z.coerce.number().int().positive().default(300),

  // Observability
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
  SENTRY_DSN: z.string().url().optional(),

  // Security
  ALLOWED_ORIGINS: z.string().default("https://rido.bike,https://www.rido.bike").describe("Comma-separated CORS allowlist"),
  CSP_REPORT_URI: z.string().url().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional().describe("Cloudflare Turnstile for bot protection"),

  // App
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_OUTPUT: z.string().optional().describe("Static export trigger; if 'export', API routes are not deployed"),
  CUSTOM_DOMAIN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate env. Throws on missing required vars.
 * Use this in every server module that needs env access.
 */
let cachedEnv: Env | null = null;
export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment variables:\n${issues}\n\nSee .env.example for the full list.`,
    );
  }
  cachedEnv = parsed.data;
  return cachedEnv;
}

// ─── Standard API response shape ───────────────────────────────────────────

export type ApiSuccess<T> = {
  ok: true;
  data: T;
  meta?: { requestId?: string; cached?: boolean; ttl?: number };
};

export type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function ok<T>(data: T, meta?: ApiSuccess<T>["meta"]): ApiSuccess<T> {
  return { ok: true, data, meta };
}

export function err(
  code: string,
  message: string,
  details?: unknown,
): ApiFailure {
  return { ok: false, error: { code, message, details } };
}

// ─── Standard error codes ──────────────────────────────────────────────────

export const ErrorCodes = {
  // 4xx
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  METHOD_NOT_ALLOWED: "METHOD_NOT_ALLOWED",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  VALIDATION: "VALIDATION",
  CSRF: "CSRF",
  // 5xx
  INTERNAL: "INTERNAL",
  UPSTREAM: "UPSTREAM",
  NOT_IMPLEMENTED: "NOT_IMPLEMENTED",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// ─── Standard headers ─────────────────────────────────────────────────────

export const Headers = {
  RequestId: "x-rido-request-id",
  RateLimit: "x-rido-ratelimit",
  CacheControl: "cache-control",
} as const;

// ─── Pagination ────────────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type Pagination = z.infer<typeof paginationSchema>;

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};
