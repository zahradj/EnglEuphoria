import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LiveActivityOverlay } from './LiveActivityOverlay';

import { useToast } from '@/hooks/use-toast';
import { useClassroomHeartbeat } from '@/hooks/classroom/useClassroomHeartbeat';
import { SafeToLeaveButton } from './SafeToLeaveButton';
import { TrialCoreIndicator } from './TrialCoreIndicator';

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
   *
   * NOTE: this listener is gated on `classroom_states.status` flipping to
   * 'ended', but nothing in the real live-lesson flow (TeacherClassroom.tsx
   * -> endLesson.ts) writes that row for a normal booking — only orphaned
   * code (useLiveClassroom.ts / classroom/unified / interview edge
   * functions) does. The working trial handoff now lives in
   * LessonWrapUpDialog.tsx's handleSubmit. This prop is kept as a harmless,
   * deduped no-op for real bookings rather than removed outright.
   */
  trialHandoff?: { studentId: string; cefrLevel: string | null } | null;
}

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
export const ClassroomLifecycle: React.FC<Props> = ({ bookingId, role, hubType = 'academy', trialHandoff = null }) => {
  const [status, setStatus] = useState<'waiting' | 'live' | 'ended' | null>(null);
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
        // The booking row carries the new curriculum_lesson_id (and a trial
        // level change also updates the saved level), so refresh those
        // before re-resolving the lesson.
        Promise.all([
          qc.invalidateQueries({ queryKey: ['classroom-booking'] }),
          qc.invalidateQueries({ queryKey: ['classroom-trial-cefr'] }),
        ]).finally(() => qc.invalidateQueries({ queryKey: ['classroom-resolved-lesson'] }));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, role, toast, qc]);


  // Resolve classroom_sessions row for telemetry.
  //
  // This row is created asynchronously by a *sibling* <TeacherClassroom>
  // component (classroomSyncService.createOrUpdateSession, via
  // useClassroomSync), not by this component or a parent -- so there's a
  // real race at mount: if this fetch ran first, it used to find nothing,
  // and since this effect never re-runs (deps: [bookingId] only), `session`
  // stayed null for the rest of the class. That silently disabled the
  // heartbeat / student-joined-detection subsystem below (useClassroomHeartbeat
  // bails on a null sessionId) even though the lesson itself ran fine end to
  // end on its own separate sync path -- producing exactly the "class ran
  // well past its booked time, but ending still warns the student will be
  // marked a no-show" bug, since `student_joined_at` never got the chance to
  // be stamped. Mirrors the retry loop already used for this identical race
  // on the student side of useClassroomSync.ts.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (let attempt = 0; attempt < 6; attempt++) {
        if (cancelled) return;
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
        if (row) {
          if (!cancelled) {
            setSession({
              id: row.id,
              lesson_type: (row.lesson_type ?? 'standard') as 'trial' | 'standard',
              scheduled_at: row.scheduled_at,
              duration_minutes: row.duration_minutes ?? 60,
              student_joined_at: row.student_joined_at,
              started_at: row.started_at,
            });
          }
          return;
        }
        await new Promise((r) => setTimeout(r, 1000));
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
            if (next === 'ended' && prev !== 'ended' && role === 'teacher' && trialHandoff?.studentId && trialHandoff.cefrLevel) {
              // Trial → CEFR handoff (teacher-side). A direct insert here was
              // blocked by RLS (students-only), so the level never saved; the
              // set_trial_level RPC saves it to the profile, placement and
              // learning path, and skips if the teacher already set a level.
              (async () => {
                try {
                  const { error } = await (supabase as any).rpc('set_trial_level', {
                    p_booking_id: bookingId,
                    p_cefr: trialHandoff.cefrLevel,
                    p_only_if_unset: true,
                  });
                  if (error) throw error;
                } catch (e) {
                  console.warn('[ClassroomLifecycle] trial handoff failed', e);
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
  }, [bookingId, role, navigate, toast, session?.id, trialHandoff?.studentId, trialHandoff?.cefrLevel, hubType]);

  // Teacher flips status → 'live' on first mount (idempotent)
  useEffect(() => {
    if (role !== 'teacher' || !status || status !== 'waiting') return;
    (async () => {
      const { error: liveErr } = await supabase
        .from('classroom_states')
        .update({ status: 'live', started_at: new Date().toISOString() })
        .eq('session_id', bookingId);
      if (liveErr) console.error('[ClassroomLifecycle] classroom_states status=live update failed:', liveErr);
    })();
  }, [role, status, bookingId]);

  return (
    <>
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
