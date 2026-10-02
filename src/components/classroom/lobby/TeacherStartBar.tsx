import React from 'react';
import { Loader2, CheckCircle2, PlayCircle } from 'lucide-react';
import { useClassroomLobby } from '@/hooks/classroom/useClassroomLobby';

interface Props {
  bookingId: string;
  teacherId: string;
  studentName: string;
}

/**
 * Floating bar for the teacher until the class is started: shows whether the student
 * is waiting and holds the "Start classroom" button. Disappears once started.
 * It never blocks the teacher — they can prepare the lesson while they wait.
 */
export const TeacherStartBar: React.FC<Props> = ({ bookingId, teacherId, studentName }) => {
  const { started, loading, otherHere: studentHere, start, starting, startError } = useClassroomLobby({
    bookingId,
    role: 'teacher',
    userId: teacherId,
  });

  if (loading || started) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-[60] flex justify-center px-3">
      <div
        className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-3 rounded-2xl border bg-card/95 px-4 py-2.5 shadow-xl backdrop-blur"
        role="region"
        aria-label="Start classroom"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-foreground" aria-live="polite">
          {studentHere ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {studentName} is here
            </>
          ) : (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> Waiting for {studentName} to join…
            </>
          )}
        </span>
        <button
          type="button"
          onClick={() => void start()}
          disabled={starting}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-bold text-white shadow transition hover:bg-emerald-700 active:scale-95 disabled:opacity-60"
        >
          {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
          Start classroom
        </button>
        {startError && (
          <span className="w-full text-center text-xs text-destructive" role="alert">
            {startError}
          </span>
        )}
      </div>
    </div>
  );
};

export default TeacherStartBar;
