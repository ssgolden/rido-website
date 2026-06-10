/**
 * Base path for GitHub Pages deployment.
 *
 * For GitHub Pages at /rido-website, all internal URLs need this prefix.
 * For custom domain (rido.bike) or local dev, it's empty.
 */

export function getBasePath(): string {
  // Server-side: check env vars (available during SSR and static export)
  if (typeof window === "undefined") {
    if (process.env.CUSTOM_DOMAIN === "true") return "";
    return process.env.NEXT_OUTPUT === "export" ? "/rido-website" : "";
  }
  // Client-side: detect from the current URL
  return window.location.pathname.startsWith("/rido-website")
    ? "/rido-website"
    : "";
}

/**
 * Prepend basePath to a path.
 * Call this at RENDER TIME (in the component), not at data initialization time.
 */
export function withBase(path: string): string {
  const base = getBasePath();
  if (path.startsWith(base)) return path;
  return `${base}${path}`;
}