"use client";

import { usePathname } from "next/navigation";

/** Skip-to-content link, labelled in the language of the current route. */
export function SkipLink() {
  const pathname = usePathname() ?? "/";
  const es = pathname === "/es" || pathname.startsWith("/es/");
  return (
    <a
      href="#main-content"
      lang={es ? "es" : "en"}
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-rido-magenta focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
    >
      {es ? "Saltar al contenido" : "Skip to content"}
    </a>
  );
}
