import React, { useState } from 'react';
import { Monitor, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'creator-studio-desktop-hint-dismissed';

export const MobileDesktopHint: React.FC = () => {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem(STORAGE_KEY) === '1';
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* noop */
    }
    setDismissed(true);
  };

  return (
    <div
      role="status"
      className="md:hidden flex items-start gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-100 text-xs"
    >
      <Monitor className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
      <p className="flex-1 leading-snug">
        The Creator Studio is best on a larger screen. You can browse here, but
        slide editing works best on tablet or desktop.
      </p>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="h-7 w-7 -mr-1 -mt-1 text-amber-900 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/40"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
