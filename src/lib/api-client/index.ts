/**
 * Public, type-safe API client SDK for the Rido frontend.
 *
 * This module is the *only* place in the frontend that talks to the
 * Rido backend. Every server interaction — the waitlist form, the
 * contact form, the newsletter signup, the live map, the analytics
 * beacon — goes through the {@link ridoApi} object exported here.
 *
 * Why a single object (and not, e.g., one module per resource)?
 *   - **Discoverability**: `ridoApi.waitlist.signup(...)` is the same
 *     shape regardless of which resource the caller is touching.
 *   - **Tree-shaking**: when no call site references a sub-namespace
 *     (e.g. `ridoApi.vehicles`), the bundler drops it without ceremony.
 *   - **Mockability**: a single import surface is trivial to stub in
 *     tests; the export shape is the contract.
 *
 * Conventions:
 *   - Every method returns a typed `Promise` and never resolves with
 *     an `ApiResponse<T>` envelope — the SDK unwraps the envelope and
 *     throws an {@link ApiClientError} on the failure path. Callers
 *     get plain data on success and structured error info on failure.
 *   - Every method sets the standard headers
 *     `Content-Type: application/json` and
 *     `X-Requested-With: XMLHttpRequest`. The latter is a defensive
 *     CSRF marker; the server's CSRF middleware looks for it on
 *     state-changing requests and rejects the call with `403 CSRF`
 *     when it's missing.
 *   - The base URL is resolved from
 *     `process.env.NEXT_PUBLIC_API_BASE` when available (build-time
 *     inlined by Next.js), falling back to `window.location.origin`
 *     in the browser and `""` (relative URL) on the server. This
 *     makes the SDK safe to import from both server components and
 *     client components without per-call site configuration.
 *
 * @module src/lib/api-client
 */

import type { ApiResponse, ErrorCode } from "@/lib/contract";
import type {
  AnalyticsEventInput,
  AnalyticsTrackResult,
  CitiesListQuery,
  CityDetail,
  CityListResponse,
  ContactRequest,
  ContactResponse,
  NewsletterRequest,
  NewsletterResponse,
  Vehicle,
  VehicleListResponse,
  VehiclesListQuery,
  WaitlistSignupRequest,
  WaitlistSignupResponse,
  WaitlistStatsResponse,
} from "./types";

// ─── Error class ──────────────────────────────────────────────────────────

/**
 * Thrown by every {@link ridoApi} method when the server returns a
 * non-2xx response or the network request fails outright.
 *
 * The class carries:
 *   - `status`     — the HTTP status code (or `0` for a network failure
 *                    with no response).
 *   - `code`       — the contract's machine-readable error code
 *                    (`BAD_REQUEST`, `VALIDATION`, `CONFLICT`, …) when
 *                    the server returned a well-formed
 *                    `ApiFailure` envelope; `null` otherwise.
 *   - `message`    — the server's human-readable error message, or a
 *                    generic fallback derived from `status`.
 *   - `details`    — the optional `details` payload from the
 *                    `ApiFailure` envelope (Zod issues, upstream
 *                    error body, etc.). Typed as `unknown` because
 *                    the shape varies by endpoint.
 *
 * Subclassing `Error` correctly (so `instanceof` works, `stack`
 * is captured, and the message is preserved) is the only reason
 * this isn't a plain object literal. We deliberately do not extend
 * `TypeError` / `RangeError` etc. — those carry semantics the SDK
 * does not want to commit to.
 *
 * @example
 * ```ts
 * try {
 *   await ridoApi.waitlist.signup(input);
 * } catch (e) {
 *   if (e instanceof ApiClientError && e.code === "CONFLICT") {
 *     // Already on the list; show a friendly message.
 *   } else {
 *     throw e;
 *   }
 * }
 * ```
 */
export class ApiClientError extends Error {
  /** HTTP status code from the response, or `0` for a network failure. */
  public readonly status: number;
  /** Machine-readable error code from the `ApiFailure` envelope, or `null`. */
  public readonly code: ErrorCode | string | null;
  /** Server-supplied details payload (Zod issues, etc.), or `null`. */
  public readonly details: unknown;

