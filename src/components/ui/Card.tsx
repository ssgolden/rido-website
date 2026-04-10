import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = true }: CardProps) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-6",
        hover &&
          "transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-rido-coral/5 hover:-translate-y-1",
        className
      )}
    >
      {children}
    </div>
  );
}