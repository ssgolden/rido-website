"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { RidoLogo } from "@/components/ui/RidoLogo";
import { Menu, X, Download } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Vehicles", href: "#vehicles" },
  { label: "Cities", href: "#cities" },
  { label: "Safety", href: "#safety" },
  { label: "Pricing", href: "#pricing" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => { setScrolled(window.scrollY > 20); };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) { document.body.style.overflow = "hidden"; }
    else { document.body.style.overflow = ""; }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const sectionIds = navLinks.map((l) => l.href.replace("#", ""));
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); }); },
      { rootMargin: "-50% 0px" }
    );
    sectionIds.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <nav className={cn("fixed top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-50 rounded-2xl px-4 py-2.5 sm:px-6 sm:py-3 transition-all duration-300", scrolled ? "glass-strong shadow-lg" : "bg-transparent")}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <a href="#" aria-label="Rido home" className="min-w-0 shrink-0 group relative">
          <span className="absolute inset-0 bg-rido-magenta/0 group-hover:bg-rido-magenta/20 blur-xl rounded-lg transition-all duration-500" />
          <span className="relative z-10 block sm:hidden"><RidoLogo variant="full" size="sm" priority /></span>
          <span className="relative z-10 hidden sm:block"><RidoLogo variant="full" size="md" priority /></span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className={cn("text-sm transition-colors cursor-pointer", activeSection === link.href.replace("#", "") ? "text-rido-magenta font-semibold" : "text-white/70 hover:text-rido-magenta")}>{link.label}</a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <a href="#download" className="cursor-pointer"><Button size="sm" className="gap-2"><Download className="w-4 h-4" /><span>Get the App</span></Button></a>
        </div>
        <button className="md:hidden text-white cursor-pointer p-3 -mr-3" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="md:hidden overflow-hidden">
            <div className="mt-3 pb-3 border-t border-white/10">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className={cn("block py-2.5 text-base transition-colors cursor-pointer", activeSection === link.href.replace("#", "") ? "text-rido-magenta font-semibold" : "text-white/70 hover:text-rido-magenta")} onClick={() => setMobileOpen(false)}>{link.label}</a>
              ))}
              <div className="mt-3"><a href="#download" onClick={() => setMobileOpen(false)} className="cursor-pointer block"><Button size="sm" className="w-full gap-2"><Download className="w-4 h-4" /><span>Get the App</span></Button></a></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