  /**
   * @param message  Human-readable error message.
   * @param status   HTTP status code, or `0` for a network failure.
   * @param code     Machine-readable error code, or `null` if the
   *                 response did not carry a well-formed envelope.
   * @param details  Server-supplied details payload, or `null`.
   */
  constructor(
    message: string,
    status: number,
    code: ErrorCode | string | null,
    details: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
    // Restore the prototype chain. Without this, `instanceof`
    // breaks when the class is transpiled to ES5 / when the
    // error crosses a realm boundary (e.g. an iframe).
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }
}

// ─── Internal helpers ────────────────────────────────────────────────────

/**
 * Resolve the absolute base URL for the Rido backend.
 *
 * Lookup order:
 *   1. `process.env.NEXT_PUBLIC_API_BASE` — when set (build-time
 *      inlined by Next.js), use it verbatim. Trailing slashes are
 *      stripped so the caller can build URLs with
 *      `${baseUrl}/api/...` reliably.
 *   2. `window.location.origin` — when running in the browser and
 *      the env var is unset. This makes the SDK work out of the
 *      box on a Vercel preview or a local `next dev` server
 *      without any environment configuration.
 *   3. `""` (empty string) — server-side with no env var, so a
 *      server component that imports this SDK still produces a
 *      well-formed URL when joined with `/api/...`. The fetch
 *      will then hit the Next.js route handler in the same
 *      process, which is exactly what we want during SSR.
 */
function resolveBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE;
  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "";
}

/**
 * Build a fully-qualified URL by joining {@link resolveBaseUrl} with a
 * path. The path is always treated as a path-segment prefix: a
 * leading `/` is preserved, no trailing `/` is appended.
 */
function buildUrl(path: string): string {
  const base = resolveBaseUrl();
  if (base === "") return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Encode an object of query parameters as a URL query string.
 *
 * Rules:
 *   - `undefined` values are dropped (so optional params are skipped).
 *   - `null` values are serialised as the empty string — callers that
 *     want a literal `?foo=` should pass `null` explicitly.
 *   - Numbers and booleans are coerced to their string form.
 *   - Strings are passed through `encodeURIComponent` so slashes,
 *     ampersands, etc. don't break the query.
 *   - Empty input returns `""` (not `"?"`).
 */
function toQueryString(query: Record<string, unknown> | undefined): string {
  if (!query) return "";
  const parts: string[] = [];
  for (const [key, raw] of Object.entries(query)) {
    if (raw === undefined) continue;
    if (raw === null) {
      parts.push(`${encodeURIComponent(key)}=`);
      continue;
    }
    const value = typeof raw === "string" ? raw : String(raw);
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  }
  if (parts.length === 0) return "";
  return `?${parts.join("&")}`;
}

/**
 * Standard headers applied to every Rido API call.
 *
 *   - `Content-Type: application/json` — the body is always JSON
 *     (or absent on GET).
 *   - `Accept: application/json`       — pin the response shape so a
 *     misconfigured proxy can't return HTML.
 *   - `X-Requested-With: XMLHttpRequest` — defensive CSRF marker;
 *     the server's CSRF middleware looks for this on state-changing
 *     requests and rejects with `403 CSRF` when it's missing.
 */
const BASE_HEADERS: Readonly<Record<string, string>> = Object.freeze({
  "Content-Type": "application/json",
  Accept: "application/json",
  "X-Requested-With": "XMLHttpRequest",
});

/**
 * The single internal `fetch()` wrapper used by every SDK method.
 *
 * It:
 *   1. Resolves the absolute URL via {@link buildUrl}.
 *   2. Merges {@link BASE_HEADERS} with any per-call headers.
 *   3. JSON-encodes the body when one is supplied.
 *   4. Awaits the response and tries to parse it as JSON.
 *   5. On a 2xx status, unwraps the `ApiResponse<T>` envelope and
 *      returns the inner `data`.
 *   6. On a non-2xx status, parses the `ApiFailure` envelope and
 *      throws an {@link ApiClientError} carrying the server's
 *      `code`, `message`, and `details`.
 *   7. On a network failure (TypeError from `fetch` with no
 *      `Response`), rethrows as an {@link ApiClientError} with
 *      `status: 0` and a generic message.
 *
 * @param path     API path (e.g. `"/api/waitlist"`).
 * @param init     `fetch()` init bag, minus the body (which is
 *                 supplied as a typed `body` argument and JSON-encoded
 *                 here).
 * @param body     Optional request body, JSON-encoded as-is.
 * @returns The unwrapped `data` payload on success.
 * @throws  {ApiClientError} On any non-2xx response or network failure.
 */
async function request<T>(
  path: string,
  init: RequestInit,
  body?: unknown,
): Promise<T> {
  const url = buildUrl(path);
  const headers: Record<string, string> = {
    ...BASE_HEADERS,
    ...(init.headers as Record<string, string> | undefined),
  };

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers,
      // `body` must be a string or undefined; passing an object
      // directly is a TS error in DOM lib 5+ and would also
      // serialise wrong for the typical DTO shape.
      body: body !== undefined ? JSON.stringify(body) : undefined,
      // Always include cookies on same-origin requests; don't
      // surface a stale cache on the analytics endpoint etc.
      credentials: init.credentials ?? "same-origin",
    });
  } catch (e) {
    // Network failure — DNS, offline, CORS preflight rejected, etc.
    const message =
      e instanceof Error ? e.message : "Network request failed";
    throw new ApiClientError(message, 0, null, null);
  }

  // Some endpoints (analytics) return 204 No Content. Treat that
  // as a successful empty payload so the SDK can resolve cleanly.
  if (response.status === 204) {
    return undefined as T;
  }

  // Try to parse the response as JSON. A non-JSON body (e.g. an
  // HTML error page from a misconfigured proxy) is itself an error.
  let parsed: unknown;
  try {
    parsed = await response.json();
  } catch {
    throw new ApiClientError(
      `Unexpected non-JSON response from ${path} (status ${response.status})`,
      response.status,
      null,
      null,
    );
  }

  if (response.ok) {
    // The contract envelope is `ApiResponse<T> = ApiSuccess<T> | ApiFailure`.
    // The success branch is `{ ok: true, data: T }` — unwrap it.
    const envelope = parsed as ApiResponse<T> | undefined;
    if (envelope && envelope.ok === true) {
      return envelope.data;
    }
    // The server returned 2xx but the body is not a well-formed
    // success envelope. Surface that explicitly; some endpoints
    // (e.g. analytics) legitimately return 204, which we already
    // handled above. For everything else, treat this as a contract
    // violation rather than silently returning the raw body.
    throw new ApiClientError(
      `Malformed success envelope from ${path}`,
      response.status,
      null,
      parsed,
    );
  }

  // Non-2xx — try to extract the standard failure envelope.
  const failure = parsed as Partial<ApiResponse<never>> | undefined;
  if (failure && failure.ok === false && failure.error) {
    throw new ApiClientError(
      failure.error.message ?? "Request failed",
      response.status,
      failure.error.code ?? null,
      failure.error.details ?? null,
    );
  }

  // No envelope at all — fall back to the HTTP status text.
  throw new ApiClientError(
    `Request failed with status ${response.status}`,
    response.status,
    null,
    parsed,
  );
}

