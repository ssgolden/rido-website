"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { withBase } from "@/lib/basePath";
import { useState } from "react";

interface RidoLogoProps {
  variant?: "full" | "mark" | "wordmark";
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
  const [imgError, setImgError] = useState(false);

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
            key={`full-${variant}`}
            src={withBase("/images/logo/rido-logo.png")}
            alt="Rido"
            width={imgW}
            height={imgH}
            loading={priority ? "eager" : undefined}
            className="shrink-0"
            style={{ imageRendering: "auto" }}
            onError={() => setImgError(true)}
          />
        )}
      </span>
    );
  }

  return null;
}
