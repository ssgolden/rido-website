"use client";

import { useState, useEffect, useRef, useSyncExternalStore, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { RidoLogo } from "@/components/ui/RidoLogo";
import { Menu, X, Download } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/config";
import { useScrollRootNode, useScrollTo } from "@/components/ui/SmoothScrollProvider";

const en = {
  homeAria: "Rido home",
  joinWaitlist: "Join the waitlist",
  joinShort: "Join",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  navLinks: [
    { label: "Torrevieja", href: "#cities" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Fleet", href: "#vehicles" },
    { label: "Safety", href: "#safety" },
    { label: "FAQ", href: "#faq" },
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
      { label: "Torrevieja", href: "#cities" },
      { label: "Cómo funciona", href: "#how-it-works" },
      { label: "Flota", href: "#vehicles" },
      { label: "Seguridad", href: "#safety" },
      { label: "Preguntas", href: "#faq" },
    ],
  },
};

function useScrolledPast(threshold: number, root: HTMLElement | null) {
  return useSyncExternalStore(
    (callback) => {
      const target: HTMLElement | Window = root ?? window;
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
      target.addEventListener("scroll", handleScroll, { passive: true });
      return () => target.removeEventListener("scroll", handleScroll);
    },
    () => (root ? root.scrollTop : window.scrollY) > threshold,
    () => false
  );
}

export function Navbar() {
  const locale = useLocale();
  const t = copy[locale];
  const navLinks = t.navLinks;
  const scrollRoot = useScrollRootNode();
  const scrollTo = useScrollTo();
  const scrolled = useScrolledPast(20, scrollRoot);
  // Section anchors only exist on the locale homepage. Elsewhere (city pages,
  // /partners) the links navigate to the homepage section instead.
  const pathname = usePathname() ?? "/";
  const homePath = locale === "es" ? "/es" : "/";
  const onHome = pathname === homePath;
  const hrefFor = (hash: string) => (onHome ? hash : `${homePath}${hash}`);
  const followAnchor = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!onHome || !href.startsWith("#") || href.length < 2) return;
    event.preventDefault();
    scrollTo(href);
    if (window.location.hash !== href) history.pushState(null, "", href);
  };
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Lock the element that actually scrolls (the SiteShell lane, #page-scroll),
  // not <body>, which never scrolls on marketing pages.
  // While the menu is open the page behind it is also inert: nothing in it can
  // take focus or be read, so the menu behaves as a modal.
  useEffect(() => {
    const el = document.getElementById("page-scroll") ?? document.body;
    el.style.overflow = mobileOpen ? "hidden" : "";
    const behind = [document.getElementById("page-scroll"), document.querySelector<HTMLElement>("[data-hero-backdrop]")];
    for (const node of behind) node?.toggleAttribute("inert", mobileOpen);
    return () => {
      el.style.overflow = "";
      for (const node of behind) node?.removeAttribute("inert");
    };
  }, [mobileOpen]);

  // The menu panel is md:hidden. If the viewport grows past md while it is
  // open (rotation, resize), close it, or the scroll lock above would leave the
  // page unscrollable with no visible way to undo it.
  useEffect(() => {
    if (!mobileOpen) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mq.matches) setMobileOpen(false);
    };
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mobileOpen]);

  // Escape closes the menu and returns focus to the hamburger; Tab wraps
  // inside the open menu (logo, Join, hamburger, links) instead of leaving it.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        hamburgerRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !navRef.current) return;
      const items = [...navRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")].filter(
        (node) => node.tabIndex >= 0 && node.offsetParent !== null
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    // Move focus into menu on open
    const first = panelRef.current?.querySelector<HTMLAnchorElement>("a");
    first?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  useEffect(() => {
    const sectionIds = copy.en.navLinks.map((l) => l.href.replace("#", ""));
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); }); },
      { root: scrollRoot, rootMargin: "-45% 0px -45% 0px" }
    );
    sectionIds.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [scrollRoot]);

  return (
    <nav
      ref={navRef}
      className={cn("relative z-50 rounded-2xl px-4 py-2.5 sm:px-6 sm:py-3 transition-[background-color,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]", scrolled || mobileOpen ? "glass-strong shadow-lg" : "bg-transparent backdrop-blur-none")}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <a href={onHome ? "#" : homePath} onClick={(e) => { if (!onHome) return; e.preventDefault(); scrollTo(0); }} aria-label={t.homeAria} className="min-w-0 shrink-0 group relative">
          <span className="absolute inset-0 bg-rido-magenta/0 group-hover:bg-rido-magenta/20 blur-xl rounded-lg transition-all duration-200" />
          <span className="relative z-10 block sm:hidden"><RidoLogo variant="full" size="sm" priority /></span>
          <span className="relative z-10 hidden sm:block"><RidoLogo variant="full" size="md" priority /></span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.href} href={hrefFor(link.href)} onClick={(e) => followAnchor(e, link.href)} aria-current={activeSection === link.href.replace("#", "") ? "true" : undefined} className={cn("nav-link text-sm transition-colors duration-200 cursor-pointer", activeSection === link.href.replace("#", "") ? "text-rido-magenta-light font-semibold" : "text-muted-strong hover:text-rido-magenta-light")}>{link.label}</a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Magnetic>
            <Button as="a" href={hrefFor("#download")} onClick={(e) => followAnchor(e, "#download")} size="sm" className="gap-2"><Download className="w-4 h-4" /><span>{t.joinWaitlist}</span></Button>
          </Magnetic>
        </div>
        {/* Mobile: keep a compact Join CTA visible next to the hamburger — primary conversion action on the dominant traffic class */}
        <div className="flex md:hidden items-center gap-2">
          <Button as="a" href={hrefFor("#download")} onClick={(e) => followAnchor(e, "#download")} size="sm" className="gap-1.5 min-h-[44px] px-4">
            <Download className="w-4 h-4" />
            <span>{t.joinShort}</span>
          </Button>
          <button
            ref={hamburgerRef}
            className="text-white cursor-pointer p-3 min-h-[44px] min-w-[44px] rounded-xl hover:bg-white/10 active:bg-white/15 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rido-magenta focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? t.closeMenu : t.openMenu}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <>
          {/* Tap outside closes the menu. Out of the tab order: keyboard users have Escape. */}
          <button
            type="button"
            tabIndex={-1}
            aria-label={t.closeMenu}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 -z-10 bg-rido-navy/60 md:hidden cursor-pointer"
          />
          <div
            id="mobile-menu"
            ref={panelRef}
            className="enter-down md:hidden overflow-hidden max-h-[calc(100dvh-5rem)] overflow-y-auto pb-[env(safe-area-inset-bottom)]"
            data-lenis-prevent=""
          >
            <div className="mt-3 pb-3 border-t border-white/10">
              {navLinks.map((link) => (
                <a key={link.href} href={hrefFor(link.href)} aria-current={activeSection === link.href.replace("#", "") ? "true" : undefined} className={cn("flex items-center py-3 min-h-[44px] text-base transition-colors cursor-pointer", activeSection === link.href.replace("#", "") ? "text-rido-magenta-light font-semibold" : "text-muted-strong hover:text-rido-magenta-light")} onClick={(e) => { followAnchor(e, link.href); setMobileOpen(false); }}>{link.label}</a>
              ))}
              <div className="mt-3"><Button as="a" href={hrefFor("#download")} onClick={(e) => { followAnchor(e, "#download"); setMobileOpen(false); }} size="sm" className="w-full gap-2 min-h-[44px]"><Download className="w-4 h-4" /><span>{t.joinWaitlist}</span></Button></div>
            </div>
          </div>
        </>
        )}
    </nav>
  );
}
