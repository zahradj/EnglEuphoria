import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { StudentClassroom } from '@/components/student/classroom';
import { Skeleton } from '@/components/ui/skeleton';
import { SessionPrivacyGuard } from '@/components/classroom/SessionPrivacyGuard';
import { PreFlightCheck } from '@/components/classroom/PreFlightCheck';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useForceEnglishLocale } from '@/hooks/useForceEnglishLocale';
import { LessonWindowGate, bookedMinutesFor } from '@/components/classroom/LessonWindowGate';
import { AcademyHubProvider } from '@/components/academy/HubGuard';
import AcademyLoader from '@/components/academy/AcademyLoader';

const StudentClassroomPage: React.FC = () => {
  useForceEnglishLocale();
  const { id: roomId } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const [preFlightPassed, setPreFlightPassed] = useState(false);

  // Validate that the booking exists and belongs to this student
  const { data: booking, isLoading: bookingLoading } = useQuery({
    queryKey: ['booking-access', roomId, user?.id],
    queryFn: async () => {
      if (!roomId || !user?.id) return null;
      const { data, error } = await supabase
        .from('class_bookings')
        .select('id, teacher_id, student_id, scheduled_at, duration, status')
        .eq('id', roomId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!roomId && !!user?.id,
  });

  if (loading || bookingLoading) {
    return (
      <AcademyHubProvider>
        <AcademyLoader />
      </AcademyHubProvider>
    );
  }

  if (!roomId) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If booking not found or user is not the student, show a friendly empty state
  if (!booking || booking.student_id !== user.id) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-indigo-50 via-violet-50 to-emerald-50 p-6">
        <div className="max-w-md w-full bg-white/90 backdrop-blur rounded-3xl shadow-xl border border-indigo-100 p-8 text-center space-y-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mx-auto text-4xl">
            📚
          </div>
          <h1 className="text-2xl font-bold text-gray-900">No active classroom</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            We couldn't find a live session for this link. It may have ended, been cancelled,
            or belong to a different student. Head back to your dashboard to book or join your next class.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-md hover:scale-105 transition-transform"
          >
            Back to dashboard
          </a>
        </div>
      </div>
    );
  }


  if (!preFlightPassed) {
    return <PreFlightCheck onComplete={() => setPreFlightPassed(true)} hubType="academy" role="student" />;
  }

  const studentName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student';
  const scheduledAtIso = (booking as any)?.scheduled_at ?? null;
  const bookedMinutes = bookedMinutesFor('academy', (booking as any)?.duration);

  return (
    <AcademyHubProvider>
      <SessionPrivacyGuard sessionId={roomId}>
        <LessonWindowGate scheduledAt={scheduledAtIso} bookedMinutes={bookedMinutes}>
          <StudentClassroom
            roomId={roomId}
            studentId={user.id}
            studentName={studentName}
            scheduledAt={scheduledAtIso}
          />
        </LessonWindowGate>
      </SessionPrivacyGuard>
    </AcademyHubProvider>
  );
};


export default StudentClassroomPage;
