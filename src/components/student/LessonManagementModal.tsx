import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useCancelReschedule } from '@/hooks/useCancelReschedule';
import { AlertCircle, Calendar as CalendarIcon, Clock, Euro, Gift, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LessonManagementModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'cancel' | 'reschedule';
  lesson: {
    id: string;
    title: string;
    scheduled_at: string;
    teacher_id?: string;
    teacher_name: string;
    duration?: number;
    lesson_price: number;
    /** Credits this booking actually consumed (0 = free trial). The real paid/free signal. */
    credits_used?: number;
    hub_type?: string;
  };
  onSuccess?: () => void;
}

const CANCELLATION_REASONS = [
  'Schedule conflict',
  'Illness',
  'Family emergency',
  'Technical issues',
  'Other'
];

const getHubColor = (hubType?: string) => {
  switch (hubType) {
    case 'playground': return 'from-orange-500 to-amber-500';
    case 'academy': return 'from-blue-600 to-purple-600';
    case 'success': return 'from-emerald-500 to-teal-500';
    default: return 'from-primary to-primary/80';
  }
};

export function LessonManagementModal({
  open,
  onClose,
  mode,
  lesson,
  onSuccess
}: LessonManagementModalProps) {
  const {
    loading,
    cancelLesson,
    rescheduleLesson,
    canCancel,
    canReschedule,
    getRefundInfo,
    getHoursUntilLesson,
  } = useCancelReschedule();

  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const isPlaygroundHour = lesson.hub_type?.toLowerCase() === 'playground' && (lesson.duration ?? 30) === 60;
  const [openSlots, setOpenSlots] = useState<{ id: string; start_time: string }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');

  // Reschedule can only move onto a slot the teacher has actually opened
  // (the server enforces the same rule), so list those instead of free-form time.
  useEffect(() => {
    if (!open || mode !== 'reschedule' || !lesson.teacher_id) return;
    let cancelled = false;
    setSlotsLoading(true);
    setSelectedSlot('');
    supabase
      .from('teacher_availability')
      .select('id, start_time')
      .eq('teacher_id', lesson.teacher_id)
      .eq('duration', isPlaygroundHour ? 30 : (lesson.duration ?? 30))
      .eq('is_available', true)
      .eq('is_booked', false)
      .gt('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(60)
      .then(({ data }) => {
        if (cancelled) return;
        let rows = ((data ?? []) as { id: string; start_time: string }[]).filter(
          (s) => s.start_time !== lesson.scheduled_at,
        );
        if (isPlaygroundHour) {
          // A one-hour Playground lesson needs two back-to-back 30-minute slots.
          const starts = new Set(rows.map((r) => new Date(r.start_time).getTime()));
          rows = rows.filter((r) => starts.has(new Date(r.start_time).getTime() + 30 * 60 * 1000));
        }
        setOpenSlots(rows);
        setSlotsLoading(false);
      });
    return () => { cancelled = true; };
  }, [open, mode, lesson.teacher_id, lesson.duration, lesson.scheduled_at, isPlaygroundHour]);

  // lesson_price is 0 on every booked lesson; credits_used is what really says paid vs free.
  const paidUnits = lesson.credits_used ?? lesson.lesson_price;
  const isTrialOrFree = !paidUnits;
  const hoursUntil = getHoursUntilLesson(lesson.scheduled_at);
  const daysUntil = Math.floor(hoursUntil / 24);

  const handleSubmit = async () => {
    if (mode === 'cancel') {
      const finalReason = selectedReason === 'Other' ? reason : selectedReason;
      const success = await cancelLesson(lesson.id, finalReason);
      if (success) {
        onSuccess?.();
        onClose();
      }
    } else if (mode === 'reschedule') {
      if (!selectedSlot) return;

      const success = await rescheduleLesson(
        lesson.id,
        new Date(selectedSlot).toISOString(),
        reason
      );
      if (success) {
        onSuccess?.();
        onClose();
      }
    }
  };

  const refundInfo = getRefundInfo(lesson.scheduled_at, paidUnits);
  const canProceed = mode === 'cancel'
    ? canCancel(lesson.scheduled_at, isTrialOrFree)
    : canReschedule(lesson.scheduled_at, isTrialOrFree);

  const hubGradient = getHubColor(lesson.hub_type);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className={`-mx-6 -mt-6 px-6 pt-6 pb-4 rounded-t-lg bg-gradient-to-r ${hubGradient}`}>
            <DialogTitle className="text-xl font-semibold text-white">
              {mode === 'cancel' ? '🚫 Cancel Lesson' : '📅 Reschedule Lesson'}
            </DialogTitle>
            <DialogDescription className="text-white/80">
              {lesson.title} with {lesson.teacher_name}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Lesson Info */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>
                {new Date(lesson.scheduled_at).toLocaleString(undefined, {
                  weekday: 'short', month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                  timeZoneName: 'short',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {daysUntil > 0 ? `${daysUntil} days` : `${Math.max(0, Math.floor(hoursUntil))} hours`} until lesson
              </span>
            </div>
          </div>

          {/* Trial lesson info */}
          {isTrialOrFree && (
            <Alert className="border-emerald-200 bg-emerald-50">
              <Gift className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-700">
                Trial lessons can be freely cancelled or rescheduled at any time — no charges apply.
              </AlertDescription>
            </Alert>
          )}

          {/* Policy Warning — non-trial, within 5 days */}
          {!isTrialOrFree && !canProceed && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {mode === 'cancel'
                  ? 'Cancelling within 5 days of the lesson will result in a full charge. The teacher has reserved this time for you.'
                  : 'Rescheduling is only available 5+ days in advance.'}
              </AlertDescription>
            </Alert>
          )}

          {/* 5-day policy info for non-trial */}
          {!isTrialOrFree && canProceed && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                {refundInfo.policyMessage}
              </AlertDescription>
            </Alert>
          )}

          {mode === 'cancel' && (canProceed || isTrialOrFree) && (
            <>
              {/* Refund Info — only for paid lessons */}
              {!isTrialOrFree && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-700">
                      {lesson.credits_used !== undefined ? 'Credits returned' : 'Refund Amount'}
                    </span>
                    <div className="flex items-center gap-1">
                      {lesson.credits_used === undefined && <Euro className="h-4 w-4 text-emerald-600" />}
                      <span className="text-lg font-bold text-emerald-700">
                        {lesson.credits_used !== undefined
                          ? refundInfo.refundAmount
                          : refundInfo.refundAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {refundInfo.penalty > 0 && lesson.credits_used === undefined && (
                    <p className="text-xs text-emerald-600 mt-1">
                      Cancellation fee: €{refundInfo.penalty.toFixed(2)}
                    </p>
                  )}
                </div>
              )}

              {/* Cancellation Reason */}
              <div className="space-y-2">
                <Label>Reason for Cancellation *</Label>
                <Select value={selectedReason} onValueChange={setSelectedReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {CANCELLATION_REASONS.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedReason === 'Other' && (
                <div className="space-y-2">
                  <Label>Additional Details</Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please provide more details..."
                    rows={3}
                  />
                </div>
              )}
            </>
          )}

          {mode === 'reschedule' && (canProceed || isTrialOrFree) && (
            <>
              <div className="space-y-2">
                <Label>Choose a new time *</Label>
                {slotsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading {lesson.teacher_name}'s open times…</p>
                ) : openSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {lesson.teacher_name} has no other open times right now. Please check back later.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {openSlots.map((slot) => (
                      <Button
                        key={slot.id}
                        type="button"
                        size="sm"
                        variant={selectedSlot === slot.start_time ? 'default' : 'outline'}
                        onClick={() => setSelectedSlot(slot.start_time)}
                        className="justify-start text-xs h-auto py-2"
                      >
                        {new Date(slot.start_time).toLocaleString(undefined, {
                          weekday: 'short', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Reason (Optional)</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why are you rescheduling?"
                  rows={2}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Go Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              loading ||
              (!canProceed && !isTrialOrFree) ||
              (mode === 'cancel' && !selectedReason) ||
              (mode === 'reschedule' && !selectedSlot)
            }
            variant={mode === 'cancel' ? 'destructive' : 'default'}
          >
            {loading ? 'Processing...' : mode === 'cancel' ? 'Confirm Cancellation' : 'Confirm Reschedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
