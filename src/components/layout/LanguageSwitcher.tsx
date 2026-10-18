"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Pages that have no Spanish version yet: the legal pages (the lawyer's
 * translation is pending — plan item 2.2) and careers.
 *
 * Decision for these pages: the Español link still goes to the Spanish home
 * page (there is no /es/... twin to send anyone to, and a dead link would be
 * worse), but it says so. Its title and aria-label explain that the page is
 * not available in Spanish yet and that the link opens the Spanish home page,
 * the page itself carries a Spanish notice (LegalPage `esIntro`), and the ES
 * footer labels these links "(EN)". Remove a path here the day its /es twin
 * ships and the link becomes a plain locale switch again.
 */
const EN_ONLY_PATHS = new Set([
  "/privacy",
  "/terms",
  "/politica-cookies",
  "/careers",
]);

const ES_FALLBACK_LABEL =
  "Esta página todavía no está disponible en español. Ir a la página de inicio en español.";

const linkClass = (active: boolean, size: "sm" | "md") =>
  cn(
    "nav-link nav-link-tall inline-flex items-center min-h-11 px-1 -mx-1 transition-colors duration-200 cursor-pointer",
    size === "md" ? "text-sm" : "text-xs",
    active ? "text-white font-semibold" : "text-muted-weak hover:text-rido-magenta-light"
  );

/**
 * Links between the English and Spanish versions of the current page.
 * English lives at `/`, Spanish under `/es` (static export — no
 * middleware), so switching locales is just prefixing/stripping "/es".
 * `size="md"` is for the mobile menu, where the footer's 12px would be
 * the smallest text on screen.
 */
export function LanguageSwitcher({ size = "sm" }: { size?: "sm" | "md" }) {
  const pathname = usePathname() ?? "/";
  const isEs = pathname === "/es" || pathname.startsWith("/es/");
  // The current page's path without the /es prefix.
  const basePathname = isEs ? pathname.slice("/es".length) || "/" : pathname;

  const enHref = basePathname;
  const esFallback = EN_ONLY_PATHS.has(basePathname);
  const esHref = basePathname === "/" || esFallback ? "/es" : `/es${basePathname}`;

  return (
    <div
      className="flex items-center gap-2"
      aria-label={isEs ? "Selección de idioma" : "Language selection"}
    >
      <Link
        href={enHref}
        prefetch={false}
        lang="en"
        hrefLang="en"
        aria-label="View this page in English"
        aria-current={isEs ? undefined : "true"}
        className={linkClass(!isEs, size)}
      >
        English
      </Link>
      <span className="text-xs text-white/20" aria-hidden="true">
        ·
      </span>
      <Link
        href={esHref}
        prefetch={false}
        lang="es"
        hrefLang="es"
        aria-label={esFallback ? ES_FALLBACK_LABEL : "Ver esta página en español"}
        title={esFallback ? ES_FALLBACK_LABEL : undefined}
        data-fallback={esFallback ? "home" : undefined}
        aria-current={isEs ? "true" : undefined}
        className={linkClass(isEs, size)}
      >
        Español
      </Link>
    </div>
  );
}
