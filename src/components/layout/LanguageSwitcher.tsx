"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Pages that have no Spanish version yet (legal pages this phase, plus
// careers and the motion lab). On these, the Español link falls back to
// the Spanish home page instead of a nonexistent /es/... route.
const EN_ONLY_PATHS = new Set([
  "/privacy",
  "/terms",
  "/politica-cookies",
  "/careers",
  "/motion-lab",
]);

const linkClass = (active: boolean) =>
  cn(
    "inline-block py-2 -my-2 px-1 -mx-1 text-xs transition-colors cursor-pointer",
    active ? "text-white font-semibold" : "text-muted-weak hover:text-rido-magenta"
  );

/**
 * Links between the English and Spanish versions of the current page.
 * English lives at `/`, Spanish under `/es` (static export — no
 * middleware), so switching locales is just prefixing/stripping "/es".
 */
export function LanguageSwitcher() {
  const pathname = usePathname() ?? "/";
  const isEs = pathname === "/es" || pathname.startsWith("/es/");
  // The current page's path without the /es prefix.
  const basePathname = isEs ? pathname.slice("/es".length) || "/" : pathname;

  const enHref = basePathname;
  const esHref =
    basePathname === "/" || EN_ONLY_PATHS.has(basePathname)
      ? "/es"
      : `/es${basePathname}`;

  return (
    <div
      className="flex items-center gap-2"
      aria-label={isEs ? "Selección de idioma" : "Language selection"}
    >
      <Link
        href={enHref}
        lang="en"
        hrefLang="en"
        aria-label="View this page in English"
        aria-current={isEs ? undefined : "true"}
        className={linkClass(!isEs)}
      >
        English
      </Link>
      <span className="text-xs text-white/20" aria-hidden="true">
        ·
      </span>
      <Link
        href={esHref}
        lang="es"
        hrefLang="es"
        aria-label="Ver esta página en español"
        aria-current={isEs ? "true" : undefined}
        className={linkClass(isEs)}
      >
        Español
      </Link>
    </div>
  );
}
