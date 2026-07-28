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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Clock, Repeat2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  cancelBookedSlot,
  cancelBookedSeries,
  hoursUntil,
  isWithinFiveDayRule,
  FIVE_DAY_RULE_HOURS,
} from "@/services/cancelSlotService";

interface BookedSlotInfo {
  slotId: string;
  studentName?: string;
  studentShortId?: string;
  hub?: "playground" | "academy" | "success" | null;
  startTime: Date;
  duration: number;
  isRecurring: boolean;
  isTrial?: boolean;
}

interface BookedSlotManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot: BookedSlotInfo | null;
  onCancelled?: () => void;
}

const HUB_META: Record<NonNullable<BookedSlotInfo["hub"]>, {
  label: string; emoji: string; classes: string;
}> = {
  playground: { label: "Playground", emoji: "🎪", classes: "bg-orange-500/15 text-orange-600 border-orange-500/40" },
  academy:    { label: "Academy",    emoji: "📘", classes: "bg-purple-500/15 text-purple-700 border-purple-500/40" },
  success:    { label: "Success",    emoji: "🏆", classes: "bg-emerald-500/15 text-emerald-700 border-emerald-500/40" },
};

export const BookedSlotManager: React.FC<BookedSlotManagerProps> = ({
  open,
  onOpenChange,
  slot,
  onCancelled,
}) => {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  if (!slot) return null;

  const meta = slot.hub ? HUB_META[slot.hub] : null;
  const hoursLeft = hoursUntil(slot.startTime);
  const lateNotice = isWithinFiveDayRule(slot.startTime);

  const handleCancelOccurrence = async () => {
    setBusy(true);
    try {
      const { refunded } = await cancelBookedSlot({ slotId: slot.slotId, reason });
      toast({
        title: "Booking cancelled",
        description: refunded
          ? "The student's credit has been refunded and the slot is open again."
          : "The slot is open again.",
      });
      onCancelled?.();
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "Could not cancel",
        description: err?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleCancelSeries = async () => {
    setBusy(true);
    try {
      const { cancelledBookings, removedSlots } = await cancelBookedSeries({
        slotId: slot.slotId,
        reason,
      });
      toast({
        title: "Weekly series cancelled",
        description: `Removed ${removedSlots} future slot${
          removedSlots === 1 ? "" : "s"
        }${cancelledBookings ? ` and cancelled ${cancelledBookings} booking${cancelledBookings === 1 ? "" : "s"}` : ""}.`,
      });
      onCancelled?.();
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "Could not cancel series",
        description: err?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            Manage booked slot
            {meta && (
              <Badge variant="outline" className={cn("border", meta.classes)}>
                {meta.emoji} {meta.label}
              </Badge>
            )}
            {slot.isTrial && (
              <Badge
                variant="outline"
                className="border bg-amber-400/20 text-amber-700 border-amber-500/60 font-bold"
              >
                🎓 Trial lesson
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Cancel just this occurrence, or the entire weekly series.
          </DialogDescription>
        </DialogHeader>

        {/* Slot summary */}
        <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-foreground truncate">
              {slot.studentName ?? "Student"}
            </span>
            {slot.studentShortId && (
              <span className="text-xs font-mono text-muted-foreground">
                {slot.studentShortId}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {slot.startTime.toLocaleString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            <span>· {slot.duration} min</span>
          </div>
          {slot.isRecurring && (
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
              <Repeat2 className="h-3.5 w-3.5" />
              Part of a weekly series
            </div>
          )}
        </div>

        {/* 5-day rule banner */}
        {lateNotice ? (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <strong>Inside the 5-day window</strong> ({Math.max(0, Math.round(hoursLeft))}h left).
              Cancelling now forfeits the student's credit per Engleuphoria's
              {` ${FIVE_DAY_RULE_HOURS}-hour`} cancellation policy.
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            More than 5 days away — student's credit is fully refundable.
          </p>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="cancel-reason">Reason (optional)</Label>
          <Textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Shared with the student in their cancellation notice."
            rows={2}
          />
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2 sm:space-x-0">
          <Button
            variant="destructive"
            disabled={busy}
            onClick={handleCancelOccurrence}
            className="w-full"
          >
            <X className="h-4 w-4 mr-1.5" />
            Cancel this occurrence
          </Button>

          {slot.isRecurring && (
            <Button
              variant="outline"
              disabled={busy}
              onClick={handleCancelSeries}
              className="w-full border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              <Repeat2 className="h-4 w-4 mr-1.5" />
              Cancel entire weekly series
            </Button>
          )}

          <Button
            variant="ghost"
            disabled={busy}
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Keep booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
