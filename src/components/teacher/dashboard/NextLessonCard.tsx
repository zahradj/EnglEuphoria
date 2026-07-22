import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  User, 
  Video,
  ChevronRight,
  Loader2,
  Radio
} from 'lucide-react';
import { format } from 'date-fns';
import { useNextClassCountdown } from '@/hooks/useNextClassCountdown';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useLiveClassroomStatus } from '@/hooks/useLiveClassroomStatus';

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
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-3">
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
          <div className="text-center py-6">
            <p className="text-muted-foreground text-sm">No upcoming lessons scheduled.</p>
            <p className="text-muted-foreground text-xs mt-1">
              Students will appear here once they book a slot.
            </p>
          </div>
        ) : (
          <>
            {/* Date & Time */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(nextLesson.scheduled_at), 'EEEE, MMM d')}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{format(new Date(nextLesson.scheduled_at), 'h:mm a')}</span>
              </div>
            </div>

            {/* Lesson Title */}
            <div>
              <p className="font-semibold text-foreground">
                {nextLesson.title || 'English Lesson'}
              </p>
            </div>

            {/* Student Info */}
            <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {nextLesson.student_name || 'Student'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {nextLesson.duration} min session
                </p>
              </div>
            </div>

            {/* Classroom access is shown only when a real upcoming lesson exists. */}
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
