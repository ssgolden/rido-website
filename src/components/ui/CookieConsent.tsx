"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CONSENT_EVENT, readConsentRecord, writeConsentRecord } from "@/lib/consent";

// The banner mounts in the root layout, OUTSIDE any LocaleProvider, so it
// derives the locale from the URL ("/es..." → Spanish) instead of context.
const en = {
  title: "We value your privacy",
  body: "We store your preference on this device and, only if you accept, load cookieless analytics to understand site traffic. No advertising or cross-site tracking cookies.",
  learnMore: "Read our cookie policy",
  accept: "Accept analytics",
  decline: "Decline non-essential",
  close: "Close",
};
const copy: Record<"en" | "es", typeof en> = {
  en,
  es: {
    title: "Tu privacidad nos importa",
    body: "Guardamos tu preferencia en este dispositivo y, solo si aceptas, cargamos analíticas sin cookies para entender el tráfico del sitio. Sin cookies publicitarias ni de rastreo entre sitios.",
    learnMore: "Lee nuestra política de cookies",
    accept: "Aceptar todas",
    decline: "Rechazar no esenciales",
    close: "Cerrar",
  },
};

// Subscribe to the consent record without setState-in-effect.
// Returns true when the banner should be visible (no current-version consent
// recorded yet). Re-evaluates when another tab answers, or when a "cookie
// settings" control clears the record.
function useShouldShowConsent() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener("storage", callback);
      window.addEventListener(CONSENT_EVENT, callback);
      return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener(CONSENT_EVENT, callback);
      };
    },
    () => readConsentRecord() === null, // client
    () => false // SSR — don't show banner during hydration
  );
}

export function CookieConsent() {
  const pathname = usePathname() ?? "/";
  const t = pathname === "/es" || pathname.startsWith("/es/") ? copy.es : copy.en;
  const shouldShow = useShouldShowConsent();
  const [dismissed, setDismissed] = useState(false);
  const visible = shouldShow && !dismissed;

  const handleAccept = () => {
    writeConsentRecord(true);
    setDismissed(true);
  };

  const handleDecline = () => {
    writeConsentRecord(false);
    setDismissed(true);
  };

  // Escape = decline, so keyboard users can dismiss the banner without
  // tabbing through the whole page to reach it (it is last in DOM order).
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDecline();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6"
          role="region"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-body"
        >
          {/* Solid surface (not glass): a translucent banner over the magenta CTA drops the title below 4.5:1 */}
          <div className="max-w-4xl mx-auto rounded-2xl p-4 sm:p-6 shadow-2xl shadow-black/40 border border-white/10 bg-rido-navy-light">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-rido-magenta/10 flex items-center justify-center shrink-0">
                <Cookie className="w-5 h-5 text-rido-magenta" />
              </div>
              <div className="flex-1 min-w-0">
                <p id="cookie-consent-title" className="font-bold text-white mb-1">{t.title}</p>
                <p id="cookie-consent-body" className="text-sm text-white/70 leading-relaxed">
                  {t.body}{" "}
                  <Link href="/politica-cookies" prefetch={false} className="text-white underline hover:text-rido-magenta-light transition-colors">
                    {t.learnMore}
                  </Link>
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Button size="sm" onClick={handleAccept}>{t.accept}</Button>
                  <Button size="sm" variant="secondary" onClick={handleDecline}>{t.decline}</Button>
                </div>
              </div>
              <button
                onClick={handleDecline}
                className="text-white/60 hover:text-white transition-colors cursor-pointer p-1 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy rounded"
                aria-label={t.close}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}