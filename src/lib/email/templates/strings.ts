/**
 * Small string helpers shared by the email templates.
 *
 * These are intentionally minimal — the templates are plain HTML strings, not
 * React trees, so the only thing we need to do safely is:
 *
 *   1. HTML-escape user input before we splice it into an `innerHTML` block.
 *   2. Provide a couple of URL builders that respect the current origin so
 *      unsubscribe / branded links work in every environment (dev, preview,
 *      production) without leaking the API key into a template literal.
 *
 * @module src/lib/email/templates/strings
 */

/**
 * Escape a value for safe insertion into an HTML email body.
 *
 * Mirrors the classic 5-character escape: `&` → `&amp;`, `<` → `&lt;`,
 * `>` → `&gt;`, `"` → `&quot;`, `'` → `&#39;`. We use it on every user-
 * supplied field (name, city, message body, …) before splicing into a
 * template literal that ends up in the `html` property of an email.
 *
 * `null`, `undefined`, numbers and booleans are stringified. `null` /
 * `undefined` become the empty string so templates can call
 * `${escape(user.name)}` without guarding every call site.
 *
 * @param value Anything renderable as text. Non-strings are coerced.
 * @returns A string safe to embed directly in HTML element bodies and
 *          (single- or double-) quoted attribute values.
 */
export function escape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = typeof value === "string" ? value : String(value);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Escape a value for safe insertion into a `href` / `src` URL attribute.
 *
 * Same rules as {@link escape} but additionally rejects the characters that
 * are most commonly abused in `javascript:` / `data:` URL injection. If the
 * input starts with a scheme other than `http`, `https`, `mailto`, or a
 * relative `path` (i.e. anything that doesn't begin with `/` or `#`), the
 * function returns `"about:blank"` so we never forward a malicious URL to
 * a recipient's mail client.
 *
 * @param value The raw URL string. May be absolute or site-relative.
 * @returns A sanitized URL string safe to use as an `href` value.
 */
export function escapeUrl(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) return "about:blank";
  const trimmed = value.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) {
    return escape(trimmed);
  }
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("http://") ||
    lower.startsWith("https://") ||
    lower.startsWith("mailto:")
  ) {
    return escape(trimmed);
  }
  return "about:blank";
}

/**
 * Build the standard unsubscribe URL for marketing emails.
 *
 * Always points at `/api/unsubscribe` with the recipient's address as a
 * query param. The unsubscribe route is owned by the API agent and is
 * expected to honour the `email` query string. If you ever change this
 * path, also update the API route handler.
 *
 * @param email The address we're sending to. Will be percent-encoded.
 * @param origin Optional site origin (e.g. `https://rido.bike`). When
 *               omitted, the URL is returned site-relative so the
 *               `href` resolves against whatever host sent the email.
 * @returns A fully-formed URL string.
 */
export function buildUnsubscribeUrl(email: string, origin?: string): string {
  const params = new URLSearchParams({ email });
  const path = `/api/unsubscribe?${params.toString()}`;
  if (!origin) return path;
  const trimmed = origin.replace(/\/+$/, "");
  return `${trimmed}${path}`;
}
