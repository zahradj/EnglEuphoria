import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface NeumorphicPanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "raised" | "inset";
  padding?: "none" | "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function NeumorphicPanel({ 
  variant = "raised",
  padding = "md",
  className, 
  children,
  ...props 
}: NeumorphicPanelProps) {
  const variantClasses = {
    raised: "neumorphic",
    inset: "neumorphic-inset"
  };

  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6"
  };

  return (
    <div 
      className={cn(
        variantClasses[variant],
        paddingClasses[padding],
        "transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
