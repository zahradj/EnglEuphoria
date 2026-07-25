import React, { useState } from 'react';
import { useParams, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { TeacherClassroom } from '@/components/teacher/classroom';
import { StudentClassroom } from '@/components/student/classroom';

import { PreFlightCheck } from '@/components/classroom/PreFlightCheck';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ShieldOff, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SoundSettingsLauncher } from '@/components/classroom/settings/SoundSettingsLauncher';
import { resolveBookingLesson, normalizeHub } from '@/services/classroomLessonResolver';
import { ClassroomLifecycle } from '@/components/classroom/ClassroomLifecycle';
import { SuccessTrailLesson } from '@/components/trial/success-trail/SuccessTrailLesson';
import { AcademyTrailLesson } from '@/components/trial/academy-trail/AcademyTrailLesson';
import { PlaygroundTrailLesson } from '@/components/trial/playground-trail/PlaygroundTrailLesson';

import { useForceEnglishLocale } from '@/hooks/useForceEnglishLocale';
import { LessonWindowGate, bookedMinutesFor } from '@/components/classroom/LessonWindowGate';
import { getMockLesson } from '@/data/interviewMockLessons';

type ClassroomHub = 'playground' | 'academy' | 'professional';

const normalizeInterviewHub = (value?: string | null): ClassroomHub | null => {
  const v = String(value ?? '').trim().toLowerCase().replace(/[_-]+/g, ' ');
  if (!v) return null;
  if (v.includes('playground') || v.includes('kid') || v.includes('child')) return 'playground';
  if (v.includes('success') || v.includes('professional') || v.includes('adult') || v === 'hub') return 'professional';
  if (v.includes('academy') || v.includes('teen')) return 'academy';
  return null;
};

const interviewSamplerForHub = (hub: ClassroomHub) =>
  hub === 'playground'
    ? 'playground_sampler'
    : hub === 'professional'
      ? 'success_sampler'
      : 'academy_sampler';

/**
 * Unified Classroom Page
 * 
 * Single route: /classroom/:bookingId
 * 
 * Determines whether to render TeacherClassroom or StudentClassroom
 * based on the booking record. Admins get "God Mode" access.
 */
