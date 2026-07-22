import { supabase } from '@/lib/supabase';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
  isTrial?: boolean;
}

export const bookingValidationService = {
  /**
   * Check if a student is eligible for a free trial lesson
   * (has never completed or booked any lesson before)
   */
  async isEligibleForTrial(studentId: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('class_bookings')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', studentId)
      .neq('status', 'cancelled');

    if (error) return false;
    return (count ?? 0) === 0;
  },
};
