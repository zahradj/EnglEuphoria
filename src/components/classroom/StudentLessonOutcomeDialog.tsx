import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { IncidentFlag, STUDENT_FLAG_OPTIONS, FLAG_META } from './incidentFlags';
import { getClassroomHubTheme, type ClassroomHubKey } from '@/components/teacher/classroom/hubClassroomTheme';

interface Props {
  roomId: string;
  onDone?: () => void;
  hubType?: ClassroomHubKey | 'professional' | string;
}

/**
 * Lightweight student-side incident report shown on the Post-Lesson Summary.
 * Pops up once per room_id, until a row exists or the student dismisses it.
 */
export const StudentLessonOutcomeDialog: React.FC<Props> = ({ roomId, onDone, hubType = 'academy' }) => {
  const theme = getClassroomHubTheme(hubType);
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'outcome' | 'flags'>('outcome');
  const [flags, setFlags] = useState<IncidentFlag[]>([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Open if no prior report exists for this student/room
  useEffect(() => {
    if (!user?.id || !roomId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('lesson_incident_reports')
        .select('id')
        .eq('room_id', roomId)
        .eq('reporter_id', user.id)
        .maybeSingle();
      if (!cancelled && !data) setOpen(true);
    })();
    return () => { cancelled = true; };
  }, [user?.id, roomId]);

  const toggle = (f: IncidentFlag) =>
    setFlags((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const submit = async (outcome: 'completed' | 'not_completed') => {
    if (!user?.id) return;
    setSubmitting(true);
    const { error } = await supabase.from('lesson_incident_reports').upsert(
      {
        room_id: roomId,
        reporter_id: user.id,
        reporter_role: 'student',
        outcome,
        flags,
        notes: notes.trim() || null,
      },
      { onConflict: 'room_id,reporter_id' },
    );
    setSubmitting(false);
    if (error) {
      toast({ title: 'Could not save', description: error.message, variant: 'destructive' });
      return;
    }
    // Trigger AI Senior Engineer verdict (fire-and-forget)
    supabase.functions.invoke('classroom-incident-verdict', { body: { room_id: roomId } })
      .catch((e) => console.warn('verdict invoke failed', e));
    toast({ title: 'Thanks for the feedback! 💛' });
    setOpen(false);
    onDone?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>How was your class?</DialogTitle>
        </DialogHeader>

        {step === 'outcome' ? (
          // Just a thumbs up or down — the easiest possible answer for a child.
          // 👍 saves "all good" in one tap; 👎 opens the short "what
          // happened?" list so real problems still get reported.
          <div className="grid grid-cols-2 gap-4 py-3">
            <button
              onClick={() => submit('completed')}
              disabled={submitting}
              aria-label="Good class"
              className="rounded-3xl border-2 border-emerald-200 bg-emerald-50 hover:border-emerald-400 hover:scale-[1.03] active:scale-95 transition p-6 flex flex-col items-center gap-2"
            >
              <span className="text-7xl leading-none">👍</span>
              <span className="text-lg font-bold text-emerald-800">Good</span>
            </button>
            <button
              onClick={() => setStep('flags')}
              disabled={submitting}
              aria-label="Not a good class"
              className="rounded-3xl border-2 border-rose-200 bg-rose-50 hover:border-rose-400 hover:scale-[1.03] active:scale-95 transition p-6 flex flex-col items-center gap-2"
            >
              <span className="text-7xl leading-none">👎</span>
              <span className="text-lg font-bold text-rose-800">Not good</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            <p className="text-sm text-slate-600">What went wrong? Tap anything that happened:</p>
            <div className="flex flex-wrap gap-2">
              {STUDENT_FLAG_OPTIONS.map((f) => {
                const meta = FLAG_META[f];
                const active = flags.includes(f);
                return (
                  <button
                    key={f}
                    onClick={() => toggle(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                      active
                        ? `text-white border-transparent ${theme.buttonPrimary}`
                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {meta.emoji} {meta.label}
                  </button>
                );
              })}
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything to add? (optional)"
              className="text-sm min-h-[60px]"
            />
            <div className="flex justify-between gap-2 pt-1">
              <Button variant="ghost" onClick={() => setStep('outcome')}>Back</Button>
              <Button
                onClick={() => submit('not_completed')}
                disabled={submitting || flags.length === 0}
                className={`text-white ${theme.buttonPrimary}`}
              >
                {submitting ? 'Saving…' : 'Send report'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
