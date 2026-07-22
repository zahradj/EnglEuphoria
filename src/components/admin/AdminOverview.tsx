import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, GraduationCap, BookOpen, DollarSign, TrendingUp, AlertTriangle, Calendar, Star, Clock, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminPendingCounts } from '@/hooks/useAdminPendingCounts';
import { AdminWelcomeSection } from './dashboard/AdminWelcomeSection';
import { AdminStatsOverview } from './dashboard/AdminStatsOverview';
import { AdminQuickActions } from './dashboard/AdminQuickActions';
import { AdminSystemHealth } from './dashboard/AdminSystemHealth';
import { AdminActivityFeed } from './dashboard/AdminActivityFeed';
import { RecentRegistrationsCard } from './dashboard/RecentRegistrationsCard';

interface AdminOverviewProps {
  onNavigate: (tab: string) => void;
}

export const AdminOverview = ({ onNavigate }: AdminOverviewProps) => {
  const navigate = useNavigate();
  const { applications, profileApprovals, pendingBonuses, atRiskTeachers } = useAdminPendingCounts();
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    activeLessons: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
    userGrowth: 0,
    studentGrowth: 0,
    teacherGrowth: 0,
    lessonGrowth: 0,
    ratingChange: 0,
    completionRate: 0,
    avgRating: 0,
  });

  const [realTimeData, setRealTimeData] = useState({
    activeUsers: 0,
    ongoingLessons: 0,
    systemHealth: 0,
  });

  const [systemMetrics, setSystemMetrics] = useState({
    dbLatencyMs: null as number | null,
    dbHealthy: true,
    openIncidents: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Time this first round-trip as a genuine DB latency reading instead
        // of a fabricated "server uptime" number — this is a real, observable
        // signal a browser client can actually measure.
        const pingStart = performance.now();
        const { count: totalUsers, error: pingError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        const dbLatencyMs = Math.round(performance.now() - pingStart);
        const dbHealthy = !pingError;

        // Fetch total students
        const { count: totalStudents } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student');

        // Fetch total teachers
        const { count: totalTeachers } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'teacher');

        // Fetch active lessons (scheduled and confirmed)
        const { count: activeLessons } = await supabase
          .from('lessons')
          .select('*', { count: 'exact', head: true })
          .in('status', ['scheduled', 'confirmed']);

        // Fetch average teacher rating
        const { data: teacherProfiles } = await supabase
          .from('teacher_profiles')
          .select('rating')
          .not('rating', 'is', null);

        const avgRating = teacherProfiles?.length
          ? teacherProfiles.reduce((sum, profile) => sum + (profile.rating || 0), 0) / teacherProfiles.length
          : 0;

        // Calculate completion rate from lessons
        const { count: completedLessons } = await supabase
          .from('lessons')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed');

        const totalLessonsCount = await supabase
          .from('lessons')
          .select('*', { count: 'exact', head: true });

        const completionRate = totalLessonsCount.count
          ? (completedLessons || 0) / totalLessonsCount.count * 100
          : 0;

        // --- Period-over-period growth, windowed by the day/week/month toggle ---
        const windowDays = timeRange === 'day' ? 1 : timeRange === 'month' ? 30 : 7;
        const now = Date.now();
        const currentStart = new Date(now - windowDays * 86_400_000).toISOString();
        const prevStart = new Date(now - 2 * windowDays * 86_400_000).toISOString();
        const prevEnd = currentStart;
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
        const prevMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString();

        const pctChange = (curr: number, prev: number) => {
          if (prev === 0) return curr > 0 ? 100 : 0;
          return Math.round(((curr - prev) / prev) * 1000) / 10;
        };

        const [
          studentsCurrent, studentsPrev,
          teachersCurrent, teachersPrev,
          lessonsCurrent, lessonsPrev,
          reviewsCurrent, reviewsPrev,
          revenueRows, prevRevenueRows,
          incidentsCount,
        ] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student').gte('created_at', currentStart),
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student').gte('created_at', prevStart).lt('created_at', prevEnd),
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'teacher').gte('created_at', currentStart),
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'teacher').gte('created_at', prevStart).lt('created_at', prevEnd),
          supabase.from('lessons').select('*', { count: 'exact', head: true }).gte('created_at', currentStart),
          supabase.from('lessons').select('*', { count: 'exact', head: true }).gte('created_at', prevStart).lt('created_at', prevEnd),
          supabase.from('teacher_reviews').select('rating').gte('created_at', currentStart),
          supabase.from('teacher_reviews').select('rating').gte('created_at', prevStart).lt('created_at', prevEnd),
          supabase.from('lesson_payments').select('amount_charged, refund_amount').gte('transaction_date', monthStart),
          supabase.from('lesson_payments').select('amount_charged, refund_amount').gte('transaction_date', prevMonthStart).lt('transaction_date', monthStart),
          supabase.from('sentinel_incidents').select('*', { count: 'exact', head: true }).in('status', ['pending', 'needs_human']),
        ]);

        const avgOf = (rows: { rating: number }[] | null) =>
          rows && rows.length ? rows.reduce((s, r) => s + r.rating, 0) / rows.length : 0;

        const userGrowth = pctChange((studentsCurrent.count || 0) + (teachersCurrent.count || 0), (studentsPrev.count || 0) + (teachersPrev.count || 0));
        const studentGrowth = pctChange(studentsCurrent.count || 0, studentsPrev.count || 0);
        const teacherGrowth = pctChange(teachersCurrent.count || 0, teachersPrev.count || 0);
        const lessonGrowth = pctChange(lessonsCurrent.count || 0, lessonsPrev.count || 0);
        const ratingChange = Math.round((avgOf(reviewsCurrent.data) - avgOf(reviewsPrev.data)) * 10) / 10;
        const sumRevenue = (rows: { amount_charged: number; refund_amount: number }[] | null) =>
          (rows || []).reduce((sum, r) => sum + Number(r.amount_charged || 0) - Number(r.refund_amount || 0), 0);
        const monthlyRevenue = sumRevenue(revenueRows.data);
        const prevMonthRevenue = sumRevenue(prevRevenueRows.data);
        const revenueGrowth = pctChange(monthlyRevenue, prevMonthRevenue);

        setStats({
          totalUsers: totalUsers || 0,
          totalStudents: totalStudents || 0,
          totalTeachers: totalTeachers || 0,
          activeLessons: activeLessons || 0,
          monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
          revenueGrowth,
          userGrowth,
          studentGrowth,
          teacherGrowth,
          lessonGrowth,
          ratingChange,
          completionRate: Math.round(completionRate),
          avgRating: Math.round(avgRating * 10) / 10,
        });

        const openIncidents = incidentsCount.count || 0;
        setSystemMetrics({ dbLatencyMs, dbHealthy, openIncidents });

        const systemHealth = !dbHealthy ? 50 : dbLatencyMs <= 500 ? 99.9 : dbLatencyMs <= 1500 ? 97 : 90;

        setRealTimeData({
          activeUsers: totalUsers || 0,
          ongoingLessons: activeLessons || 0,
          systemHealth,
        });

      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleQuickActions = {
    onManageUsers: () => onNavigate('users'),
    onManageTeachers: () => onNavigate('teacher-applications'),
    onViewReports: () => onNavigate('analytics'),
    onViewAnalytics: () => onNavigate('analytics'),
    onModerateContent: () => navigate('/admin/review-moderation'),
    onSystemSettings: () => onNavigate('settings'),
  };

  // Real counts where a meaningful mapping exists; 0 (no badge) elsewhere
  // rather than showing an invented number for a queue that doesn't exist.
  const counts = {
    pendingUsers: 0,
    pendingTeachers: applications,
    pendingReports: 0,
    systemAlerts: atRiskTeachers,
  };

  const pendingApprovals = profileApprovals + applications;

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Platform insights and metrics</p>
        </div>
        <div className="flex gap-2">
          {['day', 'week', 'month'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="capitalize"
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Enhanced Welcome Section */}
      <AdminWelcomeSection
        adminName="Administrator"
        stats={{
          totalUsers: stats.totalUsers,
          totalTeachers: stats.totalTeachers,
          activeLessons: stats.activeLessons,
          systemHealth: realTimeData.systemHealth,
        }}
      />

      {/* Enhanced Stats Overview */}
      <AdminStatsOverview
        stats={{
          totalUsers: stats.totalUsers,
          totalStudents: stats.totalStudents,
          totalTeachers: stats.totalTeachers,
          activeLessons: stats.activeLessons,
          averageRating: stats.avgRating,
          userGrowth: stats.userGrowth,
          studentGrowth: stats.studentGrowth,
          teacherGrowth: stats.teacherGrowth,
          lessonGrowth: stats.lessonGrowth,
          ratingChange: stats.ratingChange,
          monthlyRevenue: stats.monthlyRevenue,
          revenueGrowth: stats.revenueGrowth,
        }}
        loading={loading}
      />

      {/* Layout for Quick Actions, System Health, and Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <AdminQuickActions
          actions={handleQuickActions}
          counts={counts}
        />

        {/* System Health */}
        <AdminSystemHealth
          metrics={{
            dbLatencyMs: systemMetrics.dbLatencyMs,
            dbHealthy: systemMetrics.dbHealthy,
            openIncidents: systemMetrics.openIncidents,
            atRiskTeachers,
            pendingApprovals,
            pendingBonuses,
            totalUsers: realTimeData.activeUsers,
          }}
          loading={loading}
        />
      </div>

      {/* Recent Registrations and Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentRegistrationsCard onNavigate={onNavigate} />
        <AdminActivityFeed loading={loading} />
      </div>
    </div>
  );
};