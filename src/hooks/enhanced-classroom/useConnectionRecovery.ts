
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";

interface UseConnectionRecoveryProps {
  isConnected: boolean;
  error: string | null;
  onReconnect: () => Promise<void>;
  maxRetries?: number;
  retryDelay?: number;
}

export function useConnectionRecovery({
  isConnected,
  error,
  onReconnect,
  maxRetries = 3,
  retryDelay = 2000
}: UseConnectionRecoveryProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);
  const [lastToastTime, setLastToastTime] = useState(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const resetRetryCount = useCallback(() => {
    setRetryCount(0);
    setIsRecovering(false);
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, []);

  const attemptRecovery = useCallback(async () => {
    if (retryCount >= maxRetries || isRecovering) {
      return;
    }

    setIsRecovering(true);
    const currentAttempt = retryCount + 1;
    
    try {
      
      await onReconnect();
      
      // If we get here, the reconnection attempt was made
      setRetryCount(currentAttempt);
      
      // Throttle reconnection toasts (max 1 every 10 seconds)
      const now = Date.now();
      if (now - lastToastTime > 10000) {
        setLastToastTime(now);
        toast({
          title: "Reconnection Attempt",
          description: `Trying to reconnect... (${currentAttempt}/${maxRetries})`,
        });
      }

    } catch (err) {
      console.error(`❌ Recovery attempt ${currentAttempt} failed:`, err);
      setRetryCount(currentAttempt);
    }

    // Schedule next retry if we haven't exceeded max attempts
    if (currentAttempt < maxRetries) {
      retryTimeoutRef.current = setTimeout(() => {
        setIsRecovering(false);
        attemptRecovery();
      }, retryDelay * currentAttempt); // Exponential backoff
    } else {
      setIsRecovering(false);
      toast({
        title: "Connection Failed",
        description: "Maximum retry attempts reached. Please refresh the page.",
        variant: "destructive"
      });
    }
  }, [retryCount, maxRetries, isRecovering, onReconnect, retryDelay, toast]);

  // Auto-retry when connection is lost
  useEffect(() => {
    if (!isConnected && error && retryCount === 0 && !isRecovering) {
      const delayedRecovery = setTimeout(() => {
        attemptRecovery();
      }, 1000); // Initial delay before first retry

      return () => clearTimeout(delayedRecovery);
    }
  }, [isConnected, error, retryCount, isRecovering, attemptRecovery]);

  // Reset retry count when connection is restored
  useEffect(() => {
    if (isConnected && !error) {
      resetRetryCount();
    }
  }, [isConnected, error, resetRetryCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    retryCount,
    isRecovering,
    canRetry: retryCount < maxRetries && !isRecovering,
    manualRetry: attemptRecovery,
    resetRetryCount
  };
}
