import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "coral" | "green" | "gold" | "default";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
        variant === "coral" &&
          "bg-rido-coral/15 text-rido-coral border border-rido-coral/25",
        variant === "green" &&
          "bg-rido-green/15 text-rido-green border border-rido-green/25",
        variant === "gold" &&
          "bg-rido-gold/15 text-rido-gold border border-rido-gold/25",
        variant === "default" &&
          "bg-white/10 text-white/80 border border-white/15",
        className
      )}
    >
      {children}
    </span>
  );
}