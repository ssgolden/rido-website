"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "rido-cookie-consent";

function safeGetStorage(key: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  } catch {
    // localStorage unavailable (private browsing, storage blocked, etc.)
    return null;
  }
}

function safeSetStorage(key: string, value: string): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
  } catch {
    // Silently fail if storage is blocked
  }
}

// Subscribe to localStorage consent state without setState-in-effect.
// Returns true when the banner should be visible (no consent recorded yet).
function useShouldShowConsent() {
  return useSyncExternalStore(
    () => () => {},
    () => !safeGetStorage(STORAGE_KEY), // client
    () => false // SSR — don't show banner during hydration
  );
}

export function CookieConsent() {
  const shouldShow = useShouldShowConsent();
  const [dismissed, setDismissed] = useState(false);
  const visible = shouldShow && !dismissed;

  const handleAccept = () => {
    safeSetStorage(STORAGE_KEY, JSON.stringify({ accepted: true, timestamp: Date.now() }));
    setDismissed(true);
  };

  const handleDecline = () => {
    safeSetStorage(STORAGE_KEY, JSON.stringify({ accepted: false, timestamp: Date.now() }));
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6"
        >
          <div className="max-w-4xl mx-auto glass-strong rounded-2xl p-4 sm:p-6 shadow-2xl shadow-black/40">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-rido-magenta/10 flex items-center justify-center shrink-0">
                <Cookie className="w-5 h-5 text-rido-magenta" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white mb-1">We value your privacy</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  We store your preference on this device and, only if you accept, load cookieless analytics to understand site traffic. No advertising or cross-site tracking cookies.{" "}
                  <Link href="/politica-cookies" className="text-rido-magenta hover:text-rido-magenta-light transition-colors underline">
                    Learn more
                  </Link>
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Button size="sm" onClick={handleAccept}>Accept all cookies</Button>
                  <Button size="sm" variant="secondary" onClick={handleDecline}>Decline non-essential</Button>
                </div>
              </div>
              <button
                onClick={handleDecline}
                className="text-white/40 hover:text-white transition-colors cursor-pointer p-1 shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}