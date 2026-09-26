/**
 * Public site origin.
 *
 * Netlify serves https://www.rido.bike and 301-redirects the apex
 * https://rido.bike to www. Canonicals, sitemap, robots, and JSON-LD
 * must use this origin so they match the host visitors actually land on.
 */
export const SITE_ORIGIN = "https://www.rido.bike";

/**
 * Open Graph locale tags use language_TERRITORY.
 * English pages are en_GB. Spanish pages are es_ES.
 * Declare the other tag as og:locale:alternate only when that page has a twin.
 */
export const OG_LOCALE_EN = "en_GB";
export const OG_LOCALE_ES = "es_ES";

/**
 * UTC calendar date of this build. Sitemap lastmod and WebPage dateModified
 * read it so freshness tracks the deploy, not a frozen or future date.
 */
export const SITE_LAST_MODIFIED = new Date().toISOString().slice(0, 10);
