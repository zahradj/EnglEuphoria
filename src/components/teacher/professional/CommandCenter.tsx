import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  Activity,
  BookOpen,
  BarChart3,
  ChevronRight,
  Zap,
  Globe,
  Mail,
  Filter,
  CalendarDays,
  Video,
  LogIn,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CommandCenterProps {
  teacherId: string;
  teacherName: string;
  onViewStudent?: (studentId: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  teacherId,
  teacherName,
  onViewStudent,
}) => {
  const [logFilter, setLogFilter] = useState<'all' | 'sent' | 'failed'>('all');
  const navigate = useNavigate();

  // Fetch live metrics
  const { data: metrics } = useQuery({
    queryKey: ['command-center-metrics', teacherId],
    queryFn: async () => {
      const { data: bookings } = await supabase
        .from('class_bookings')
        .select('student_id, status, scheduled_at')
        .eq('teacher_id', teacherId);

      const uniqueStudents = [...new Set((bookings || []).map(b => b.student_id))];
      const today = new Date().toISOString().split('T')[0];
      const todayBookings = (bookings || []).filter(
        b => b.scheduled_at?.startsWith(today)
      );

      const { data: atRisk } = await supabase
        .from('mastery_milestone_results')
        .select('student_id, score, weakest_skill, completed_at')
        .in('student_id', uniqueStudents.length ? uniqueStudents : ['none'])
        .eq('passed', false)
        .order('completed_at', { ascending: false })
        .limit(10);

      const atRiskIds = [...new Set((atRisk || []).map(a => a.student_id))];
      const { data: profiles } = await supabase
        .from('student_profiles')
        .select('user_id, display_name')
        .in('user_id', atRiskIds.length ? atRiskIds : ['none']);

      const profileMap = Object.fromEntries(
        (profiles || []).map(p => [p.user_id, p.display_name])
      );

      const { data: recentLessons } = await supabase
        .from('class_bookings')
        .select('id, student_id, scheduled_at, status, duration')
        .eq('teacher_id', teacherId)
        .eq('status', 'completed')
        .order('scheduled_at', { ascending: false })
        .limit(6);

      const completedStudentIds = [
        ...new Set((recentLessons || []).map(l => l.student_id)),
      ];
      const { data: completedProfiles } = await supabase
        .from('student_profiles')
        .select('user_id, display_name')
        .in('user_id', completedStudentIds.length ? completedStudentIds : ['none']);

      const completedProfileMap = Object.fromEntries(
        (completedProfiles || []).map(p => [p.user_id, p.display_name])
      );

      return {
        totalStudents: uniqueStudents.length,
        sessionsToday: todayBookings.length,
        atRiskStudents: (atRisk || []).map(a => ({
          ...a,
          studentName: profileMap[a.student_id] || 'Unknown',
        })),
        recentActivity: (recentLessons || []).map(l => ({
          ...l,
          studentName: completedProfileMap[l.student_id] || 'Unknown',
        })),
      };
    },
    staleTime: 60_000,
  });

  // Fetch upcoming lessons
  const { data: upcomingLessons = [] } = useQuery({
    queryKey: ['teacher-upcoming-lessons', teacherId],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data: bookings } = await supabase
        .from('class_bookings')
        .select('id, student_id, scheduled_at, status, duration, booking_type, price_paid, session_id, meeting_link')
        .eq('teacher_id', teacherId)
        .in('status', ['scheduled', 'confirmed'])
        .gte('scheduled_at', now)
        .order('scheduled_at', { ascending: true })
        .limit(5);

      if (!bookings?.length) return [];

      const studentIds = [...new Set(bookings.map(b => b.student_id))];
      const { data: profiles } = await supabase
        .from('student_profiles')
        .select('user_id, display_name, student_level')
        .in('user_id', studentIds);

      const profileMap = Object.fromEntries(
        (profiles || []).map(p => [p.user_id, { name: p.display_name, level: p.student_level }])
      );

      return bookings.map(b => ({
        ...b,
        studentName: profileMap[b.student_id]?.name || 'Student',
        studentLevel: profileMap[b.student_id]?.level || 'academy',
        isTrial: b.price_paid === 0 || b.booking_type === 'trial',
        sessionId: b.session_id,
        meetingLink: b.meeting_link,
      }));
    },
    staleTime: 30_000,
  });

  // Fetch notification logs
  const { data: notificationLogs = [] } = useQuery({
    queryKey: ['notification-logs', logFilter],
    queryFn: async () => {
      let query = supabase
        .from('notification_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (logFilter !== 'all') {
        query = query.eq('status', logFilter);
      }

      const { data } = await query;
      if (!data?.length) return [];

      const studentIds = [...new Set(data.map((l: any) => l.student_id))];
      const { data: profiles } = await supabase
        .from('student_profiles')
        .select('user_id, display_name')
        .in('user_id', studentIds.length ? studentIds : ['none']);

      const profileMap = Object.fromEntries(
        (profiles || []).map((p: any) => [p.user_id, p.display_name])
      );

      return data.map((log: any) => ({
        ...log,
        studentName: profileMap[log.student_id] || 'Unknown',
      }));
    },
    staleTime: 30_000,
  });

  const { totalStudents = 0, sessionsToday = 0, atRiskStudents = [], recentActivity = [] } =
    metrics || {};

  const getHubColor = (level: string) => {
    switch (level) {
      case 'playground': return { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/20' };
      case 'professional': return { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20' };
      default: return { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground font-inter tracking-tight">
            Command Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {teacherName}
          </p>
        </div>
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/5 text-emerald-600 font-medium"
        >
          <Activity className="h-3 w-3 mr-1.5" />
          Live
        </Badge>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard icon={<Users className="h-5 w-5" />} label="Total Students" value={totalStudents} variant="primary" />
        <StatusCard icon={<Clock className="h-5 w-5" />} label="Sessions Today" value={sessionsToday} variant="primary" />
        <StatusCard icon={<AlertTriangle className="h-5 w-5" />} label="At-Risk Alerts" value={atRiskStudents.length} variant={atRiskStudents.length > 0 ? 'danger' : 'muted'} />
        <StatusCard icon={<TrendingUp className="h-5 w-5" />} label="Units Completed" value={recentActivity.length} variant="success" />
      </div>

      {/* Upcoming Lessons Widget */}
      <Card className="brand-card border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            Upcoming Lessons
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingLessons.length === 0 ? (
            <div className="flex items-center gap-3 py-6 justify-center text-muted-foreground">
              <CalendarDays className="h-5 w-5" />
              <p className="text-sm">No upcoming lessons scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingLessons.map((lesson: any) => {
                const hub = getHubColor(lesson.studentLevel);
                const dt = new Date(lesson.scheduled_at);
                const now = new Date();
                const minutesUntil = (dt.getTime() - now.getTime()) / 60000;
                const canJoin = true;
                const hubButtonStyles: Record<string, string> = {
                  playground: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600',
                  professional: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
                  academy: 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600',
                };
                const btnStyle = hubButtonStyles[lesson.studentLevel] || hubButtonStyles.academy;
                
                return (
                  <div
                    key={lesson.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${hub.border} ${hub.bg} transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-lg ${hub.bg} flex items-center justify-center`}>
                        <Video className={`h-4 w-4 ${hub.text}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{lesson.studentName}</p>
                          {lesson.isTrial && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-400/50 bg-amber-400/10 text-amber-600">
                              Trial
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {lesson.duration}min • {lesson.studentLevel}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${hub.text}`}>
                          {dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      {lesson.id && (
                        <Button
                          size="sm"
                          disabled={!canJoin}
                          className={`text-white text-xs px-3 ${canJoin ? btnStyle : 'bg-muted text-muted-foreground'}`}
                          onClick={() => navigate(`/classroom/${lesson.id}`)}
                        >
                          <LogIn className="h-3.5 w-3.5 mr-1" />
                          {canJoin ? 'Join' : `${Math.ceil(minutesUntil)}m`}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* At-Risk Alerts */}
        <Card className="brand-card border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              II Wizard Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {atRiskStudents.length === 0 ? (
              <div className="flex items-center gap-3 py-6 justify-center text-muted-foreground">
                <Zap className="h-5 w-5" />
                <p className="text-sm">All students on track — no alerts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {atRiskStudents.slice(0, 5).map((student: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg border border-destructive/10 bg-destructive/5 cursor-pointer hover:bg-destructive/10 transition-colors"
                    onClick={() => onViewStudent?.(student.student_id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{student.studentName}</p>
                        <p className="text-xs text-muted-foreground">
                          Failed • Weakest: {student.weakest_skill || 'N/A'} • Score: {Math.round(student.score)}%
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="brand-card border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Globe className="h-4 w-4 text-emerald-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="flex items-center gap-3 py-6 justify-center text-muted-foreground">
                <BookOpen className="h-5 w-5" />
                <p className="text-sm">No completed sessions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{activity.studentName}</p>
                        <p className="text-xs text-muted-foreground">{activity.duration}min session completed</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {activity.scheduled_at
                        ? new Date(activity.scheduled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                        : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notification Log */}
      <Card className="brand-card border border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Notification Log
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              {(['all', 'sent', 'failed'] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={logFilter === filter ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-7 text-xs px-2.5 ${
                    logFilter === filter && filter === 'failed'
                      ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                      : ''
                  }`}
                  onClick={() => setLogFilter(filter)}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {notificationLogs.length === 0 ? (
            <div className="flex items-center gap-3 py-6 justify-center text-muted-foreground">
              <Mail className="h-5 w-5" />
              <p className="text-sm">No notification logs yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 font-medium text-muted-foreground text-xs">Student</th>
                    <th className="pb-2 font-medium text-muted-foreground text-xs">Template</th>
                    <th className="pb-2 font-medium text-muted-foreground text-xs">Recipient</th>
                    <th className="pb-2 font-medium text-muted-foreground text-xs">Status</th>
                    <th className="pb-2 font-medium text-muted-foreground text-xs">Sent At</th>
                    <th className="pb-2 font-medium text-muted-foreground text-xs">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {notificationLogs.map((log: any) => (
                    <tr key={log.id} className={`border-b border-border/50 ${log.status === 'failed' ? 'bg-destructive/5' : ''}`}>
                      <td className="py-2.5 text-foreground font-medium">{log.studentName}</td>
                      <td className="py-2.5 text-muted-foreground">{log.template_name}</td>
                      <td className="py-2.5 text-muted-foreground text-xs">{log.recipient_email}</td>
                      <td className="py-2.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            log.status === 'sent'
                              ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600'
                              : log.status === 'failed'
                              ? 'border-destructive/30 bg-destructive/5 text-destructive'
                              : 'border-amber-500/30 bg-amber-500/5 text-amber-600'
                          }`}
                        >
                          {log.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-muted-foreground text-xs">
                        {log.email_sent_at
                          ? new Date(log.email_sent_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </td>
                      <td className="py-2.5 text-destructive text-xs max-w-[200px] truncate">{log.error_message || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

/* ── Small helper ─────────────────────────────── */
const StatusCard = ({
  icon,
  label,
  value,
  variant,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  variant: 'primary' | 'success' | 'danger' | 'muted';
}) => {
  const styles = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-emerald-500/10 text-emerald-600',
    danger: 'bg-destructive/10 text-destructive',
    muted: 'bg-muted text-muted-foreground',
  };

  return (
    <Card className="brand-card border border-border">
      <CardContent className="pt-5 pb-4 flex items-center gap-4">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${styles[variant]}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
};
