import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { recordClassroomLessonCompletion } from '@/services/classroomLessonCompletion';

/**
 * Shared by both lesson players: when the STUDENT of a live class reaches the
 * finale, record the lesson as done (progress + words/sounds + Homework Quest)
 * so it shows up on their dashboard. The dashboard's own player passes
 * `onFinaleReached` and does this itself, so it opts out via `skip`.
 */
export function useRecordClassroomCompletion(opts: {
  scenes: unknown;
  isFinale: boolean;
  role?: 'teacher' | 'student';
  roomId?: string;
  skip?: boolean;
}) {
  const { user } = useAuth();
  const firedRef = useRef(false);
  const { scenes, isFinale, role, roomId, skip } = opts;

  useEffect(() => {
    if (!isFinale || firedRef.current || skip) return;
    if (role !== 'student' || !roomId || !user?.id) return;
    firedRef.current = true;
    void recordClassroomLessonCompletion(user.id, scenes);
  }, [isFinale, skip, role, roomId, user?.id, scenes]);
}
