import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface JoyfulCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "gradient" | "playful" | "celebration";
  hover?: boolean;
  sparkles?: boolean;
}

export function JoyfulCard({ 
  children, 
  className, 
  variant = "default",
  hover = true,
  sparkles = false
}: JoyfulCardProps) {
  
  const getVariantStyles = () => {
    switch (variant) {
      case "gradient":
        return {
          background: 'var(--gradient-card)',
          border: '2px solid hsla(var(--primary) / 0.2)',
          boxShadow: 'var(--shadow-card)'
        };
      case "playful":
        return {
          background: 'linear-gradient(135deg, hsl(var(--surface)), hsl(var(--surface-2)))',
          border: '2px solid hsla(var(--joy-teal) / 0.3)',
          boxShadow: 'var(--shadow-soft)'
        };
      case "celebration":
        return {
          background: 'linear-gradient(135deg, hsl(var(--surface)), hsl(var(--joy-yellow) / 0.05))',
          border: '2px solid hsla(var(--joy-orange) / 0.3)',
          boxShadow: 'var(--shadow-celebration)'
        };
      default:
        return {
          background: 'hsl(var(--surface))',
          border: '1px solid hsl(var(--border))',
          boxShadow: 'var(--shadow-soft)'
        };
    }
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden rounded-2xl transition-all duration-300",
        hover && "hover:scale-[1.02] hover:shadow-lg",
        variant === "celebration" && "animate-gentle-pulse",
        className
      )}
      style={getVariantStyles()}
    >
      {/* Decorative corner elements */}
      {variant === "playful" && (
        <>
          <div className="absolute top-0 right-0 w-6 h-6 rounded-bl-full opacity-20"
               style={{ background: 'hsl(var(--joy-pink))' }}></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 rounded-tr-full opacity-15"
               style={{ background: 'hsl(var(--joy-purple))' }}></div>
        </>
      )}

      {/* Sparkles for celebration variant */}
      {(sparkles || variant === "celebration") && (
        <>
          <div className="absolute top-2 right-3 text-sm animate-sparkle opacity-60">✨</div>
          <div className="absolute bottom-3 right-2 text-xs animate-sparkle opacity-50" 
               style={{ animationDelay: '0.7s' }}>⭐</div>
        </>
      )}

      {/* Rainbow border for magical effects */}
      {variant === "gradient" && (
        <div className="absolute inset-0 rounded-2xl opacity-30 animate-rainbow-shift blur-sm -z-10"
             style={{ background: 'var(--gradient-rainbow)', padding: '2px' }}></div>
      )}

      <div className="relative z-10">
        {children}
      </div>
    </Card>
  );
}