const UnifiedClassroomPage: React.FC = () => {
  useForceEnglishLocale();
  const params = useParams<{ id?: string; sessionId?: string; roomId?: string; interviewId?: string }>();
  const bookingId = params.id ?? params.sessionId ?? params.roomId ?? params.interviewId;
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [preFlightPassed, setPreFlightPassed] = useState(false);

  const userRole = (user as any)?.role;
  const isAdmin = userRole === 'admin';
  const interviewHint =
    new URLSearchParams(location.search).has('interview') ||
    String(bookingId ?? '').startsWith('interview-') ||
    location.pathname.startsWith('/interview-classroom/') ||
    location.pathname.startsWith('/interview-arena/');

  // Fetch booking to determine participant role — resolve ANY ID flavor via RPC
  const { data: booking, isLoading: bookingLoading, error: bookingError } = useQuery({
    queryKey: ['classroom-booking', bookingId, user?.id],
    queryFn: async () => {
      if (!bookingId || !user?.id) return null;

      // Resolve any flavor (class_bookings.id, classroom_id, lessons.id) → canonical booking id
      const { data: resolvedId, error: resolveError } = await supabase.rpc('resolve_classroom_id', {
        any_id: bookingId,
      });

      if (resolveError) {
        if (interviewHint) return null;
        throw resolveError;
      }
      if (!resolvedId) return null;

      const { data, error } = await supabase
        .from('class_bookings')
        .select(`
          id, teacher_id, student_id, lesson_id, curriculum_lesson_id, scheduled_at, duration, status, booking_type, hub_type, classroom_id,
          teacher:users!class_bookings_teacher_id_fkey(full_name, email),
          student:users!class_bookings_student_id_fkey(full_name, email)
        `)
        .eq('id', resolvedId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!bookingId && !!user?.id,
  });

  const { data: interview, isLoading: interviewLoading } = useQuery({
    queryKey: ['classroom-interview-fallback', bookingId, user?.id],
    queryFn: async () => {
      if (!bookingId || !user?.id) return null;
      const raw = String(bookingId);
      const uuidFromInterviewRoom = raw.startsWith('interview-') ? raw.slice('interview-'.length) : raw;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuidFromInterviewRoom);
      const filters = [`classroom_session_id.eq.${raw}`];
      if (isUuid) filters.push(`id.eq.${uuidFromInterviewRoom}`);

      const { data, error } = await supabase
        .from('interviews')
        .select('id, application_id, admin_id, applicant_user_id, teacher_email, teacher_name, mock_lesson_key, hub, hub_type, status, classroom_session_id, scheduled_at, duration_minutes')
        .or(filters.join(','))
        .maybeSingle();

      if (error) {
        if (interviewHint) console.error('[UnifiedClassroomPage] interview fallback failed', error);
        return null;
      }
      return data as any;
    },
    enabled: !!bookingId && !!user?.id,
  });

  const isTrialLesson = String((booking as any)?.booking_type ?? '').toLowerCase() === 'trial';

  // Trail lesson (self-contained gamified deck) may ONLY render for the
  // student's very first lesson on the platform. Every subsequent booking
  // — even if still typed 'trial' — must flow through the Master Library
  // resolver keyed by the student's placement-test CEFR level.
  const { data: isFirstLesson } = useQuery({
    queryKey: ['classroom-is-first-lesson', (booking as any)?.student_id, booking?.id],
    queryFn: async () => {
      const studentId = (booking as any)?.student_id;
      const bookingScheduledAt = (booking as any)?.scheduled_at;
      if (!studentId || !bookingScheduledAt) return false;
      const { count, error } = await supabase
        .from('class_bookings')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', studentId)
        .neq('id', booking!.id)
        .lt('scheduled_at', bookingScheduledAt);
      if (error) {
        console.warn('[UnifiedClassroomPage] first-lesson check failed', error);
        return false;
      }
      return (count ?? 0) === 0;
    },
    enabled: !!booking?.id && isTrialLesson,
  });

  const showTrailLesson = isTrialLesson && isFirstLesson === true;


  const { data: trialCefr } = useQuery({
    queryKey: ['classroom-trial-cefr', (booking as any)?.student_id],
    queryFn: async () => {
      const studentId = (booking as any)?.student_id;
      if (!studentId) return null;

      const { data: placement } = await (supabase as any)
        .from('placement_results')
        .select('cefr_level')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (placement?.cefr_level) return placement.cefr_level as string;

      const { data: profile } = await (supabase as any)
        .from('student_profiles')
        .select('current_level')
        .eq('user_id', studentId)
        .maybeSingle();

      return (profile?.current_level as string | null) ?? null;
    },
    enabled: !!booking?.id && isTrialLesson,
  });

  // Resolve the Master Library lesson + canonical hub for this booking.
  // Must be declared before any early return to keep hook order stable.
  const { data: resolved, isLoading: lessonLoading } = useQuery({
    queryKey: ['classroom-resolved-lesson', booking?.id, trialCefr, isFirstLesson],
    queryFn: () => resolveBookingLesson({
      id: booking!.id,
      lesson_id: (booking as any).lesson_id,
      curriculum_lesson_id: (booking as any).curriculum_lesson_id,
      hub_type: (booking as any).hub_type,
      booking_type: (booking as any).booking_type,
      cefr_level: trialCefr,
      student_id: (booking as any).student_id,
      // Trial slide fallback ONLY on the student's very first lesson.
      // Later bookings fall through to Master Library via resolveActiveCoreLesson.
      use_trial_fallback: isFirstLesson === true,
    }),
    enabled: !!booking?.id && (!isTrialLesson || (trialCefr !== undefined && isFirstLesson !== undefined)),
  });


  // Auth loading
  if (authLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-foreground text-lg font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!bookingId) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (bookingLoading || (interviewHint && interviewLoading)) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-foreground text-lg font-medium">Verifying classroom access...</p>
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    );
  }

  // Booking not found
  if (!booking && interview) {
    const isGuestApplicant = (() => {
      try { return sessionStorage.getItem(`interview_guest:${interview.id}`) === '1'; }
      catch { return false; }
    })();
    const userEmail = user.email?.toLowerCase?.() ?? '';
    const teacherEmail = interview.teacher_email?.toLowerCase?.() ?? '';
    const isBoundAdmin = interview.admin_id === user.id || isAdmin;
    const isApplicant =
      !isBoundAdmin &&
      (interview.applicant_user_id === user.id ||
        (!!teacherEmail && teacherEmail === userEmail) ||
        isGuestApplicant);
    const hasInterviewAccess = isApplicant || isBoundAdmin;

    if (!hasInterviewAccess) {
      return (
        <div className="min-h-dvh flex items-center justify-center bg-background p-6">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
              <ShieldOff className="w-10 h-10 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">This interview classroom is private</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Only the applicant and assigned interviewer can enter this demo classroom.
              </p>
            </div>
            <Button onClick={() => window.history.back()} variant="outline">Go back</Button>
          </div>
        </div>
      );
    }

    const roomId = interview.classroom_session_id || `interview-${interview.id}`;
    // Resolve hub branding: explicit hub_type wins, otherwise infer from mock_lesson_key.
    const explicitHub = normalizeInterviewHub(interview.hub_type) ?? normalizeInterviewHub((interview as any).hub);
    const hubType = explicitHub ?? normalizeInterviewHub(interview.mock_lesson_key) ?? 'academy';
    const defaultLessonKey = interviewSamplerForHub(hubType);
    const mockLesson = getMockLesson(explicitHub ? defaultLessonKey : (interview.mock_lesson_key ?? defaultLessonKey));
    const hubBadgeStyle: React.CSSProperties =
      hubType === 'playground'
        ? { background: 'linear-gradient(135deg,#FE6A2F,#F59E0B)', color: '#fff' }
        : hubType === 'professional'
          ? { background: 'linear-gradient(135deg,#059669,#10B981)', color: '#fff' }
          : { background: 'linear-gradient(135deg,#6B21A8,#A855F7)', color: '#fff' };
    const hubLabel = hubType === 'playground' ? 'Playground' : hubType === 'professional' ? 'Success' : 'Academy';
    const InterviewBadge = (
      <div
        className="fixed bottom-3 left-3 z-30 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm flex items-center gap-1.5 pointer-events-none"
        style={hubBadgeStyle}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white/90 animate-pulse" />
        Interview · {hubLabel}
      </div>
    );
    const applicantName = interview.teacher_name || teacherEmail?.split('@')[0] || 'Teacher Applicant';
    const displayName = isApplicant
      ? applicantName
      : user.user_metadata?.full_name || user.email?.split('@')[0] || 'Interviewer';

    if (!preFlightPassed) {
      return (
        <PreFlightCheck
          onComplete={() => setPreFlightPassed(true)}
          hubType={hubType}
          role={isApplicant ? 'teacher' : 'student'}
        />
      );
    }

    if (isApplicant) {
      return (
        <>
          {InterviewBadge}
          <TeacherClassroom
            classId={roomId}
            teacherName={displayName}
            studentName="Interviewer"
            studentId={interview.admin_id ?? undefined}
            hubType={hubType}
            lessonId={mockLesson.key}
            lessonTitle={mockLesson.title}
            initialSlides={mockLesson.slides as any[]}
            scheduledAt={interview.scheduled_at}
            isInterview
          />
          <SoundSettingsLauncher />
        </>
      );
    }

    return (
      <>
        {InterviewBadge}
        <StudentClassroom
          roomId={roomId}
          studentId={user.id}
          studentName={displayName}
          teacherName={applicantName}
          hubType={hubType}
          scheduledAt={interview.scheduled_at}
          isInterview
        />
        <SoundSettingsLauncher />
      </>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
            <ShieldOff className="w-10 h-10 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Booking Not Found</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              This classroom session does not exist or has been cancelled.
            </p>
            {isAdmin && (
              <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-left text-xs">
                <div className="flex items-center gap-2 mb-1 text-yellow-400 font-semibold">
                  <Bug className="h-3 w-3" /> Admin Debug
                </div>
                <p className="text-muted-foreground">
                  Booking ID: <code className="text-foreground">{bookingId}</code><br/>
                  User ID: <code className="text-foreground">{user.id}</code><br/>
                  Error: {bookingError?.message || 'No booking found with this ID'}
                </p>
              </div>
            )}
          </div>
          <Button onClick={() => window.history.back()} variant="outline">Go back</Button>
        </div>
      </div>
    );
  }

  // Determine classroom role
  const isTeacher = booking.teacher_id === user.id;
  const isStudent = booking.student_id === user.id;
  const hasAccess = isTeacher || isStudent || isAdmin;

  // Access denied
  if (!hasAccess) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
            <ShieldOff className="w-10 h-10 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">This session is private</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              You don't have access to this classroom. Only the student and teacher
              associated with this booking can enter.
            </p>
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-left text-xs">
              <p className="text-muted-foreground">
                <strong>ID Mismatch:</strong><br/>
                Your ID: <code className="text-foreground">{user.id}</code><br/>
                Booking Teacher: <code className="text-foreground">{booking.teacher_id}</code><br/>
                Booking Student: <code className="text-foreground">{booking.student_id}</code>
              </p>
            </div>
          </div>
          <Button onClick={() => window.history.back()} variant="outline">Go back</Button>
        </div>
      </div>
    );
  }

  // Admin "God Mode" — admin enters as teacher view by default
  const classroomRole: 'teacher' | 'student' = isTeacher || (isAdmin && !isStudent) ? 'teacher' : 'student';

  // Prefer the fully-resolved lesson's hub, but fall back to the booking's
  // own hub_type (known as soon as the booking loads, well before the
  // lesson-content resolution completes) instead of hardcoding 'academy' —
  // that mismatch was causing a purple flash before the correct hub color
  // (e.g. orange for Playground) took over in the pre-flight waiting room.
  const normalizedHub: 'playground' | 'academy' | 'professional' =
    resolved?.hubType ?? normalizeHub((booking as any)?.hub_type);

  // Hub-aware booked duration: Playground = 30min, Academy/Success = 60min.
  const scheduledAtIso: string | null = (booking as any)?.scheduled_at ?? null;
  const bookedMinutes = bookedMinutesFor(normalizedHub, (booking as any)?.duration);

  if (!preFlightPassed) {
    return (
      <PreFlightCheck
        onComplete={() => setPreFlightPassed(true)}
        hubType={normalizedHub}
        role={classroomRole}
      />
    );
  }

  if (lessonLoading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-foreground text-lg font-medium">Loading lesson…</p>
        </div>
      </div>
    );
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Participant';

  const teacherRow: any = (booking as any).teacher;
  const studentRow: any = (booking as any).student;
  const teacherFullName =
    teacherRow?.full_name || teacherRow?.email?.split('@')[0] || 'Teacher';
  const studentFullName =
    studentRow?.full_name || studentRow?.email?.split('@')[0] || 'Student';

  // Hub-aware trail lesson rendering — first lesson only. Subsequent
  // lessons fall through to the Master Library resolver (CEFR-aware).
  const trailStage =
    showTrailLesson && normalizedHub === 'professional'
      ? <SuccessTrailLesson roomId={booking.id} role={classroomRole} />
      : showTrailLesson && normalizedHub === 'academy'
        ? <AcademyTrailLesson roomId={booking.id} role={classroomRole} />
        : showTrailLesson && normalizedHub === 'playground'
          ? <PlaygroundTrailLesson roomId={booking.id} role={classroomRole} />
          : undefined;



  if (classroomRole === 'teacher') {
    return (
      <LessonWindowGate scheduledAt={scheduledAtIso} bookedMinutes={bookedMinutes} bypass={isAdmin}>
        <TeacherClassroom
          classId={booking.id}
          teacherName={displayName}
          studentName={studentFullName}
          studentId={booking.student_id}
          hubType={normalizedHub}
          lessonId={resolved?.lessonId ?? undefined}
          lessonTitle={resolved?.lessonTitle ?? undefined}
          initialSlides={resolved?.slides ?? []}
          scheduledAt={scheduledAtIso}
          customStage={trailStage}
          isTrial={isTrialLesson && isFirstLesson === true}
        />
        <ClassroomLifecycle
          bookingId={booking.id}
          role="teacher"
          hubType={normalizedHub}
          trialHandoff={
            isTrialLesson && isFirstLesson === true && (booking as any).student_id
              ? { studentId: (booking as any).student_id, cefrLevel: trialCefr ?? null }
              : null
          }
          progressAdvance={
            !isTrialLesson && (booking as any).student_id && resolved?.lessonId
              ? { studentId: (booking as any).student_id, lessonId: resolved.lessonId }
              : null
          }
        />
        <SoundSettingsLauncher />
      </LessonWindowGate>
    );
  }

  return (
    <LessonWindowGate scheduledAt={scheduledAtIso} bookedMinutes={bookedMinutes} bypass={isAdmin}>
      <StudentClassroom
        roomId={booking.id}
        studentId={user.id}
        studentName={displayName}
        teacherName={teacherFullName}
        hubType={normalizedHub}
        scheduledAt={scheduledAtIso}
        customStage={trailStage}
      />
      <ClassroomLifecycle
        bookingId={booking.id}
        role="student"
        hubType={normalizedHub}
        trialHandoff={
          isTrialLesson && isFirstLesson === true && (booking as any).student_id
            ? { studentId: (booking as any).student_id, cefrLevel: trialCefr ?? null }
            : null
        }
      />
      <SoundSettingsLauncher />
    </LessonWindowGate>
  );
};

export default UnifiedClassroomPage;
