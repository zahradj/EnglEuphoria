
import { useEffect, useMemo, useRef } from 'react';
import { useSessionManager } from './useSessionManager';
import { useRealTimeSync } from './useRealTimeSync';
import { supabase } from '@/lib/supabase';

interface UseSessionInitializerProps {
  roomId: string;
  userId: string;
  userRole: 'teacher' | 'student';
}

export function useSessionInitializer({
  roomId,
  userId,
  userRole
}: UseSessionInitializerProps) {
  const hasInitialized = useRef(false);
  const initializationInProgress = useRef(false);
  
  // Memoize props to prevent unnecessary re-initializations
  const sessionProps = useMemo(() => ({ roomId, userId, userRole }), [roomId, userId, userRole]);
  
  const sessionManager = useSessionManager(sessionProps);
  const realTimeSync = useRealTimeSync(sessionProps);

  // Auto-initialize session only (real-time sync auto-connects)
  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized.current || initializationInProgress.current) {
      return;
    }

    // Only initialize on classroom pages and for authenticated users
    const isClassroomPage = window.location.pathname.includes('/classroom') || 
                            window.location.pathname.includes('/unified-classroom');
    
    if (!isClassroomPage) {
      return;
    }

    initializationInProgress.current = true;

    
    const initializeSession = async () => {
      try {
        // Check authentication first - allow development mode with URL params
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        // For development mode, if we have userId in URL params, proceed without authentication
        if ((authError || !user) && !userId) {
          initializationInProgress.current = false;
          return;
        }

        // Use authenticated user ID or fallback to URL userId for development
        const effectiveUserId = user?.id || userId;

        // Initialize based on role
        if (userRole === 'teacher') {
          await sessionManager.createSession();
        } else {
          await sessionManager.joinSession();
        }
        
        hasInitialized.current = true;
      } catch (error) {
        console.error('❌ Classroom initialization failed:', error);
      } finally {
        initializationInProgress.current = false;
      }
    };

    // Small delay to ensure components are mounted
    const timeoutId = setTimeout(initializeSession, 500);

    return () => {
      clearTimeout(timeoutId);
      if (!hasInitialized.current) {
        initializationInProgress.current = false;
      }
    };
  }, [userRole, roomId, userId, sessionManager]); // Include userId dependency

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      realTimeSync.disconnect();
      hasInitialized.current = false;
      initializationInProgress.current = false;
    };
  }, [realTimeSync]);

  return {
    sessionManager,
    realTimeSync,
    isInitialized: hasInitialized.current
  };
}
