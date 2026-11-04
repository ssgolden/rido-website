"use client";
import { withBase } from "@/lib/basePath";
import { track, type Placement } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import { storeUrl, type Store } from "@/data/apps";

const copy = {
  en: { group: "Get the Rido app", ios: "Download Rido on the App Store (opens in a new tab)", android: "Get Rido on Google Play (opens in a new tab)" },
  es: { group: "Descarga la app de Rido", ios: "Descarga Rido en el App Store (se abre en una pestaña nueva)", android: "Consigue Rido en Google Play (se abre en una pestaña nueva)" },
} as const satisfies Record<Locale, unknown>;

// Official artwork (public/images/badges), never recoloured or redrawn.
// Both badges render at the same height; widths follow each file's ratio.
const badges: { store: Store; file: (l: Locale) => string; ratio: number }[] = [
  { store: "ios", file: (l) => `/images/badges/app-store-${l}.svg`, ratio: 119.66 / 40 },
  { store: "android", file: (l) => `/images/badges/google-play-${l}.svg`, ratio: 135 / 40 },
];

// Height per size; width follows from the artwork. "lg" drops to 48px on phones
// so both badges still fit on one row at 360px.
const sizes = {
  sm: { h: 40, className: "h-10" },
  md: { h: 48, className: "h-12" },
  lg: { h: 56, className: "h-12 sm:h-14" },
} as const;

/**
 * App Store and Google Play badges. Each tap is counted as `store_click`
 * (only after cookie consent; see src/lib/analytics.ts).
 */
export function StoreBadges({
  locale,
  placement,
  size = "md",
  className,
}: {
  locale: Locale;
  placement: Placement;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const t = copy[locale];
  const { h, className: heightClass } = sizes[size];

  return (
    <ul aria-label={t.group} className={cn("flex flex-wrap items-center gap-3", className)}>
      {badges.map(({ store, file, ratio }) => (
        <li key={store}>
          <a
            href={storeUrl[store]}
            target="_blank"
            rel="noopener"
            aria-label={t[store]}
            onClick={() => track("store_click", { placement, locale, detail: store })}
            className="inline-flex rounded-[10px] cursor-pointer transition-transform duration-200 motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rido-magenta focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static SVG badge, no optimisation needed */}
            <img src={withBase(file(locale))} alt="" width={Math.round(h * ratio)} height={h} className={cn("block w-auto", heightClass)} />
          </a>
        </li>
      ))}
    </ul>
  );
}
