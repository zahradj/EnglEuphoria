import React, { useState } from 'react';
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
import { Calendar } from '@/components/ui/calendar';
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
    teacher_name: string;
    lesson_price: number;
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
  const [newDate, setNewDate] = useState<Date>();
  const [newTime, setNewTime] = useState('');

  const isTrialOrFree = !lesson.lesson_price || lesson.lesson_price === 0;
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
      if (!newDate || !newTime) return;

      const [hours, minutes] = newTime.split(':');
      const newDateTime = new Date(newDate);
      newDateTime.setHours(parseInt(hours), parseInt(minutes));

      const success = await rescheduleLesson(
        lesson.id,
        newDateTime.toISOString(),
        reason
      );
      if (success) {
        onSuccess?.();
        onClose();
      }
    }
  };

  const refundInfo = getRefundInfo(lesson.scheduled_at, lesson.lesson_price);
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
                    <span className="text-sm font-medium text-emerald-700">Refund Amount</span>
                    <div className="flex items-center gap-1">
                      <Euro className="h-4 w-4 text-emerald-600" />
                      <span className="text-lg font-bold text-emerald-700">
                        {refundInfo.refundAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {refundInfo.penalty > 0 && (
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
                <Label>Select New Date</Label>
                <Calendar
                  mode="single"
                  selected={newDate}
                  onSelect={setNewDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>

              <div className="space-y-2">
                <Label>Select New Time</Label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
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
              (mode === 'reschedule' && (!newDate || !newTime))
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
