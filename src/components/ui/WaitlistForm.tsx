"use client";

import { useId, useState } from "react";
import { Mail, Loader2, ArrowRight } from "lucide-react";
import { m, useReducedMotion } from "framer-motion";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/config";
import { DURATION, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

const copy = {
  en: {
    emailPlaceholder: "your@email.com",
    emailLabel: "Email address for the Rido waitlist",
    submit: "Join the waitlist",
    errorInvalid: "Please enter a valid email address.",
    errorGenericBefore: "We couldn't save your email just now. Write to ",
    errorGenericAfter: " and we'll add you by hand.",
    successTitle: "You're on the list!",
    successBody: "We'll email you the moment Rido launches near you.",
  },
  es: {
    emailPlaceholder: "tu@email.com",
    emailLabel: "Correo electrónico para la lista de espera de Rido",
    submit: "Unirme a la lista",
    errorInvalid: "Introduce una dirección de correo electrónico válida.",
    errorGenericBefore: "No hemos podido guardar tu correo ahora mismo. Escríbenos a ",
    errorGenericAfter: " y te apuntamos a mano.",
    successTitle: "¡Ya estás en la lista!",
    successBody: "Te escribiremos en cuanto Rido llegue a tu zona.",
  },
} as const satisfies Record<Locale, Record<string, string>>;

const WAITLIST_KEY = "rido-waitlist-email";
// Apps Script URL when configured; otherwise /api/waitlist (Netlify Function on
// the static site, Next route on Vercel). Success is shown only after a backend
// accepts the sign-up — never on a local-only save.
const WAITLIST_URL = process.env.NEXT_PUBLIC_WAITLIST_URL || "";
const WAITLIST_ENDPOINT = WAITLIST_URL || "/api/waitlist";
const CONTACT_EMAIL = "info@rido.bike";

/**
 * The one waitlist form, used in the hero and the closing section.
 * `align` only changes alignment; behaviour and copy are identical.
 */
export function WaitlistForm({ align = "left", className }: { align?: "left" | "center"; className?: string }) {
  const locale = useLocale();
  const t = copy[locale];
  const reduce = useReducedMotion();
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorKey, setErrorKey] = useState<"invalid" | "generic" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setErrorKey("invalid");
      return;
    }
    setStatus("loading");
    setErrorKey(null);
    try {
      const res = await fetch(WAITLIST_ENDPOINT, {
        method: "POST",
        // Apps Script needs text/plain to avoid a CORS preflight; the API parses JSON.
        headers: { "Content-Type": WAITLIST_URL ? "text/plain;charset=utf-8" : "application/json" },
        body: JSON.stringify({ email, locale, userAgent: navigator.userAgent }),
      });
      if (!res.ok) throw new Error(`waitlist HTTP ${res.status}`);
      const json = await res.json().catch(() => ({}));
      if (json.ok === false) throw new Error(json.error || "waitlist rejected");
      try {
        const existing: string[] = JSON.parse(localStorage.getItem(WAITLIST_KEY) || "[]");
        if (!existing.includes(email)) {
          existing.push(email);
          localStorage.setItem(WAITLIST_KEY, JSON.stringify(existing));
        }
      } catch {
        // Storage blocked — the backend already has the sign-up.
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorKey("generic");
    }
  };

  if (status === "success") {
    return (
      <m.div
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : DURATION.entrance, ease: EASE }}
        className={cn("glass rounded-2xl p-5 max-w-md", align === "center" ? "mx-auto text-center" : "", className)}
        role="status"
        aria-live="polite"
      >
        <p className="font-bold text-white">{t.successTitle}</p>
        <p className="mt-1 text-sm text-muted">{t.successBody}</p>
      </m.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn("w-full max-w-md", align === "center" ? "mx-auto" : "", className)}
    >
      <div className="flex flex-col sm:flex-row gap-2 rounded-2xl sm:bg-white/[0.06] sm:p-1.5 sm:ring-1 sm:ring-white/15 sm:backdrop-blur-xl">
        <label htmlFor={inputId} className="sr-only">{t.emailLabel}</label>
        <div className="relative flex-1">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-weak pointer-events-none" aria-hidden="true" />
          <input
            id={inputId}
            type="email"
            inputMode="email"
            autoComplete="email"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder={t.emailPlaceholder}
            disabled={status === "loading"}
            aria-invalid={status === "error"}
            aria-describedby={status === "error" ? errorId : undefined}
            className="field w-full min-h-12 pl-11 pr-4 rounded-xl bg-white/[0.06] ring-1 ring-white/15 sm:bg-transparent sm:ring-0 text-white text-base placeholder:text-muted-weak focus:outline-none focus-visible:ring-2 focus-visible:ring-rido-magenta cursor-text disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="group btn-lift inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-rido-magenta px-6 font-semibold text-white shadow-[0_8px_30px_rgba(222,4,152,0.35)] hover:brightness-110 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy disabled:opacity-60 disabled:cursor-wait"
        >
          {status === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <>
              {t.submit}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
      {status === "error" && errorKey && (
        <p id={errorId} className={cn("text-sm text-red-300 mt-2", align === "center" ? "text-center" : "")} role="alert">
          {errorKey === "invalid" ? (
            t.errorInvalid
          ) : (
            <>
              {t.errorGenericBefore}
              <a href={`mailto:${CONTACT_EMAIL}?subject=Waitlist`} className="underline underline-offset-2 text-white hover:text-rido-magenta-light transition-colors cursor-pointer">
                {CONTACT_EMAIL}
              </a>
              {t.errorGenericAfter}
            </>
          )}
        </p>
      )}
    </form>
  );
}
