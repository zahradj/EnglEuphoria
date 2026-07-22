
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { lessonService } from "@/services/lessonService";

interface UserProfile {
  id: string;
  name: string;
  role: 'teacher' | 'student';
  avatar?: string;
}

interface LessonContext {
  lessonId?: string;
  title?: string;
  duration?: number;
  isValidated: boolean;
}

interface EnhancedUnifiedClassroomContextType {
  currentUser: UserProfile;
  finalRoomId: string;
  lessonContext: LessonContext;
  hasShownWelcome: boolean;
  setHasShownWelcome: (value: boolean) => void;
}

const EnhancedUnifiedClassroomContext = React.createContext<EnhancedUnifiedClassroomContextType | null>(null);

export const useEnhancedUnifiedClassroomContext = () => {
  const context = React.useContext(EnhancedUnifiedClassroomContext);
  if (!context) {
    throw new Error('useEnhancedUnifiedClassroomContext must be used within EnhancedUnifiedClassroomProvider');
  }
  return context;
};

interface EnhancedUnifiedClassroomProviderProps {
  children: React.ReactNode;
}

export function EnhancedUnifiedClassroomProvider({ children }: EnhancedUnifiedClassroomProviderProps) {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [lessonContext, setLessonContext] = useState<LessonContext>({
    isValidated: false
  });

  // SECURITY: Derive classroom role from server-validated auth context
  // Never trust URL params or client storage for role determination
  const currentUser = useMemo<UserProfile>(() => {
    const authRole = (user as any)?.role;
    const finalRole: 'teacher' | 'student' = 
      (authRole === 'teacher' || authRole === 'admin') ? 'teacher' : 'student';
    
    const finalName = user?.user_metadata?.full_name || (finalRole === 'teacher' ? 'Teacher' : 'Student');
    const finalUserId = user?.id || `anonymous-${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: finalUserId,
      name: finalName,
      role: finalRole
    };
  }, [user]);

  const finalRoomId = useMemo(() => roomId || "unified-classroom-1", [roomId]);

  // Validate lesson access when roomId or user changes
  useEffect(() => {
    const validateLessonAccess = async () => {
      if (finalRoomId && currentUser.id && !lessonContext.isValidated) {
        try {
          
          const canAccess = await lessonService.canAccessLesson(finalRoomId, currentUser.id);
          
          if (canAccess) {
            setLessonContext({
              isValidated: true,
              lessonId: finalRoomId, // In real implementation, you'd fetch lesson details
              title: "Scheduled Lesson",
              duration: 60
            });
            
          } else {
            setLessonContext({ isValidated: false });
            
            toast({
              title: "Access Denied",
              description: "You don't have permission to access this lesson, or it's not time yet.",
              variant: "destructive"
            });
            
          }
        } catch (error) {
          console.error('Error validating lesson access:', error);
          setLessonContext({ isValidated: false });
          
          toast({
            title: "Validation Error",
            description: "Could not validate lesson access. Please try again.",
            variant: "destructive"
          });
        }
      }
    };

    validateLessonAccess();
  }, [finalRoomId, currentUser.id, lessonContext.isValidated, toast]);

  // Show enhanced welcome message only once and after validation
  useEffect(() => {
    if (!hasShownWelcome && currentUser.role && lessonContext.isValidated) {
      const welcomeMessage = currentUser.role === 'teacher' 
        ? `Welcome to the lesson, ${currentUser.name}! You have full teaching controls.`
        : `Welcome to your lesson, ${currentUser.name}! Your teacher will join shortly.`;
      
      toast({
        title: `${currentUser.role === 'teacher' ? '👩‍🏫' : '👨‍🎓'} Lesson Ready`,
        description: welcomeMessage,
      });
      
      setHasShownWelcome(true);
    }
  }, [currentUser.role, currentUser.name, lessonContext.isValidated, toast, hasShownWelcome]);

  const contextValue = {
    currentUser,
    finalRoomId,
    lessonContext,
    hasShownWelcome,
    setHasShownWelcome
  };

  return (
    <EnhancedUnifiedClassroomContext.Provider value={contextValue}>
      {children}
    </EnhancedUnifiedClassroomContext.Provider>
  );
}
