/**
 * Dictionary loader for the Rido website.
 *
 * Responsibilities:
 *   - Re-export the {@link Locale} type and the {@link locales} /
 *     {@link defaultLocale} constants from `./config` so callers can
 *     `import` everything from `@/lib/i18n` without reaching into the
 *     config module directly.
 *   - Define the {@link Dictionary} type — the structural shape that both
 *     the English (`en.json`) and Spanish (`es.json`) tables conform to.
 *     This is what gives us a compile-time check that the two files
 *     cover the same keys.
 *   - Expose {@link getDictionary}, the async loader used by Server
 *     Components. The JSON tables are imported eagerly at module-load
 *     time, so there is no filesystem round-trip per request — perfect
 *     for the edge runtime the middleware will run in.
 *
 * Locale resolution
 * -----------------
 * Pass a valid {@link Locale} and you get the matching dictionary. Pass
 * an unknown string (e.g. from an untrusted URL) and the loader falls
 * back to {@link defaultLocale} rather than throwing — the app should
 * always be able to render *something*, even if the URL is mangled.
 *
 * Usage from a Server Component:
 *
 * ```tsx
 * import { getDictionary, type Locale } from "@/lib/i18n";
 *
 * export default async function Page({ params }: { params: { locale: Locale } }) {
 *   const t = await getDictionary(params.locale);
 *   return <h1>{t.hero.headlineHighlight}</h1>;
 * }
 * ```
 *
 * @module src/lib/i18n
 */

import { defaultLocale, isLocale, locales, type Locale } from "./config";

// ─── Re-exports ────────────────────────────────────────────────────────────

export { locales, defaultLocale, isLocale, type Locale };

// ─── Dictionary type ───────────────────────────────────────────────────────

/**
 * Structural type of a dictionary. The English and Spanish JSON files
 * must both satisfy this shape. If they diverge, TypeScript will fail at
 * the `en satisfies Dictionary` / `es satisfies Dictionary` checks below,
 * which is intentional — we want a compile-time error, not a runtime
 * `undefined.foo` crash on a missing key.
 *
 * The type is recursive: every string leaf is allowed, and every object
 * leaf is recursively a `Dictionary`. A few primitive values (the
 * `year` strings in milestones, the `count` in the cities eyebrow, the
 * `unlock` / `perMinute` numerics in the pricing estimator) are
 * interpolated by the consumer via `next-intl`'s `t(key, { values })`,
 * so they appear as plain `string` in the source tables.
 */
export type Dictionary = {
  common: {
    appName: string;
    tagline: string;
    learnMore: string;
    getStarted: string;
    comingSoon: string;
    readMore: string;
    readLess: string;
    submit: string;
    cancel: string;
    close: string;
    openMenu: string;
    closeMenu: string;
    loading: string;
    error: {
      generic: string;
      notFound: string;
      unauthorized: string;
      forbidden: string;
      validation: string;
      network: string;
      offline: string;
    };
    form: {
      email: string;
      emailPlaceholder: string;
      password: string;
      search: string;
      searchPlaceholder: string;
      required: string;
      invalidEmail: string;
      invalidPassword: string;
    };
    language: {
      label: string;
      switchTo: string;
      en: string;
      es: string;
    };
  };
  navbar: {
    home: string;
    howItWorks: string;
    vehicles: string;
    cities: string;
    safety: string;
    pricing: string;
    about: string;
    getTheApp: string;
  };
  footer: {
    tagline: string;
    downloadTheApp: string;
    sections: { product: string; company: string; legal: string };
    links: {
      eScooter: string;
      eBike: string;
      pricing: string;
      cities: string;
      about: string;
      safety: string;
      sustainability: string;
      careers: string;
      privacy: string;
      terms: string;
      cookies: string;
    };
    social: { instagram: string; facebook: string; x: string; email: string };
    copyright: string;
    languageNotice: string;
    languageComingSoon: string;
  };
  hero: {
    ariaLabel: string;
    eyebrow: string;
    headlineBefore: string;
    headlineHighlight: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
    stats: { cities: string; vehicles: string; rides: string; co2Saved: string };
    scrollDown: string;
  };
  howItWorks: {
    ariaLabel: string;
    eyebrow: string;
    headlineBefore: string;
    headlineHighlight: string;
    steps: {
      download: { title: string; description: string };
      scan: { title: string; description: string };
      ride: { title: string; description: string };
      park: { title: string; description: string };
    };
  };
  vehicles: {
    ariaLabel: string;
    eyebrow: string;
    headlineBefore: string;
    headlineHighlight: string;
    subheadline: string;
    scooter: {
      name: string;
      tagline: string;
      description: string;
      specs: { range: string; topSpeed: string; weightLimit: string; battery: string };
      features: {
        lights: string;
        phoneHolder: string;
        brakes: string;
        turnSignals: string;
        beginnerMode: string;
        gps: string;
      };
      imageAlt: string;
    };
    bike: {
      name: string;
      tagline: string;
      description: string;
      specs: { range: string; assistSpeed: string; weightLimit: string; battery: string };
      features: {
        pedalAssist: string;
        saddle: string;
        basket: string;
        lights: string;
        tires: string;
        frame: string;
      };
      imageAlt: string;
    };
  };
  cities: {
    ariaLabel: string;
    eyebrowActive: string;
    eyebrowComingSoon: string;
    headlineBefore: string;
    headlineHighlight: string;
    subheadline: string;
    region: string;
    comingSoonBadge: string;
    stats: { activeCities: string; vehiclesDeployed: string; averageWait: string };
  };
  safety: {
    ariaLabel: string;
    eyebrow: string;
    headlineBefore: string;
    headlineHighlight: string;
    subheadline: string;
    rating: string;
    items: {
      helmet: { title: string; description: string };
      oneRider: { title: string; description: string };
      sober: { title: string; description: string };
      park: { title: string; description: string };
    };
  };
  sustainability: {
    ariaLabel: string;
    eyebrow: string;
    headlineBefore: string;
    headlineHighlight: string;
    subheadline: string;
    stats: { co2Saved: string; carTripsReplaced: string; kmRidden: string };
    disclaimer: string;
    commitments: {
      carbonNeutral: { title: string; description: string };
      batteries: { title: string; description: string };
      recycling: { title: string; description: string };
    };
  };
  pricing: {
    ariaLabel: string;
    eyebrow: string;
    headlineBefore: string;
    headlineHighlight: string;
    subheadline: string;
    estimator: {
      title: string;
      rideDuration: string;
      minutes: string;
      estimatedCost: string;
      unlockBreakdown: string;
      flatRateNote: string;
    };
    tiers: {
      payAsYouGo: { name: string; description: string };
      ridoPass: { name: string; description: string; badge: string };
      dayPass: { name: string; description: string; badge: string };
    };
    labels: { unlockFee: string; perMinute: string };
    guarantees: {
      noMinTopUp: string;
      noHiddenFees: string;
      freeRefund: string;
      exactPricing: string;
    };
  };
  faq: {
    ariaLabel: string;
    eyebrow: string;
    headlineBefore: string;
    headlineHighlight: string;
    subheadline: string;
    searchPlaceholder: string;
    searchAriaLabel: string;
    categories: {
      all: string;
      gettingStarted: string;
      pricing: string;
      safety: string;
      legal: string;
    };
    empty: string;
    items: {
      age: { question: string; answer: string };
      unlock: { question: string; answer: string };
      license: { question: string; answer: string };
      damage: { question: string; answer: string };
      bikeLanes: { question: string; answer: string };
      parking: { question: string; answer: string };
      helmet: { question: string; answer: string };
      cost: { question: string; answer: string };
      ridoPass: { question: string; answer: string };
      refund: { question: string; answer: string };
      battery: { question: string; answer: string };
      insurance: { question: string; answer: string };
    };
  };
  about: {
    ariaLabel: string;
    eyebrow: string;
    headlineBefore: string;
    headlineHighlight: string;
    headlineAfter: string;
    quote: string;
    paragraph1: string;
    paragraph2: string;
    values: {
      freedom: { title: string; description: string };
      safety: { title: string; description: string };
      sustainability: { title: string; description: string };
    };
    milestones: {
      founded: { year: string; event: string };
      launch: { year: string; event: string };
      expansion: { year: string; event: string };
    };
  };
  downloadCTA: {
    ariaLabel: string;
    headlineBefore: string;
    headlineHighlight: string;
    subheadline: string;
    ridersCount: string;
    appStore: { topLabel: string; name: string; ariaLabel: string };
    googlePlay: { topLabel: string; name: string; ariaLabel: string };
    scanAndRide: string;
    trustSignals: { free: string; noCard: string; available: string };
  };
};

