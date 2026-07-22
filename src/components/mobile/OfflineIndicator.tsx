import React from 'react';
import { Wifi, WifiOff, CloudOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { cn } from '@/lib/utils';

interface OfflineIndicatorProps {
  className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className }) => {
  const { capabilities } = usePWA();
  const { hasPendingChanges } = useOfflineStorage({ key: 'offline-data' });

  if (capabilities.isOnline && !hasPendingChanges) {
    return null;
  }

  return (
    <div className={cn(
      "fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm",
      className
    )}>
      <Card className="shadow-lg bg-card/95 backdrop-blur-sm border-orange-200 dark:border-orange-800">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex-shrink-0 p-2 rounded-lg",
              !capabilities.isOnline 
                ? "bg-orange-100 dark:bg-orange-900/30" 
                : "bg-blue-100 dark:bg-blue-900/30"
            )}>
              {!capabilities.isOnline ? (
                <WifiOff className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              ) : (
                <CloudOff className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm text-foreground">
                  {!capabilities.isOnline ? 'Offline Mode' : 'Syncing...'}
                </h3>
                
                {capabilities.isOnline && (
                  <Wifi className="h-3 w-3 text-green-500 animate-pulse" />
                )}
              </div>
              
              <p className="text-xs text-muted-foreground mt-1">
                {!capabilities.isOnline 
                  ? 'You can continue learning. Progress will sync when back online.'
                  : hasPendingChanges 
                  ? 'Syncing your offline progress...'
                  : 'All caught up!'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};