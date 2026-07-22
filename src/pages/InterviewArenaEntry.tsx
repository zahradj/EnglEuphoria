/**
 * InterviewArenaEntry — bootstraps an Interview Arena session.
 *
 * Flow:
 *  1. Resolve `interviews` row by `:interviewId`.
 *  2. Compute deterministic `sessionId = interview-<interviewId>`.
 *  3. Upsert `classroom_states` row stamped `is_interview = true` and the
 *     interview's `mock_lesson_key` so LiveClassroom serves the mock lesson.
 *  4. Persist the binding back to `interviews.classroom_session_id`.
 *  5. Navigate to `/live-classroom/:sessionId` — the actual hybrid UI lives there.
 *
 * Both admin and applicant hit this same route from their respective entry
 * points; the upsert is idempotent so whoever arrives second just navigates.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type CanonicalHub = 'playground' | 'academy' | 'success';

const normalizeHub = (value?: string | null): CanonicalHub | null => {
  const v = String(value ?? '').trim().toLowerCase().replace(/[_-]+/g, ' ');
  if (!v) return null;
  if (v.includes('playground') || v.includes('kid') || v.includes('child')) return 'playground';
  if (v.includes('success') || v.includes('professional') || v.includes('adult') || v === 'hub') return 'success';
  if (v.includes('academy') || v.includes('teen')) return 'academy';
  return null;
};

const samplerForHub = (hub: CanonicalHub) =>
  hub === 'playground' ? 'playground_sampler' : hub === 'success' ? 'success_sampler' : 'academy_sampler';

export default function InterviewArenaEntry() {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!interviewId || !user?.id) return;
    let cancelled = false;

    (async () => {
      try {
        const { data: interview, error: fetchErr } = await supabase
          .from('interviews')
          .select(
            'id, admin_id, applicant_user_id, teacher_email, mock_lesson_key, classroom_session_id, hub, hub_type',
          )
          .eq('id', interviewId)
          .maybeSingle();
        if (fetchErr) throw fetchErr;
        if (!interview) {
          setError('Interview not found or you do not have access.');
          return;
        }

        // Canonical hub column is `hub_type` (set by interview-book-slot).
        // Some older rows used `hub`; honor whichever is populated.
        const hubKey = normalizeHub((interview as any).hub_type) ?? normalizeHub((interview as any).hub);
        const hubDerivedMockKey = hubKey ? samplerForHub(hubKey) : null;

        // Trust hub_type as the source of truth. The stored `mock_lesson_key`
        // is only used when there is no hub mapping (legacy rows w/o hub_type),
        // otherwise it would override the applicant's chosen hub.
        const canonicalMockKey =
          hubDerivedMockKey ?? interview.mock_lesson_key ?? 'playground_sampler';


        // Authorize: bound admin OR matching applicant only.
        const email = (user as any)?.email?.toLowerCase?.() ?? '';
        const isApplicant =
          (!!interview.applicant_user_id && interview.applicant_user_id === user.id) ||
          (!!interview.teacher_email &&
            interview.teacher_email.toLowerCase() === email);
        const isAdmin = !!interview.admin_id && interview.admin_id === user.id;
        if (!isApplicant && !isAdmin) {
          setError('You are not authorized to join this interview.');
          return;
        }

        const sessionId =
          interview.classroom_session_id || `interview-${interview.id}`;

        // If applicant is the first to claim themselves, persist user_id link.
        if (isApplicant && !interview.applicant_user_id) {
          await supabase
            .from('interviews')
            .update({ applicant_user_id: user.id })
            .eq('id', interview.id);
        }

        // Heal the interview row if its stored mock_lesson_key drifted from hub.
        if (
          hubDerivedMockKey &&
          interview.mock_lesson_key !== hubDerivedMockKey
        ) {
          await supabase
            .from('interviews')
            .update({ mock_lesson_key: hubDerivedMockKey, hub_type: hubKey, hub: hubKey } as any)
            .eq('id', interview.id);
        }

        // Admin bootstraps the classroom row (acts as the row's teacher_id).
        // Applicant only joins; if no row exists yet, ask them to wait.
        const { data: existing } = await supabase
          .from('classroom_states')
          .select('id, mock_lesson_key')
          .eq('session_id', sessionId)
          .maybeSingle();

        // Repair: heal pre-existing rows whose mock_lesson_key drifted from hub.
        if (existing && (existing as any).mock_lesson_key !== canonicalMockKey) {
          await supabase
            .from('classroom_states')
            .update({ mock_lesson_key: canonicalMockKey } as any)
            .eq('session_id', sessionId);
        }

        if (!existing) {
          if (!isAdmin) {
            setError(
              'Your interviewer has not opened the arena yet. Please wait for them to join, then refresh.',
            );
            return;
          }
          await supabase.from('classroom_states').insert({
            session_id: sessionId,
            teacher_id: interview.applicant_user_id ?? user.id,
            lesson_id: null,
            current_slide_index: 0,
            is_interview: true,
            mock_lesson_key: canonicalMockKey,
          } as any);
        }


        if (!interview.classroom_session_id) {
          await supabase
            .from('interviews')
            .update({ classroom_session_id: sessionId })
            .eq('id', interview.id);
        }

        if (!cancelled) {
          navigate(`/live-classroom/${sessionId}?interview=1`, { replace: true });
        }
      } catch (e: any) {
        console.error('[InterviewArenaEntry]', e);
        if (!cancelled) setError(e?.message ?? 'Failed to open interview arena.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [interviewId, user?.id, navigate, user]);

  if (error) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-3">
            <ShieldAlert className="h-10 w-10 text-destructive mx-auto" />
            <h2 className="text-lg font-bold">Interview Arena</h2>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={() => navigate('/')}>
              Back to home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Preparing your interview arena…
      </div>
    </div>
  );
}
