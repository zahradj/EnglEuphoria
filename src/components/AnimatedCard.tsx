
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  delay?: '300' | '500' | '700' | '900' | '1100' | '1300' | string;
}

export function AnimatedCard({
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  header,
  footer,
  children,
  delay = '0',
}: AnimatedCardProps) {
  const animationClass = delay === '0' 
    ? 'animate-scale-in' 
    : `animate-scale-in animation-delay-${delay}`;

  return (
    <Card className={cn("relative overflow-hidden", animationClass, className)}>
      {/* Inner glow effects */}
      <div className="absolute -z-10 top-0 left-0 w-[80%] h-[80%] bg-purple/10 rounded-full blur-2xl animate-blur-fade"></div>
      <div className="absolute -z-10 bottom-0 right-0 w-[60%] h-[60%] bg-teal/5 rounded-full blur-2xl animate-blur-fade animation-delay-500"></div>
      
      {header && (
        <CardHeader className={headerClassName}>
          {header}
        </CardHeader>
      )}
      
      <CardContent className={cn("relative z-10", contentClassName)}>
        {children}
      </CardContent>
      
      {footer && (
        <CardFooter className={footerClassName}>
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
