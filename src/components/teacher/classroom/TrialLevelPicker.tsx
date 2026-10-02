import React, { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ListChecks } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { normalizeCefr } from '@/services/activeCoreLessonResolver';
import {
  UnitKnowledgeChecklist,
  UNITS_PER_LEVEL,
  startUnitFor,
  toLevelMapHub,
  type UnitMarks,
} from './UnitKnowledgeChecklist';

const LEVELS = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'];
interface Props {
  bookingId: string;
  studentId?: string;
  hubType: 'playground' | 'academy' | 'professional';
  /** The level the class opened with (saved trial level, else placement). */
  initialLevel?: string | null;
  classStarted?: boolean;
}

/**
 * Trial-class level + prior-knowledge picker. The teacher picks the
 * student's level, then marks which of the level's 10 units (from the
 * curriculum blueprint, built or not) the student already knows. The path
 * starts at the first unit not known. `set_trial_start` saves it all — the
 * level on the profile/dashboard, the marks, and the learning path — and
 * pins this class to the lesson to teach now, so both screens reload.
 */
export const TrialLevelPicker: React.FC<Props> = ({ bookingId, studentId, hubType, initialLevel, classStarted = false }) => {
  const [level, setLevel] = useState<string | null>(normalizeCefr(initialLevel));
  const [startUnit, setStartUnit] = useState<number>(1);
  const [saving, setSaving] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [marks, setMarks] = useState<UnitMarks>({});
  const { toast } = useToast();
  const qc = useQueryClient();

  useEffect(() => {
    if (!saving) setLevel(normalizeCefr(initialLevel));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLevel]);

  // The marks saved so far (same level only).
  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any)
        .from('student_prior_knowledge')
        .select('cefr_level, start_unit, unit_marks')
        .eq('student_id', studentId)
        .maybeSingle();
      if (cancelled || !data) return;
      if (normalizeCefr(data.cefr_level) === normalizeCefr(initialLevel)) {
        setMarks((data.unit_marks ?? {}) as UnitMarks);
        setStartUnit(data.start_unit ?? 1);
      }
    })();
    return () => { cancelled = true; };
  }, [studentId, initialLevel]);

  const save = async (nextLevel: string, nextUnitMarks: UnitMarks, savingKey: string) => {
    const start = startUnitFor(nextUnitMarks);
    setSaving(savingKey);
    try {
      const { data, error } = await (supabase as any).rpc('set_trial_start', {
        p_booking_id: bookingId,
        p_cefr: nextLevel,
        p_start_unit: start,
        p_marks: nextUnitMarks,
      });
      if (error) throw error;
      const saved = normalizeCefr(data?.level) ?? nextLevel;
      setLevel(saved);
      setMarks(nextUnitMarks);
      setStartUnit(data?.start_unit ?? start);

      try {
        const channel = supabase.channel(`classroom-events:${bookingId}`);
        await channel.subscribe();
        await channel.send({
          type: 'broadcast',
          event: 'lesson_switched',
          payload: { lessonId: data?.lesson_id ?? null, lessonTitle: `${saved} · Unit ${data?.start_unit ?? start}` },
        });
        supabase.removeChannel(channel);
      } catch (e) {
        console.warn('[TrialLevelPicker] broadcast failed', e);
      }

      await qc.invalidateQueries({ queryKey: ['classroom-booking'] });
      await qc.invalidateQueries({ queryKey: ['classroom-trial-cefr'] });
      await qc.invalidateQueries({ queryKey: ['classroom-resolved-lesson'] });
      const unitText = `Unit ${data?.start_unit ?? start}`;
      toast({
        title: `Saved: ${saved} · starts at ${unitText}`,
        description: !data?.pointer_id
          ? `Saved on the student's profile. No ${saved} lessons exist for this hub yet.`
          : data?.start_built
            ? `Saved on the student's profile and learning path. Opening ${unitText}, Lesson 1…`
            : `Saved on the student's profile and learning path. ${unitText} isn't built yet — this class uses the nearest built lesson, and ${unitText} opens automatically once it's added.`,
      });
      return true;
    } catch (e: any) {
      toast({ title: 'Could not save', description: e?.message ?? 'Please try again.', variant: 'destructive' });
      return false;
    } finally {
      setSaving(null);
    }
  };

  const pickLevel = async (next: string) => {
    if (saving || next === level) return;
    if (classStarted) {
      const ok = window.confirm(
        `Set the student's level to ${next}?\n\nThis saves ${next} on their profile and learning path and opens ${next} Unit 1 for both of you. You can then mark the units they already know.`,
      );
      if (!ok) return;
    }
    await save(next, {}, next);
  };

  const draftStart = useMemo(() => startUnitFor(marks), [marks]);
  return (
    <>
      <div className="flex items-center gap-1 h-8 rounded-md bg-background/80 backdrop-blur border border-border/60 px-1.5">
        <span className="text-[11px] font-semibold text-muted-foreground pr-1">Trial level</span>
        {LEVELS.map((l) => {
          const active = l === level;
          return (
            <button
              key={l}
              type="button"
              disabled={!!saving}
              onClick={() => pickLevel(l)}
              title={active ? `Saved level: ${l}` : `Set level to ${l}`}
              className={
                'h-6 min-w-[2.25rem] rounded px-1.5 text-[11px] font-bold transition-colors disabled:opacity-60 ' +
                (active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted')
              }
            >
              {saving === l ? <Loader2 className="h-3 w-3 animate-spin inline" /> : l}
            </button>
          );
        })}
        <span className="mx-1 h-4 w-px bg-border" />
        <button
          type="button"
          disabled={!level || !!saving}
          onClick={() => setOpen(true)}
          title={level ? 'Mark the units the student already knows' : 'Pick a level first'}
          className="h-6 rounded px-1.5 text-[11px] font-bold text-foreground hover:bg-muted disabled:opacity-50 flex items-center gap-1"
        >
          <ListChecks className="h-3.5 w-3.5" />
          Prior knowledge · Unit {startUnit}
        </button>
      </div>

      <Dialog open={open} onOpenChange={(o) => !saving && setOpen(o)}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Prior knowledge · {level}</DialogTitle>
            <DialogDescription>
              Mark what the student already knows well. Their path starts at the first unit that isn't “Knows it”.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto -mx-1 px-1">
            {level && (
              <UnitKnowledgeChecklist hub={toLevelMapHub(hubType)} level={level} marks={marks} onChange={setMarks} />
            )}
          </div>

          <DialogFooter className="items-center gap-2 sm:justify-between">
            <div className="text-sm">
              Starts at <b>{level} · Unit {draftStart}, Lesson 1</b>
              {Object.values(marks).filter((m) => m === 'known').length === UNITS_PER_LEVEL && (
                <div className="text-xs text-amber-600">Knows the whole level — consider the next level.</div>
              )}
            </div>
            <Button
              disabled={!level || !!saving}
              onClick={async () => {
                if (level && (await save(level, marks, 'marks'))) setOpen(false);
              }}
            >
              {saving === 'marks' ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Save starting point
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TrialLevelPicker;
