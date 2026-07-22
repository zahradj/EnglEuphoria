import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
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
          <div className="grid grid-cols-2 gap-3 py-2">
            <button
              onClick={() => submit('completed')}
              disabled={submitting}
              className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:border-emerald-400 transition p-5 flex flex-col items-center gap-2"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              <span className="font-bold text-emerald-800">All good 👍</span>
              <span className="text-[11px] text-emerald-700/80 text-center">No problems</span>
            </button>
            <button
              onClick={() => setStep('flags')}
              disabled={submitting}
              className="rounded-2xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-rose-100 hover:border-rose-400 transition p-5 flex flex-col items-center gap-2"
            >
              <AlertTriangle className="w-10 h-10 text-rose-600" />
              <span className="font-bold text-rose-800">Something went wrong</span>
              <span className="text-[11px] text-rose-700/80 text-center">Flag the issue</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            <p className="text-sm text-slate-600">Tap anything that happened:</p>
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
