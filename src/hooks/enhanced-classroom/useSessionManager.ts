
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

interface ClassroomSession {
  id: string;
  room_id: string;
  teacher_id: string;
  session_status: 'waiting' | 'started' | 'ended';
  started_at?: string;
  ended_at?: string;
  created_at: string;
  updated_at: string;
}

interface UseSessionManagerProps {
  roomId: string;
  userId: string;
  userRole: 'teacher' | 'student';
}

export function useSessionManager({ roomId, userId, userRole }: UseSessionManagerProps) {
  const [session, setSession] = useState<ClassroomSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const channelRef = useRef<any>(null);

  // Create a new session (teacher only)
  const createSession = useCallback(async () => {
    if (userRole !== 'teacher') {
      setError('Only teachers can create sessions');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get the authenticated user's ID or use URL userId for development
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      const effectiveUserId = user?.id || userId;
      
      if (!effectiveUserId) {
        throw new Error('User ID required');
      }

      // Check if session already exists
      const { data: existingSession } = await supabase
        .from('classroom_sessions')
        .select('*')
        .eq('room_id', roomId)
        .maybeSingle();

      if (existingSession) {
        setSession(existingSession);
        return existingSession;
      }

      // Create new session
      const { data: newSession, error: createError } = await supabase
        .from('classroom_sessions')
        .insert({
          room_id: roomId,
          teacher_id: effectiveUserId,
          session_status: 'waiting'
        })
        .select()
        .single();

      if (createError) throw createError;

      setSession(newSession);
      
      toast({
        title: "Session Created",
        description: "Classroom session is ready for students to join.",
      });

      return newSession;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMessage);
      console.error('❌ Session creation failed:', err);
      
      toast({
        title: "Session Creation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [roomId, userId, userRole, toast]);

  // Join an existing session (student)
  const joinSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: existingSession, error: fetchError } = await supabase
        .from('classroom_sessions')
        .select('*')
        .eq('room_id', roomId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!existingSession) {
        setError('No active session found for this room');
        return;
      }

      setSession(existingSession);
      
      if (userRole === 'student') {
        toast({
          title: "Joined Session",
          description: "You've successfully joined the classroom session.",
        });
      }

      return existingSession;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join session';
      setError(errorMessage);
      console.error('❌ Session join failed:', err);
      
      toast({
        title: "Join Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [roomId, userRole, toast]);

  // Start the session (teacher only)
  const startSession = useCallback(async () => {
    if (userRole !== 'teacher' || !session) return;

    try {
      const { error } = await supabase
        .from('classroom_sessions')
        .update({
          session_status: 'started',
          started_at: new Date().toISOString()
        })
        .eq('id', session.id);

      if (error) throw error;

      toast({
        title: "Session Started",
        description: "Students can now join the video session.",
      });
    } catch (err) {
      console.error('❌ Failed to start session:', err);
      toast({
        title: "Error",
        description: "Failed to start session. Please try again.",
        variant: "destructive"
      });
    }
  }, [session, userRole, toast]);

  // End the session (teacher only)
  const endSession = useCallback(async () => {
    if (userRole !== 'teacher' || !session) return;

    try {
      const { error } = await supabase
        .from('classroom_sessions')
        .update({
          session_status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', session.id);

      if (error) throw error;

      toast({
        title: "Session Ended",
        description: "The classroom session has been ended.",
      });
    } catch (err) {
      console.error('❌ Failed to end session:', err);
      toast({
        title: "Error",
        description: "Failed to end session. Please try again.",
        variant: "destructive"
      });
    }
  }, [session, userRole, toast]);

  return {
    session,
    isLoading,
    error,
    createSession,
    joinSession,
    startSession,
    endSession,
    canStartSession: userRole === 'teacher' && session?.session_status === 'waiting',
    canJoinVideo: session?.session_status === 'started',
    isWaitingForTeacher: userRole === 'student' && session?.session_status === 'waiting'
  };
}
