/**
 * Local user profile types. Mirrors the subset of fields we read/write
 * from `public.student_profiles` for client-side typing convenience.
 */
export interface StudentProfile {
  user_id: string;
  hub_type?: string | null;
  onboarding_completed?: boolean | null;
  companion_id?: string | null;
}
