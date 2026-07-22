import React from 'react';
import { MobileNavigation } from './MobileNavigation';
import { MobileHeader } from './MobileHeader';
import { UpdatePrompt } from './UpdatePrompt';
import { cn } from '@/lib/utils';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  headerProps?: React.ComponentProps<typeof MobileHeader>;
  showNavigation?: boolean;
  className?: string;
}

export const MobileOptimizedLayout: React.FC<MobileOptimizedLayoutProps> = ({
  children,
  headerProps,
  showNavigation = true,
  className
}) => {
  return (
    <div className="min-h-dvh bg-background">
      {headerProps && <MobileHeader {...headerProps} />}
      
      <main className={cn(
        "flex-1",
        // Add bottom padding for navigation on mobile
        showNavigation && "pb-16 md:pb-0",
        // Add top padding if header is present
        headerProps && "pt-0 md:pt-0",
        className
      )}>
        {children}
      </main>
      
      {showNavigation && <MobileNavigation />}
      <UpdatePrompt />
    </div>
  );
};