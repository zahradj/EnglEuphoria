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
  CalendarClock
} from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { useNextClassCountdown } from '@/hooks/useNextClassCountdown';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useLiveClassroomStatus } from '@/hooks/useLiveClassroomStatus';

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

  return (
    <Card className="overflow-hidden border-primary/10 shadow-sm">
      <CardHeader className="relative bg-gradient-to-br from-primary/15 via-primary/5 to-transparent pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            Next Lesson
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* LIVE badge — shows when session is active */}
            {isSessionLive && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-bold shadow-md">
                <Radio className="w-3 h-3 animate-pulse" />
                LIVE
              </span>
            )}
            {!isLoading && (
              <Badge
                variant={getBadgeVariant()}
                className={`${
                  (isStartingSoon || hasStarted || isSessionLive) && nextLesson
                    ? 'animate-pulse bg-emerald-500 text-white'
                    : ''
                }`}
              >
                {isSessionLive ? 'In Session!' : getBadgeContent()}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : !nextLesson ? (
          <div className="flex flex-col items-center text-center py-6 gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-1">
              <CalendarClock className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-foreground text-sm font-medium">No upcoming lessons scheduled</p>
            <p className="text-muted-foreground text-xs">
              Students will appear here once they book a slot.
            </p>
          </div>
        ) : (
          <>
            {/* Student + lesson title */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary ring-2 ring-primary/10">
                {initial(nextLesson.student_name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground truncate">
                  {nextLesson.student_name || 'Student'}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {nextLesson.title || 'English Lesson'}
                </p>
              </div>
            </div>

            {/* Date, time & duration */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm rounded-lg bg-muted/50 px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-foreground font-medium">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{friendlyDay(new Date(nextLesson.scheduled_at))}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{format(new Date(nextLesson.scheduled_at), 'h:mm a')}</span>
              </div>
              <span className="ml-auto text-xs text-muted-foreground">
                {nextLesson.duration} min
              </span>
            </div>
          </>
        )}

        {nextLesson && (
          <Button
            onClick={handleEnterClassroom}
            size="lg"
            disabled={disabled}
            className={`w-full transition-all duration-300 ${
              isSessionLive
                ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg shadow-red-500/30 animate-pulse'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25'
            }`}
          >
            {isSessionLive ? (
              <>
                <Radio className="w-5 h-5 mr-2 animate-pulse" />
                🔴 Join LIVE Class
              </>
            ) : (
              <>
                <Video className="w-5 h-5 mr-2" />
                Enter Classroom
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        )}

        {disabled && (
          <p className="text-xs text-center text-muted-foreground">
            Available after profile approval
          </p>
        )}
      </CardContent>
    </Card>
  );
};
