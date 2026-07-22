import { supabase } from '@/integrations/supabase/client';
import { SystemId, SystemTransition, TriggerReason } from '@/types/multiTenant';

export interface GraduationResult {
  success: boolean;
  newSystemId?: SystemId;
  transition?: SystemTransition;
  error?: string;
}

const GRADUATION_PATH: Record<SystemId, SystemId | null> = {
  kids: 'teen',
  teen: 'adult',
  adult: null, // Cannot graduate further
};

// Log a system transition for audit purposes
async function logSystemTransition(
  userId: string,
  fromSystem: SystemId | null,
  toSystem: SystemId,
  reason: TriggerReason,
  triggeredBy?: string
): Promise<SystemTransition | null> {
  const { data, error } = await supabase
    .from('system_transitions')
    .insert({
      user_id: userId,
      from_system: fromSystem,
      to_system: toSystem,
      trigger_reason: reason,
      triggered_by: triggeredBy || null,
      metadata: {},
    })
    .select()
    .single();

  if (error) {
    console.error('Error logging system transition:', error);
    return null;
  }

  return data as SystemTransition;
}

// Get transition history for a user
export async function getTransitionHistory(userId: string): Promise<SystemTransition[]> {
  const { data, error } = await supabase
    .from('system_transitions')
    .select('*')
    .eq('user_id', userId)
    .order('transition_date', { ascending: false });

  if (error) {
    console.error('Error fetching transition history:', error);
    return [];
  }

  return (data || []) as SystemTransition[];
}

// Graduate a student to the next system level
export async function graduateStudent(
  userId: string,
  reason: TriggerReason = 'course_completed',
  triggeredBy?: string
): Promise<GraduationResult> {
  try {
    // Get current system_id
    const { data: profile, error: fetchError } = await supabase
      .from('student_profiles')
      .select('system_id')
      .eq('user_id', userId)
      .single();

    if (fetchError || !profile) {
      return { success: false, error: 'Profile not found' };
    }

    const currentSystem = (profile.system_id || 'kids') as SystemId;
    const newSystem = GRADUATION_PATH[currentSystem];

    if (!newSystem) {
      return { success: false, error: 'Already at the highest level' };
    }

    // Update to new system
    const { error: updateError } = await supabase
      .from('student_profiles')
      .update({ system_id: newSystem })
      .eq('user_id', userId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Log the transition
    const transition = await logSystemTransition(
      userId,
      currentSystem,
      newSystem,
      reason,
      triggeredBy
    );

    return { success: true, newSystemId: newSystem, transition: transition || undefined };
  } catch (error) {
    console.error('Graduation error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Set a student's system directly (with audit logging)
export async function setStudentSystem(
  userId: string,
  systemId: SystemId,
  reason: TriggerReason = 'manual_override',
  triggeredBy?: string
): Promise<boolean> {
  // Get current system for logging
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('system_id')
    .eq('user_id', userId)
    .single();

  const currentSystem = (profile?.system_id || null) as SystemId | null;

  // Update the system
  const { error } = await supabase
    .from('student_profiles')
    .update({ system_id: systemId })
    .eq('user_id', userId);

  if (error) {
    console.error('Error setting system:', error);
    return false;
  }

  // Log the transition
  await logSystemTransition(userId, currentSystem, systemId, reason, triggeredBy);

  return true;
}

// Check if a student should be graduated based on age
export async function checkAgeBasedGraduation(
  userId: string,
  dateOfBirth: Date
): Promise<GraduationResult | null> {
  const age = Math.floor(
    (Date.now() - dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );

  // Get current system
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('system_id')
    .eq('user_id', userId)
    .single();

  const currentSystem = (profile?.system_id || 'kids') as SystemId;

  // Age thresholds
  if (currentSystem === 'kids' && age >= 12) {
    return graduateStudent(userId, 'age_limit_reached');
  }

  if (currentSystem === 'teen' && age >= 18) {
    return graduateStudent(userId, 'age_limit_reached');
  }

  return null; // No graduation needed
}
