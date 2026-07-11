"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RidoLogo } from "@/components/ui/RidoLogo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Mail, Lock, Check } from "lucide-react";
import { citiesAnnounced } from "@/data/cities";

const en = {
  badge: "Launching soon on the Costa del Sol",
  heading1: "Something good",
  heading2: "is rolling in.",
  sub: citiesAnnounced
    ? "Shared e-scooters and e-bikes for Marbella, San Pedro, Cancelada, Estepona and El Paraíso. Join the waitlist and be first to ride."
    : "Shared e-scooters and e-bikes are coming to the Costa del Sol. Launch cities announced soon — join the waitlist and be first to ride.",
  emailPlaceholder: "your@email.com",
  emailAria: "Email address",
  join: "Join the waitlist",
  joining: "Joining…",
  joined: "You're on the list — we'll email you at launch.",
  error: "That didn't work — check the email and try again.",
  privacy: "No spam. One email at launch, GDPR-compliant.",
  teamAccess: "Team access",
  passwordPlaceholder: "Access password",
  passwordAria: "Team access password",
  enter: "Enter",
  wrongPassword: "Wrong password.",
  langSwitch: "Español",
};

const copy: Record<"en" | "es", typeof en> = {
  en,
  es: {
    badge: "Muy pronto en la Costa del Sol",
    heading1: "Algo bueno",
    heading2: "está en camino.",
    sub: citiesAnnounced
      ? "Patinetes y bicis eléctricas compartidas para Marbella, San Pedro, Cancelada, Estepona y El Paraíso. Únete a la lista de espera y sé el primero en rodar."
      : "Patinetes y bicis eléctricas compartidas llegan a la Costa del Sol. Las ciudades de lanzamiento se anunciarán muy pronto — únete a la lista de espera y sé el primero en rodar.",
    emailPlaceholder: "tu@email.com",
    emailAria: "Correo electrónico",
    join: "Únete a la lista",
    joining: "Enviando…",
    joined: "Estás en la lista — te avisaremos en el lanzamiento.",
    error: "No ha funcionado — revisa el correo e inténtalo de nuevo.",
    privacy: "Sin spam. Un correo en el lanzamiento, conforme al RGPD.",
    teamAccess: "Acceso del equipo",
    passwordPlaceholder: "Contraseña de acceso",
    passwordAria: "Contraseña de acceso del equipo",
    enter: "Entrar",
    wrongPassword: "Contraseña incorrecta.",
    langSwitch: "English",
  },
};

export function ComingSoon() {
  const router = useRouter();
  const [locale, setLocale] = useState<"en" | "es">("en");
  const t = copy[locale];

  const [email, setEmail] = useState("");
  const [signupState, setSignupState] = useState<"idle" | "busy" | "done" | "error">("idle");

  const [gateOpen, setGateOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [gateState, setGateState] = useState<"idle" | "busy" | "wrong">("idle");

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    if (signupState === "busy") return;
    setSignupState("busy");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      setSignupState(res.ok ? "done" : "error");
    } catch {
      setSignupState("error");
    }
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (gateState === "busy") return;
    setGateState("busy");
    try {
      const res = await fetch("/api/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
        return;
      }
      setGateState("wrong");
    } catch {
      setGateState("wrong");
    }
  }

  return (
    <main
      id="main-content"
      aria-label="Rido coming soon"
      className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6 py-12"
    >
      {/* Ambient background, consistent with the hero/404 */}
      <div className="absolute inset-0 bg-gradient-to-br from-rido-magenta/15 via-rido-navy to-rido-navy" aria-hidden="true" />
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] rounded-full bg-rido-magenta/10 blur-3xl hero-orb hero-orb-1" aria-hidden="true" />
      <div className="absolute bottom-0 right-1/4 w-[260px] h-[260px] rounded-full bg-rido-magenta-light/8 blur-3xl hero-orb hero-orb-2" aria-hidden="true" />

      <div className="relative w-full max-w-xl text-center flex flex-col items-center">
        <RidoLogo variant="full" size="lg" priority />

        <Badge variant="magenta" className="mt-8 mb-5 cursor-default">{t.badge}</Badge>

        <h1 className="text-display-2xl font-black text-balance">
          {t.heading1} <span className="text-gradient-brand">{t.heading2}</span>
        </h1>

        <p className="mt-5 text-lg text-muted leading-relaxed max-w-md">{t.sub}</p>

        {signupState === "done" ? (
          <p className="mt-8 inline-flex items-center gap-2 text-rido-green font-semibold" role="status">
            <Check className="w-5 h-5" aria-hidden="true" /> {t.joined}
          </p>
        ) : (
          <form onSubmit={submitEmail} className="mt-8 w-full max-w-md flex flex-col sm:flex-row gap-3">
            <label className="sr-only" htmlFor="waitlist-email">{t.emailAria}</label>
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-weak" aria-hidden="true" />
              <input
                id="waitlist-email"
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (signupState === "error") setSignupState("idle"); }}
                placeholder={t.emailPlaceholder}
                className="w-full glass rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-muted-weak focus:outline-none focus-visible:outline-2 focus-visible:outline-rido-magenta"
              />
            </div>
            <Button type="submit" disabled={signupState === "busy"} className="shrink-0">
              {signupState === "busy" ? t.joining : t.join}
            </Button>
          </form>
        )}
        {signupState === "error" && (
          <p className="mt-3 text-sm text-red-400" role="alert">{t.error}</p>
        )}
        <p className="mt-4 text-xs text-muted-weak">{t.privacy}</p>

        <button
          onClick={() => setLocale(locale === "en" ? "es" : "en")}
          className="mt-10 text-sm text-muted hover:text-rido-magenta-light transition-colors cursor-pointer"
        >
          {t.langSwitch}
        </button>

        {/* Team access — deliberately quiet */}
        <div className="mt-12">
          {gateOpen ? (
            <form onSubmit={submitPassword} className="flex items-center gap-2 justify-center">
              <label className="sr-only" htmlFor="gate-password">{t.passwordAria}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-weak" aria-hidden="true" />
                <input
                  id="gate-password"
                  type="password"
                  autoFocus
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (gateState === "wrong") setGateState("idle"); }}
                  placeholder={t.passwordPlaceholder}
                  className="glass rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-muted-weak focus:outline-none focus-visible:outline-2 focus-visible:outline-rido-magenta"
                />
              </div>
              <Button type="submit" size="sm" variant="secondary" disabled={gateState === "busy"}>
                {t.enter}
              </Button>
            </form>
          ) : (
            <button
              onClick={() => setGateOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs text-muted-weak hover:text-muted transition-colors cursor-pointer"
            >
              <Lock className="w-3 h-3" aria-hidden="true" /> {t.teamAccess}
            </button>
          )}
          {gateState === "wrong" && (
            <p className="mt-2 text-xs text-red-400" role="alert">{t.wrongPassword}</p>
          )}
        </div>

        <p className="mt-10 text-xs text-muted-weak">
          © {new Date().getFullYear()} Go2 Place S.L. ·{" "}
          <a href="mailto:info@rido.bike" className="hover:text-rido-magenta-light transition-colors">info@rido.bike</a>
        </p>
      </div>
    </main>
  );
}
