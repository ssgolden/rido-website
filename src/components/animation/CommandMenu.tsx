"use client";

import { useEffect, useState, useMemo } from "react";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sparkles, Zap, Box, Type, MessageSquare, Menu, Layers, Wind } from "lucide-react";

export interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const items = [
  { id: "home", label: "Home", icon: Sparkles, action: "/" },
  { id: "vehicles", label: "Vehicles", icon: Box, action: "/#vehicles" },
  { id: "cities", label: "Cities", icon: Layers, action: "/#cities" },
  { id: "safety", label: "Safety", icon: Zap, action: "/#safety" },
  { id: "sustainability", label: "Sustainability", icon: Wind, action: "/#sustainability" },
  { id: "pricing", label: "Pricing", icon: Type, action: "/#pricing" },
  { id: "faq", label: "FAQ", icon: MessageSquare, action: "/#faq" },
  { id: "about", label: "About", icon: Menu, action: "/#about" },
  { id: "waitlist", label: "Join the waitlist", icon: Sparkles, action: "/#download" },
  { id: "lab", label: "Motion Lab", icon: Sparkles, action: "/motion-lab" },
];

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const items_safe = useMemo(() => items, []);

  // Reset search when the menu closes. We subscribe to the *open* prop and
  // reset the search after the close transition (deferred to next microtask)
  // to avoid setting state synchronously inside an effect.
  useEffect(() => {
    if (!open) {
      queueMicrotask(() => setSearch(""));
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl glass overflow-hidden shadow-2xl shadow-black/60"
          >
            <Command label="Rido command menu" className="w-full">
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder="Type a command or search…"
                className="w-full px-5 py-4 bg-transparent text-white placeholder-white/40 outline-none text-base border-b border-white/10"
                autoFocus
              />
              <Command.List className="max-h-80 overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-sm text-muted">
                  No results found.
                </Command.Empty>
                <Command.Group heading="Navigate" className="text-[10px] uppercase tracking-[0.2em] text-muted px-3 py-2">
                  {items_safe.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Command.Item
                        key={item.id}
                        value={item.label}
                        onSelect={() => {
                          onOpenChange(false);
                          if (item.action.startsWith("/motion-lab")) {
                            router.push(item.action);
                          } else if (item.action.startsWith("/#")) {
                            const id = item.action.slice(2);
                            const el = document.getElementById(id);
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                            else router.push("/");
                          } else {
                            router.push(item.action);
                          }
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/90 cursor-pointer aria-selected:bg-rido-magenta/20 aria-selected:text-white"
                      >
                        <Icon className="w-4 h-4 text-rido-magenta" />
                        <span className="flex-1">{item.label}</span>
                        <span className="text-[10px] text-muted">↵</span>
                      </Command.Item>
                    );
                  })}
                </Command.Group>
              </Command.List>
              <div className="border-t border-white/10 px-4 py-2 flex items-center justify-between text-[10px] text-muted">
                <span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">↑↓</kbd> navigate
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">↵</kbd> select
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">esc</kbd> close
                </span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
