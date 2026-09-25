"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { RidoLogo } from "@/components/ui/RidoLogo";
import { Menu, X, Download } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/config";

const en = {
  homeAria: "Rido home",
  joinWaitlist: "Join Waitlist",
  joinShort: "Join",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  navLinks: [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Vehicles", href: "#vehicles" },
    { label: "Cities", href: "#cities" },
    { label: "Safety", href: "#safety" },
    { label: "Pricing", href: "#pricing" },
  ],
};

const copy: Record<Locale, typeof en> = {
  en,
  es: {
    homeAria: "Inicio de Rido",
    joinWaitlist: "Únete a la lista",
    joinShort: "Únete",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    navLinks: [
      { label: "Cómo funciona", href: "#how-it-works" },
      { label: "Vehículos", href: "#vehicles" },
      { label: "Ciudades", href: "#cities" },
      { label: "Seguridad", href: "#safety" },
      { label: "Precios", href: "#pricing" },
    ],
  },
};

function useScrolledPast(threshold: number) {
  return useSyncExternalStore(
    (callback) => {
      let ticking = false;
      const handleScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            callback();
            ticking = false;
          });
          ticking = true;
        }
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    },
    () => window.scrollY > threshold,
    () => false
  );
}

interface NavbarProps {
  /**
   * Prefix for the section anchors. On the home pages this is "" (same-page
   * anchors); on other routes (city landing pages) pass "/" or "/es" so the
   * links navigate home instead of pointing at sections that don't exist.
   */
  anchorBase?: string;
}

export function Navbar({ anchorBase = "" }: NavbarProps = {}) {
  const locale = useLocale();
  const t = copy[locale];
  const homeHref = locale === "es" ? "/es" : "/";
  const navLinks = t.navLinks.map((l) => ({ ...l, href: `${anchorBase}${l.href}` }));
  const scrolled = useScrolledPast(20);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mobileOpen) { document.body.style.overflow = "hidden"; }
    else { document.body.style.overflow = ""; }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Tabbing out of the open panel would land on hidden, scroll-locked page
  // content; close the menu instead so focus stays on visible UI.
  useEffect(() => {
    if (!mobileOpen) return;
    const onFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget as Node | null;
      if (next && !navRef.current?.contains(next)) setMobileOpen(false);
    };
    const nav = navRef.current;
    nav?.addEventListener("focusout", onFocusOut);
    return () => nav?.removeEventListener("focusout", onFocusOut);
  }, [mobileOpen]);

  // Escape closes menu and returns focus to the hamburger
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        hamburgerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    // Move focus into menu on open
    const first = panelRef.current?.querySelector<HTMLAnchorElement>("a");
    first?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  useEffect(() => {
    if (anchorBase) return; // not on a page that contains the sections
    const sectionIds = copy.en.navLinks.map((l) => l.href.replace("#", ""));
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); }); },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    sectionIds.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [anchorBase]);

  return (
    <nav
      ref={navRef}
      className={cn("fixed z-50 rounded-2xl px-4 py-2.5 sm:px-6 sm:py-3 transition-all duration-300", scrolled ? "glass-strong shadow-lg" : "bg-transparent backdrop-blur-none")}
      style={{
        top: "max(0.75rem, env(safe-area-inset-top))",
        left: "max(0.75rem, env(safe-area-inset-left))",
        right: "max(0.75rem, env(safe-area-inset-right))",
      }}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link
          href={homeHref}
          onClick={(e) => {
            // Already on the home page: scroll to top instead of a navigation.
            if (!anchorBase) { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }
          }}
          aria-label={t.homeAria}
          className="min-w-0 shrink-0 group relative"
        >
          <span className="absolute inset-0 bg-rido-magenta/0 group-hover:bg-rido-magenta/20 blur-xl rounded-lg transition-all duration-500" />
          <span className="relative z-10 block sm:hidden"><RidoLogo variant="full" size="sm" priority /></span>
          <span className="relative z-10 hidden sm:block"><RidoLogo variant="full" size="md" priority /></span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} aria-current={activeSection === link.href.slice(link.href.indexOf("#") + 1) ? "true" : undefined} className={cn("text-sm transition-colors cursor-pointer", activeSection === link.href.slice(link.href.indexOf("#") + 1) ? "text-rido-magenta-light font-semibold" : "text-muted-strong hover:text-rido-magenta-light")}>{link.label}</a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Magnetic>
            <Button as="a" href={`${anchorBase}#download`} size="sm" className="gap-2"><Download className="w-4 h-4" /><span>{t.joinWaitlist}</span></Button>
          </Magnetic>
        </div>
        {/* Mobile: keep a compact Join CTA visible next to the hamburger — primary conversion action on the dominant traffic class */}
        <div className="flex md:hidden items-center gap-2">
          <Button as="a" href={`${anchorBase}#download`} size="sm" className="gap-1.5 min-h-[44px] px-4">
            <Download className="w-4 h-4" />
            <span>{t.joinShort}</span>
          </Button>
          <button
            ref={hamburgerRef}
            className="text-white cursor-pointer p-3 min-h-[44px] min-w-[44px]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? t.closeMenu : t.openMenu}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            ref={panelRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden max-h-[calc(100dvh-5rem)] overflow-y-auto"
          >
            <div className="mt-3 pb-3 border-t border-white/10">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} aria-current={activeSection === link.href.slice(link.href.indexOf("#") + 1) ? "true" : undefined} className={cn("flex items-center py-3 min-h-[44px] text-base transition-colors cursor-pointer", activeSection === link.href.slice(link.href.indexOf("#") + 1) ? "text-rido-magenta-light font-semibold" : "text-muted-strong hover:text-rido-magenta-light")} onClick={() => setMobileOpen(false)}>{link.label}</a>
              ))}
              <div className="mt-3"><Button as="a" href={`${anchorBase}#download`} onClick={() => setMobileOpen(false)} size="sm" className="w-full gap-2 min-h-[44px]"><Download className="w-4 h-4" /><span>{t.joinWaitlist}</span></Button></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
