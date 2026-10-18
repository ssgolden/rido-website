"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Mail, Loader2, ArrowRight, MailCheck } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { hasAnalyticsConsent, track, type Placement } from "@/lib/analytics";
import { subscribeConsent } from "@/lib/consent";
import Link from "next/link";
import { ShareInvite } from "@/components/ui/ShareInvite";
import { isValidEmail } from "@/lib/email";

const copy = {
  en: {
    emailPlaceholder: "your@email.com",
    emailLabel: "Email address for the Rido waitlist",
    submit: "Join the waitlist",
    sending: "Sending…",
    errorInvalid: "Please enter a valid email address.",
    errorGenericBefore: "We couldn't save your email just now. Write to ",
    errorGenericAfter: " and we'll add you by hand.",
    errorBusy: "We're getting a lot of sign-ups right now. Please try again in a few minutes.",
    successTitle: "You're on the list!",
    successBody: "We'll email you the moment Rido launches near you.",
    pendingTitle: "Check your inbox",
    pendingBody: "We've sent you a link to confirm your email. Your place is saved once you click it.",
    privacyBefore: "By joining you accept our ",
    privacyLink: "Privacy Policy",
    privacyAfter: ".",
  },
  es: {
    emailPlaceholder: "tu@email.com",
    emailLabel: "Correo electrónico para la lista de espera de Rido",
    submit: "Unirme a la lista",
    sending: "Enviando…",
    errorInvalid: "Introduce una dirección de correo electrónico válida.",
    errorGenericBefore: "No hemos podido guardar tu correo ahora mismo. Escríbenos a ",
    errorGenericAfter: " y te apuntamos a mano.",
    errorBusy: "Estamos recibiendo muchas inscripciones ahora mismo. Inténtalo de nuevo en unos minutos.",
    successTitle: "¡Ya estás en la lista!",
    successBody: "Te escribiremos en cuanto Rido llegue a tu zona.",
    pendingTitle: "Revisa tu correo",
    pendingBody: "Te hemos enviado un enlace para confirmar tu correo. Tu plaza queda guardada al pulsarlo.",
    privacyBefore: "Al apuntarte aceptas nuestra ",
    privacyLink: "Política de privacidad",
    privacyAfter: ".",
  },
} as const satisfies Record<Locale, Record<string, string>>;

// Apps Script URL when configured; otherwise /api/waitlist (Netlify Function on
// the static site, Next route on Vercel). Success is shown only after a backend
// accepts the sign-up — never on a local-only save.
const WAITLIST_URL = process.env.NEXT_PUBLIC_WAITLIST_URL || "";
const WAITLIST_ENDPOINT = WAITLIST_URL || "/api/waitlist";
const CONTACT_EMAIL = "info@rido.bike";

/**
 * The one waitlist form (hero, closing section, town pages).
 * `align` only changes alignment; behaviour and copy are identical.
 * `placement` labels the consent-gated conversion events (src/lib/analytics.ts)
 * so placements can be compared; `sharePath` is the page the share row links to.
 */
