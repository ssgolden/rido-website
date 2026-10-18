"use client";

import { useSyncExternalStore } from "react";
import { readConsent, saveConsent, subscribeConsent } from "@/lib/consent";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/Button";


// The banner mounts in the root layout, OUTSIDE any LocaleProvider, so it
// derives the locale from the URL ("/es..." → Spanish) instead of context.
const en = {
  title: "We value your privacy",
  body: "Cookieless analytics load only if you accept. No advertising or cross-site tracking. Your choice is saved on this device.",
  /** Phones: one sentence, so the card stays clear of the hero form. */
  short: "Cookieless analytics, only if you accept.",
  learnMore: "Read our cookie policy",
  learnMoreShort: "Cookie policy",
  accept: "Accept analytics",
  decline: "Decline",
};
const copy: Record<"en" | "es", typeof en> = {
  en,
  es: {
    title: "Tu privacidad nos importa",
    body: "La analítica sin cookies solo se carga si aceptas. Sin publicidad ni rastreo entre sitios. Tu elección se guarda en este dispositivo.",
    short: "Analítica sin cookies, solo si aceptas.",
    learnMore: "Lee nuestra política de cookies",
    learnMoreShort: "Política de cookies",
    accept: "Aceptar analítica",
    decline: "Rechazar",
  },
};

// Visible while no choice is stored. Re-evaluates when the choice changes in
// this tab (accept, decline, or "Cookie settings" in the footer) or another.
function useShouldShowConsent() {
  return useSyncExternalStore(
    subscribeConsent,
    () => readConsent() === "unset", // client
    () => false // SSR — don't show banner during hydration
  );
}

/**
 * Consent card. Mounted first in <body> (RootDocument) so keyboard users reach
 * it before the page. On phones it is one sentence and two buttons, sitting
 * above the home indicator; the full card shows from `sm`. Declining is one
 * action (no extra close control).
 */
export function CookieConsent() {
  const pathname = usePathname() ?? "/";
  const t = pathname === "/es" || pathname.startsWith("/es/") ? copy.es : copy.en;
  const visible = useShouldShowConsent();

  const handleAccept = () => saveConsent(true);
  const handleDecline = () => saveConsent(false);

  return (
    visible && (
        <div
          className="enter-up fixed bottom-0 left-0 right-0 z-[100] p-3 max-sm:pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-6"
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-consent-title"
        >
          <div className="consent-card max-w-4xl mx-auto rounded-2xl p-3 sm:p-6 shadow-2xl shadow-black/40">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex w-10 h-10 rounded-xl bg-rido-magenta/10 items-center justify-center shrink-0" aria-hidden="true">
                <Cookie className="w-5 h-5 text-rido-magenta" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 id="cookie-consent-title" className="sr-only sm:not-sr-only font-semibold text-white sm:mb-1">{t.title}</h3>
                <p className="hidden sm:block text-sm text-muted-strong leading-relaxed">
                  {t.body}{" "}
                  <Link href="/politica-cookies" prefetch={false} className="text-white underline cursor-pointer hover:text-rido-magenta-light transition-colors">
                    {t.learnMore}
                  </Link>
                </p>
                <p className="sm:hidden text-sm text-muted-strong leading-snug">
                  {t.short}{" "}
                  <Link href="/politica-cookies" prefetch={false} className="text-white underline cursor-pointer hover:text-rido-magenta-light transition-colors">
                    {t.learnMoreShort}
                  </Link>
                </p>
                <div className="mt-2.5 sm:mt-4 flex flex-row gap-2">
                  <Button size="sm" onClick={handleAccept} className="flex-1 sm:flex-none min-h-11">{t.accept}</Button>
                  <Button size="sm" variant="secondary" onClick={handleDecline} className="flex-1 sm:flex-none min-h-11">{t.decline}</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
    )
  );
}
