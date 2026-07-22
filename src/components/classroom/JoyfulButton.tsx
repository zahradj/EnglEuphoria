import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface JoyfulButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "success" | "warning" | "fun" | "magical";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  className?: string;
  disabled?: boolean;
  isActive?: boolean;
}

export function JoyfulButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  icon: Icon,
  className,
  disabled = false,
  isActive = false
}: JoyfulButtonProps) {
  
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          background: 'var(--gradient-success)',
          boxShadow: 'var(--shadow-button)',
          color: 'white'
        };
      case "warning":
        return {
          background: 'var(--gradient-warm)',
          boxShadow: 'var(--shadow-button)',
          color: 'white'
        };
      case "fun":
        return {
          background: 'var(--gradient-celebration)',
          boxShadow: 'var(--shadow-glow)',
          color: 'white'
        };
      case "magical":
        return {
          background: 'var(--gradient-rainbow)',
          boxShadow: 'var(--shadow-celebration)',
          color: 'white'
        };
      default:
        return {
          background: 'var(--gradient-cool)',
          boxShadow: 'var(--shadow-button)',
          color: 'white'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "px-3 py-1.5 text-sm rounded-lg";
      case "lg":
        return "px-8 py-4 text-lg rounded-xl";
      default:
        return "px-6 py-3 text-base rounded-xl";
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "font-semibold border-0 transition-all duration-300 transform",
        "hover:scale-105 hover:shadow-lg active:scale-95",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        getSizeStyles(),
        isActive && "scale-105 shadow-lg",
        variant === "magical" && "animate-rainbow-shift",
        className
      )}
      style={getVariantStyles()}
    >
      <div className="flex items-center gap-2 relative z-10">
        {Icon && (
          <Icon 
            size={size === "sm" ? 16 : size === "lg" ? 24 : 20} 
            className={cn(
              "drop-shadow-sm",
              variant === "fun" && "animate-sparkle",
              variant === "magical" && "animate-gentle-pulse"
            )}
          />
        )}
        <span className="drop-shadow-sm">{children}</span>
      </div>
      
      {/* Sparkle effect for magical variant */}
      {variant === "magical" && (
        <>
          <div className="absolute top-1 right-1 text-xs animate-sparkle opacity-80">✨</div>
          <div className="absolute bottom-1 left-1 text-xs animate-sparkle opacity-70" 
               style={{ animationDelay: '0.5s' }}>⭐</div>
        </>
      )}
    </Button>
  );
}