// ─── Static imports ────────────────────────────────────────────────────────

import en from "./dictionaries/en.json";
import es from "./dictionaries/es.json";

/**
 * Compile-time assertion that both dictionaries conform to {@link Dictionary}.
 * If a key is added to one file and not the other, `tsc` will fail here
 * with a precise type error pointing at the missing field.
 *
 * This is the single biggest win of using a structural `Dictionary` type
 * instead of leaving the JSON files as `Record<string, any>` — typos and
 * drift between locales surface at build time, not in production.
 */
const _enCheck: Dictionary = en;
const _esCheck: Dictionary = es;
// References the variables so TS doesn't drop them as "unused".
void _enCheck;
void _esCheck;

/**
 * All loaded dictionaries, keyed by {@link Locale}. Adding a new locale
 * means: add it to {@link locales}, drop a `xx.json` in `./dictionaries`,
 * and add the import + an entry to this map. The `satisfies Record<Locale, Dictionary>`
 * ensures the new entry compiles only if the JSON shape is correct.
 */
const dictionaries = {
  en,
  es,
} as const satisfies Record<Locale, Dictionary>;

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Load the dictionary for a locale.
 *
 * The function is `async` to match the signature of `next-intl`'s
 * `getTranslations` and the patterns Server Components already use, even
 * though the actual lookup is synchronous (the JSON is bundled at
 * compile time). The signature is forward-compatible with a future
 * switch to per-locale async loading (e.g. from a CMS).
 *
 * @param locale The locale to load. If `locale` is not a known
 *   {@link Locale}, this falls back to {@link defaultLocale} rather than
 *   throwing — defensive, so a typo in a dynamic route can't crash a page.
 * @returns The dictionary for the resolved locale. Always non-null.
 */
export async function getDictionary(locale: string): Promise<Dictionary> {
  const safe: Locale = isLocale(locale) ? locale : defaultLocale;
  return dictionaries[safe];
}

/**
 * Synchronous variant of {@link getDictionary}. Useful in places where
 * the locale is known at compile time (e.g. a statically-rendered
 * Server Component reading `params.locale`).
 *
 * @param locale The locale to load. Falls back to {@link defaultLocale}
 *   for unknown values.
 * @returns The dictionary for the resolved locale.
 */
export function getDictionarySync(locale: string): Dictionary {
  const safe: Locale = isLocale(locale) ? locale : defaultLocale;
  return dictionaries[safe];
}

/**
 * The set of locales that have a bundled dictionary. Equal to
 * {@link locales} today, but exposed as a separate export so callers
 * that care only about "locales I can actually render" don't have to
 * trust that the config and the dictionaries stay in sync.
 */
export const availableLocales: readonly Locale[] = locales;
