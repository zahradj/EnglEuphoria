import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CancelRescheduleResult {
  loading: boolean;
  cancelLesson: (lessonId: string, reason: string) => Promise<boolean>;
  rescheduleLesson: (lessonId: string, newDateTime: string, reason?: string) => Promise<boolean>;
  canCancel: (scheduledAt: string, isTrialOrFree?: boolean) => boolean;
  canReschedule: (scheduledAt: string, isTrialOrFree?: boolean) => boolean;
  getRefundInfo: (scheduledAt: string, cost: number) => { refundAmount: number; penalty: number; policyMessage: string };
  getHoursUntilLesson: (scheduledAt: string) => number;
  POLICY_HOURS: number;
  CANCEL_POLICY_HOURS: number;
}

// Students cancel up to 8 hours before a lesson (credit returned). Rescheduling still needs 5 days (120 hours).
// Teachers' own rule is 5 days; see cancelSlotService.ts. The 8 hours here must match student_cancel_lesson in the database.
export const CANCEL_POLICY_HOURS = 8;
const POLICY_HOURS = 120;

export function useCancelReschedule(): CancelRescheduleResult {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const getHoursUntilLesson = (scheduledAt: string): number => {
    const lessonTime = new Date(scheduledAt);
    const now = new Date();
    return (lessonTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  };

  const canCancel = (scheduledAt: string, isTrialOrFree = false): boolean => {
    if (isTrialOrFree) return true; // Trial lessons can always be cancelled
    return getHoursUntilLesson(scheduledAt) >= CANCEL_POLICY_HOURS;
  };

  const canReschedule = (scheduledAt: string, isTrialOrFree = false): boolean => {
    if (isTrialOrFree) return true; // Trial lessons can always be rescheduled
    return getHoursUntilLesson(scheduledAt) >= POLICY_HOURS;
  };

  const getRefundInfo = (scheduledAt: string, cost: number) => {
    // Free/trial lessons — no money involved
    if (cost === 0) {
      return { refundAmount: 0, penalty: 0, policyMessage: 'Trial lessons can be freely cancelled or rescheduled.' };
    }

    const hoursUntil = getHoursUntilLesson(scheduledAt);

    if (hoursUntil >= CANCEL_POLICY_HOURS) {
      return { refundAmount: cost, penalty: 0, policyMessage: t('cx.policy.full', 'Full refund — more than 8 hours before the lesson.') };
    } else {
      return { refundAmount: 0, penalty: cost, policyMessage: t('cx.policy.none', 'No refund — less than 8 hours before the lesson. Teacher gets paid for the reserved time.') };
    }
  };

  const cancelLesson = async (lessonId: string, reason: string): Promise<boolean> => {
    setLoading(true);
    try {
      // student_cancel_lesson is the sole source of truth for the 120-hour
      // window and the credit refund — both are re-verified server-side
      // against the DB's own clock, not trusted from client state.
      const { data, error: rpcError } = await supabase.rpc('student_cancel_lesson', {
        p_lesson_id: lessonId,
        p_reason: reason,
      });

      if (rpcError) {
        toast({
          title: 'Cannot Cancel',
          description: /8 hours|5 days/.test(rpcError.message)
            ? t('cx.toast.tooLate', 'Lessons must be cancelled at least 8 hours in advance. Cancelling now will result in a full charge.')
            : rpcError.message,
          variant: 'destructive',
        });
        return false;
      }

      const result = data as { refunded: boolean; is_trial: boolean } | null;

      toast({
        title: 'Lesson Cancelled',
        description: result?.is_trial
          ? 'Your trial lesson has been cancelled. You can book a new one anytime.'
          : result?.refunded
          ? 'Your credit has been returned to your balance.'
          : 'Lesson cancelled.',
      });

      return true;
    } catch (error) {
      console.error('Error cancelling lesson:', error);
      toast({
        title: 'Cancellation Failed',
        description: 'Unable to cancel lesson. Please try again.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const rescheduleLesson = async (
    lessonId: string,
    newDateTime: string,
    reason?: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      // student_reschedule_lesson is the sole source of truth: it re-verifies
      // the 120-hour window server-side (the old client-only check could be
      // bypassed entirely), rejects times that collide with another booking
      // the teacher already has, and atomically moves both lessons and
      // class_bookings plus the teacher_availability rows in one transaction
      // instead of two independent client writes that could drift apart.
      const { data, error: rpcError } = await supabase.rpc('student_reschedule_lesson', {
        p_lesson_id: lessonId,
        p_new_scheduled_at: newDateTime,
        p_reason: reason || null,
      });

      if (rpcError) {
        const msg = rpcError.message || '';
        toast({
          title: 'Cannot Reschedule',
          description: msg.includes('5+ days')
            ? 'Rescheduling is only available 5+ days in advance.'
            : msg.includes('already has a lesson')
            ? 'This teacher already has a lesson booked at that time. Please choose another slot.'
            : msg || 'Unable to reschedule lesson. Please try again.',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Lesson Rescheduled',
        description: `Your lesson has been moved to ${new Date(newDateTime).toLocaleString()}`,
      });

      return true;
    } catch (error) {
      console.error('Error rescheduling lesson:', error);
      toast({
        title: 'Rescheduling Failed',
        description: 'Unable to reschedule lesson. Please try again.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    cancelLesson,
    rescheduleLesson,
    canCancel,
    canReschedule,
    getRefundInfo,
    getHoursUntilLesson,
    POLICY_HOURS,
    CANCEL_POLICY_HOURS
  };
}
