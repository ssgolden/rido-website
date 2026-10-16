"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { DURATION, EASE, REVEAL } from "@/lib/motion";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "rido-cookie-consent";

// The banner mounts in the root layout, OUTSIDE any LocaleProvider, so it
// derives the locale from the URL ("/es..." → Spanish) instead of context.
const en = {
  title: "We value your privacy",
  body: "Cookieless analytics load only if you accept. No advertising or cross-site tracking. Your choice is saved on this device.",
  learnMore: "Read our cookie policy",
  accept: "Accept analytics",
  decline: "Decline",
  close: "Close",
};
const copy: Record<"en" | "es", typeof en> = {
  en,
  es: {
    title: "Tu privacidad nos importa",
    body: "Las analíticas sin cookies solo se cargan si aceptas. Sin publicidad ni rastreo entre sitios. Tu elección se guarda en este dispositivo.",
    learnMore: "Lee nuestra política de cookies",
    accept: "Aceptar analíticas",
    decline: "Rechazar",
    close: "Cerrar",
  },
};

function safeGetStorage(key: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  } catch {
    // localStorage unavailable (private browsing, storage blocked, etc.)
    return null;
  }
}

function safeSetStorage(key: string, value: string): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
  } catch {
    // Silently fail if storage is blocked
  }
}

// Subscribe to localStorage consent state without setState-in-effect.
// Returns true when the banner should be visible (no consent recorded yet).
function useShouldShowConsent() {
  return useSyncExternalStore(
    () => () => {},
    () => !safeGetStorage(STORAGE_KEY), // client
    () => false // SSR — don't show banner during hydration
  );
}

export function CookieConsent() {
  const pathname = usePathname() ?? "/";
  const t = pathname === "/es" || pathname.startsWith("/es/") ? copy.es : copy.en;
  const shouldShow = useShouldShowConsent();
  const [dismissed, setDismissed] = useState(false);
  const visible = shouldShow && !dismissed;
  const reduce = useReducedMotion();

  const handleAccept = () => {
    safeSetStorage(STORAGE_KEY, JSON.stringify({ accepted: true, timestamp: Date.now() }));
    setDismissed(true);
  };

  const handleDecline = () => {
    safeSetStorage(STORAGE_KEY, JSON.stringify({ accepted: false, timestamp: Date.now() }));
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          initial={reduce ? false : { y: REVEAL.y, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: REVEAL.y, opacity: 0 }}
          transition={{ duration: reduce ? 0 : DURATION.entrance, ease: EASE }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-3 sm:p-6"
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-consent-title"
        >
          <div className="max-w-4xl mx-auto glass-strong rounded-2xl p-4 sm:p-6 shadow-2xl shadow-black/40">
            <div className="flex items-start gap-4">
              {/* Icon is decorative; dropped on phones so the card stays compact and the hero CTAs stay visible. */}
              <div className="hidden sm:flex w-10 h-10 rounded-xl bg-rido-magenta/10 items-center justify-center shrink-0" aria-hidden="true">
                <Cookie className="w-5 h-5 text-rido-magenta" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 id="cookie-consent-title" className="font-bold text-white mb-1">{t.title}</h3>
                <p className="text-sm text-muted-strong leading-relaxed">
                  {t.body}{" "}
                  <Link href="/politica-cookies" className="text-white underline hover:text-rido-magenta-light transition-colors">
                    {t.learnMore}
                  </Link>
                </p>
                <div className="mt-3 sm:mt-4 flex flex-row gap-2">
                  <Button size="sm" onClick={handleAccept} className="flex-1 sm:flex-none">{t.accept}</Button>
                  <Button size="sm" variant="secondary" onClick={handleDecline} className="flex-1 sm:flex-none">{t.decline}</Button>
                </div>
              </div>
              <button
                onClick={handleDecline}
                className="text-muted-strong hover:text-white transition-colors cursor-pointer p-1 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy rounded"
                aria-label={t.close}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}