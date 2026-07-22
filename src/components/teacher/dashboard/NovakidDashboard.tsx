import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeacherHubRole } from '@/hooks/useTeacherHubRole';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { TeacherWelcomeHero } from './TeacherWelcomeHero';
import { DeviceCheckBanner } from './DeviceCheckBanner';
import { NextLessonCard } from './NextLessonCard';
import { MonthlyStatsCard } from './MonthlyStatsCard';
import { LessonsListCard } from './LessonsListCard';
import { KpiPulseCard } from './KpiPulseCard';

interface NovakidDashboardProps {
  teacherId: string;
  profileImageUrl?: string | null;
}

export const NovakidDashboard: React.FC<NovakidDashboardProps> = ({ teacherId, profileImageUrl }) => {
  const { user } = useAuth();
  const { hubKind, isPlayground } = useTeacherHubRole(teacherId);
  const teacherName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Teacher';

  const { data: bookingStats } = useQuery({
    queryKey: ['teacher-dashboard-booking-stats', teacherId],
    queryFn: async () => {
      const [bookingsRes, earningsRes] = await Promise.all([
        supabase
          .from('class_bookings')
          .select('scheduled_at, duration, student_id, status, booking_type')
          .eq('teacher_id', teacherId)
          .not('status', 'in', '(cancelled,refunded)'),
        supabase
          .from('teacher_earnings')
          .select('teacher_amount, earned_at')
          .eq('teacher_id', teacherId),
      ]);

      if (bookingsRes.error) throw bookingsRes.error;

      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date(startOfToday);
      endOfToday.setDate(endOfToday.getDate() + 1);
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const rows = bookingsRes.data ?? [];
      const todayLessons = rows.filter((row) => {
        const scheduledAt = new Date(row.scheduled_at);
        return scheduledAt >= startOfToday && scheduledAt < endOfToday;
      }).length;
      const totalStudents = new Set(rows.map((row) => row.student_id).filter(Boolean)).size;
      const weeklyMinutes = rows.reduce((total, row) => {
        const scheduledAt = new Date(row.scheduled_at);
        if (scheduledAt < startOfWeek || scheduledAt >= endOfWeek) return total;
        return total + (row.duration || 0);
      }, 0);

      const earnings = (earningsRes.data ?? []) as Array<{ teacher_amount: number | null; earned_at: string | null }>;
      const monthlyEarnings = earnings.reduce((sum, e) => {
        const when = e.earned_at ? new Date(e.earned_at) : null;
        if (!when || when < startOfMonth) return sum;
        return sum + (Number(e.teacher_amount) || 0);
      }, 0);

      // "This Month" stats — total lessons + regular vs. trial student split.
      const monthRows = rows.filter((row) => new Date(row.scheduled_at) >= startOfMonth);
      const totalLessonsThisMonth = monthRows.length;
      const trialStudentIds = new Set<string>();
      const regularStudentIds = new Set<string>();
      for (const row of monthRows) {
        if (!row.student_id) continue;
        const isTrial = String((row as any).booking_type ?? '').toLowerCase() === 'trial';
        (isTrial ? trialStudentIds : regularStudentIds).add(row.student_id);
      }
      // A student who has both a trial and a regular booking this month
      // counts as "regular" (they've converted), not double-counted.
      for (const id of regularStudentIds) trialStudentIds.delete(id);

      return {
        todayLessons,
        totalStudents,
        weeklyHours: Math.round((weeklyMinutes / 60) * 10) / 10,
        monthlyEarnings: Math.round(monthlyEarnings * 100) / 100,
        totalLessonsThisMonth,
        regularStudents: regularStudentIds.size,
        trialStudents: trialStudentIds.size,
      };
    },
    enabled: !!teacherId,
    refetchInterval: 60_000,
  });

  const hubLabel = isPlayground
    ? '🎪 Playground Specialist'
    : hubKind === 'professional'
      ? '🏆 Success Mentor'
      : '📘 Academy Mentor';

  return (
    <div>
      <TeacherWelcomeHero
        teacherName={teacherName}
        hubLabel={hubLabel}
        profileImageUrl={profileImageUrl ?? null}
        todayLessons={bookingStats?.todayLessons ?? 0}
        totalStudents={bookingStats?.totalStudents ?? 0}
        weeklyHours={bookingStats?.weeklyHours ?? 0}
        monthlyEarnings={bookingStats?.monthlyEarnings ?? 0}
      />

      <div className="space-y-6">
        <KpiPulseCard />
        <DeviceCheckBanner />
        <NextLessonCard />
        <MonthlyStatsCard
          totalLessons={bookingStats?.totalLessonsThisMonth ?? 0}
          totalStudents={bookingStats?.totalStudents ?? 0}
          regularStudents={bookingStats?.regularStudents ?? 0}
          trialStudents={bookingStats?.trialStudents ?? 0}
        />
        <LessonsListCard />
      </div>
    </div>
  );
};
