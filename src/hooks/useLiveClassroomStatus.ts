import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface LiveClassroomStatus {
  isLive: boolean;
  roomId: string | null;
  classroomUrl: string | null;
}

/**
 * Detects whether the current user has an active classroom session.
 *
 * Teacher flow: queries classroom_sessions WHERE teacher_id = auth.uid() AND session_status = 'active'
 * Student flow: cross-references class_bookings session_ids with classroom_sessions.room_id
 *
 * Subscribes to real-time updates so the badge appears within seconds of the teacher opening the room.
 */
export function useLiveClassroomStatus(role: 'teacher' | 'student'): LiveClassroomStatus {
  const { user } = useAuth();
  const [status, setStatus] = useState<LiveClassroomStatus>({
    isLive: false,
    roomId: null,
    classroomUrl: null,
  });

  const checkLiveStatus = useCallback(async () => {
    if (!user?.id) return;

    if (role === 'teacher') {
      const { data, error } = await supabase
        .from('classroom_sessions')
        .select('room_id')
        .eq('teacher_id', user.id)
        .eq('session_status', 'active')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setStatus({
          isLive: true,
          roomId: data.room_id,
          classroomUrl: `/classroom/${data.room_id}`,
        });
      } else {
        setStatus({ isLive: false, roomId: null, classroomUrl: null });
      }
    } else {
      // Student: get their confirmed bookings and check if any session_id is live
      const { data: bookings, error: bookingError } = await supabase
        .from('class_bookings')
        .select('session_id')
        .eq('student_id', user.id)
        .in('status', ['confirmed', 'in_progress'])
        .not('session_id', 'is', null);

      if (bookingError || !bookings?.length) {
        setStatus({ isLive: false, roomId: null, classroomUrl: null });
        return;
      }

      const sessionIds = bookings.map((b) => b.session_id).filter(Boolean) as string[];

      const { data: sessions, error: sessionError } = await supabase
        .from('classroom_sessions')
        .select('room_id')
        .in('room_id', sessionIds)
        .eq('session_status', 'active')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!sessionError && sessions) {
        setStatus({
          isLive: true,
          roomId: sessions.room_id,
          classroomUrl: `/classroom/${sessions.room_id}`,
        });
      } else {
        setStatus({ isLive: false, roomId: null, classroomUrl: null });
      }
    }
  }, [user?.id, role]);

  useEffect(() => {
    checkLiveStatus();

    // Subscribe to real-time changes on classroom_sessions
    const channel = supabase
      .channel(`live-status-${user?.id}-${role}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'classroom_sessions',
        },
        () => {
          checkLiveStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [checkLiveStatus, user?.id, role]);

  return status;
}