export function WaitlistForm({
  align = "left",
  placement,
  sharePath,
  className,
}: {
  align?: "left" | "center";
  placement: Placement;
  sharePath?: string;
  className?: string;
}) {
  const locale = useLocale();
  const t = copy[locale];
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const formRef = useRef<HTMLFormElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLParagraphElement>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [pending, setPending] = useState(false);
  const [errorKey, setErrorKey] = useState<"invalid" | "busy" | "generic" | null>(null);

  // One "view" per form per page load, once at least half of it has been on
  // screen AND the visitor has accepted analytics. The hero form is seen before
  // anyone can answer the banner, so a view seen first is sent on acceptance.
  useEffect(() => {
    const el = formRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let seen = false;
    let sent = false;
    const send = () => {
      if (sent || !seen || !hasAnalyticsConsent()) return;
      sent = true;
      track("waitlist_view", { placement, locale });
      io.disconnect();
      unsubscribe();
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          seen = true;
          send();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    const unsubscribe = subscribeConsent(send);
    return () => {
      io.disconnect();
      unsubscribe();
    };
  }, [placement, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    track("waitlist_submit", { placement, locale });
    if (!isValidEmail(email)) {
      setStatus("error");
      setErrorKey("invalid");
      inputRef.current?.focus();
      track("waitlist_error", { placement, locale, detail: "invalid" });
      return;
    }
    setStatus("loading");
    setErrorKey(null);
    try {
      const res = await fetch(WAITLIST_ENDPOINT, {
        method: "POST",
        // Apps Script needs text/plain to avoid a CORS preflight; the API parses JSON.
        headers: { "Content-Type": WAITLIST_URL ? "text/plain;charset=utf-8" : "application/json" },
        body: JSON.stringify({ email, locale, company: honeypotRef.current?.value ?? "" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.ok === false) {
        const reason = json.error === "invalid_email" ? "invalid" : json.error === "busy" ? "busy" : "generic";
        setStatus("error");
        setErrorKey(reason);
        track("waitlist_error", { placement, locale, detail: reason });
        return;
      }
      setPending(json.pending === true);
      setStatus("success");
      track("waitlist_success", { placement, locale, detail: json.pending === true ? "pending" : "saved" });
    } catch {
      setStatus("error");
      setErrorKey("generic");
      track("waitlist_error", { placement, locale, detail: "generic" });
    }
  };

  // After a successful submit the form is replaced by the result: move focus
  // there so keyboard and screen-reader users are not dropped to <body>.
  useEffect(() => {
    if (status === "success") resultRef.current?.focus();
  }, [status]);

  // Always rendered, first, in both branches so the node persists and screen
  // readers announce the result (a live region mounted already filled is
  // often not announced).
  const liveRegion = (
    <p className="sr-only" role="status" aria-live="polite">
      {status === "success" ? `${pending ? t.pendingTitle : t.successTitle}. ${pending ? t.pendingBody : t.successBody}` : ""}
    </p>
  );

  if (status === "success") {
    return (
      <>
      {liveRegion}
      <div
        className={cn("enter-up glass rounded-2xl p-5", !/\bmax-w-/.test(className ?? "") && "max-w-md", align === "center" ? "mx-auto text-center" : "", className)}
      >
        <div>
          <p ref={resultRef} tabIndex={-1} className="font-bold text-white focus:outline-none">
            {pending ? <MailCheck className="mr-2 inline-block w-5 h-5 align-[-0.25em] text-rido-magenta-light" aria-hidden="true" /> : null}
            {pending ? t.pendingTitle : t.successTitle}
          </p>
          <p className="mt-1 text-sm text-muted">{pending ? t.pendingBody : t.successBody}</p>
        </div>
        <ShareInvite placement={placement} path={sharePath} align={align} className="mt-4 border-t border-white/10 pt-4" />
      </div>
      </>
    );
  }

  return (
    <>
    {liveRegion}
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-busy={status === "loading"}
      className={cn("w-full", !/\bmax-w-/.test(className ?? "") && "max-w-md", align === "center" ? "mx-auto" : "", className)}
    >
      {/* Honeypot for bots: off-screen, skipped by keyboard and screen readers. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Company
          <input ref={honeypotRef} type="text" name="company" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 rounded-2xl sm:bg-white/[0.06] sm:p-1.5 sm:ring-1 sm:ring-white/15">
        <label htmlFor={inputId} className="sr-only">{t.emailLabel}</label>
        <div className="relative flex-1">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-weak pointer-events-none" aria-hidden="true" />
          <input
            ref={inputRef}
            id={inputId}
            type="email"
            inputMode="email"
            enterKeyHint="send"
            autoComplete="email"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder={t.emailPlaceholder}
            // readOnly, not disabled: disabling blurs the field on iOS and drops the keyboard.
            readOnly={status === "loading"}
            aria-invalid={status === "error"}
            aria-describedby={status === "error" ? errorId : undefined}
            className="field w-full min-h-12 pl-11 pr-4 rounded-xl bg-white/[0.06] ring-1 ring-white/15 sm:bg-transparent sm:ring-0 text-white text-base placeholder:text-muted-weak focus:outline-none focus-visible:ring-2 focus-visible:ring-rido-magenta cursor-text disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="group btn-lift inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-rido-magenta px-6 font-semibold text-white hover:brightness-110 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy disabled:opacity-60 disabled:cursor-wait"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin motion-reduce:hidden" aria-hidden="true" />
              <span className="sr-only motion-reduce:not-sr-only">{t.sending}</span>
            </>
          ) : (
            <>
              {t.submit}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
      <p className={cn("mt-2 text-xs text-muted-weak", align === "center" ? "text-center" : "")}>
        {t.privacyBefore}
        <Link href="/privacy" prefetch={false} className="underline underline-offset-2 hover:text-white transition-colors cursor-pointer">
          {t.privacyLink}
        </Link>
        {t.privacyAfter}
      </p>
      {status === "error" && errorKey && (
        <p id={errorId} className={cn("text-sm text-red-300 mt-2", align === "center" ? "text-center" : "")} role="alert">
          {errorKey === "invalid" ? (
            t.errorInvalid
          ) : errorKey === "busy" ? (
            t.errorBusy
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
    </>
  );
}
