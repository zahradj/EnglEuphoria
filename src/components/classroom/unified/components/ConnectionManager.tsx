
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCcw, Wifi, WifiOff, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConnectionManagerProps {
  isConnected: boolean;
  error: string | null;
  onRetry: () => void;
  onRefresh?: () => void;
  connectionQuality?: string;
}

export function ConnectionManager({
  isConnected,
  error,
  onRetry,
  onRefresh = () => window.location.reload(),
  connectionQuality = 'good'
}: ConnectionManagerProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const { toast } = useToast();

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      await onRetry();
      toast({
        title: "Reconnecting...",
        description: "Attempting to restore connection",
      });
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setTimeout(() => setIsRetrying(false), 2000);
    }
  };

  const getConnectionStatus = () => {
    if (isConnected) {
      return {
        icon: <Wifi className="h-4 w-4 text-green-500" />,
        label: "Connected",
        variant: "default" as const,
        color: "text-green-600"
      };
    } else if (error) {
      return {
        icon: <WifiOff className="h-4 w-4 text-red-500" />,
        label: "Connection Error",
        variant: "destructive" as const,
        color: "text-red-600"
      };
    } else {
      return {
        icon: <AlertCircle className="h-4 w-4 text-yellow-500" />,
        label: "Connecting...",
        variant: "secondary" as const,
        color: "text-yellow-600"
      };
    }
  };

  const status = getConnectionStatus();

  if (!error && isConnected) {
    return (
      <div className="flex items-center gap-2 text-sm">
        {status.icon}
        <span className={status.color}>Connected</span>
        {connectionQuality && (
          <Badge variant="outline" className="text-xs">
            Quality: {connectionQuality}
          </Badge>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4 border-red-200 bg-red-50">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-red-800 mb-1">
              Connection Issue
            </h4>
            <p className="text-sm text-red-700 mb-3">
              {error.includes('session') || error.includes('Session') 
                ? "Unable to connect to the classroom session. Please check your internet connection and try again."
                : error
              }
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                size="sm"
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCcw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : `Retry${retryCount > 0 ? ` (${retryCount})` : ''}`}
              </Button>
              <Button
                onClick={onRefresh}
                size="sm"
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {status.icon}
      <span className={status.color}>{status.label}</span>
    </div>
  );
}
