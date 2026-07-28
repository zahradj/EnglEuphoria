import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type HubType = 'playground' | 'academy' | 'professional';

const HUB_TO_TARGET_SYSTEM: Record<HubType, string[]> = {
  playground: ['playground', 'kids'],
  academy: ['academy', 'teens'],
  professional: ['success', 'professional', 'adults'],
};

// CEFR ordering for the curriculum sequence — anything not in this list
// sorts after, alphabetically.
const LEVEL_ORDER = ['pre-a1', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

interface LessonRow {
  id: string;
  title: string;
  slot_cefr_level: string | null;
  slot_unit_number: number | null;
  slot_lesson_number: number | null;
}

interface Props {
  bookingId: string;
  studentId?: string;
  hubType: HubType;
  currentLessonId?: string | null;
  currentLessonTitle?: string | null;
  /** When true, the class is already live and a swap will show a confirm. */
  classStarted?: boolean;
}

/**
 * Teacher-side curriculum stepper. Moves the class to the previous or next
 * lesson in the hub's sequence (Pre-A1 -> A1 -> A2..., unit, then lesson
 * number) rather than letting the teacher jump anywhere in the catalog.
 * Persists the choice to `class_bookings.curriculum_lesson_id` (preferred by
 * resolver on re-entry) AND `student_curriculum_progress.current_lesson_id`
 * (drives future bookings). Broadcasts a `lesson_switched` event on the
 * classroom realtime channel so the student sees a toast.
 */
export const LessonSwitcher: React.FC<Props> = ({
  bookingId,
  studentId,
  hubType,
  currentLessonId,
  currentLessonTitle,
  classStarted = false,
}) => {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: lessons, isLoading } = useQuery({
    queryKey: ['lesson-switcher-catalog', hubType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('curriculum_lessons')
        .select('id, title, slot_cefr_level, slot_unit_number, slot_lesson_number')
        .in('target_system', HUB_TO_TARGET_SYSTEM[hubType])
        .eq('is_published', true)
        .limit(500);
      if (error) throw error;
      return (data ?? []) as LessonRow[];
    },
    staleTime: 60_000,
  });

  // Ordered by CEFR level, then unit, then lesson — the actual curriculum
  // sequence, not creation order or raw alphabetical sort.
  const sequence = useMemo(() => {
    return [...(lessons ?? [])].sort((a, b) => {
      const ai = LEVEL_ORDER.indexOf((a.slot_cefr_level ?? '').toLowerCase());
      const bi = LEVEL_ORDER.indexOf((b.slot_cefr_level ?? '').toLowerCase());
      const aLevel = ai === -1 ? LEVEL_ORDER.length : ai;
      const bLevel = bi === -1 ? LEVEL_ORDER.length : bi;
      if (aLevel !== bLevel) return aLevel - bLevel;
      const aUnit = a.slot_unit_number ?? Number.MAX_SAFE_INTEGER;
      const bUnit = b.slot_unit_number ?? Number.MAX_SAFE_INTEGER;
      if (aUnit !== bUnit) return aUnit - bUnit;
      const aLesson = a.slot_lesson_number ?? Number.MAX_SAFE_INTEGER;
      const bLesson = b.slot_lesson_number ?? Number.MAX_SAFE_INTEGER;
      return aLesson - bLesson;
    });
  }, [lessons]);

  const currentIndex = useMemo(
    () => sequence.findIndex((l) => l.id === currentLessonId),
    [sequence, currentLessonId],
  );
  const prevLesson = currentIndex > 0 ? sequence[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < sequence.length - 1 ? sequence[currentIndex + 1] : null;

  const handlePick = async (lessonId: string, lessonTitle: string) => {
    if (!studentId) {
      toast({ title: 'No student', description: 'Cannot switch lesson without a student.', variant: 'destructive' });
      return;
    }
    if (classStarted) {
      const ok = window.confirm(
        'The class is already live. Switching lessons will replace the current slides for both you and the student.\n\nContinue?',
      );
      if (!ok) return;
    }
    setSaving(true);
    try {
      // Persist on the booking (preferred by resolver) + null legacy lesson_id.
      await (supabase as any)
        .from('class_bookings')
        .update({ curriculum_lesson_id: lessonId, lesson_id: null })
        .eq('id', bookingId);

      // Also advance the student's Master Library pointer for future bookings.
      await supabase
        .from('student_curriculum_progress')
        .upsert(
          { student_id: studentId, current_lesson_id: lessonId, last_activity_at: new Date().toISOString() },
          { onConflict: 'student_id' },
        );

      // Audit trail — best-effort, never blocks the switch.
      try {
        const { data: authData } = await supabase.auth.getUser();
        await supabase.from('audit_logs').insert({
          user_id: authData?.user?.id ?? null,
          action: 'lesson_switched',
          resource_type: 'class_booking',
          resource_id: bookingId,
          old_values: { curriculum_lesson_id: currentLessonId ?? null, class_started: classStarted },
          new_values: { curriculum_lesson_id: lessonId, lesson_title: lessonTitle },
        });
      } catch (e) {
        console.warn('[LessonSwitcher] audit log failed', e);
      }

      // Broadcast so the student's classroom shows a toast + refreshes.
      try {
        const channel = supabase.channel(`classroom-events:${bookingId}`);
        await channel.subscribe();
        await channel.send({
          type: 'broadcast',
          event: 'lesson_switched',
          payload: { lessonId, lessonTitle },
        });
        supabase.removeChannel(channel);
      } catch (e) {
        console.warn('[LessonSwitcher] broadcast failed', e);
      }

      await qc.invalidateQueries({ queryKey: ['classroom-resolved-lesson'] });
      toast({ title: 'Lesson switched', description: 'Loading the new lesson…' });
    } catch (e: any) {
      toast({ title: 'Switch failed', description: e?.message ?? 'Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-1 h-8 rounded-md bg-background/80 backdrop-blur border border-border/60 px-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        disabled={!prevLesson || saving || isLoading}
        title={prevLesson ? `Previous: ${prevLesson.title}` : 'No previous lesson'}
        onClick={() => prevLesson && handlePick(prevLesson.id, prevLesson.title)}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </Button>
      <span className="max-w-[180px] truncate text-xs px-1">
        {saving || isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin inline" /> : (currentLessonTitle ?? 'No lesson selected')}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        disabled={!nextLesson || saving || isLoading}
        title={nextLesson ? `Next: ${nextLesson.title}` : 'No next lesson'}
        onClick={() => nextLesson && handlePick(nextLesson.id, nextLesson.title)}
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};

export default LessonSwitcher;
