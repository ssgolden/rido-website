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
          "card-lift hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-rido-magenta/5",
        className
      )}
    >
      {children}
    </div>
  );
}