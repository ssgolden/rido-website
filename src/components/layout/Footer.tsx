import { RidoLogo } from "@/components/ui/RidoLogo";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { primaryCity } from "@/data/cities";
import { CookieSettingsButton } from "@/components/ui/CookieSettingsButton";

type FooterLink = { label: string; href: string };
/** `cookieSettings` adds the "Cookie settings" control after the links. */
type FooterColumn = { heading: string; links: FooterLink[]; cookieSettings?: boolean };

// The Footer is a server component, so it receives the locale as a prop
// (default "en") instead of reading context. Section links are written
// home-relative ("/#faq", "/es#faq") so they work from city pages and
// /partners too. Legal pages and careers are EN-only this phase.
function columnsFor(locale: Locale): FooterColumn[] {
  const home = locale === "es" ? "/es" : "/";
  const prefix = locale === "es" ? "/es" : "";
  const town = primaryCity;
  if (locale === "es") {
    return [
      {
        heading: "Producto",
        links: [
          { label: "Patinete eléctrico", href: `${home}#vehicles` },
          { label: "Bici eléctrica", href: `${home}#vehicles` },
          ...(town ? [{ label: `Rido en ${town.name}`, href: `${prefix}/${town.slug}` }] : []),
          { label: "Preguntas frecuentes", href: `${home}#faq` },
        ],
      },
      {
        heading: "Empresa",
        links: [
          { label: "Seguridad", href: `${home}#safety` },
          { label: "Socios", href: `${prefix}/partners` },
          { label: "Empleo", href: "/careers" },
          { label: "Contacto", href: "mailto:info@rido.bike" },
        ],
      },
      {
        heading: "Legal",
        cookieSettings: true,
        links: [
          { label: "Política de privacidad", href: "/privacy" },
          { label: "Términos del servicio", href: "/terms" },
          { label: "Política de cookies", href: "/politica-cookies" },
        ],
      },
    ];
  }
  return [
    {
      heading: "Product",
      links: [
        { label: "E-scooter", href: `${home}#vehicles` },
        { label: "E-bike", href: `${home}#vehicles` },
        ...(town ? [{ label: `Rido in ${town.name}`, href: `/${town.slug}` }] : []),
        { label: "FAQ", href: `${home}#faq` },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "Safety", href: `${home}#safety` },
        { label: "Partners", href: "/partners" },
        { label: "Careers", href: "/careers" },
        { label: "Contact", href: "mailto:info@rido.bike" },
      ],
    },
    {
      heading: "Legal",
      cookieSettings: true,
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "/politica-cookies" },
      ],
    },
  ];
}

const copy = {
  en: {
    tagline: "Shared e-scooters and e-bikes for the Costa Blanca and Costa del Sol. Built and run by a local team.",
    joinWaitlist: "Join the waitlist",
    emailAria: "Email Rido",
    rights: "All rights reserved.",
    addressLabel: "Registered office",
    cookieSettings: "Cookie settings",
  },
  es: {
    tagline: "Patinetes y bicis eléctricas compartidas para la Costa Blanca y la Costa del Sol. Creado y gestionado por un equipo local.",
    joinWaitlist: "Únete a la lista",
    emailAria: "Escribir a Rido",
    rights: "Todos los derechos reservados.",
    addressLabel: "Domicilio social",
    cookieSettings: "Configurar cookies",
  },
} as const satisfies Record<Locale, Record<string, string>>;

const linkClass =
  "nav-link inline-flex items-center min-h-8 text-sm text-muted hover:text-rido-magenta-light transition-colors duration-200 cursor-pointer";

export function Footer({ locale = "en" }: { locale?: Locale }) {
  const t = copy[locale];
  const columns = columnsFor(locale);
  const home = locale === "es" ? "/es" : "/";
  return (
    <footer className="border-t border-white/10 bg-navy-deep">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <RidoLogo variant="full" size="md" />
            <p className="mt-4 text-sm text-muted leading-relaxed max-w-sm">{t.tagline}</p>
            <address className="mt-5 not-italic text-sm text-muted-weak leading-relaxed flex gap-2">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                <span className="sr-only">{t.addressLabel}: </span>
                Go2 Place S.L. · Calle Eneldo 3, C4, local 22<br />
                03189 Orihuela Costa (Alicante)
              </span>
            </address>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={`${home}#download`}
                className="btn-lift inline-flex items-center gap-2 px-4 min-h-[44px] rounded-xl bg-rido-magenta text-white text-sm font-semibold hover:brightness-110 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep"
              >
                {t.joinWaitlist}
              </a>
              <a
                href="mailto:info@rido.bike"
                aria-label={t.emailAria}
                className="btn-lift inline-flex items-center gap-2 px-4 min-h-[44px] rounded-xl bg-white/5 text-sm text-muted-strong hover:bg-white/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rido-magenta focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep"
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                info@rido.bike
              </a>
            </div>
          </div>
          {columns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="font-display text-sm font-semibold text-white mb-4">{column.heading}</h2>
              <ul className="space-y-1">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("mailto:") || link.href.includes("#") ? (
                      <a href={link.href} className={linkClass}>{link.label}</a>
                    ) : (
                      <Link href={link.href} className={linkClass}>{link.label}</Link>
                    )}
                  </li>
                ))}
                {column.cookieSettings ? (
                  <li>
                    <CookieSettingsButton label={t.cookieSettings} className={linkClass} />
                  </li>
                ) : null}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-weak">© {new Date().getFullYear()} Go2 Place S.L. {t.rights}</p>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
