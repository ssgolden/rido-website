import { RidoLogo } from "@/components/ui/RidoLogo";
import Link from "next/link";
import { Mail } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

type FooterLink = { label: string; href: string; badge?: string };
type FooterColumn = { heading: string; links: FooterLink[] };

// User-visible strings per locale. The Footer is a server component, so it
// receives the locale as a prop (default "en") instead of reading context.
// hrefs are code-level and identical across locales — legal pages are
// EN-only this phase, so their links stay pointing at the English routes.
const en = {
  tagline1: "Shared micro-mobility for Spain.",
  tagline2: "Move freely. Ride responsibly.",
  joinWaitlist: "Join the waitlist →",
  emailAria: "Email",
  rights: "All rights reserved.",
  columns: [
    {
      heading: "Product",
      links: [
        { label: "E-Scooter", href: "#vehicles" },
        { label: "E-Bike", href: "#vehicles" },
        { label: "Pricing", href: "#pricing" },
        { label: "Cities", href: "#cities" },
        { label: "Motion Lab", href: "/motion-lab", badge: "new" },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "About", href: "#about" },
        { label: "Safety", href: "#safety" },
        { label: "Sustainability", href: "#sustainability" },
        { label: "Careers", href: "/careers" },
      ],
    },
    {
      heading: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "/politica-cookies" },
      ],
    },
  ] as FooterColumn[],
};

const copy: Record<Locale, typeof en> = {
  en,
  es: {
    tagline1: "Micromovilidad compartida para España.",
    tagline2: "Muévete con libertad. Viaja con responsabilidad.",
    joinWaitlist: "Únete a la lista de espera →",
    emailAria: "Correo electrónico",
    rights: "Todos los derechos reservados.",
    columns: [
      {
        heading: "Producto",
        links: [
          { label: "Patinete eléctrico", href: "#vehicles" },
          { label: "Bici eléctrica", href: "#vehicles" },
          { label: "Precios", href: "#pricing" },
          { label: "Ciudades", href: "#cities" },
          { label: "Motion Lab", href: "/motion-lab", badge: "nuevo" },
        ],
      },
      {
        heading: "Empresa",
        links: [
          { label: "Sobre nosotros", href: "#about" },
          { label: "Seguridad", href: "#safety" },
          { label: "Sostenibilidad", href: "#sustainability" },
          { label: "Empleo", href: "/careers" },
        ],
      },
      {
        heading: "Legal",
        links: [
          { label: "Política de privacidad", href: "/privacy" },
          { label: "Términos del servicio", href: "/terms" },
          { label: "Política de cookies", href: "/politica-cookies" },
        ],
      },
    ] as FooterColumn[],
  },
};

// Social profile links intentionally omitted — Rido has no verified social
// accounts yet. Add them here (icon + href) once real profiles exist.
const socialLinks = [
  { icon: Mail, href: "mailto:info@rido.bike", labelKey: "emailAria" as const },
];

export function Footer({ locale = "en" }: { locale?: Locale }) {
  const t = copy[locale];
  return (
    <footer className="border-t border-white/10 bg-rido-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-2">
            <RidoLogo variant="full" size="md" />
            <p className="mt-3 text-sm text-muted leading-relaxed max-w-xs">{t.tagline1}<br />{t.tagline2}</p>
            <div className="flex items-center gap-3 mt-5">
              {socialLinks.map((social) => (
                <a key={social.labelKey} href={social.href} target={social.href.startsWith("http") ? "_blank" : undefined} rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined} aria-label={t[social.labelKey]} className="w-9 h-9 rounded-lg bg-white/5 hover:bg-rido-magenta/20 flex items-center justify-center transition-all duration-200 hover:scale-110 group" suppressHydrationWarning>
                  <social.icon className="w-4 h-4 text-muted group-hover:text-rido-magenta transition-colors" />
                </a>
              ))}
            </div>
            <div className="mt-5">
              <a href="#download" suppressHydrationWarning className="inline-flex items-center gap-2 text-sm text-rido-magenta-light hover:text-white transition-colors cursor-pointer font-semibold">{t.joinWaitlist}</a>
            </div>
          </div>
          {t.columns.map((column) => (
            <div key={column.heading}>
              <h3 className="font-semibold text-white mb-4">{column.heading}</h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("http") || link.href.startsWith("#") ? (
                      <a href={link.href} {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-rido-magenta-light transition-colors cursor-pointer">
                        {link.label}
                        {link.badge ? (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-rido-magenta/15 text-rido-magenta-light border border-rido-magenta/30">
                            {link.badge}
                          </span>
                        ) : null}
                      </a>
                    ) : (
                      <Link href={link.href} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-rido-magenta-light transition-colors cursor-pointer">
                        {link.label}
                        {link.badge ? (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-rido-magenta/15 text-rido-magenta-light border border-rido-magenta/30">
                            {link.badge}
                          </span>
                        ) : null}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-weak">© {new Date().getFullYear()} Go2 Place S.L. {t.rights}</p>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
