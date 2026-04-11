/**
 * Base path utility for GitHub Pages deployment.
 * When deployed to GitHub Pages at /rido-website, all internal URLs
 * need this prefix. For custom domain (rido.bike) or Vercel, it's empty.
 */
export const basePath = process.env.NEXT_OUTPUT === "export" ? "/rido-website" : "";

/** Prepend basePath to a path */
export function withBase(path: string): string {
  if (!basePath) return path;
  // Don't double-prefix
  if (path.startsWith(basePath)) return path;
  return `${basePath}${path}`;
}