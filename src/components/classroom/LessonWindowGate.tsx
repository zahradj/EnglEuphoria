import React from 'react';
import { Loader2, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isLiveNow, windowCloseMs, type SessionTimes } from '@/services/lessonTiming';

export type ClassroomHub = 'playground' | 'academy' | 'professional';

/** Hub-aware booked lesson duration in minutes. */
export function bookedMinutesFor(
  hubType: ClassroomHub | null | undefined,
  fallbackDuration?: number | null,
): number {
  if (typeof fallbackDuration === 'number' && fallbackDuration > 0) return fallbackDuration;
  return hubType === 'playground' ? 30 : 60;
}

export interface LessonWindowGateProps {
  scheduledAt: string | Date | null | undefined;
  bookedMinutes: number;
  /** Admin / super-user bypass. */
  bypass?: boolean;
  /** Minutes before scheduled_at the classroom unlocks. Default 30. */
  earlyOpenMinutes?: number;
  /** Minutes of bonus / overtime after the booked end. Default 5. */
  bonusMinutes?: number;
  /** The live session (joins + heartbeats). A class that started late gets its
   *  full booked time, and a class that is still live never closes on a refresh. */
  session?: SessionTimes | null;
  /** True until the session row has loaded (the gate waits instead of closing). */
  sessionLoading?: boolean;
  children: React.ReactNode;
}

/**
 * Gates the classroom to its real lesson window.
 *  - Opens `earlyOpenMinutes` before `scheduled_at`
 *  - Closes `bookedMinutes + bonusMinutes` after the real start (the booked
 *    start, or later if both joined later) — but never while the class is
 *    still live (a teacher or student heartbeat in the last 3 minutes), so a
 *    refresh during an over-running class doesn't lock anyone out.
 * Outside that range a friendly screen is shown instead of the classroom.
 */
export const LessonWindowGate: React.FC<LessonWindowGateProps> = ({
  scheduledAt,
  bookedMinutes,
  bypass = false,
  earlyOpenMinutes = 30,
  bonusMinutes = 5,
  session,
  sessionLoading = false,
  children,
}) => {
  if (bypass || !scheduledAt) return <>{children}</>;

  const startMs =
    scheduledAt instanceof Date ? scheduledAt.getTime() : new Date(scheduledAt).getTime();
  if (!Number.isFinite(startMs)) return <>{children}</>;

  const nowMs = Date.now();
  const openMs = startMs - earlyOpenMinutes * 60_000;
  const closeMs = windowCloseMs(startMs, bookedMinutes, bonusMinutes, session);

  if (nowMs < openMs) {
    const opensIn = Math.ceil((openMs - nowMs) / 60_000);
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Loader2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Classroom not open yet</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            This lesson opens {earlyOpenMinutes} minutes before its scheduled start.
            <br />
            Opens in <strong>{opensIn} min</strong> ({new Date(startMs).toLocaleString()}).
          </p>
          <Button onClick={() => window.history.back()} variant="outline">Go back</Button>
        </div>
      </div>
    );
  }

  if (nowMs > closeMs && !isLiveNow(session, nowMs)) {
    if (sessionLoading) {
      return (
        <div className="min-h-dvh flex items-center justify-center bg-background">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      );
    }
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
            <ShieldOff className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Lesson finished</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The {bookedMinutes}-minute lesson window has closed.
            Head to your post-lesson summary for feedback and homework.
          </p>
          <Button onClick={() => window.history.back()} variant="outline">Go back</Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
