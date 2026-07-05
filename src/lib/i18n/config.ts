/**
 * i18n config for the static-export strategy: English at `/`, Spanish at `/es`.
 * No middleware/locale routing — GitHub Pages serves plain static files.
 */
export const locales = ["en", "es"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
