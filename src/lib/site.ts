/**
 * Public site origin.
 *
 * Netlify serves https://www.rido.bike and 301-redirects the apex
 * https://rido.bike to www. Canonicals, sitemap, robots, and JSON-LD
 * must use this origin so they match the host visitors actually land on.
 */
export const SITE_ORIGIN = "https://www.rido.bike";

/**
 * UTC calendar date of this build. Sitemap lastmod and WebPage dateModified
 * read it so freshness tracks the deploy, not a frozen or future date.
 */
export const SITE_LAST_MODIFIED = new Date().toISOString().slice(0, 10);
