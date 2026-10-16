"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/i18n/config";

const copy = {
  en: {
    title: "Something went wrong",
    body: "Sorry, an unexpected error occurred. Try again, or head back to the homepage.",
    errorId: "Error ID",
    retry: "Try again",
    home: "Go home",
  },
  es: {
    title: "Algo ha fallado",
    body: "Lo sentimos, se ha producido un error inesperado. Vuelve a intentarlo o regresa a la página de inicio.",
    errorId: "ID del error",
    retry: "Reintentar",
    home: "Ir al inicio",
  },
} as const satisfies Record<Locale, Record<string, string>>;

const button =
  "btn-lift inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rido-magenta focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy";

/**
 * Shared error-boundary view (app/(en)/error.tsx, app/(es)/error.tsx,
 * app/global-error.tsx). Plain markup and an inline icon: Next loads error
 * boundaries' JS on every page, so they must not pull in Button, lucide or
 * next/link.
 */
export function ErrorView({ error, reset, locale = "en" }: { error: Error & { digest?: string }; reset: () => void; locale?: Locale }) {
  const t = copy[locale];
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-dvh bg-rido-navy text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-rido-magenta/10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-10 h-10 text-rido-magenta" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-3">{t.title}</h1>
        <p className="text-white/70 mb-6">
          {t.body}
          {error.digest ? (
            <span className="block mt-2 text-xs text-white/50">
              {t.errorId}: {error.digest}
            </span>
          ) : null}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button type="button" onClick={() => reset()} className={`${button} bg-rido-magenta text-white hover:brightness-110`}>
            {t.retry}
          </button>
          <a href={locale === "es" ? "/es" : "/"} className={`${button} bg-white/10 text-white hover:bg-white/15`}>
            {t.home}
          </a>
        </div>
      </div>
    </div>
  );
}
