import React, { useEffect, useMemo, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, ArrowLeft, CalendarClock, Clock, Loader2, Repeat2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  cancelBookedSlot,
  cancelAndRemoveBookedSlot,
  cancelBookedSeries,
  moveBookedLesson,
  loadMoveContext,
  hoursUntil,
  isWithinPenaltyWindow,
  LATE_CANCELLATION_PENALTY_HOURS,
} from "@/services/cancelSlotService";
import { findMoveOptions, groupByDay, isSplitLesson } from "@/lib/booking/moveOptions";

interface BookedSlotInfo {
  slotId: string;
  studentId?: string;
  studentName?: string;
  studentShortId?: string;
  lessonTitle?: string;
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
  teacherId: string;
  /** Called after the lesson was cancelled (or its slots removed). */
  onCancelled?: () => void;
  /** Called after the lesson was moved to another time. */
  onMoved?: () => void;
}

const HUB_META: Record<NonNullable<BookedSlotInfo["hub"]>, {
  label: string; emoji: string; classes: string;
}> = {
  playground: { label: "Playground", emoji: "🎪", classes: "bg-orange-500/15 text-orange-600 border-orange-500/40" },
  academy:    { label: "Academy",    emoji: "📘", classes: "bg-purple-500/15 text-purple-700 border-purple-500/40" },
  success:    { label: "Success",    emoji: "🏆", classes: "bg-emerald-500/15 text-emerald-700 border-emerald-500/40" },
};

type MoveContext = Awaited<ReturnType<typeof loadMoveContext>>;

const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

