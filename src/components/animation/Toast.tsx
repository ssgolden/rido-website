"use client";

import { useState } from "react";
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";

/**
 * Toast — premium notifications via Sonner.
 * Usage:
 *   <Toaster />                          // mount once in root layout
 *   toast.success("Saved!")              // call from anywhere
 */
export { sonnerToast as toast };

function readInitialTheme(): "dark" | "light" {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function Toaster() {
  // Sync from the document on first render so the theme is correct on mount
  // and doesn't trigger a cascading re-render via an effect.
  const theme = useState<"dark" | "light">(readInitialTheme)[0];
  return (
    <SonnerToaster
      theme={theme}
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        className: "glass",
        style: {
          background: "rgba(15, 23, 42, 0.85)",
          color: "#fff",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(20px)",
        },
      }}
    />
  );
}

export function showSuccess(message: string, description?: string) {
  return sonnerToast.success(message, description ? { description } : undefined);
}
export function showError(message: string, description?: string) {
  return sonnerToast.error(message, description ? { description } : undefined);
}
export function showInfo(message: string, description?: string) {
  return sonnerToast.info(message, description ? { description } : undefined);
}
export function showLoading(message: string) {
  return sonnerToast.loading(message);
}
export function showPromise<T>(
  promise: Promise<T>,
  msgs: { loading: string; success: string; error: string }
) {
  return sonnerToast.promise(promise, msgs);
}
