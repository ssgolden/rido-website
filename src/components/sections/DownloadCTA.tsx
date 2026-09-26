"use client";

import { useState } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";
import { Shield, Smartphone, CreditCard, MapPin, Mail, Loader2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/config";
import { DURATION, EASE, STAGGER } from "@/lib/motion";

interface DownloadCopy {
  sectionAria: string;
  headingBefore: string;
  headingHighlight: string;
  headingAfter: string;
  intro: string;
  emailPlaceholder: string;
  emailAria: string;
  submit: string;
  errorInvalid: string;
  errorGeneric: string;
  successTitle: string;
  successBody: string;
  appsNote: string;
  /** Fixed-length tuple: zips with `trustSignalIcons` by index. */
  trustSignals: readonly [string, string, string];
  complianceLine: string;
  phoneTagline: string;
  phoneCta: string;
  phoneTabs: readonly [string, string, string];
  /** 3-step "what happens after you join" inline preview */
  whatHappens: readonly [string, string, string];
}

/** Icons zip with `copy[locale].trustSignals` by index. */
const trustSignalIcons = [Smartphone, CreditCard, MapPin] as const;

const copy = {
  en: {
    sectionAria: "Join the Rido waitlist",
    headingBefore: "Ready to ",
    headingHighlight: "Ride",
    headingAfter: "?",
    intro: "Join the waitlist and be first to ride when Rido launches on the Costa del Sol.",
    emailPlaceholder: "your@email.com",
    emailAria: "Email address for waitlist",
    submit: "Join Waitlist",
    errorInvalid: "Please enter a valid email address.",
    errorGeneric: "Something went wrong. Please try again.",
    successTitle: "You're on the list!",
    successBody: "We'll email you the moment Rido launches on the Costa del Sol. Get ready to ride.",
    appsNote: "iOS and Android apps in development. Join the waitlist to get an early-access invite the moment they ship.",
    trustSignals: ["Be first to ride", "No payment now", "Costa del Sol launch"],
    complianceLine: "Insured rides · GDPR compliant · Data protected",
    phoneTagline: "Move freely",
    phoneCta: "Scan & Ride",
    phoneTabs: ["Map", "Ride", "Pay"],
    whatHappens: [
      "We confirm your spot by email",
      "When the iOS & Android app ships, waitlist members get first access",
      "Your first ride is on us",
    ],
  },
  es: {
    sectionAria: "Únete a la lista de espera de Rido",
    headingBefore: "¿Todo listo para ",
    headingHighlight: "moverte",
    headingAfter: "?",
    intro: "Únete a la lista de espera y sé de los primeros en subirte cuando Rido llegue a la Costa del Sol.",
    emailPlaceholder: "tu@email.com",
    emailAria: "Correo electrónico para la lista de espera",
    submit: "Unirme a la lista",
    errorInvalid: "Introduce una dirección de correo electrónico válida.",
    errorGeneric: "Algo ha salido mal. Vuelve a intentarlo.",
    successTitle: "¡Ya estás en la lista!",
    successBody: "Te escribiremos en cuanto Rido llegue a la Costa del Sol. Prepárate para arrancar.",
    appsNote: "Apps de iOS y Android en desarrollo. Únete a la lista para recibir una invitación de acceso anticipado en cuanto salgan.",
    trustSignals: ["Sé de los primeros en moverte", "Sin pagos por ahora", "Lanzamiento en la Costa del Sol"],
    complianceLine: "Trayectos asegurados · Cumplimos el RGPD · Datos protegidos",
    phoneTagline: "Muévete con libertad",
    phoneCta: "Escanea y rueda",
    phoneTabs: ["Mapa", "Viaje", "Pago"],
    whatHappens: [
      "Confirmamos tu plaza por correo",
      "Cuando salgan las apps de iOS y Android, quienes estén en la lista tendrán acceso primero",
      "Tu primer viaje corre por nuestra cuenta",
    ],
  },
} as const satisfies Record<Locale, DownloadCopy>;

const WAITLIST_KEY = "rido-waitlist-email";
// Optional Apps Script URL. Unset (this launch): the form keeps the email in
// localStorage only and never invents a live count.
const WAITLIST_URL = process.env.NEXT_PUBLIC_WAITLIST_URL || "";

function WaitlistForm() {
  const locale = useLocale();
  const t = copy[locale];
  const reduce = useReducedMotion();
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
      // Persist locally as backup, then POST to the configured backend when set.
      const existing = JSON.parse(localStorage.getItem(WAITLIST_KEY) || "[]");
      if (!existing.includes(email)) {
        existing.push(email);
        localStorage.setItem(WAITLIST_KEY, JSON.stringify(existing));
      }

      if (WAITLIST_URL) {
        const res = await fetch(WAITLIST_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            email,
            locale,
            userAgent: navigator.userAgent,
          }),
        });
        if (!res.ok) throw new Error(`waitlist HTTP ${res.status}`);
        const json = await res.json().catch(() => ({}));
        if (json.ok === false && json.error !== "invalid") throw new Error(json.error || "waitlist rejected");
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorKey("generic");
    }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : DURATION.entrance, ease: EASE }}
        className="glass rounded-2xl p-6 text-center max-w-md mx-auto lg:mx-0"
        role="status"
        aria-live="polite"
      >
        {/* Choreographed success: ring draws itself then check draws inside */}
        <motion.svg
          viewBox="0 0 64 64"
          className="w-14 h-14 mx-auto mb-3"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduce ? 0 : DURATION.micro }}
        >
          <motion.circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="#22C55E"
            strokeWidth="3"
            strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0, rotate: -90 }}
            animate={{ pathLength: 1, rotate: -90 }}
            style={{ transformOrigin: "center" }}
            transition={{ duration: reduce ? 0 : DURATION.entrance, ease: EASE }}
          />
          <motion.path
            d="M20 33 L28 41 L45 24"
            fill="none"
            stroke="#22C55E"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: reduce ? 0 : 0.32, duration: reduce ? 0 : DURATION.micro, ease: EASE }}
          />
        </motion.svg>
        <motion.h3
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduce ? 0 : 0.36, duration: reduce ? 0 : DURATION.entrance, ease: EASE }}
          className="text-lg font-bold mb-1"
        >
          {t.successTitle}
        </motion.h3>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduce ? 0 : 0.42, duration: reduce ? 0 : DURATION.entrance, ease: EASE }}
          className="text-sm text-muted"
        >
          {t.successBody}
        </motion.p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto lg:mx-0">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-weak" />
          <input
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
            aria-label={t.emailAria}
            aria-invalid={status === "error"}
            className="field w-full pl-11 pr-4 py-3 rounded-xl glass text-white text-sm placeholder:text-muted-weak focus:outline-none focus:ring-2 focus:ring-rido-magenta focus:ring-offset-2 focus:ring-offset-rido-navy cursor-text disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-ripple btn-lift inline-flex items-center justify-center font-semibold rounded-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rido-magenta focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy bg-rido-magenta hover:bg-rido-magenta-dark text-white shadow-lg shadow-rido-magenta/25 hover:shadow-xl hover:shadow-rido-magenta/30 px-6 py-3 text-sm whitespace-nowrap disabled:opacity-60 disabled:cursor-wait"
        >
          {status === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            t.submit
          )}
        </button>
      </div>
      {status === "error" && errorKey && (
        <p className="text-sm text-red-400 mt-2 text-center lg:text-left" role="alert">{errorKey === "invalid" ? t.errorInvalid : t.errorGeneric}</p>
      )}
    </form>
  );
}

