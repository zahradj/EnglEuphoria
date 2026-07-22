import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "accent" | "success";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ variant = "default", size = "md", glow = false, className, children, ...props }, ref) => {
    const variantClasses = {
      default: "glass hover:glass-light",
      primary: "glass hover:bg-primary/20 border-primary/30 text-primary",
      accent: "glass hover:bg-accent/20 border-accent/30 text-accent",
      success: "glass hover:bg-success/20 border-success/30 text-success"
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg"
    };

    const glowClass = glow ? {
      default: "glow-primary",
      primary: "glow-primary",
      accent: "glow-accent",
      success: "hover:glow-primary"
    }[variant] : "";

    return (
      <button
        ref={ref}
        className={cn(
          "rounded-xl font-medium transition-all duration-300",
          "hover:scale-105 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          variantClasses[variant],
          sizeClasses[size],
          glowClass,
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

GlassButton.displayName = "GlassButton";
