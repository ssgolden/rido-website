"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, CircleAlert, CircleCheck, Loader2, MailCheck } from "lucide-react";
import { Section } from "@/components/ui/Section";
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
    askTitle: "One click to confirm.",
    askBody: (email: string) => `Confirm ${email} to keep your place on the Rido waitlist.`,
    confirm: "Confirm my email",
    confirming: "Confirming…",
    okTitle: "You're confirmed.",
    okBody: `Your place on the Rido waitlist is saved. We'll email you the moment Rido launches in ${town}.`,
    badTitle: "That link didn't work.",
    badBody: "It may be incomplete or out of date. Enter your email again and we'll send a fresh link.",
    errorRetry: "We couldn't confirm just now. Please try again in a moment.",
    home: "Back to Rido",
  },
  es: {
    aria: "Confirmación de la lista de espera",
    checking: "Comprobando tu enlace…",
    askTitle: "Un clic para confirmar.",
    askBody: (email: string) => `Confirma ${email} para guardar tu plaza en la lista de espera de Rido.`,
    confirm: "Confirmar mi correo",
    confirming: "Confirmando…",
    okTitle: "Correo confirmado.",
    okBody: `Tu plaza en la lista de espera de Rido está guardada. Te escribiremos en cuanto Rido llegue a ${town}.`,
    badTitle: "Ese enlace no ha funcionado.",
    badBody: "Puede que esté incompleto o caducado. Vuelve a introducir tu correo y te enviaremos uno nuevo.",
    errorRetry: "No hemos podido confirmar ahora mismo. Inténtalo de nuevo en un momento.",
    home: "Volver a Rido",
  },
} satisfies Record<Locale, Record<string, unknown>>;

type Phase = "unknown" | "ask" | "confirming" | "ok" | "invalid" | "retry";

/** The link's parameters, read after hydration so the static HTML stays neutral. */
function readLink(): string {
  const p = new URLSearchParams(window.location.search);
  return JSON.stringify({ email: p.get("e") ?? "", token: p.get("t") ?? "" });
}

/**
 * Double opt-in landing page. The confirmation email links here with the
 * address and token; nothing is confirmed until the visitor presses the
 * button (POST /api/waitlist/confirm), so email scanners that open links
 * cannot confirm on their behalf.
 */
export function WaitlistConfirmed() {
  const locale = useLocale();
  const t = copy[locale];
  const link = useSyncExternalStore(
    () => () => {},
    readLink,
    () => ""
  );
  const { email, token } = link ? (JSON.parse(link) as { email: string; token: string }) : { email: "", token: "" };
  const [result, setResult] = useState<Phase | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const home = locale === "es" ? "/es" : "/";

  const phase: Phase = result ?? (!link ? "unknown" : email && token ? "ask" : "invalid");

  const onConfirm = async () => {
    setResult("confirming");
    try {
      const res = await fetch("/api/waitlist/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });
      const json = await res.json().catch(() => ({}));
      setResult(res.ok && json.ok ? "ok" : res.status === 400 ? "invalid" : "retry");
    } catch {
      setResult("retry");
    }
    // Move focus to the new heading so screen readers announce the outcome.
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const heading = "mt-5 font-display text-3xl sm:text-4xl md:text-5xl font-black text-balance focus:outline-none";

  return (
    <Section id="waitlist-confirmed" label={t.aria} className="min-h-[70svh] flex items-center" containerClassName="w-full max-w-2xl text-center">
      <div aria-live="polite">
        {phase === "unknown" ? (
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black">{t.checking}</h1>
        ) : phase === "ask" || phase === "confirming" || phase === "retry" ? (
          <>
            <MailCheck className="mx-auto w-12 h-12 text-rido-magenta-light" aria-hidden="true" />
            <h1 ref={headingRef} tabIndex={-1} className={heading}>{t.askTitle}</h1>
            <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed break-words">{t.askBody(email)}</p>
            <button
              type="button"
              onClick={onConfirm}
              disabled={phase === "confirming"}
              className="btn-lift mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-rido-magenta px-7 font-semibold text-white shadow-[0_8px_30px_rgba(222,4,152,0.35)] hover:brightness-110 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy disabled:opacity-60 disabled:cursor-wait"
            >
              {phase === "confirming" ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
              {phase === "confirming" ? t.confirming : t.confirm}
            </button>
            {phase === "retry" ? (
              <p className="mt-4 text-sm text-red-300" role="alert">{t.errorRetry}</p>
            ) : null}
          </>
        ) : phase === "ok" ? (
          <>
            <CircleCheck className="mx-auto w-12 h-12 text-rido-green" aria-hidden="true" />
            <h1 ref={headingRef} tabIndex={-1} className={heading}>{t.okTitle}</h1>
            <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed">{t.okBody}</p>
            <ShareInvite placement="confirmed" align="center" className="mt-8" />
          </>
        ) : (
          <>
            <CircleAlert className="mx-auto w-12 h-12 text-rido-magenta-light" aria-hidden="true" />
            <h1 ref={headingRef} tabIndex={-1} className={heading}>{t.badTitle}</h1>
            <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed">{t.badBody}</p>
            <WaitlistForm align="center" placement="confirmed" className="mt-8 max-w-lg" />
          </>
        )}
      </div>
      <Link
        href={home}
        className="mt-10 inline-flex items-center gap-2 min-h-11 font-semibold text-white hover:text-rido-magenta-light transition-colors cursor-pointer"
      >
        {t.home} <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </Section>
  );
}
