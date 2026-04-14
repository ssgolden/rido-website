import { cn } from "@/lib/utils";

interface RidoLogoProps {
  variant?: "full" | "mark" | "wordmark";
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Define sizes per variant
const sizes = {
  sm: { mark: 20, text: "text-lg" },
  md: { mark: 28, text: "text-2xl" },
  lg: { mark: 40, text: "text-4xl" },
};

// SVG logo mark component
function CheckMarkMark({ size, className }: { size: number; className?: string }) {
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
      <rect width="32" height="32" rx="8" fill="#DE0498" />
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

// Wordmark (text) component
function WordMarkText({ textClass, className }: { textClass: string; className?: string }) {
  return (
    <span className={cn("font-black tracking-tight text-white", textClass, className)}>
      rido
    </span>
  );
}

// Variants map for rendering
const variants = {
  mark: CheckMarkMark,
  wordmark: WordMarkText,
  full: function FullLogo({ size, className }: { size: string; className?: string }) {
    const s = sizes[size as keyof typeof sizes] ?? sizes.md;
    return (
      <span className="inline-flex items-center gap-2">
        <CheckMarkMark size={s.mark} className={className} />
        <WordMarkText textClass={s.text} className={className} />
      </span>
    );
  },
} as const;

export function RidoLogo({ variant = "full", size = "md", className }: RidoLogoProps) {
  const s = sizes[size];

  if (variant === "mark") {
    return <CheckMarkMark size={s.mark} className={className} />;
  }

  if (variant === "wordmark") {
    return <WordMarkText textClass={s.text} className={className} />;
  }

  return variants.full({ size, className });
}