/**
 * i18n configuration for the Rido website.
 *
 * This file is the single source of truth for:
 *   - Which locales the app supports
 *   - Which locale is the default
 *   - How the URL prefix strategy works (see {@link localePrefix} below)
 *   - Re-exported helper types and constants consumed by the middleware,
 *     server components, and the dictionary loader.
 *
 * Why these specific values?
 *   - `locales = ['en', 'es']` — the product ships with English and Spanish.
 *     Rido's primary market is Spanish-speaking (Costa del Sol launch), so
 *     Spanish must be present from day one; English is added for tourists
 *     and expat residents.
 *   - `defaultLocale = 'es'` — the default locale is **NOT** the same as
 *     "the first locale in the list". It is the locale we fall back to
 *     when a user hits a path that does not carry a locale prefix and we
 *     cannot infer one from the `Accept-Language` header. Spanish-first
 *     matches the product's primary market.
 *   - `localePrefix = 'as-needed'` — Spanish (the default) renders without
 *     a prefix (`/pricing`); English renders with a prefix (`/en/pricing`).
 *     This is the recommended next-intl mode for default-locale SEO: the
 *     canonical version of every page lives at the un-prefixed path, which
 *     matches the existing pre-i18n URL structure and avoids 301-ing every
 *     old link after the migration.
 *
 * The companion files in this folder:
 *   - `dictionaries/{en,es}.json` — string tables, one per locale.
 *   - `index.ts` — `getDictionary(locale)` loader.
 *   - `../../middleware-i18n.ts` — the next-intl routing middleware.
 *
 * The auth middleware lives at `src/middleware.ts` (owned by a different
 * agent). The two will be combined in a follow-up — see the JSDoc on
 * `src/middleware-i18n.ts` for details.
 *
 * @module src/lib/i18n/config
 */

/**
 * The list of supported application locales.
 *
 * Order matters here only for type-level inference (e.g. the union type
 * {@link Locale}). The default locale is configured separately via
 * {@link defaultLocale}.
 */
export const locales = ["en", "es"] as const;

/**
 * Union of valid locale strings, derived from {@link locales}.
 * Use this type anywhere a locale is accepted (`Locale` parameters,
 * translation key lookups, etc.).
 */
export type Locale = (typeof locales)[number];

/**
 * The locale used when no locale can be inferred from the URL or the
 * `Accept-Language` header. Rido is a Spain-first product, so Spanish is
 * the default.
 */
export const defaultLocale: Locale = "es";

/**
 * URL prefix strategy.
 *
 * - `'always'`    — every path starts with a locale (`/en/pricing`,
 *                   `/es/pricing`). Most explicit, worst default-locale SEO.
 * - `'as-needed'` — the default locale renders without a prefix
 *                   (`/pricing` for Spanish) and other locales keep the
 *                   prefix (`/en/pricing`). Recommended by next-intl.
 * - `'never'`     — no prefixes; locale is detected from headers/cookies
 *                   only. Useful for purely header-driven setups, but
 *                   brittle for marketing pages where we want
 *                   shareable canonical URLs per language.
 *
 * We use `'as-needed'` to keep canonical URLs un-prefixed for the default
 * (Spanish) locale.
 */
export const localePrefix = "as-needed" as const;

/**
 * Human-readable label for each locale, used in the language picker.
 * The label is rendered in the locale's own language — i.e. an English
 * picker would show "English" / "Español", and a Spanish picker would
 * show "Inglés" / "Español".
 */
export const localeLabels: Record<Locale, { native: string; english: string }> = {
  en: { native: "English", english: "English" },
  es: { native: "Español", english: "Spanish" },
};

/**
 * Type guard: returns `true` if `value` is one of the supported
 * {@link locales}. Useful for validating `params.locale` segments before
 * using them.
 *
 * @param value The candidate locale string (e.g. from a dynamic route).
 * @returns `true` if `value` is a supported locale.
 */
export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}