// ─── Resource namespaces ──────────────────────────────────────────────────

/**
 * Namespace for the waitlist signup + stats endpoints.
 *
 *   - `signup(input)` — submit a new waitlist signup.
 *   - `stats()`       — fetch the unauthenticated, public-safe
 *                       aggregate counters.
 */
const waitlist = {
  /**
   * Submit a new waitlist signup.
   *
   * Mirrors `POST /api/waitlist` (201 Created on success, 409
   * Conflict on duplicate, 400 Validation on a malformed body,
   * 500 Internal / Upstream on a downstream failure).
   *
   * The honeypot field is forwarded verbatim; the server silently
   * rejects filled honeypots with a 200 OK `{ ok: true }` envelope
   * — the SDK returns `undefined` in that case (the parsed
   * `data` of `{ accepted: true }`).
   *
   * @param input  Validated {@link WaitlistSignupRequest}.
   * @returns A {@link WaitlistSignupResponse} on success.
   * @throws  {ApiClientError} `code === "CONFLICT"` on duplicate
   *          signups; `code === "VALIDATION"` on a malformed body.
   */
  signup(input: WaitlistSignupRequest): Promise<WaitlistSignupResponse> {
    return request<WaitlistSignupResponse>(
      "/api/waitlist",
      { method: "POST" },
      input,
    );
  },

  /**
   * Fetch the public, unauthenticated waitlist statistics.
   *
   * Mirrors `GET /api/waitlist` (200 OK with the aggregate
   * counters). No request body.
   *
   * The response contains no PII — only counts — so it is safe
   * to call from SSR or a public dashboard.
   *
   * @returns A {@link WaitlistStatsResponse} on success.
   * @throws  {ApiClientError} On any non-2xx response.
   */
  stats(): Promise<WaitlistStatsResponse> {
    return request<WaitlistStatsResponse>("/api/waitlist", {
      method: "GET",
    });
  },
};

