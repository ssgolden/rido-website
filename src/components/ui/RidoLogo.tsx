import { cn } from "@/lib/utils";

interface RidoLogoProps {
  variant?: "full" | "mark" | "wordmark";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RidoLogo({ variant = "full", size = "md", className }: RidoLogoProps) {
  const sizes = {
    sm: { mark: 20, text: "text-lg" },
    md: { mark: 28, text: "text-2xl" },
    lg: { mark: 40, text: "text-4xl" },
  };

  const s = sizes[size];

  const CheckMark = () => (
    <svg
      width={s.mark}
      height={s.mark}
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

  const WordMark = () => (
    <span className={cn("font-black tracking-tight text-white", s.text)}>
      rido
    </span>
  );

  if (variant === "mark") return <CheckMark />;
  if (variant === "wordmark") return <WordMark />;

  return (
    <span className="inline-flex items-center gap-2">
      <CheckMark />
      <WordMark />
    </span>
  );
}