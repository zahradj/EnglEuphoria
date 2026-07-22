import { useCallback, useState } from 'react';
import { z } from 'zod';
import { rateLimiter, generateCSRFToken } from '@/utils/security';
import { useToast } from '@/hooks/use-toast';

interface UseSecureFormOptions<T> {
  schema: z.ZodSchema<T>;
  onSubmit: (data: T) => Promise<void>;
  rateLimitKey?: string;
  maxAttempts?: number;
}

export function useSecureForm<T>({
  schema,
  onSubmit,
  rateLimitKey,
  maxAttempts = 5,
}: UseSecureFormOptions<T>) {
  const [csrfToken] = useState(() => generateCSRFToken());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleSubmit = useCallback(async (data: unknown) => {
    // Check rate limiting
    if (rateLimitKey && !rateLimiter.isAllowed(rateLimitKey, maxAttempts)) {
      toast({
        title: "Too many attempts",
        description: "Please wait before trying again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate data with schema
      const validatedData = schema.parse(data);
      
      // Submit the form
      await onSubmit(validatedData);
      
      // Reset rate limit on success
      if (rateLimitKey) {
        rateLimiter.reset(rateLimitKey);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: "Submission failed",
          description: "An error occurred while processing your request.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [schema, onSubmit, rateLimitKey, maxAttempts, toast]);

  return {
    handleSubmit,
    isSubmitting,
    errors,
    csrfToken,
  };
}