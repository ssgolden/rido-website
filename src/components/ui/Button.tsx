import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, AnchorHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

interface ButtonAsButton extends BaseButtonProps, ButtonHTMLAttributes<HTMLButtonElement> {
  as?: "button";
}

interface ButtonAsLink extends BaseButtonProps, AnchorHTMLAttributes<HTMLAnchorElement> {
  as: "a";
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses = (variant: ButtonVariant) => {
  switch (variant) {
    case "primary":
      return "bg-rido-magenta hover:bg-rido-magenta-dark text-white shadow-lg shadow-rido-magenta/25";
    case "secondary":
      return "glass text-white hover:bg-white/15";
    case "outline":
      return "border-2 border-rido-magenta text-rido-magenta hover:bg-rido-magenta/10";
  }
};

const sizeClasses = (size: ButtonSize) => {
  switch (size) {
    case "sm":
      return "px-4 py-2 text-sm";
    case "md":
      return "px-6 py-3 text-base";
    case "lg":
      return "px-8 py-4 text-lg";
  }
};

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const classes = cn(
      "btn-ripple inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer",
      "hover:scale-105 active:scale-95",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rido-magenta focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy",
      variantClasses(variant),
      sizeClasses(size),
      className
    );

    if (props.as === "a") {
      const { as: _as, ...anchorProps } = props as ButtonAsLink;
      return (
        <a ref={ref as React.Ref<HTMLAnchorElement>} className={classes} {...anchorProps}>
          {children}
        </a>
      );
    }

    const { as: _as, ...buttonProps } = props as ButtonAsButton;
    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} className={classes} {...buttonProps}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";