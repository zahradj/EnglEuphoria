import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { TeacherClassroom } from '@/components/teacher/classroom';
import { SessionPrivacyGuard } from '@/components/classroom/SessionPrivacyGuard';
import { PreFlightCheck } from '@/components/classroom/PreFlightCheck';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useForceEnglishLocale } from '@/hooks/useForceEnglishLocale';
import { LessonWindowGate, bookedMinutesFor } from '@/components/classroom/LessonWindowGate';

const TeacherClassroomPage: React.FC = () => {
  useForceEnglishLocale();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [preFlightPassed, setPreFlightPassed] = useState(false);

  // Validate that the booking exists and belongs to this teacher
  const { data: booking, isLoading: bookingLoading, error: bookingError } = useQuery({
    queryKey: ['booking-access', id, user?.id],
    queryFn: async () => {
      if (!id || !user?.id) return null;
      const { data, error } = await supabase
        .from('class_bookings')
        .select('id, teacher_id, student_id, scheduled_at, duration, status')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user?.id,
  });

  if (!id) {
    return <Navigate to="/teacher" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (bookingLoading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    );
  }

  // If booking not found or user is not the teacher, redirect
  if (!booking || booking.teacher_id !== user.id) {
    return <Navigate to="/teacher" replace />;
  }

  if (!preFlightPassed) {
    return <PreFlightCheck onComplete={() => setPreFlightPassed(true)} hubType="academy" role="teacher" />;
  }

  const teacherName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Teacher';
  const scheduledAtIso = (booking as any)?.scheduled_at ?? null;
  const bookedMinutes = bookedMinutesFor('academy', (booking as any)?.duration);

  return (
    <SessionPrivacyGuard sessionId={id}>
      <LessonWindowGate scheduledAt={scheduledAtIso} bookedMinutes={bookedMinutes}>
        <TeacherClassroom
          classId={id}
          teacherName={teacherName}
          scheduledAt={scheduledAtIso}
        />
      </LessonWindowGate>
    </SessionPrivacyGuard>
  );
};

export default TeacherClassroomPage;
