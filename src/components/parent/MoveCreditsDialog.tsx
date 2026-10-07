import { useEffect, useState } from 'react';
import { Loader2, Minus, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Learner {
  studentId: string;
  name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  learners: Learner[];
  /** Unused credits per learner. */
  credits: Record<string, number>;
  /** Learner the credits are moved FROM when the dialog opens. */
  fromId: string | null;
}

/** Move unused credits between two children of the same parent (checked again by the database). */
export function MoveCreditsDialog({ open, onOpenChange, learners, credits, fromId }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [count, setCount] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const start = fromId ?? learners[0]?.studentId ?? '';
    setFrom(start);
    setTo(learners.find((l) => l.studentId !== start)?.studentId ?? '');
    setCount(1);
    // Only when the dialog opens (the learners list is a new array on every parent render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, fromId]);

  const available = credits[from] ?? 0;
  const canMove = !!from && !!to && from !== to && available >= 1 && count >= 1 && count <= available;
  const nameOf = (id: string) => learners.find((l) => l.studentId === id)?.name ?? '';

  const move = async () => {
    if (!canMove) return;
    setSaving(true);
    try {
      const { error } = await (supabase as any).rpc('transfer_family_credits', { p_from: from, p_to: to, p_credits: count });
      if (error) throw error;
      toast({ title: 'Credits moved', description: `${count} credit${count === 1 ? '' : 's'} moved from ${nameOf(from)} to ${nameOf(to)}.` });
      await queryClient.invalidateQueries({ queryKey: ['family-credits'] });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Could not move credits', description: err?.message ?? 'Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const select = (id: string, value: string, set: (v: string) => void, label: string) => (
    <label className="grid gap-1 text-sm font-medium" htmlFor={id}>
      {label}
      <select
        id={id}
        value={value}
        onChange={(e) => set(e.target.value)}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
      >
        {learners.map((l) => (
          <option key={l.studentId} value={l.studentId}>{l.name} ({credits[l.studentId] ?? 0} credits)</option>
        ))}
      </select>
    </label>
  );

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!saving) onOpenChange(next); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move credits between children</DialogTitle>
          <DialogDescription>Only unused credits can be moved. Credits already used for lessons stay where they are.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {select('move-from', from, (v) => { setFrom(v); setCount(1); if (v === to) setTo(learners.find((l) => l.studentId !== v)?.studentId ?? ''); }, 'From')}
          {select('move-to', to, setTo, 'To')}
          <div className="grid gap-1 text-sm font-medium">
            Credits to move
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" size="icon" aria-label="One less" onClick={() => setCount((c) => Math.max(1, c - 1))} disabled={count <= 1}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="min-w-8 text-center text-lg font-bold" aria-live="polite">{count}</span>
              <Button type="button" variant="outline" size="icon" aria-label="One more" onClick={() => setCount((c) => Math.min(available, c + 1))} disabled={count >= available}>
                <Plus className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground">{available} available</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={move} disabled={!canMove || saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Move credits
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
