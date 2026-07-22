import React from 'react';
import { MobileOptimizedLayout } from './MobileOptimizedLayout';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';
import { OfflineIndicator } from './OfflineIndicator';

interface MobileAwarePageProps {
  children: React.ReactNode;
  title?: string;
  showNavigation?: boolean;
  showBackButton?: boolean;
  onBackClick?: () => void;
  className?: string;
}

export const MobileAwarePage: React.FC<MobileAwarePageProps> = ({
  children,
  title,
  showNavigation = true,
  showBackButton = false,
  onBackClick,
  className
}) => {
  const { capabilities } = useDeviceCapabilities();

  // Only apply mobile layout on mobile devices
  if (capabilities.isMobile) {
    return (
      <MobileOptimizedLayout
        headerProps={title ? {
          title,
          showBackButton,
          onBackClick,
          showNotifications: true
        } : undefined}
        showNavigation={showNavigation}
        className={className}
      >
        <OfflineIndicator />
        {children}
      </MobileOptimizedLayout>
    );
  }

  // Desktop layout - just render children normally
  return (
    <div className={className}>
      <OfflineIndicator />
      {children}
    </div>
  );
};