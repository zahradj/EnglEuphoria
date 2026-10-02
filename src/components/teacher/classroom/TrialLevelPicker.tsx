import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { normalizeCefr } from '@/services/activeCoreLessonResolver';

const LEVELS = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'];

interface Props {
  bookingId: string;
  /** The level the class opened with (saved trial level, else placement). */
  initialLevel?: string | null;
  classStarted?: boolean;
}

/**
 * Trial-class level picker. The teacher decides the student's level; the
 * `set_trial_level` RPC saves it everywhere at once — the student's profile
 * and dashboard level, a trial placement result, and the learning path
 * (current-lesson pointer → Unit 1 Lesson 1 of that level) — and pins this
 * booking to that lesson, so both screens reload into it.
 */
export const TrialLevelPicker: React.FC<Props> = ({ bookingId, initialLevel, classStarted = false }) => {
  const [level, setLevel] = useState<string | null>(normalizeCefr(initialLevel));
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  useEffect(() => {
    if (!saving) setLevel(normalizeCefr(initialLevel));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLevel]);

  const pick = async (next: string) => {
    if (saving || next === level) return;
    if (classStarted) {
      const ok = window.confirm(
        `Set the student's level to ${next}?\n\nThis saves ${next} on their profile and learning path, and opens ${next} Unit 1 Lesson 1 for both of you.`,
      );
      if (!ok) return;
    }
    setSaving(next);
    try {
      const { data, error } = await (supabase as any).rpc('set_trial_level', {
        p_booking_id: bookingId,
        p_cefr: next,
      });
      if (error) throw error;
      const saved = normalizeCefr(data?.level) ?? next;
      setLevel(saved);

      try {
        const channel = supabase.channel(`classroom-events:${bookingId}`);
        await channel.subscribe();
        await channel.send({
          type: 'broadcast',
          event: 'lesson_switched',
          payload: { lessonId: data?.lesson_id ?? null, lessonTitle: `${saved} · Unit 1 Lesson 1` },
        });
        supabase.removeChannel(channel);
      } catch (e) {
        console.warn('[TrialLevelPicker] broadcast failed', e);
      }

      await qc.invalidateQueries({ queryKey: ['classroom-booking'] });
      await qc.invalidateQueries({ queryKey: ['classroom-trial-cefr'] });
      await qc.invalidateQueries({ queryKey: ['classroom-resolved-lesson'] });
      toast({
        title: `Level saved: ${saved}`,
        description: data?.lesson_id
          ? "Saved on the student's profile and learning path. Opening Unit 1 Lesson 1…"
          : `Saved on the student's profile. No ${saved} lesson is published for this hub yet.`,
      });
    } catch (e: any) {
      toast({ title: 'Could not save the level', description: e?.message ?? 'Please try again.', variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="flex items-center gap-1 h-8 rounded-md bg-background/80 backdrop-blur border border-border/60 px-1.5">
      <span className="text-[11px] font-semibold text-muted-foreground pr-1">Trial level</span>
      {LEVELS.map((l) => {
        const active = l === level;
        return (
          <button
            key={l}
            type="button"
            disabled={!!saving}
            onClick={() => pick(l)}
            title={active ? `Saved level: ${l}` : `Set level to ${l}`}
            className={
              'h-6 min-w-[2.25rem] rounded px-1.5 text-[11px] font-bold transition-colors disabled:opacity-60 ' +
              (active
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-muted')
            }
          >
            {saving === l ? <Loader2 className="h-3 w-3 animate-spin inline" /> : l}
          </button>
        );
      })}
    </div>
  );
};

export default TrialLevelPicker;
