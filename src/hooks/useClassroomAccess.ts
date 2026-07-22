
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { classroomAccessService, ClassroomAccessValidation } from '@/services/classroomAccessService';

interface UseClassroomAccessProps {
  roomId: string;
  userId: string;
  userRole: 'teacher' | 'student';
  autoValidate?: boolean;
}

export function useClassroomAccess({ 
  roomId, 
  userId, 
  userRole, 
  autoValidate = true 
}: UseClassroomAccessProps) {
  const [validation, setValidation] = useState<ClassroomAccessValidation | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateAccess = async () => {
    if (!roomId || !userId) return;

    setIsValidating(true);
    try {
      const result = await classroomAccessService.validateClassroomAccess(
        roomId, 
        userId, 
        userRole
      );
      
      setValidation(result);
      
      if (!result.isValid) {
        toast({
          title: "Access Denied",
          description: result.message,
          variant: "destructive"
        });
      } else if (result.lesson) {
        // Track session join
        await classroomAccessService.trackSessionJoin(
          result.lesson.id, 
          userId, 
          userRole
        );
        
        toast({
          title: "Welcome to Class",
          description: `Joined lesson: ${result.lesson.title}`,
        });
      }
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Failed to validate classroom access.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const trackLeave = async () => {
    if (validation?.lesson) {
      await classroomAccessService.trackSessionLeave(
        validation.lesson.id, 
        userId
      );
    }
  };

  const updateLessonStatus = async (status: string) => {
    if (validation?.lesson && userRole === 'teacher') {
      await classroomAccessService.updateLessonStatus(
        validation.lesson.id, 
        status
      );
    }
  };

  useEffect(() => {
    if (autoValidate) {
      validateAccess();
    }
    
    // Cleanup on unmount
    return () => {
      if (validation?.lesson) {
        trackLeave();
      }
    };
  }, [roomId, userId, userRole, autoValidate]);

  return {
    validation,
    isValidating,
    isAccessValid: validation?.isValid || false,
    lesson: validation?.lesson,
    validateAccess,
    trackLeave,
    updateLessonStatus
  };
}
