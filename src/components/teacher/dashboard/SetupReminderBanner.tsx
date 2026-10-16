import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Video, Wifi, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AVTestDialog } from './AVTestDialog';
import { SpeedTestDialog } from './SpeedTestDialog';
import {
  dismissForLesson,
  getCheckedOn,
  getDismissedLesson,
  markCheckedToday,
  minutesUntil,
  shouldShowSetupReminder,
} from '@/lib/classroom/setupReminder';

/**
 * A gentle "your lesson starts soon - check your camera, microphone and connection" nudge. It reuses the dashboard's
 * existing System Check dialogs and the same next-lesson query as NextLessonCard (so no extra request), and it is
 * only shown within 90 minutes before a lesson, until the teacher has checked today or said "not now".
 */
export const SetupReminderBanner: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState<'av' | 'speed' | null>(null);
  const [tick, setTick] = useState(0);

  const { data: lessons } = useQuery({
    queryKey: ['teacher-next-lesson', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.rpc('get_teacher_upcoming_lessons', { teacher_uuid: user.id });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
    refetchInterval: 60_000,
  });

  // Re-evaluate every minute so the countdown and the 90-minute window stay current without a refetch.
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const next = (lessons as Array<{ id: string; scheduled_at: string; student_name?: string | null }> | undefined)?.[0] ?? null;
  const now = new Date();
  const scheduledAt = next ? new Date(next.scheduled_at) : null;
  const show = shouldShowSetupReminder({
    now,
    scheduledAt,
    lessonId: next?.id ?? null,
    checkedOn: getCheckedOn(),
    dismissedLessonId: getDismissedLesson(),
  });
  void tick;

  const startCheck = (which: 'av' | 'speed') => {
    markCheckedToday();
    setOpen(which);
  };

  return (
    <>
      {show && next && scheduledAt && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900 dark:bg-sky-950/30">
          <div className="min-w-0">
            <p className="font-medium text-foreground">
              Your lesson{next.student_name ? ` with ${next.student_name}` : ''} starts in {minutesUntil(now, scheduledAt)} min
            </p>
            <p className="text-sm text-muted-foreground">Take one minute to check your camera, microphone and connection.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" className="gap-2" onClick={() => startCheck('av')}><Video className="h-4 w-4" />Check camera &amp; mic</Button>
            <Button size="sm" variant="outline" className="gap-2" onClick={() => startCheck('speed')}><Wifi className="h-4 w-4" />Speed test</Button>
            <Button size="sm" variant="ghost" className="gap-1" onClick={() => { dismissForLesson(next.id); setTick((n) => n + 1); }} aria-label="Not now">
              <X className="h-4 w-4" />Not now
            </Button>
          </div>
        </div>
      )}
      <AVTestDialog open={open === 'av'} onOpenChange={(o) => !o && setOpen(null)} />
      <SpeedTestDialog open={open === 'speed'} onOpenChange={(o) => !o && setOpen(null)} />
    </>
  );
};

export default SetupReminderBanner;
