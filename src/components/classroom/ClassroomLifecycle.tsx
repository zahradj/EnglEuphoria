import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EntryCountdown } from './EntryCountdown';
import { LiveActivityOverlay } from './LiveActivityOverlay';

import { useToast } from '@/hooks/use-toast';
import { useClassroomHeartbeat } from '@/hooks/classroom/useClassroomHeartbeat';
import { SafeToLeaveButton } from './SafeToLeaveButton';
import { TrialCoreIndicator } from './TrialCoreIndicator';
import { advanceCurriculumProgress } from '@/services/activeCoreLessonResolver';

interface Props {
  bookingId: string;
  role: 'teacher' | 'student';
  hubType?: 'playground' | 'academy' | 'professional';
  /**
   * When set, on lifecycle `ended` we insert this CEFR level into
   * `placement_results` for the student so their next booking flows
   * through the Master Library at the right level. Meant for trial
   * lessons on the student's FIRST booking only. Deduped by checking
   * for an existing `method = 'trial_lesson'` row for the student.
   */
  trialHandoff?: { studentId: string; cefrLevel: string | null } | null;
  /**
   * When set, on lifecycle `ended` we advance the student's Master
   * Library pointer to the next lesson. Fires teacher-side only.
   */
  progressAdvance?: { studentId: string; lessonId: string } | null;
}

const HUB_RING: Record<string, string> = {
  playground: 'hsl(28 95% 58%)',
  academy: 'hsl(265 70% 47%)',
  professional: 'hsl(160 84% 32%)',
};

interface SessionMeta {
  id: string;
  lesson_type: 'trial' | 'standard';
  scheduled_at: string | null;
  duration_minutes: number;
  student_joined_at: string | null;
  started_at: string | null;
}

/**
 * Top-level live-classroom lifecycle controller.
 * - Subscribes to classroom_states.status for this booking
 * - Resolves the classroom_sessions row for telemetry (heartbeat + Safe to Leave)
 * - Shows EntryCountdown when status flips to 'live'
 */
