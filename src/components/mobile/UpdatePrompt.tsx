import React from 'react';
import { usePWA } from '@/hooks/usePWA';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const UpdatePrompt: React.FC = () => {
  const { updateAvailable, applyUpdate } = usePWA();

  if (!updateAvailable) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 text-primary animate-spin" />
          <p className="text-sm font-medium text-foreground">
            A new version is available
          </p>
        </div>
        <Button size="sm" onClick={applyUpdate} className="shrink-0">
          Update
        </Button>
      </div>
    </div>
  );
};
