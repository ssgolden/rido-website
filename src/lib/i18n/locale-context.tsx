"use client";

import { createContext, useContext, useEffect } from "react";
import type { Locale } from "@/lib/i18n/config";

/**
 * Locale context for the static-export i18n strategy: English at `/`,
 * Spanish at `/es` (no middleware — GitHub Pages cannot run one).
 * Client components read the active locale via useLocale() and select
 * their copy from a colocated `copy` object; server components receive
 * a `locale` prop instead.
 */
const LocaleContext = createContext<Locale>("en");

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  // Locale root layouts set <html lang> for the first paint. Keep this in
  // sync if a client tree is ever rendered under the other document.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}
