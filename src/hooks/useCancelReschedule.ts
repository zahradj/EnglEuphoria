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
}

// 5-day policy = 120 hours
const POLICY_HOURS = 120;

export function useCancelReschedule(): CancelRescheduleResult {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getHoursUntilLesson = (scheduledAt: string): number => {
    const lessonTime = new Date(scheduledAt);
    const now = new Date();
    return (lessonTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  };

  const canCancel = (scheduledAt: string, isTrialOrFree = false): boolean => {
    if (isTrialOrFree) return true; // Trial lessons can always be cancelled
    return getHoursUntilLesson(scheduledAt) >= POLICY_HOURS;
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

    if (hoursUntil >= POLICY_HOURS) {
      return { refundAmount: cost, penalty: 0, policyMessage: 'Full refund — more than 5 days before lesson.' };
    } else {
      return { refundAmount: 0, penalty: cost, policyMessage: 'No refund — less than 5 days before lesson. Teacher gets paid for the reserved time.' };
    }
  };

  const reopenTeacherSlot = async (lessonId: string) => {
    try {
      await supabase
        .from('teacher_availability')
        .update({ is_booked: false, student_id: null, lesson_id: null, lesson_title: null })
        .eq('lesson_id', lessonId);
    } catch (err) {
      console.error('Failed to reopen teacher availability slot:', err);
    }
  };

  const cancelLesson = async (lessonId: string, reason: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data: lesson, error: fetchError } = await supabase
        .from('lessons')
        .select('scheduled_at, lesson_price, student_id, teacher_id')
        .eq('id', lessonId)
        .single();

      if (fetchError || !lesson) {
        throw new Error('Failed to fetch lesson details');
      }

      const isTrialOrFree = !lesson.lesson_price || lesson.lesson_price === 0;

      if (!canCancel(lesson.scheduled_at, isTrialOrFree)) {
        toast({
          title: 'Cannot Cancel',
          description: `Lessons must be cancelled at least 5 days in advance. Cancelling now will result in a full charge.`,
          variant: 'destructive'
        });
        return false;
      }

      // Update lesson status
      const { error: updateError } = await supabase
        .from('lessons')
        .update({
          status: 'cancelled',
          cancellation_reason: reason
        })
        .eq('id', lessonId);

      if (updateError) throw updateError;

      // Cancel related class_bookings
      await supabase
        .from('class_bookings')
        .update({ status: 'cancelled', cancellation_reason: reason, cancelled_at: new Date().toISOString() })
        .eq('lesson_id', lessonId);

      // Re-open teacher's availability slot
      await reopenTeacherSlot(lessonId);

      const refundInfo = getRefundInfo(lesson.scheduled_at, lesson.lesson_price || 0);

      toast({
        title: 'Lesson Cancelled',
        description: isTrialOrFree
          ? 'Your trial lesson has been cancelled. You can book a new one anytime.'
          : `Refund: €${refundInfo.refundAmount.toFixed(2)}`,
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
      const { data: lesson, error: fetchError } = await supabase
        .from('lessons')
        .select('scheduled_at, reschedule_count, lesson_price')
        .eq('id', lessonId)
        .single();

      if (fetchError || !lesson) {
        throw new Error('Failed to fetch lesson details');
      }

      const isTrialOrFree = !lesson.lesson_price || lesson.lesson_price === 0;

      if (!canReschedule(lesson.scheduled_at, isTrialOrFree)) {
        toast({
          title: 'Cannot Reschedule',
          description: 'Rescheduling is only available 5+ days in advance.',
          variant: 'destructive'
        });
        return false;
      }

      // Re-open old teacher slot
      await reopenTeacherSlot(lessonId);

      const rescheduleHistory = {
        old_date: lesson.scheduled_at,
        new_date: newDateTime,
        reason: reason || 'Student requested',
        timestamp: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('lessons')
        .update({
          scheduled_at: newDateTime,
          reschedule_count: (lesson.reschedule_count || 0) + 1,
        })
        .eq('id', lessonId);

      if (updateError) throw updateError;

      // Update class_bookings too
      await supabase
        .from('class_bookings')
        .update({ scheduled_at: newDateTime })
        .eq('lesson_id', lessonId);

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
    POLICY_HOURS
  };
}