export function DownloadCTA() {
  const locale = useLocale();
  const t = copy[locale];
  const prefersReduced = useReducedMotion();
  // useReducedMotion returns null on SSR and boolean on client — null is falsy.
  const shouldReduce = prefersReduced ?? false;

  return (
    <section id="download" aria-label={t.sectionAria} className="py-12 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-rido-magenta/20 via-rido-navy to-rido-magenta-light/10 hero-gradient" />
      <div className="absolute top-0 right-0 w-[280px] sm:w-[400px] h-[280px] sm:h-[400px] rounded-full bg-rido-magenta/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] rounded-full bg-rido-magenta-light/8 blur-3xl" />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <StaggerReveal className="text-center lg:text-left" staggerDelay={STAGGER.text}>
            <StaggerItem>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6">{t.headingBefore}<span className="text-gradient-brand">{t.headingHighlight}</span>{t.headingAfter}</h2>
              <p className="text-lg text-muted max-w-lg mx-auto lg:mx-0 mb-4">{t.intro}</p>
              {/* 3-step "what happens after you join" preview — sets expectation + lifts submit rate */}
              <ol className="mt-6 mb-6 flex flex-col items-start gap-3 text-left max-w-lg mx-auto lg:mx-0">
                {t.whatHappens.map((step, i) => (
                  <li key={step} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-rido-magenta/15 border border-rido-magenta/40 text-rido-magenta-light text-[10px] font-bold shrink-0">{i + 1}</span>
                    <span className="text-muted-strong leading-snug">{step}</span>
                  </li>
                ))}
              </ol>
            </StaggerItem>
            <StaggerItem>
              <WaitlistForm />
            </StaggerItem>
            <StaggerItem>
              <div className="mt-6 flex items-center justify-center lg:justify-start mb-8">
                <div className="glass rounded-xl px-5 py-4 border border-white/10 max-w-md">
                  <p className="text-sm text-muted-strong">{t.appsNote}</p>
                </div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 text-muted-weak text-sm">
                {t.trustSignals.map((text, i) => {
                  const Icon = trustSignalIcons[i];
                  return (
                    <div key={text} className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-rido-magenta/60" />
                      <span>{text}</span>
                    </div>
                  );
                })}
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="mt-6 flex items-center justify-center lg:justify-start gap-2 text-muted-weak text-xs">
                <Shield className="w-3.5 h-3.5" />
                <span>{t.complianceLine}</span>
              </div>
            </StaggerItem>
          </StaggerReveal>

          <ScrollReveal delay={STAGGER.grid} direction="right">
            <div className="flex justify-center lg:justify-end py-2">
              <motion.div
                initial={false}
                animate={shouldReduce ? { y: 0 } : { y: [0, -8, 0] }}
                transition={shouldReduce ? { duration: 0 } : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div className="relative w-[260px] sm:w-[280px] h-[520px] sm:h-[560px] rounded-[40px] border-4 border-white/20 bg-rido-navy shadow-2xl shadow-rido-magenta/20 overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-rido-navy rounded-b-[20px] z-20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-b from-rido-magenta/30 to-rido-navy flex flex-col items-center justify-center pt-10">
                      <div className="w-16 h-16 rounded-2xl bg-rido-magenta/30 mb-4 flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M9 16.5L13.5 21L23 11" stroke="#DE0498" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <p className="text-white font-black text-2xl">rido</p>
                      <p className="text-muted-weak text-sm mt-2">{t.phoneTagline}</p>
                      <div className="mt-6 w-[160px] h-[40px] rounded-xl bg-rido-magenta/80 flex items-center justify-center text-white font-semibold text-sm">{t.phoneCta}</div>
                      <div className="mt-4 grid grid-cols-3 gap-2 w-[200px]">
                        {t.phoneTabs.map((label) => (
                          <div key={label} className="h-[60px] rounded-lg bg-white/5 flex items-center justify-center text-muted-weak text-xs">{label}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 -z-10 rounded-[40px] bg-rido-magenta/20 blur-3xl scale-125" />
              </motion.div>
            </div>
          </ScrollReveal>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-rido-navy to-transparent pointer-events-none" />
    </section>
  );
}