export const ClassroomLifecycle: React.FC<Props> = ({ bookingId, role, hubType = 'academy', trialHandoff = null, progressAdvance = null }) => {
  const [status, setStatus] = useState<'waiting' | 'live' | 'ended' | null>(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const [session, setSession] = useState<SessionMeta | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();

  // Listen for teacher-side `lesson_switched` broadcast — student sees a toast,
  // teacher sees the "reloading" toast from LessonSwitcher itself.
  useEffect(() => {
    const channel = supabase.channel(`classroom-events:${bookingId}`);
    channel
      .on('broadcast', { event: 'lesson_switched' }, ({ payload }: any) => {
        if (role === 'student') {
          toast({
            title: 'Your teacher switched lessons',
            description: payload?.lessonTitle ? `Now: ${payload.lessonTitle}` : 'Loading the new lesson…',
          });
        }
        qc.invalidateQueries({ queryKey: ['classroom-resolved-lesson'] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, role, toast, qc]);


  // Resolve classroom_sessions row for telemetry
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: byBooking } = await supabase
        .from('classroom_sessions')
        .select('id, lesson_type, scheduled_at, duration_minutes, student_joined_at, started_at')
        .eq('booking_id', bookingId)
        .maybeSingle();
      let row: any = byBooking;
      if (!row) {
        const { data: byRoom } = await supabase
          .from('classroom_sessions')
          .select('id, lesson_type, scheduled_at, duration_minutes, student_joined_at, started_at')
          .eq('room_id', bookingId)
          .maybeSingle();
        row = byRoom;
      }
      if (!cancelled && row) {
        setSession({
          id: row.id,
          lesson_type: (row.lesson_type ?? 'standard') as 'trial' | 'standard',
          scheduled_at: row.scheduled_at,
          duration_minutes: row.duration_minutes ?? 60,
          student_joined_at: row.student_joined_at,
          started_at: row.started_at,
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  // Telemetry heartbeat (5s ping; joined_at stamping handled server-side via RPC)
  useClassroomHeartbeat({ sessionId: session?.id ?? null, role });

  // Realtime: peer's joined_at + lifecycle status
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('classroom_states')
        .select('status')
        .eq('session_id', bookingId)
        .maybeSingle();
      if (!cancelled && data) setStatus((data as any).status ?? 'waiting');
    })();

    const channel = supabase
      .channel(`classroom-lifecycle:${bookingId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'classroom_states', filter: `session_id=eq.${bookingId}` },
        (payload) => {
          const next = (payload.new as any)?.status;
          if (!next) return;
          setStatus((prev) => {
            if (next === 'live' && prev !== 'live') setShowCountdown(true);
            if (next === 'ended' && prev !== 'ended' && role === 'teacher' && trialHandoff?.studentId && trialHandoff.cefrLevel) {
              // Trial → CEFR handoff (teacher-side, deduped by student+method).
              (async () => {
                try {
                  const { data: existing } = await (supabase as any)
                    .from('placement_results')
                    .select('id')
                    .eq('student_id', trialHandoff.studentId)
                    .eq('method', 'trial_lesson')
                    .limit(1)
                    .maybeSingle();
                  if (existing?.id) return;
                  await (supabase as any).from('placement_results').insert({
                    student_id: trialHandoff.studentId,
                    cefr_level: trialHandoff.cefrLevel,
                    method: 'trial_lesson',
                    hub: hubType,
                  });
                } catch (e) {
                  console.warn('[ClassroomLifecycle] trial handoff failed', e);
                }
              })();
            }
            if (next === 'ended' && prev !== 'ended' && role === 'teacher' && progressAdvance?.studentId && progressAdvance.lessonId) {
              // Advance student's Master Library pointer for booking #2+.
              (async () => {
                try {
                  await advanceCurriculumProgress(progressAdvance.studentId, progressAdvance.lessonId);
                } catch (e) {
                  console.warn('[ClassroomLifecycle] advanceCurriculumProgress failed', e);
                }
              })();
            }
            if (next === 'ended' && role === 'student') {
              // Trial → placement toast. If the teacher's handoff wrote a
              // placement_results row for this student, surface the CEFR so
              // the student sees the outcome before the summary page.
              (async () => {
                try {
                  if (session?.lesson_type === 'trial') {
                    // Give the teacher's insert a moment to land.
                    await new Promise((r) => setTimeout(r, 400));
                    const { data: authData } = await supabase.auth.getUser();
                    const uid = authData?.user?.id;
                    if (uid) {
                      const { data: pr } = await (supabase as any)
                        .from('placement_results')
                        .select('cefr_level')
                        .eq('student_id', uid)
                        .eq('method', 'trial_lesson')
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .maybeSingle();
                      if (pr?.cefr_level) {
                        toast({
                          title: `Your level: ${pr.cefr_level}`,
                          description: 'Saved from your trial — your next lessons are tuned to this level.',
                        });
                      }
                    }
                  }
                } catch (e) {
                  console.warn('[ClassroomLifecycle] trial placement toast failed', e);
                }
              })();
              toast({ title: 'Lesson ended', description: 'Heading to your feedback…' });
              setTimeout(() => navigate(`/classroom/${bookingId}/summary`), 1500);
            }
            return next;
          });
        },
      )
      .subscribe();

    // Watch session telemetry row for student_joined_at flip
    let sessionChannel: any = null;
    if (session?.id) {
      sessionChannel = supabase
        .channel(`classroom-session-meta:${session.id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'classroom_sessions', filter: `id=eq.${session.id}` },
          (payload) => {
            const n = payload.new as any;
            setSession((prev) =>
              prev
                ? { ...prev, student_joined_at: n.student_joined_at, started_at: n.started_at ?? prev.started_at }
                : prev,
            );
          },
        )
        .subscribe();
    }

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      if (sessionChannel) supabase.removeChannel(sessionChannel);
    };
  }, [bookingId, role, navigate, toast, session?.id, trialHandoff?.studentId, trialHandoff?.cefrLevel, progressAdvance?.studentId, progressAdvance?.lessonId, hubType]);

  // Teacher flips status → 'live' on first mount (idempotent)
  useEffect(() => {
    if (role !== 'teacher' || !status || status !== 'waiting') return;
    (async () => {
      await supabase
        .from('classroom_states')
        .update({ status: 'live', started_at: new Date().toISOString() })
        .eq('session_id', bookingId);
    })();
  }, [role, status, bookingId]);

  return (
    <>
      <EntryCountdown
        active={showCountdown}
        seconds={30}
        onComplete={() => setShowCountdown(false)}
        hubColor={HUB_RING[hubType] ?? HUB_RING.academy}
      />
      {role === 'teacher' && (
        <div className="fixed top-2.5 right-4 z-[60] flex items-center gap-2">
          {session && (
            <>
              <TrialCoreIndicator
                active={session.lesson_type === 'trial' && !!session.student_joined_at}
                startedAt={session.started_at}
                scheduledAt={session.scheduled_at}
              />
              <SafeToLeaveButton
                sessionId={session.id}
                lessonType={session.lesson_type}
                scheduledAt={session.scheduled_at}
                durationMinutes={session.duration_minutes}
                studentJoined={!!session.student_joined_at}
                startedAt={session.started_at}
              />
            </>
          )}

        </div>
      )}
      <LiveActivityOverlay bookingId={bookingId} isTeacher={role === 'teacher'} />
    </>
  );
};

export default ClassroomLifecycle;
