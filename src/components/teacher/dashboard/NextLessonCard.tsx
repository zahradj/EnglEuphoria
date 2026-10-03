import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  Video,
  ChevronRight,
  Loader2,
  Radio,
  CalendarClock,
  Hourglass
} from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { useNextClassCountdown } from '@/hooks/useNextClassCountdown';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useLiveClassroomStatus } from '@/hooks/useLiveClassroomStatus';
import { cn } from '@/lib/utils';
import { formatTimeRange } from '@/lib/timeRange';

/** First letter of the student's name, for the avatar. */
const initial = (name: string) => (name?.trim()[0] || '?').toUpperCase();

/** "Today" / "Tomorrow" / "Mon, Jan 5" — friendlier than a bare date for a single upcoming lesson. */
const friendlyDay = (date: Date) => {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'EEE, MMM d');
};

interface NextLessonCardProps {
  disabled?: boolean;
}

export const NextLessonCard: React.FC<NextLessonCardProps> = ({ disabled = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch real upcoming lesson from DB using the existing RPC
  const { data: lessons, isLoading } = useQuery({
    queryKey: ['teacher-next-lesson', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.rpc('get_teacher_upcoming_lessons', {
        teacher_uuid: user.id,
      });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
    refetchInterval: 60_000, // refresh every minute
  });

  const nextLesson = lessons?.[0] ?? null;
  const scheduledAt = nextLesson ? new Date(nextLesson.scheduled_at) : null;

  const { formattedTime, isStartingSoon, hasStarted } = useNextClassCountdown(scheduledAt);
  const liveStatus = useLiveClassroomStatus('teacher');

  // Consider it "live" if the hook detects an active session OR the lesson has started
  const isSessionLive = liveStatus.isLive && !!nextLesson &&
    (liveStatus.roomId === nextLesson.room_id || liveStatus.roomId === nextLesson.id);

  const handleEnterClassroom = () => {
    if (isSessionLive && liveStatus.classroomUrl) {
      navigate(liveStatus.classroomUrl);
      return;
    }
    if (!nextLesson) {
      navigate('/teacher/schedule');
      return;
    }
    // Prefer the canonical class_booking_id; fall back to id (which is also the booking id
    // in the updated RPC) so the unified classroom resolver can locate the room.
    const targetId = (nextLesson as any).class_booking_id || nextLesson.id;
    navigate(`/classroom/${targetId}`);
  };

  const getBadgeContent = () => {
    if (!nextLesson) return 'No upcoming lessons';
    if (hasStarted) return 'Starting Now!';
    return `In ${formattedTime}`;
  };

  const getBadgeVariant = (): 'default' | 'secondary' | 'destructive' => {
    if (!nextLesson) return 'secondary';
    if (hasStarted) return 'destructive';
    if (isStartingSoon) return 'default';
    return 'secondary';
  };

  const end = scheduledAt && nextLesson ? new Date(scheduledAt.getTime() + (Number(nextLesson.duration) || 30) * 60_000) : null;
  const hot = !!nextLesson && (isStartingSoon || hasStarted || isSessionLive);

  return (
    <Card className="relative overflow-hidden rounded-3xl border-primary/15 shadow-lg shadow-primary/5">
      {/* Soft colour wash behind the whole card */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-emerald-400/10" aria-hidden />
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/15 blur-3xl" aria-hidden />

      <CardHeader className="relative pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2.5 text-lg">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-500 shadow-md shadow-primary/25">
              <Video className="h-4.5 w-4.5 text-white" />
            </span>
            Next Lesson
          </CardTitle>
          <div className="flex items-center gap-2">
            {isSessionLive && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                <Radio className="h-3 w-3 animate-pulse" />
                LIVE
              </span>
            )}
            {!isLoading && (
              <Badge
                variant={getBadgeVariant()}
                className={cn('rounded-full px-3 py-1 text-xs font-bold', hot && 'animate-pulse bg-emerald-500 text-white hover:bg-emerald-500')}
              >
                {isSessionLive ? 'In Session!' : getBadgeContent()}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4 pt-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !nextLesson ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/15 to-emerald-400/15">
              <CalendarClock className="h-7 w-7 text-primary" />
            </div>
            <p className="text-sm font-bold text-foreground">No upcoming lessons</p>
            <p className="max-w-[260px] text-xs text-muted-foreground">
              When a student books one of your slots, or you invite one, the next lesson shows up here.
            </p>
          </div>
        ) : (
          <>
            {/* Student */}
            <div className="flex items-center gap-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-500 text-xl font-extrabold text-white shadow-lg shadow-primary/25">
                {initial(nextLesson.student_name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-extrabold leading-tight text-foreground">
                  {nextLesson.student_name || 'Student'}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {nextLesson.title || 'English Lesson'}
                </p>
              </div>
            </div>

            {/* When */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-card/80 px-3 py-2.5 text-center ring-1 ring-border/60">
                <Calendar className="mx-auto mb-1 h-4 w-4 text-primary" />
                <p className="text-[13px] font-extrabold text-foreground">{friendlyDay(new Date(nextLesson.scheduled_at))}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Day</p>
              </div>
              <div className="rounded-2xl bg-card/80 px-3 py-2.5 text-center ring-1 ring-border/60">
                <Clock className="mx-auto mb-1 h-4 w-4 text-primary" />
                <p className="text-[13px] font-extrabold text-foreground">
                  {end ? formatTimeRange(new Date(nextLesson.scheduled_at), end) : format(new Date(nextLesson.scheduled_at), 'h:mm a')}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Time</p>
              </div>
              <div className="rounded-2xl bg-card/80 px-3 py-2.5 text-center ring-1 ring-border/60">
                <Hourglass className="mx-auto mb-1 h-4 w-4 text-primary" />
                <p className="text-[13px] font-extrabold text-foreground">{nextLesson.duration} min</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Length</p>
              </div>
            </div>
          </>
        )}

        {nextLesson && (
          <Button
            onClick={handleEnterClassroom}
            size="lg"
            disabled={disabled}
            className={cn(
              'w-full rounded-2xl text-white transition-all duration-300 hover:brightness-110',
              isSessionLive
                ? 'animate-pulse bg-gradient-to-r from-red-500 to-rose-600 shadow-lg shadow-red-500/30'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25',
            )}
          >
            {isSessionLive ? (
              <>
                <Radio className="mr-2 h-5 w-5 animate-pulse" />
                Join LIVE Class
              </>
            ) : (
              <>
                <Video className="mr-2 h-5 w-5" />
                Enter Classroom
                <ChevronRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        )}

        {disabled && (
          <p className="text-center text-xs text-muted-foreground">
            Available after profile approval
          </p>
        )}
      </CardContent>
    </Card>
  );
};
