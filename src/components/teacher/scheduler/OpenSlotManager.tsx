import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Repeat2, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cancelBookedSeries, removeOpenSlot } from "@/services/cancelSlotService";

export interface OpenSlotInfo {
  slotId: string;
  startTime: Date;
  duration: number;
  hub?: "playground" | "academy" | "success" | null;
  isRecurring: boolean;
}

interface OpenSlotManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot: OpenSlotInfo | null;
  teacherId: string;
  /** Called after any slot was removed, so the schedule can reload. */
  onChanged?: () => void;
}

const HUB_LABEL = { playground: "🎪 Playground", academy: "📘 Academy", success: "🏆 Success" } as const;

/** What a teacher can do with an OPEN slot: remove just this one, or this one and every later week of its series. */
export const OpenSlotManager: React.FC<OpenSlotManagerProps> = ({ open, onOpenChange, slot, teacherId, onChanged }) => {
  const [busy, setBusy] = useState(false);
  const [armed, setArmed] = useState(false);

  if (!slot) return null;

  const close = (next: boolean) => {
    if (!next) setArmed(false);
    onOpenChange(next);
  };

  const removeOne = async () => {
    setBusy(true);
    try {
      await removeOpenSlot({ slotId: slot.slotId, teacherId });
      toast({ title: "Slot removed", description: "That time is no longer available to students." });
      onChanged?.();
      close(false);
    } catch (err: any) {
      toast({ title: "Could not remove the slot", description: err?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const removeSeries = async () => {
    if (!armed) {
      setArmed(true);
      return;
    }
    setBusy(true);
    try {
      const { removedSlots, keptBooked } = await cancelBookedSeries({
        slotId: slot.slotId,
        fromStart: slot.startTime,
        keepBooked: true,
      });
      toast({
        title: "Weekly slots removed",
        description: `Removed ${removedSlots} open slot${removedSlots === 1 ? "" : "s"}.${
          keptBooked ? ` ${keptBooked} booked lesson${keptBooked === 1 ? " was" : "s were"} kept — cancel those from the booked slot.` : ""
        }`,
      });
      onChanged?.();
      close(false);
    } catch (err: any) {
      toast({ title: "Could not remove the weekly slots", description: err?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            Open slot
            {slot.hub && <Badge variant="outline">{HUB_LABEL[slot.hub]}</Badge>}
          </DialogTitle>
          <DialogDescription>Nobody has booked this time yet. Remove it so students can no longer pick it.</DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5 rounded-lg border bg-muted/30 p-3 text-sm">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {slot.startTime.toLocaleString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            <span className="font-normal text-muted-foreground">· {slot.duration} min</span>
          </div>
          {slot.isRecurring && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <Repeat2 className="h-3.5 w-3.5" />
              Part of a weekly series
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
          <Button variant="destructive" disabled={busy} onClick={removeOne} className="w-full">
            <Trash2 className="mr-1.5 h-4 w-4" />
            Remove this slot
          </Button>

          {slot.isRecurring && (
            <Button
              variant="outline"
              disabled={busy}
              onClick={removeSeries}
              className="w-full border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              <Repeat2 className="mr-1.5 h-4 w-4" />
              {armed ? "Tap again to remove them all" : "Remove this and all later weekly slots"}
            </Button>
          )}
          {slot.isRecurring && armed && (
            <p className="text-center text-xs text-muted-foreground">
              Earlier weeks stay. Lessons students already booked in this series are not cancelled.
            </p>
          )}

          <Button variant="ghost" disabled={busy} onClick={() => close(false)} className="w-full">
            Keep it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
