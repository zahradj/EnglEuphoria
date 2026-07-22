import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { X } from 'lucide-react';

interface SlotManagerProps {
  open: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  selectedTime: string | null;
  onCreateSlot: (duration: 30 | 60) => Promise<void>;
  onDeleteSlot?: () => Promise<void>;
  existingSlot?: boolean;
  /** Allowed durations for this teacher's hub. Defaults to [30, 60]. */
  allowedDurations?: (30 | 60)[];
}

export const SlotManager: React.FC<SlotManagerProps> = ({
  open,
  onClose,
  selectedDate,
  selectedTime,
  onCreateSlot,
  onDeleteSlot,
  existingSlot = false,
  allowedDurations = [30, 60],
}) => {
  const defaultDuration: 30 | 60 = allowedDurations[0] ?? 30;
  const [duration, setDuration] = useState<30 | 60>(defaultDuration);

  // Keep selected duration valid if hub-allowed list changes
  React.useEffect(() => {
    if (!allowedDurations.includes(duration)) {
      setDuration(defaultDuration);
    }
  }, [allowedDurations, duration, defaultDuration]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCreate = async () => {
    setIsProcessing(true);
    try {
      await onCreateSlot(duration);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteSlot) return;
    setIsProcessing(true);
    try {
      await onDeleteSlot();
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  if (!selectedDate || !selectedTime) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {existingSlot ? 'Manage Availability Slot' : 'Create Availability Slot'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Date:</span>{' '}
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Time:</span> {selectedTime}
            </p>
          </div>

          {!existingSlot && (
            <div className="space-y-3">
              <Label>Lesson Duration</Label>
              <RadioGroup
                value={duration.toString()}
                onValueChange={(value) => setDuration(Number(value) as 30 | 60)}
              >
                {allowedDurations.includes(30) && (
                  <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="30" id="duration-30" />
                    <Label htmlFor="duration-30" className="cursor-pointer flex-1">
                      <div className="font-semibold">30 minutes</div>
                      <div className="text-xs text-muted-foreground">Standard session</div>
                    </Label>
                  </div>
                )}
                {allowedDurations.includes(60) && (
                  <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="60" id="duration-60" />
                    <Label htmlFor="duration-60" className="cursor-pointer flex-1">
                      <div className="font-semibold">60 minutes</div>
                      <div className="text-xs text-muted-foreground">Extended session</div>
                    </Label>
                  </div>
                )}
              </RadioGroup>
              {allowedDurations.length === 1 && (
                <p className="text-xs text-muted-foreground">
                  Your hub uses {allowedDurations[0]}-minute lessons only.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {existingSlot && onDeleteSlot ? (
            <>
              <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isProcessing}
              >
                {isProcessing ? 'Deleting...' : 'Delete Slot'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isProcessing}>
                {isProcessing ? 'Creating...' : 'Create Slot'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