/**
 * Namespace for the live-vehicle endpoints.
 *
 *   - `list(query)` — return vehicles near a point.
 *   - `get(id)`     — return a single vehicle by primary key.
 */
const vehicles = {
  /**
   * List vehicles within a radius of an anchor point.
   *
   * Mirrors `GET /api/vehicles`. The server requires `lat`, `lng`,
   * `radiusMeters`, and `type`; `citySlug` and `limit` are
   * optional. `undefined` query values are dropped before the
   * request is built, so the URL stays clean.
   *
   * @param query  The {@link VehiclesListQuery} describing the
   *               anchor point, search radius, and filters.
   * @returns A {@link VehicleListResponse} on success.
   * @throws  {ApiClientError} `code === "VALIDATION"` on a
   *          malformed query (e.g. out-of-range lat/lng).
   */
  list(query: VehiclesListQuery): Promise<VehicleListResponse> {
    return request<VehicleListResponse>(
      `/api/vehicles${toQueryString(query as unknown as Record<string, unknown>)}`,
      { method: "GET" },
    );
  },

  /**
   * Fetch a single vehicle by primary key.
   *
   * Mirrors `GET /api/vehicles/[id]`. The server validates the
   * id is a well-formed UUID before hitting the DB; a malformed
   * id returns 400 BAD_REQUEST.
   *
   * @param id  Vehicle UUID.
   * @returns A {@link Vehicle} on success.
   * @throws  {ApiClientError} `code === "BAD_REQUEST"` on a
   *          malformed id, `code === "NOT_FOUND"` when the row
   *          does not exist.
   */
  get(id: string): Promise<Vehicle> {
    return request<Vehicle>(`/api/vehicles/${encodeURIComponent(id)}`, {
      method: "GET",
    });
  },
};

/**
 * Namespace for the city catalogue endpoints.
 *
 *   - `list(query)` — return cities, optionally filtered.
 *   - `get(slug)`   — return a single city detail record.
 */
const cities = {
  /**
   * List cities, optionally narrowed by status / slug.
   *
   * Mirrors `GET /api/cities`. Defaults: `status: "active"` on
   * the server. The SDK forwards the query object as-is (with
   * `undefined` values dropped).
   *
   * @param query  Optional {@link CitiesListQuery} filters.
   * @returns A {@link CityListResponse} on success.
   * @throws  {ApiClientError} `code === "VALIDATION"` on a
   *          malformed query.
   */
  list(query?: CitiesListQuery): Promise<CityListResponse> {
    return request<CityListResponse>(
      `/api/cities${toQueryString(query as unknown as Record<string, unknown> | undefined)}`,
      { method: "GET" },
    );
  },

  /**
   * Fetch a single city's full detail record.
   *
   * Mirrors `GET /api/cities/[slug]`. Returns the
   * {@link CityDetail} (which extends {@link City} with
   * `geofence` and `parkingZones`).
   *
   * @param slug  City slug (e.g. `"marbella"`).
   * @returns A {@link CityDetail} on success.
   * @throws  {ApiClientError} `code === "NOT_FOUND"` when the
   *          slug is unknown.
   */
  get(slug: string): Promise<CityDetail> {
    return request<CityDetail>(`/api/cities/${encodeURIComponent(slug)}`, {
      method: "GET",
    });
  },
};

/**
 * Namespace for the contact form submission endpoint.
 *
 *   - `submit(input)` — submit a new contact form message.
 */
const contact = {
  /**
   * Submit a contact form message.
   *
   * Mirrors `POST /api/contact` (201 Created on success, 400
   * Validation on a malformed body, 500 Internal / Upstream on
   * a downstream failure). The honeypot field is forwarded
   * verbatim; the server silently rejects filled honeypots.
   *
   * @param input  Validated {@link ContactRequest}.
   * @returns A {@link ContactResponse} on success.
   * @throws  {ApiClientError} `code === "VALIDATION"` on a
   *          malformed body.
   */
  submit(input: ContactRequest): Promise<ContactResponse> {
    return request<ContactResponse>(
      "/api/contact",
      { method: "POST" },
      input,
    );
  },
};

