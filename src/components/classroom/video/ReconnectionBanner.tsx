import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReconnectionStatus {
  isReconnecting: boolean;
  attempts: number;
  maxAttempts: number;
  status: 'reconnecting' | 'connected' | 'failed';
}

interface ReconnectionBannerProps {
  reconnectionStatus: ReconnectionStatus | null;
  onRetry?: () => void;
}

export function ReconnectionBanner({ reconnectionStatus, onRetry }: ReconnectionBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reconnectionStatus?.isReconnecting || reconnectionStatus?.status === 'failed') {
      setVisible(true);
    } else if (reconnectionStatus?.status === 'connected') {
      // Auto-hide after successful reconnection
      setTimeout(() => setVisible(false), 3000);
    }
  }, [reconnectionStatus]);

  if (!visible || !reconnectionStatus) return null;

  if (reconnectionStatus.status === 'failed') {
    return (
      <Alert variant="destructive" className="mb-4">
        <Wifi className="h-4 w-4" />
        <AlertTitle>Connection Failed</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>Failed to reconnect after {reconnectionStatus.maxAttempts} attempts.</span>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (reconnectionStatus.status === 'connected') {
    return (
      <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950">
        <Wifi className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-600">Reconnected</AlertTitle>
        <AlertDescription className="text-green-600">
          Successfully reconnected to the video session
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4">
      <Loader2 className="h-4 w-4 animate-spin" />
      <AlertTitle>Reconnecting...</AlertTitle>
      <AlertDescription className="flex items-center gap-2">
        <span>
          Attempting to reconnect (Attempt {reconnectionStatus.attempts}/{reconnectionStatus.maxAttempts})
        </span>
        <Badge variant="secondary" className="ml-auto">
          {reconnectionStatus.attempts}/{reconnectionStatus.maxAttempts}
        </Badge>
      </AlertDescription>
    </Alert>
  );
}
