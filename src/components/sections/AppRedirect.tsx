"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Section } from "@/components/ui/Section";
import { StoreBadges } from "@/components/ui/StoreBadges";
import { track } from "@/lib/analytics";
import type { Locale } from "@/lib/i18n/config";
import { storeUrl, type Store } from "@/data/apps";

const copy = {
  en: {
    aria: "Get the Rido app",
    title: "Get the Rido app.",
    opening: "Opening your app store…",
    body: "Download Rido, scan the QR code on the handlebar and ride. Shared e-scooters, live now in Torrevieja.",
  },
  es: {
    aria: "Descarga la app de Rido",
    title: "Descarga la app de Rido.",
    opening: "Abriendo tu tienda de apps…",
    body: "Descarga Rido, escanea el código QR del manillar y a rodar. Patinetes eléctricos compartidos, ya en Torrevieja.",
  },
} as const satisfies Record<Locale, unknown>;

/** iPhone/iPad (including iPadOS, which reports as a Mac with touch) or Android; null elsewhere. */
function detectStore(): Store | null {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  return null;
}

/**
 * The rido.bike/app smart link for QR stickers, flyers and social bios.
 * Phones go straight to their store; everything else sees both badges.
 * The static HTML is the both-badges page, so it works without JavaScript.
 */
export function AppRedirect({ locale }: { locale: Locale }) {
  const store = useSyncExternalStore(() => () => {}, detectStore, () => null);
  const t = copy[locale];

  useEffect(() => {
    if (!store) return;
    track("store_click", { placement: "app-link", locale, detail: store });
    window.location.replace(storeUrl[store]);
  }, [store, locale]);

  return (
    <Section id="get-the-app" label={t.aria}>
      <div className="max-w-xl mx-auto text-center">
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-balance">{t.title}</h1>
        <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed" aria-live="polite">
          {store ? t.opening : t.body}
        </p>
        <StoreBadges locale={locale} placement="app-link" size="lg" className="mt-8 justify-center" />
      </div>
    </Section>
  );
}
