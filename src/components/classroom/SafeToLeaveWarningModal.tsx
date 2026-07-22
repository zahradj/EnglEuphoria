import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirmStay: () => void;
}

export function SafeToLeaveWarningModal({ open, onOpenChange, onConfirmStay }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Warning — Early Leave
          </DialogTitle>
          <DialogDescription className="pt-2 text-foreground">
            If you leave now, you will be marked as a <strong>No-Show</strong> and
            will not be paid for this session. Please wait for the student.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Leave Anyway
          </Button>
          <Button onClick={onConfirmStay}>I'll Wait</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
