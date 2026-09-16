import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const CEFR_LEVELS = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

interface LevelChangeRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: { id: string; name: string; level?: string } | null;
}

export const LevelChangeRequestDialog = ({ open, onOpenChange, student }: LevelChangeRequestDialogProps) => {
  const { user } = useAuth();
  const [requestedLevel, setRequestedLevel] = useState<string>('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setRequestedLevel('');
    setReason('');
  };

  const submit = async () => {
    if (!student || !user?.id || !requestedLevel) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('level_change_requests').insert({
        student_id: student.id,
        teacher_id: user.id,
        current_level: student.level || null,
        requested_level: requestedLevel,
        reason: reason || null,
      });
      if (error) throw error;
      toast.success(`Level change request sent for ${student.name}`);
      reset();
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to submit level change request:', err);
      toast.error('Could not submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request level change</DialogTitle>
          <DialogDescription>
            {student ? `For ${student.name} (currently ${student.level || 'unset'}). An admin reviews and approves this before it takes effect.` : ''}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Select value={requestedLevel} onValueChange={setRequestedLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Requested level" />
            </SelectTrigger>
            <SelectContent>
              {CEFR_LEVELS.map(level => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Why should this student's level change? (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="h-24"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting || !requestedLevel}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Submit request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
