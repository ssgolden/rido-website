"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { withBase } from "@/lib/basePath";
import { useState } from "react";

interface RidoLogoProps {
  variant?: "full" | "mark" | "wordmark" | "hero";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  priority?: boolean;
}

const sizeConfig = {
  sm: { height: 24, text: "text-lg" },
  md: { height: 32, text: "text-2xl" },
  lg: { height: 40, text: "text-3xl" },
  xl: { height: 56, text: "text-5xl" },
} as const;

function FallbackMark({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="mark-grad" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#F23DB5" />
          <stop offset="100%" stopColor="#DE0498" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#mark-grad)" />
      <path
        d="M9 16.5L13.5 21L23 11"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RidoLogo({
  variant = "full",
  size = "md",
  className,
  priority = false,
}: RidoLogoProps) {
  const config = sizeConfig[size];
  // Remember which variant failed to load instead of resetting a boolean in
  // an effect: switching variants derives a fresh (non-errored) state.
  const [errorVariant, setErrorVariant] = useState<RidoLogoProps["variant"] | null>(null);
  const imgError = errorVariant === variant;
  const setImgError = () => setErrorVariant(variant);

  if (variant === "mark") {
    const markSize = size === "xl" ? 48 : size === "lg" ? 36 : size === "md" ? 28 : 20;
    return <FallbackMark size={markSize} className={className} />;
  }

  if (variant === "wordmark") {
    return (
      <span className={cn("font-black tracking-tight text-white", config.text, className)}>
        rido
      </span>
    );
  }

  if (variant === "full") {
    const imgH = config.height;
    const imgW = Math.round(imgH * 2.03);
    return (
      <span className={cn("inline-flex items-center gap-2", className)}>
        {imgError ? (
          <FallbackMark size={imgH} className="shrink-0" />
        ) : (
          <Image
            src={withBase("/images/logo/rido-logo.png")}
            alt="Rido"
            width={imgW}
            height={imgH}
            priority={priority}
            sizes={`(max-width: 640px) ${imgW}px, ${Math.round(imgW * 1.25)}px`}
            className="shrink-0"
            style={{ imageRendering: "auto" }}
            onError={setImgError}
          />
        )}
      </span>
    );
  }

  if (variant === "hero") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={cn("relative inline-flex items-center", className)}
      >
        <div className="absolute inset-0 blur-2xl bg-rido-magenta/40 scale-150 rounded-full" />
        {imgError ? (
          <FallbackMark size={138} className="relative z-10 shrink-0" />
        ) : (
          <Image
            src={withBase("/images/logo/rido-logo.png")}
            alt="Rido"
            width={280}
            height={138}
            priority
            sizes="(max-width: 640px) 200px, 280px"
            className="relative z-10 shrink-0"
            style={{ imageRendering: "auto" }}
            onError={setImgError}
          />
        )}
      </motion.div>
    );
  }

  return null;
}
