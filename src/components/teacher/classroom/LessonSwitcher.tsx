import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { BookOpen, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type HubType = 'playground' | 'academy' | 'professional';

const HUB_TO_TARGET_SYSTEM: Record<HubType, string[]> = {
  playground: ['playground', 'kids'],
  academy: ['academy', 'teens'],
  professional: ['success', 'professional', 'adults'],
};

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
 * Teacher-side Master Library lesson picker.
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
  const [open, setOpen] = useState(false);
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
        .order('slot_cefr_level', { ascending: true, nullsFirst: false })
        .order('slot_unit_number', { ascending: true, nullsFirst: false })
        .order('slot_lesson_number', { ascending: true, nullsFirst: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as LessonRow[];
    },
    enabled: open,
    staleTime: 60_000,
  });

  const handlePick = async (lessonId: string, lessonTitle: string) => {
    if (!studentId) {
      toast({ title: 'No student', description: 'Cannot switch lesson without a student.', variant: 'destructive' });
      return;
    }
    if (classStarted) {
      const ok = window.confirm(
        'The class is already live. Switching the Master Library lesson will replace the current slides for both you and the student.\n\nContinue?',
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
      setOpen(false);
    } catch (e: any) {
      toast({ title: 'Switch failed', description: e?.message ?? 'Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 bg-background/80 backdrop-blur border-border/60"
          title="Switch Master Library lesson"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span className="max-w-[220px] truncate text-xs">
            {currentLessonTitle ?? 'Pick a lesson'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search Master Library…" />
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isLoading && (
              <>
                <CommandEmpty>No lessons found.</CommandEmpty>
                {(() => {
                  const groups = new Map<string, LessonRow[]>();
                  for (const l of lessons ?? []) {
                    const key = (l.slot_cefr_level ?? 'Unleveled').toUpperCase();
                    if (!groups.has(key)) groups.set(key, []);
                    groups.get(key)!.push(l);
                  }
                  const CEFR_ORDER = ['PRE-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'UNLEVELED'];
                  const ordered = [...groups.entries()].sort(
                    (a, b) => CEFR_ORDER.indexOf(a[0]) - CEFR_ORDER.indexOf(b[0]),
                  );
                  return ordered.map(([level, rows]) => (
                    <CommandGroup key={level} heading={level}>
                      {rows.map((l) => {
                        const label = [
                          l.slot_unit_number != null ? `U${l.slot_unit_number}` : null,
                          l.slot_lesson_number != null ? `L${l.slot_lesson_number}` : null,
                        ]
                          .filter(Boolean)
                          .join(' · ');
                        const isCurrent = l.id === currentLessonId;
                        return (
                          <CommandItem
                            key={l.id}
                            value={`${level} ${label} ${l.title}`}
                            disabled={saving}
                            onSelect={() => handlePick(l.id, l.title)}
                            className="flex items-center gap-2"
                          >
                            <Check
                              className={`h-3.5 w-3.5 ${isCurrent ? 'opacity-100 text-primary' : 'opacity-0'}`}
                            />
                            <span className="text-[10px] font-mono text-muted-foreground min-w-[52px]">
                              {label || '—'}
                            </span>
                            <span className="text-xs truncate flex-1">{l.title}</span>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  ));
                })()}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default LessonSwitcher;