/**
 * Namespace for the newsletter subscription endpoint.
 *
 *   - `subscribe(input)` — submit a new subscription.
 */
const newsletter = {
  /**
   * Subscribe an email to the Rido newsletter.
   *
   * Mirrors `POST /api/newsletter`. Two success paths:
   *   - 201 Created with `{ email, subscribed: true }` (direct
   *     subscription).
   *   - 200 OK with `{ status: "pending_confirmation", email }`
   *     when the client asks for `doubleOptIn: true`.
   *
   * The SDK returns the union as a {@link NewsletterResponse};
   * callers should branch on `status` (when present) or on
   * `subscribed` (when not) to render the right UI.
   *
   * @param input  Validated {@link NewsletterRequest}.
   * @returns A {@link NewsletterResponse} on success.
   * @throws  {ApiClientError} `code === "CONFLICT"` on a
   *          duplicate subscription, `code === "VALIDATION"`
   *          on a malformed body.
   */
  subscribe(input: NewsletterRequest): Promise<NewsletterResponse> {
    return request<NewsletterResponse>(
      "/api/newsletter",
      { method: "POST" },
      input,
    );
  },
};

/**
 * Namespace for the analytics ingestion endpoint.
 *
 *   - `track(event)` — fire-and-forget POST a single event.
 */
const analytics = {
  /**
   * Track a single analytics event.
   *
   * Mirrors `POST /api/analytics` (204 No Content on success).
   * The server strips sensitive keys from `properties` (any
   * `_`-prefixed key, plus any key containing `password`,
   * `token`, `secret`, `apikey`, or `authorization`
   * case-insensitively) before persistence; the SDK does NOT
   * pre-filter — that's the server's job, and stripping on the
   * client would silently disagree with the server's rule set.
   *
   * The method awaits the response (it does not use
   * `navigator.sendBeacon`) so that callers can chain
   * post-tracking work, but it resolves quickly because the
   * server returns 204 with no body. If you need true
   * fire-and-forget semantics, wrap the call in
   * `void ridoApi.analytics.track(event)` and don't await it.
   *
   * @param event  The {@link AnalyticsEventInput} to record.
   * @returns A {@link AnalyticsTrackResult} echoing the name +
   *          sessionId that were forwarded.
   * @throws  {ApiClientError} `code === "VALIDATION"` on a
   *          malformed body. Network failures and 5xx responses
   *          are *not* thrown by the route (it swallows them
   *          to avoid bloat from client retries), so the SDK
   *          only throws on validation failures.
   */
  track(event: AnalyticsEventInput): Promise<AnalyticsTrackResult> {
    return request<AnalyticsTrackResult>(
      "/api/analytics",
      { method: "POST" },
      event,
    );
  },
};

// ─── Public SDK surface ───────────────────────────────────────────────────

/**
 * The Rido frontend API client.
 *
 * Single import surface for the whole frontend. Tree-shakable
 * (the bundler drops unused namespaces), typed end-to-end, and
 * the only place that needs to know about the backend's wire
 * format.
 *
 * @example
 * ```ts
 * import { ridoApi, ApiClientError } from "@/lib/api-client";
 *
 * try {
 *   const { id } = await ridoApi.waitlist.signup({
 *     email: "jane@example.com",
 *     citySlug: "marbella",
 *     locale: "en",
 *     source: "hero",
 *   });
 *   toast.success("You're on the list!");
 * } catch (e) {
 *   if (e instanceof ApiClientError && e.code === "CONFLICT") {
 *     toast.info("You're already on the waitlist for Marbella.");
 *   } else {
 *     toast.error("Something went wrong. Please try again.");
 *   }
 * }
 * ```
 */
export const ridoApi = {
  waitlist,
  vehicles,
  cities,
  contact,
  newsletter,
  analytics,
} as const;

// ─── Re-exports for consumers ─────────────────────────────────────────────

/** Re-export the typed payload surface for consumers that need it. */
export type {
  AnalyticsEventInput,
  AnalyticsTrackResult,
  CitiesListQuery,
  City,
  CityDetail,
  CityListResponse,
  ContactRequest,
  ContactResponse,
  NewsletterRequest,
  NewsletterResponse,
  Vehicle,
  VehicleListResponse,
  VehiclesListQuery,
  WaitlistSignupRequest,
  WaitlistSignupResponse,
  WaitlistStatsResponse,
} from "./types";
