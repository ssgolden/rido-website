import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "magenta" | "magenta-light" | "green" | "default";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
        variant === "magenta" &&
          "bg-rido-magenta/15 text-rido-magenta-light border border-rido-magenta/25",
        variant === "green" &&
          "bg-rido-green/15 text-rido-green border border-rido-green/25",
        variant === "magenta-light" &&
          "bg-rido-magenta-light/15 text-rido-magenta-light border border-rido-magenta-light/25",
        variant === "default" &&
          "bg-white/10 text-white/80 border border-white/15",
        className
      )}
    >
      {children}
    </span>
  );
}