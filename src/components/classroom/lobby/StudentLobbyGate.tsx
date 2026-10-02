import React from 'react';
import { Loader2, CheckCircle2, Clock } from 'lucide-react';
import { useClassroomLobby } from '@/hooks/classroom/useClassroomLobby';

interface Props {
  bookingId: string;
  studentId: string;
  teacherName: string;
  children: React.ReactNode;
}

/**
 * Holds the student in a waiting room until the teacher presses "Start classroom",
 * then shows the classroom. Wrap everything a student mounts when entering the class
 * (the classroom itself AND its heartbeat/lifecycle) so nothing counts the student as
 * "joined" while they are still waiting.
 */
export const StudentLobbyGate: React.FC<Props> = ({ bookingId, studentId, teacherName, children }) => {
  const { started, loading, otherHere: teacherHere } = useClassroomLobby({ bookingId, role: 'student', userId: studentId });

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background" role="status" aria-label="Checking your class">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (started) return <>{children}</>;

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-background to-muted p-6">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <Clock className="h-12 w-12 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Waiting for your teacher</h1>
          <p className="text-muted-foreground leading-relaxed">
            {teacherName} will start the class in a moment. Stay on this page — the classroom opens by itself.
          </p>
        </div>
        <div
          className="mx-auto inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm"
          aria-live="polite"
        >
          {teacherHere ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Your teacher is here
            </>
          ) : (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> Your teacher hasn&apos;t arrived yet
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentLobbyGate;
