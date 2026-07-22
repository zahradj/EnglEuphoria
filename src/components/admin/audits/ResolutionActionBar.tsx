import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ResolutionMathPreview } from './ResolutionMathPreview';
import type { AuditSession } from '@/hooks/admin/useClassroomAudits';
import { Textarea } from '@/components/ui/textarea';

type ResolutionType =
  | 'teacher_absent'
  | 'student_absent'
  | 'teacher_tech_fault'
  | 'student_tech_fault'
  | 'platform_fault';

const TIERS: Array<{
  key: ResolutionType;
  label: string;
  pct: number;
  refund: boolean;
  variant: 'destructive' | 'default' | 'outline' | 'secondary';
}> = [
  { key: 'teacher_absent', label: 'Teacher Absent', pct: 0, refund: true, variant: 'destructive' },
  { key: 'student_absent', label: 'Student Absent', pct: 100, refund: false, variant: 'secondary' },
  { key: 'teacher_tech_fault', label: 'Teacher Tech Fault', pct: 0, refund: true, variant: 'destructive' },
  { key: 'student_tech_fault', label: 'Student Tech Fault', pct: 50, refund: false, variant: 'outline' },
  { key: 'platform_fault', label: 'Platform Fault', pct: 100, refund: true, variant: 'default' },
];

interface Props {
  session: AuditSession;
}

export function ResolutionActionBar({ session }: Props) {
  const [pending, setPending] = useState<ResolutionType | null>(null);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const duration = session.duration_minutes ?? 60;
  const tier = TIERS.find((t) => t.key === pending);

  const commit = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc('apply_classroom_resolution', {
        p_session_id: session.id,
        p_resolution_type: pending,
        p_notes: notes || null,
      });
      if (error) throw error;
      const pay = (data as any)?.teacher_pay_eur ?? 0;
      const refunded = (data as any)?.refunded;
      toast.success(
        `Resolved · Teacher €${Number(pay).toFixed(2)}${refunded ? ' · Credit refunded' : ''}`,
      );
      setPending(null);
      setNotes('');
    } catch (e: any) {
      toast.error(e?.message ?? 'Resolution failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-1">
        {TIERS.map((t) => (
          <Button
            key={t.key}
            size="sm"
            variant={t.variant}
            onClick={() => setPending(t.key)}
            className="h-7 text-[10px] px-2"
          >
            {t.label}
          </Button>
        ))}
      </div>

      <Dialog open={pending !== null} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Resolution: {tier?.label}</DialogTitle>
            <DialogDescription>
              Review the financial impact before committing. This action is logged
              to the resolution ledger and updates payroll + credits immediately.
            </DialogDescription>
          </DialogHeader>
          {tier && (
            <ResolutionMathPreview
              teacherId={session.teacher_id}
              durationMinutes={duration}
              pct={tier.pct}
              refund={tier.refund}
            />
          )}
          <Textarea
            placeholder="Admin notes (optional)…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="font-mono text-xs"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPending(null)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={commit} disabled={busy}>
              {busy ? 'Applying…' : 'Approve & Apply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
