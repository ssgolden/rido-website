import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer",
          "hover:scale-105 active:scale-95",
          variant === "primary" &&
            "bg-rido-coral hover:bg-rido-coral-dark text-white shadow-lg shadow-rido-coral/25",
          variant === "secondary" && "glass text-white hover:bg-white/15",
          variant === "outline" &&
            "border-2 border-rido-coral text-rido-coral hover:bg-rido-coral/10",
          size === "sm" && "px-4 py-2 text-sm",
          size === "md" && "px-6 py-3 text-base",
          size === "lg" && "px-8 py-4 text-lg",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";