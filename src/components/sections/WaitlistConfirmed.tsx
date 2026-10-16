"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, CircleAlert, CircleCheck } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ShareInvite } from "@/components/ui/ShareInvite";
import { WaitlistForm } from "@/components/ui/WaitlistForm";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/config";
import { primaryCity } from "@/data/cities";

const town = primaryCity?.name ?? "Torrevieja";

const copy = {
  en: {
    aria: "Waitlist confirmation",
    checking: "Checking your link…",
    okTitle: "You're confirmed.",
    okBody: `Your place on the Rido waitlist is saved. We'll email you the moment Rido launches in ${town}.`,
    badTitle: "That link didn't work.",
    badBody: "It may be incomplete or already replaced by a newer one. Enter your email again and we'll send a fresh link.",
    home: "Back to Rido",
  },
  es: {
    aria: "Confirmación de la lista de espera",
    checking: "Comprobando tu enlace…",
    okTitle: "Correo confirmado.",
    okBody: `Tu plaza en la lista de espera de Rido está guardada. Te escribiremos en cuanto Rido llegue a ${town}.`,
    badTitle: "Ese enlace no ha funcionado.",
    badBody: "Puede que esté incompleto o que haya uno más reciente. Vuelve a introducir tu correo y te enviaremos uno nuevo.",
    home: "Volver a Rido",
  },
} as const satisfies Record<Locale, Record<string, string>>;

type Status = "ok" | "invalid" | "unknown";

function readStatus(): Status {
  return new URLSearchParams(window.location.search).get("status") === "invalid" ? "invalid" : "ok";
}

/**
 * Landing page for the double opt-in link (netlify/functions/waitlist.mjs
 * redirects here, adding ?status=invalid when the token didn't match).
 * The status is read after hydration, so the static HTML stays neutral.
 */
export function WaitlistConfirmed() {
  const locale = useLocale();
  const t = copy[locale];
  const status = useSyncExternalStore<Status>(
    () => () => {},
    readStatus,
    () => "unknown"
  );
  const home = locale === "es" ? "/es" : "/";

  return (
    <Section id="waitlist-confirmed" label={t.aria} className="min-h-[70svh] flex items-center" containerClassName="w-full max-w-2xl text-center">
      <ScrollReveal>
        {status === "unknown" ? (
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black">{t.checking}</h1>
        ) : status === "ok" ? (
          <>
            <CircleCheck className="mx-auto w-12 h-12 text-rido-green" aria-hidden="true" />
            <h1 className="mt-5 font-display text-3xl sm:text-4xl md:text-5xl font-black text-balance">{t.okTitle}</h1>
            <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed">{t.okBody}</p>
            <ShareInvite placement="confirmed" align="center" className="mt-8" />
          </>
        ) : (
          <>
            <CircleAlert className="mx-auto w-12 h-12 text-rido-magenta-light" aria-hidden="true" />
            <h1 className="mt-5 font-display text-3xl sm:text-4xl md:text-5xl font-black text-balance">{t.badTitle}</h1>
            <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed">{t.badBody}</p>
            <WaitlistForm align="center" placement="confirmed" className="mt-8 max-w-lg" />
          </>
        )}
        <Link
          href={home}
          className="mt-10 inline-flex items-center gap-2 min-h-11 font-semibold text-white hover:text-rido-magenta-light transition-colors cursor-pointer"
        >
          {t.home} <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </ScrollReveal>
    </Section>
  );
}
