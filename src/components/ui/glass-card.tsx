import { cn } from "@/lib/utils";
import { HTMLAttributes, ButtonHTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "light" | "strong";
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl";
  children: React.ReactNode;
}

export function GlassCard({ 
  variant = "default", 
  rounded = "2xl",
  className, 
  children,
  ...props 
}: GlassCardProps) {
  const variantClasses = {
    default: "glass",
    light: "glass-light",
    strong: "glass-strong"
  };

  const roundedClasses = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl"
  };

  return (
    <div 
      className={cn(
        variantClasses[variant],
        roundedClasses[rounded],
        "transition-all duration-300 hover:shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function GlassButton({
  variant = "default",
  size = "md",
  className,
  children,
  ...props
}: GlassButtonProps) {
  const variantClasses = {
    default: "bg-white/10 hover:bg-white/20 text-white border border-white/10",
    outline: "bg-transparent hover:bg-white/10 text-white border border-white/30",
    ghost: "bg-transparent hover:bg-white/10 text-white"
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-all duration-300",
        "backdrop-blur-sm",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
