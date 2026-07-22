import React from 'react';
import { usePWA } from '@/hooks/usePWA';
import { cn } from '@/lib/utils';

interface AppVersionProps {
  className?: string;
}

export const AppVersion: React.FC<AppVersionProps> = ({ className }) => {
  const { appVersion } = usePWA();

  return (
    <span className={cn('text-xs text-muted-foreground', className)}>
      v{appVersion}
    </span>
  );
};
