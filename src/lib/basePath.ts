/**
 * Base path for GitHub Pages deployment.
 *
 * For GitHub Pages at /rido-website, all internal URLs need this prefix.
 * For custom domain (rido.bike) or local dev, it's empty.
 *
 * CRITICAL: This uses a runtime check so it works in BOTH SSR and client.
 * Using `process.env.NEXT_OUTPUT` breaks client-side rendering because
 * that variable is undefined in the browser JS bundle, causing
 * client-side rendered images (like bike gallery) to have the wrong
 * path (missing the /rido-website prefix) on GitHub Pages.
 */
export function getBasePath(): string {
  // Server-side: check the env var (available during SSR and static export)
  if (typeof window === "undefined") {
    return process.env.NEXT_OUTPUT === "export" ? "/rido-website" : "";
  }
  // Client-side: detect from the current URL (works in both
  // GitHub Pages deployment and local dev)
  return window.location.pathname.startsWith("/rido-website")
    ? "/rido-website"
    : "";
}

/**
 * Current base path. Uses runtime detection so it works correctly
 * in both SSR and client-side rendering.
 */
export const basePath = getBasePath();

/**
 * Prepend basePath to a path.
 * Use this for all internal URLs in image src, link href, etc.
 * that aren't handled by next/link or next/image.
 *
 * IMPORTANT: Call this at RENDER TIME (in the component), not at
 * data initialization time (in the data file). Data files are
 * initialized once and shared between SSR and client, but
 * basePath differs between server and browser when using
 * process.env-based detection.
 */
export function withBase(path: string): string {
  const base = getBasePath();
  // Don't double-prefix
  if (path.startsWith(base)) return path;
  return `${base}${path}`;
}