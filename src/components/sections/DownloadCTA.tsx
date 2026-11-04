import { Shield } from "lucide-react";
import { FeatureList } from "@/components/ui/FeatureList";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { WaitlistForm } from "@/components/ui/WaitlistForm";
import { StoreBadges } from "@/components/ui/StoreBadges";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { withBase } from "@/lib/basePath";
import type { Locale } from "@/lib/i18n/config";
import { primaryCity, plannedTownCount } from "@/data/cities";
import { vehicles } from "@/data/vehicles";

const town = primaryCity?.name ?? "Torrevieja";
const nextTowns = plannedTownCount("Costa del Sol");
// The scooter here: it is the vehicle riding in Torrevieja now.
const scooter = vehicles.find((v) => v.id === "e-scooter");
const scooterImage = scooter?.cutouts.find((c) => c.includes("side")) ?? scooter?.cutouts[0];

const copy = {
  en: {
    sectionAria: "Download the Rido app",
    title: `Ride Rido in ${town} today.`,
    intro: "Download the free app, find a scooter on the map and scan to unlock.",
    benefitsLabel: "In the app",
    benefits: [
      "Every Rido e-scooter near you, live on the map",
      "The price before every ride, no hidden fees",
      "Helmet docked on every scooter",
    ],
    qrLabel: "On a computer? Scan with your phone",
    qrAlt: "QR code linking to rido.bike/app",
    nextTitle: "Not in Torrevieja?",
    nextIntro: `${nextTowns} Costa del Sol towns are next. Leave your email and we'll tell you when Rido reaches yours.`,
    reassurance: "No spam, no payment. Unsubscribe anytime · GDPR compliant",
    imageAlt: "The Rido e-scooter in brand magenta, side view with its helmet",
  },
  es: {
    sectionAria: "Descarga la app de Rido",
    title: `Monta en Rido en ${town} hoy.`,
    intro: "Descarga la app gratuita, encuentra un patinete en el mapa y escanea para desbloquear.",
    benefitsLabel: "En la app",
    benefits: [
      "Todos los patinetes Rido cerca de ti, en directo en el mapa",
      "El precio antes de cada trayecto, sin costes ocultos",
      "Casco acoplado en cada patinete",
    ],
    qrLabel: "¿En el ordenador? Escanéalo con el móvil",
    qrAlt: "Código QR que lleva a rido.bike/app",
    nextTitle: "¿No estás en Torrevieja?",
    nextIntro: `${nextTowns} localidades de la Costa del Sol vienen después. Déjanos tu correo y te avisamos cuando Rido llegue a la tuya.`,
    reassurance: "Sin spam, sin pagos. Date de baja cuando quieras · Cumplimos el RGPD",
    imageAlt: "El patinete eléctrico Rido en magenta, de perfil con su casco",
  },
} as const satisfies Record<Locale, unknown>;

/**
 * Closing download block (id stays "download": the navbar, footer and JSON-LD
 * link to #download). Store badges, a QR code to rido.bike/app for desktop
 * visitors, and below them the waitlist form, now only for the towns still to
 * come. Server component: StoreBadges and WaitlistForm are the client islands.
 */
export function DownloadCTA({ locale, sharePath }: { locale: Locale; sharePath?: string }) {
  const t = copy[locale];

  return (
    <section id="download" aria-label={t.sectionAria} className="py-16 sm:py-24 px-4 sm:px-6">
      <ScrollReveal>
        <div className="relative max-w-6xl mx-auto overflow-hidden rounded-3xl px-6 py-14 sm:px-12 sm:py-16 lg:py-14 bg-rido-navy-light ring-1 ring-white/10">
          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14 items-center">
            <div className="text-center lg:text-left">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-balance">{t.title}</h2>
              <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed">{t.intro}</p>

              <p className="mt-7 text-sm font-semibold text-rido-magenta-light">{t.benefitsLabel}</p>
              <div className="mt-3 inline-block text-left">
                <FeatureList items={t.benefits} />
              </div>

              <div className="mt-8 flex flex-col items-center lg:items-start gap-5">
                <StoreBadges locale={locale} placement="closing" size="lg" className="justify-center lg:justify-start" />
                <figure className="hidden lg:flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- static QR code */}
                  <img src={withBase("/images/app-qr.svg")} alt={t.qrAlt} width={88} height={88} className="rounded-lg bg-white p-1.5" />
                  <figcaption className="max-w-[9rem] text-left text-xs text-muted">{t.qrLabel}</figcaption>
                </figure>
              </div>

              <div className="mt-10 border-t border-white/10 pt-8">
                <h3 className="font-display text-xl font-bold text-white">{t.nextTitle}</h3>
                <p className="mt-2 text-sm sm:text-base text-muted leading-relaxed">{t.nextIntro}</p>
                <WaitlistForm placement="closing" sharePath={sharePath} className="mt-5 max-w-lg mx-auto lg:mx-0" />
                <p className="mt-4 inline-flex items-center gap-2 text-xs sm:text-sm text-muted">
                  <Shield className="hidden sm:block w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {t.reassurance}
                </p>
              </div>
            </div>

            {scooterImage ? (
              <ImageFrame
                src={withBase(scooterImage)}
                alt={t.imageAlt}
                sizes="(max-width: 1024px) 0px, 40vw"
                aspect="aspect-[5/4]"
                imageClassName="drop-shadow-[0_24px_30px_rgba(15,23,42,0.25)]"
                className="hidden lg:block shadow-2xl shadow-black/40"
              />
            ) : null}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
