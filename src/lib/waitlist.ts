/**
 * Client helpers for the Google Apps Script waitlist.
 *
 * NEXT_PUBLIC_WAITLIST_URL is inlined at build time. When it is empty
 * (local dev, static preview, or a Netlify build that forgot the var),
 * callers must keep the honest fallback: localStorage only, and no count.
 */

export const WAITLIST_URL = process.env.NEXT_PUBLIC_WAITLIST_URL || "";

/** Public count query. The deployed script returns `{ count }` for any GET; `count=1` is the documented contract. */
export function waitlistCountUrl(url: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}count=1`;
}

/**
 * Read the live signup count. Returns null when the URL is unset, the
 * request fails, or the payload is not a non-negative number — callers
 * render the no-count kicker instead of inventing a figure.
 *
 * No custom headers: Apps Script answers a simple GET after its redirect.
 * A preflight would fail CORS and the count would never arrive.
 */
export async function fetchWaitlistCount(url: string): Promise<number | null> {
  if (!url) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(waitlistCountUrl(url), {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { count?: unknown };
    const n = typeof data?.count === "number" ? data.count : Number(data?.count);
    if (!Number.isFinite(n) || n < 0) return null;
    return Math.floor(n);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export type WaitlistSignup = {
  email: string;
  locale: string;
  userAgent: string;
};

/**
 * POST a signup to an Apps Script web app.
 *
 * `text/plain` keeps the request simple (no CORS preflight). If the
 * script.google.com 302 hides the JSON from the browser, one no-cors
 * retry still delivers the body to doPost. The sheet dedupes emails.
 * A readable `{ ok: false }` is surfaced and not retried.
 */
export async function postWaitlistSignup(url: string, payload: WaitlistSignup): Promise<void> {
  const body = JSON.stringify(payload);
  const init: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body,
    redirect: "follow",
  };

  try {
    const res = await fetch(url, init);
    if (res.type === "opaque" || res.status === 0) return;
    if (!res.ok) throw new Error(`waitlist HTTP ${res.status}`);
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (json.ok === false) throw new Error(json.error || "waitlist rejected");
  } catch (err) {
    if (!(err instanceof TypeError)) throw err;
    await fetch(url, { ...init, mode: "no-cors" });
  }
}
