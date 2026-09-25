/**
 * Build-time site constants shared by server components.
 * `copyrightYear` is evaluated once at build; the site is rebuilt on every
 * deploy, so it never drifts more than one release behind.
 */
export const siteUrl = "https://rido.bike";
export const copyrightYear = new Date().getFullYear();
/** True when the build is the GitHub Pages static export (no API routes). */
export const isStaticExport = process.env.NEXT_OUTPUT === "export";