export const BookedSlotManager: React.FC<BookedSlotManagerProps> = ({
  open,
  onOpenChange,
  slot,
  teacherId,
  onCancelled,
  onMoved,
}) => {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<"main" | "move">("main");
  const [removeSlotToo, setRemoveSlotToo] = useState(false);
  const [seriesArmed, setSeriesArmed] = useState(false);
  const [ctx, setCtx] = useState<MoveContext | null>(null);
  const [ctxError, setCtxError] = useState<string | null>(null);
  const [ctxLoading, setCtxLoading] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);

  const slotId = slot?.slotId;
  const studentId = slot?.studentId;
  const slotStartIso = slot?.startTime.toISOString();

  // Reset every time a different slot is opened.
  useEffect(() => {
    setReason("");
    setView("main");
    setRemoveSlotToo(false);
    setSeriesArmed(false);
    setPicked(null);
    setCtx(null);
    setCtxError(null);
  }, [slotId]);

  // The booking behind the slot: its true start and length, its own calendar rows
  // and the teacher's open slots - what "Move lesson" needs.
  useEffect(() => {
    if (!open || !slotId || !studentId || !slotStartIso) return;
    let cancelled = false;
    setCtxLoading(true);
    loadMoveContext({ teacherId, studentId, slotStart: slotStartIso })
      .then((c) => { if (!cancelled) { setCtx(c); setCtxError(null); } })
      .catch((e: any) => { if (!cancelled) { setCtx(null); setCtxError(e?.message ?? "Could not load this lesson."); } })
      .finally(() => { if (!cancelled) setCtxLoading(false); });
    return () => { cancelled = true; };
  }, [open, slotId, studentId, slotStartIso, teacherId]);

  const days = useMemo(() => {
    if (!ctx) return [];
    const own = ctx.ownRows;
    const starts = findMoveOptions(
      [...ctx.openRows, ...own],
      { minutes: ctx.minutes, split: isSplitLesson(ctx.minutes, own.length), hub: own[0]?.hub_specialty ?? null },
      ctx.scheduledAt,
    );
    return groupByDay(starts);
  }, [ctx]);

  if (!slot) return null;

  const meta = slot.hub ? HUB_META[slot.hub] : null;
  const lessonStart = ctx ? new Date(ctx.scheduledAt) : slot.startTime;
  const lessonMinutes = ctx?.minutes ?? slot.duration;
  const hoursLeft = hoursUntil(lessonStart);
  const lateNotice = isWithinPenaltyWindow(lessonStart);

  const done = (cb?: () => void) => {
    cb?.();
    onOpenChange(false);
  };

  const handleCancelOccurrence = async () => {
    setBusy(true);
    try {
      const run = removeSlotToo ? cancelAndRemoveBookedSlot : cancelBookedSlot;
      const { refunded, penalized, penaltyAmount } = await run({ slotId: slot.slotId, reason });
      toast({
        title: penalized ? "Booking cancelled — penalty applied" : "Booking cancelled",
        description: penalized
          ? `The student's credit was refunded in full. Since this was inside the ${LATE_CANCELLATION_PENALTY_HOURS}-hour window, a $${penaltyAmount.toFixed(2)} cancellation fee was deducted from your balance.`
          : `${refunded ? "The student's credit has been refunded and " : ""}${
              removeSlotToo ? "the time is off your schedule." : "the slot is open again."
            }`,
        variant: penalized ? "destructive" : "default",
      });
      done(onCancelled);
    } catch (err: any) {
      toast({ title: "Could not cancel", description: err?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handleCancelSeries = async () => {
    if (!seriesArmed) {
      setSeriesArmed(true);
      return;
    }
    setBusy(true);
    try {
      const { cancelledBookings, removedSlots } = await cancelBookedSeries({
        slotId: slot.slotId,
        reason,
        fromStart: lessonStart,
      });
      toast({
        title: "Weekly series cancelled",
        description: `Removed ${removedSlots} slot${removedSlots === 1 ? "" : "s"}${
          cancelledBookings ? ` and cancelled ${cancelledBookings} booking${cancelledBookings === 1 ? "" : "s"}` : ""
        }.`,
      });
      done(onCancelled);
    } catch (err: any) {
      toast({ title: "Could not cancel series", description: err?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handleMove = async () => {
    if (!picked) return;
    setBusy(true);
    try {
      await moveBookedLesson({ slotId: slot.slotId, newStart: picked, reason });
      toast({
        title: "Lesson moved",
        description: `${slot.studentName ?? "The student"} was told the new time: ${new Date(picked).toLocaleString(undefined, {
          weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
        })}. Their credits are unchanged.`,
      });
      done(onMoved);
    } catch (err: any) {
      toast({ title: "Could not move the lesson", description: err?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const summary = (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-foreground truncate">{slot.studentName ?? "Student"}</span>
        {slot.studentShortId && (
          <span className="text-xs font-mono text-muted-foreground">{slot.studentShortId}</span>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        {lessonStart.toLocaleString(undefined, {
          weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
        })}
        <span>· {lessonMinutes} min</span>
      </div>
      {slot.lessonTitle && <p className="text-sm font-medium text-foreground/90 truncate">{slot.lessonTitle}</p>}
      {slot.isRecurring && (
        <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
          <Repeat2 className="h-3.5 w-3.5" />
          Part of a weekly series
        </div>
      )}
    </div>
  );

  const reasonField = (hint: string) => (
    <div className="space-y-1.5">
      <Label htmlFor="slot-reason">Reason (optional)</Label>
      <Textarea
        id="slot-reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder={hint}
        rows={2}
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            {view === "move" ? "Move lesson" : "Manage booked slot"}
            {meta && (
              <Badge variant="outline" className={cn("border", meta.classes)}>
                {meta.emoji} {meta.label}
              </Badge>
            )}
            {slot.isTrial && (
              <Badge variant="outline" className="border bg-amber-400/20 text-amber-700 border-amber-500/60 font-bold">
                🎓 Trial lesson
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {view === "move"
              ? "Pick one of your open slots. The student keeps the lesson and their credits, and is told the new time."
              : slot.studentId
                ? "Move this lesson to another time, or cancel it."
                : "Cancel just this occurrence, or the entire weekly series."}
          </DialogDescription>
        </DialogHeader>

        {summary}

        {view === "main" ? (
          <>
            {slot.studentId && (
              <>
                <Button
                  variant="default"
                  disabled={busy || ctxLoading || !ctx}
                  onClick={() => setView("move")}
                  className="w-full"
                >
                  {ctxLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CalendarClock className="mr-1.5 h-4 w-4" />}
                  Move to another time
                </Button>
                {ctxError && !ctxLoading && (
                  <p className="text-xs text-destructive">{ctxError}</p>
                )}
              </>
            )}

            {/* 48-hour late-cancellation penalty banner */}
            {lateNotice ? (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <strong>Inside the {LATE_CANCELLATION_PENALTY_HOURS}-hour window</strong> ({Math.max(0, Math.round(hoursLeft))}h left).
                  The student is still refunded in full, but cancelling this close to the lesson
                  means <strong>you'll be charged a cancellation fee</strong> per Engleuphoria's policy. Moving the lesson has no fee.
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                More than {LATE_CANCELLATION_PENALTY_HOURS} hours away — no cancellation penalty applies.
              </p>
            )}

            {reasonField("Shared with the student in their notice.")}

            <label className="flex cursor-pointer items-start gap-2 text-sm">
              <Checkbox
                checked={removeSlotToo}
                onCheckedChange={(v) => setRemoveSlotToo(v === true)}
                className="mt-0.5"
                disabled={busy}
              />
              <span>
                Also take this time off my schedule
                <span className="block text-xs text-muted-foreground">Otherwise the slot opens again for other students.</span>
              </span>
            </label>

            <DialogFooter className="flex-col sm:flex-col gap-2 sm:space-x-0">
              <Button variant="destructive" disabled={busy} onClick={handleCancelOccurrence} className="w-full">
                <X className="h-4 w-4 mr-1.5" />
                Cancel this lesson
              </Button>

              {slot.isRecurring && (
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={handleCancelSeries}
                  className="w-full border-destructive/40 text-destructive hover:bg-destructive/10"
                >
                  <Repeat2 className="h-4 w-4 mr-1.5" />
                  {seriesArmed ? "Tap again to cancel them all" : "Cancel this and all later weekly lessons"}
                </Button>
              )}
              {slot.isRecurring && seriesArmed && (
                <p className="text-center text-xs text-muted-foreground">
                  Every later booking in this series is cancelled and refunded, and those slots are removed. Earlier weeks stay.
                </p>
              )}

              <Button variant="ghost" disabled={busy} onClick={() => onOpenChange(false)} className="w-full">
                Keep booking
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="max-h-64 space-y-3 overflow-y-auto rounded-lg border p-3">
              {days.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You have no open {lessonMinutes}-minute slots to move this lesson to. Open a slot at the time you want
                  (tap an empty cell), then come back.
                </p>
              ) : (
                days.map((d) => (
                  <div key={d.dayKey}>
                    <p className="mb-1 text-xs font-semibold text-muted-foreground">
                      {d.day.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {d.starts.map((iso) => (
                        <button
                          key={iso}
                          type="button"
                          onClick={() => setPicked(iso)}
                          aria-pressed={picked === iso}
                          className={cn(
                            "rounded-md border px-2.5 py-1 text-xs font-semibold tabular-nums transition-colors",
                            picked === iso
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background hover:bg-muted",
                          )}
                        >
                          {timeLabel(iso)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {slot.isRecurring && (
              <p className="text-xs text-muted-foreground">Only this lesson moves; the rest of the weekly series stays where it is.</p>
            )}

            {reasonField("Shared with the student, e.g. “I have a meeting”.")}

            <DialogFooter className="flex-col sm:flex-col gap-2 sm:space-x-0">
              <Button disabled={busy || !picked} onClick={handleMove} className="w-full">
                {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CalendarClock className="mr-1.5 h-4 w-4" />}
                {picked
                  ? `Move to ${new Date(picked).toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" })}`
                  : "Pick a new time"}
              </Button>
              <Button variant="ghost" disabled={busy} onClick={() => setView("main")} className="w-full">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
