"use client";

import { useState } from "react";
import { Check, MessageCircle, Share2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/config";
import { track, type Placement } from "@/lib/analytics";
import { SITE_ORIGIN } from "@/lib/site";
import { cn } from "@/lib/utils";

const copy = {
  en: {
    prompt: "Know someone who'd ride? Tell a friend.",
    share: "Share",
    copied: "Link copied",
    whatsapp: "WhatsApp",
    whatsappAria: "Share Rido on WhatsApp (opens in a new tab)",
    message: "Rido is launching shared e-scooters and e-bikes in Torrevieja. I've joined the waitlist:",
  },
  es: {
    prompt: "¿Conoces a alguien que se apuntaría? Compártelo.",
    share: "Compartir",
    copied: "Enlace copiado",
    whatsapp: "WhatsApp",
    whatsappAria: "Compartir Rido por WhatsApp (se abre en una pestaña nueva)",
    message: "Rido trae patinetes y bicis eléctricas compartidas a Torrevieja. Yo ya estoy en la lista de espera:",
  },
} as const satisfies Record<Locale, Record<string, string>>;

/**
 * "Tell a friend" row shown after a waitlist sign-up. The native share sheet
 * when the browser has one, a copy-link fallback otherwise, plus WhatsApp
 * (the default messenger in Spain). Markup is identical on server and client;
 * the share/copy choice is made on click.
 */
export function ShareInvite({
  placement,
  path,
  align = "left",
  tone = "navy",
  className,
}: {
  placement: Placement;
  /** Page to share, e.g. "/torrevieja". Defaults to the locale's homepage. */
  path?: string;
  /** "left" follows the hero pattern: centred on phones, left-aligned from lg. */
  align?: "left" | "center";
  tone?: "navy" | "sand";
  className?: string;
}) {
  const locale = useLocale();
  const t = copy[locale];
  const [copied, setCopied] = useState(false);
  const url = `${SITE_ORIGIN}${path ?? (locale === "es" ? "/es" : "/")}`;
  const light = tone === "sand";

  const onShare = async () => {
    track("share_click", { placement, locale, detail: "native" });
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Rido", text: t.message, url });
        return;
      } catch (err) {
        // User closed the sheet: nothing to do. Any other failure falls back to copy.
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard blocked: the WhatsApp link still works.
    }
  };

  const button = cn(
    "btn-lift inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold cursor-pointer transition-colors duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rido-magenta focus-visible:ring-offset-2",
    light
      ? "bg-ink/5 text-ink hover:bg-ink/10 focus-visible:ring-offset-sand"
      : "bg-white/10 text-white hover:bg-white/15 focus-visible:ring-offset-rido-navy"
  );

  return (
    <div className={cn(align === "center" ? "text-center" : "", className)}>
      <p className={cn("text-sm", light ? "text-ink-muted" : "text-muted")}>{t.prompt}</p>
      <div className={cn("mt-3 flex flex-wrap gap-2", align === "center" ? "justify-center" : "justify-center lg:justify-start")}>
        <button type="button" onClick={onShare} className={button}>
          {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Share2 className="w-4 h-4" aria-hidden="true" />}
          <span aria-live="polite">{copied ? t.copied : t.share}</span>
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${t.message} ${url}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.whatsappAria}
          onClick={() => track("share_click", { placement, locale, detail: "whatsapp" })}
          className={button}
        >
          <MessageCircle className="w-4 h-4" aria-hidden="true" />
          {t.whatsapp}
        </a>
      </div>
    </div>
  );
}
