/**
 * useInterviewRole — derive Interview Arena role overrides.
 *
 * For an interview-mode classroom session:
 *  - The applicant (matched by `applicant_user_id` or `teacher_email`) is
 *    forced into the `teacher` UI so they can demonstrate platform proficiency.
 *  - The bound super admin (`admin_id`) is forced into the `student` UI so
 *    they experience the canvas exactly as a learner would, AND gets the
 *    admin scorecard side-panel.
 *  - Anyone else is denied (`forbidden: true`).
 *
 * For non-interview sessions, returns `{ isInterview: false }` and the caller
 * keeps its original role logic.
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface InterviewMeta {
  id: string;
  application_id: string;
  admin_id: string | null;
  applicant_user_id: string | null;
  teacher_email: string | null;
  teacher_name: string | null;
  mock_lesson_key: string | null;
  hub_type: string | null;
  scorecard: Record<string, any> | null;
  admin_notes: string | null;
  status: string;
  classroom_session_id: string | null;
}

export interface InterviewRoleResult {
  loading: boolean;
  isInterview: boolean;
  interview: InterviewMeta | null;
  /** Role the LiveClassroom canvas should treat this user as. */
  effectiveRole: 'teacher' | 'student';
  /** True only for the bound super admin — unlocks the scorecard drawer. */
  showAdminScorecard: boolean;
  /** True when this session is an interview but the current user is neither admin nor applicant. */
  forbidden: boolean;
}

export function useInterviewRole(
  sessionId: string,
  user: { id?: string; email?: string | null } | null,
  isInterviewHint?: boolean,
): InterviewRoleResult {
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState<InterviewMeta | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('interviews')
        .select(
          'id, application_id, admin_id, applicant_user_id, teacher_email, teacher_name, mock_lesson_key, hub_type, scorecard, admin_notes, status, classroom_session_id',
        )
        .eq('classroom_session_id', sessionId)
        .maybeSingle();
      if (!cancelled) {
        setInterview((data as InterviewMeta | null) ?? null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const isInterview = !!interview || !!isInterviewHint;

  if (!isInterview || !interview || !user?.id) {
    return {
      loading,
      isInterview,
      interview,
      effectiveRole: 'student',
      showAdminScorecard: false,
      forbidden: false,
    };
  }

  // Magic-link guests are marked in sessionStorage by InterviewMagicEntry.
  // Anonymous auth users carry no email, so this is the only way to recognize
  // them as the applicant for this specific interview.
  let isGuestApplicant = false;
  try {
    isGuestApplicant =
      typeof window !== 'undefined' &&
      window.sessionStorage.getItem(`interview_guest:${interview.id}`) === '1';
  } catch {
    isGuestApplicant = false;
  }

  const isApplicant =
    (!!interview.applicant_user_id && interview.applicant_user_id === user.id) ||
    (!!interview.teacher_email &&
      !!user.email &&
      interview.teacher_email.toLowerCase() === user.email.toLowerCase()) ||
    isGuestApplicant;

  const isBoundAdmin = !!interview.admin_id && interview.admin_id === user.id;

  return {
    loading,
    isInterview: true,
    interview,
    effectiveRole: isApplicant ? 'teacher' : 'student',
    showAdminScorecard: isBoundAdmin && !isApplicant,
    forbidden: !isApplicant && !isBoundAdmin,
  };
}

