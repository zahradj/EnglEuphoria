import { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { normalizeCefr } from '@/services/activeCoreLessonResolver';
import {
  UnitKnowledgeChecklist,
  startUnitFor,
  toLevelMapHub,
  type UnitMarks,
} from '@/components/teacher/classroom/UnitKnowledgeChecklist';

const CEFR_LEVELS = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

interface LevelChangeRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: { id: string; name: string; level?: string; hub?: string | null } | null;
  /** The class it's sent from, if any (shown to the admin). */
  bookingId?: string | null;
}

interface LatestRequest {
  status: string;
  requested_level: string;
  requested_start_unit: number | null;
  admin_notes: string | null;
  created_at: string;
}

/**
 * After the trial lesson, a student's level (and where they start in it)
 * only changes through a request that an admin approves. The teacher picks
 * the level, marks the units the student already knows (start = first unit
 * not known) and gives a reason; approval applies it to the profile,
 * dashboard and learning path (review_level_change).
 */
export const LevelChangeRequestDialog = ({ open, onOpenChange, student, bookingId = null }: LevelChangeRequestDialogProps) => {
  const [requestedLevel, setRequestedLevel] = useState<string>('');
  const [marks, setMarks] = useState<UnitMarks>({});
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<string | null>(null);
  const [hub, setHub] = useState<string | null>(null);
  const [latest, setLatest] = useState<LatestRequest | null>(null);

  useEffect(() => {
    if (!open || !student) return;
    let cancelled = false;
    setCurrentLevel(normalizeCefr(student.level) ?? null);
    setHub(student.hub ?? null);
    (async () => {
      const [{ data: profile }, { data: prior }, { data: req }] = await Promise.all([
        (supabase as any).from('student_profiles').select('final_cefr_level, cefr_level, hub_type').eq('user_id', student.id).maybeSingle(),
        (supabase as any).from('student_prior_knowledge').select('hub, cefr_level').eq('student_id', student.id).maybeSingle(),
        (supabase as any)
          .from('level_change_requests')
          .select('status, requested_level, requested_start_unit, admin_notes, created_at')
          .eq('student_id', student.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      if (cancelled) return;
      const lvl = normalizeCefr(profile?.final_cefr_level) ?? normalizeCefr(prior?.cefr_level) ?? normalizeCefr(profile?.cefr_level);
      if (lvl) setCurrentLevel(lvl);
      setHub(student.hub ?? prior?.hub ?? profile?.hub_type ?? null);
      setLatest((req as LatestRequest) ?? null);
    })();
    return () => { cancelled = true; };
  }, [open, student]);

  const reset = () => {
    setRequestedLevel('');
    setMarks({});
    setReason('');
  };

  const submit = async () => {
    if (!student || !requestedLevel || !reason.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await (supabase as any).rpc('request_level_change', {
        p_student: student.id,
        p_level: requestedLevel,
        p_start_unit: startUnitFor(marks),
        p_marks: marks,
        p_reason: reason.trim(),
        p_booking: bookingId,
      });
      if (error) throw error;
      toast.success(`Level change request sent for ${student.name}`, {
        description: 'An admin will review it. The level stays the same until it is approved.',
      });
      reset();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Failed to submit level change request:', err);
      toast.error(err?.message ?? 'Could not submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const start = startUnitFor(marks);

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next); }}>
      <DialogContent className="max-w-2xl max-h-[88vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Request level change</DialogTitle>
          <DialogDescription>
            {student
              ? `For ${student.name} (currently ${currentLevel || 'unset'}). The level was set in the trial lesson; any change after that needs an admin's approval.`
              : ''}
          </DialogDescription>
        </DialogHeader>

        {latest?.status === 'pending' && (
          <div className="rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-xs">
            A request to move to <b>{latest.requested_level}</b>
            {latest.requested_start_unit ? ` · Unit ${latest.requested_start_unit}` : ''} is waiting for approval.
            Sending a new one replaces it.
          </div>
        )}
        {latest && latest.status !== 'pending' && (
          <div className="text-xs text-muted-foreground">
            Last request: {latest.requested_level} — <Badge variant="outline" className="text-[10px]">{latest.status}</Badge>
            {latest.admin_notes ? ` · “${latest.admin_notes}”` : ''}
          </div>
        )}

        <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-3">
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1">New level</div>
            <div className="flex flex-wrap gap-1.5">
              {CEFR_LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => { setRequestedLevel(l); setMarks({}); }}
                  className={`h-7 min-w-[3rem] rounded-md border px-2 text-xs font-bold ${
                    requestedLevel === l ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'
                  }`}
                >
                  {l}{l === currentLevel ? ' (now)' : ''}
                </button>
              ))}
            </div>
          </div>

          {requestedLevel && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-1">
                What does the student already know in {requestedLevel}?
              </div>
              <UnitKnowledgeChecklist hub={toLevelMapHub(hub)} level={requestedLevel} marks={marks} onChange={setMarks} />
            </div>
          )}

          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1">Reason (required)</div>
            <Textarea
              placeholder="What did you observe? e.g. finds Unit 6 too easy, already uses comparatives confidently…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-20"
            />
          </div>
        </div>

        <DialogFooter className="items-center gap-2 sm:justify-between">
          <div className="text-sm">
            {requestedLevel ? <>Would start at <b>{requestedLevel} · Unit {start}, Lesson 1</b></> : 'Pick a level'}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={submitting || !requestedLevel || !reason.trim()}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send request
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
