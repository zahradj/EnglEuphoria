
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useErrorBoundary() {
  const { toast } = useToast();

  const handleAsyncError = useCallback((error: any, context?: string) => {
    console.error(`Error in ${context || 'component'}:`, error);
    
    // Show user-friendly error message
    toast({
      title: "Something went wrong",
      description: context ? `Error in ${context}. Please try again.` : "Please try again.",
      variant: "destructive"
    });
  }, [toast]);

  return { handleAsyncError };
}
