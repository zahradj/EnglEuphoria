import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StudentStat {
  student_id: string;
  student_name: string;
  email: string;
  cefr_level: string;
  lessons_completed: number;
  avg_score: number;
  homework_completion_rate: number;
  last_active: string | null;
  total_sessions: number;
}

export interface ClassMetrics {
  totalStudents: number;
  averageAttendance: number;
  averageProgress: number;
  completedLessons: number;
  totalHomeworkSubmissions: number;
  averageScore: number;
}

export const useTeacherAnalytics = (teacherId: string | undefined) => {
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['teacher-students', teacherId],
    queryFn: async () => {
      if (!teacherId) return [];
      const { data: bookings, error } = await supabase
        .from('class_bookings')
        .select('student_id')
        .eq('teacher_id', teacherId);
      if (error) throw error;
      const uniqueIds = [...new Set(bookings?.map(b => b.student_id) || [])];
      if (uniqueIds.length === 0) return [];
      const { data: profiles, error: profErr } = await supabase
        .from('profiles')
        .select('id, display_name, email, current_level')
        .in('id', uniqueIds);
      if (profErr) throw profErr;
      return profiles || [];
    },
    enabled: !!teacherId,
  });

  const studentIds = students?.map(s => s.id) || [];

  // Per-student homework data
  const { data: homeworkByStudent, isLoading: homeworkLoading } = useQuery({
    queryKey: ['teacher-homework-per-student', teacherId, studentIds.length],
    queryFn: async () => {
      if (!studentIds.length) return {};
      const { data, error } = await supabase
        .from('homework_submissions')
        .select('student_id, status, score')
        .in('student_id', studentIds);
      if (error) throw error;
      const map: Record<string, { total: number; graded: number; totalScore: number }> = {};
      for (const s of data || []) {
        if (!map[s.student_id]) map[s.student_id] = { total: 0, graded: 0, totalScore: 0 };
        map[s.student_id].total++;
        if (s.status === 'graded') {
          map[s.student_id].graded++;
          map[s.student_id].totalScore += s.score || 0;
        }
      }
      return map;
    },
    enabled: !!studentIds.length,
  });

  // Per-student lesson progress
  const { data: progressByStudent, isLoading: progressLoading } = useQuery({
    queryKey: ['teacher-progress-per-student', teacherId, studentIds.length],
    queryFn: async () => {
      if (!studentIds.length) return {};
      const { data, error } = await supabase
        .from('interactive_lesson_progress')
        .select('student_id, completed, updated_at')
        .in('student_id', studentIds);
      if (error) throw error;
      const map: Record<string, { completed: number; lastActive: string | null }> = {};
      for (const p of data || []) {
        if (!map[p.student_id]) map[p.student_id] = { completed: 0, lastActive: null };
        if (p.completed) map[p.student_id].completed++;
        if (!map[p.student_id].lastActive || (p.updated_at && p.updated_at > map[p.student_id].lastActive!)) {
          map[p.student_id].lastActive = p.updated_at;
        }
      }
      return map;
    },
    enabled: !!studentIds.length,
  });

  // Per-student session counts
  const { data: sessionsByStudent, isLoading: sessionLoading } = useQuery({
    queryKey: ['teacher-sessions-per-student', teacherId, studentIds.length],
    queryFn: async () => {
      if (!studentIds.length) return { byStudent: {}, total: 0, completed: 0, upcoming: 0 };
      const { data, error } = await supabase
        .from('class_bookings')
        .select('student_id, status, scheduled_at')
        .eq('teacher_id', teacherId!);
      if (error) throw error;
      const byStudent: Record<string, number> = {};
      const now = new Date().toISOString();
      let total = 0, completed = 0, upcoming = 0;
      for (const b of data || []) {
        byStudent[b.student_id] = (byStudent[b.student_id] || 0) + 1;
        total++;
        if (b.status === 'completed') completed++;
        if (b.scheduled_at > now && b.status !== 'cancelled') upcoming++;
      }
      return { byStudent, total, completed, upcoming };
    },
    enabled: !!teacherId,
  });

  // Build per-student stats with real data
  const studentStats: StudentStat[] = (students || []).map(s => {
    const hw = homeworkByStudent?.[s.id];
    const prog = progressByStudent?.[s.id];
    const sessions = sessionsByStudent?.byStudent?.[s.id] || 0;
    const avgScore = hw && hw.graded > 0 ? Math.round(hw.totalScore / hw.graded) : 0;
    const hwRate = hw && hw.total > 0 ? Math.round((hw.graded / hw.total) * 100) : 0;

    return {
      student_id: s.id,
      student_name: s.display_name || 'Unknown',
      email: s.email || '',
      cefr_level: s.current_level || 'A1',
      lessons_completed: prog?.completed || 0,
      avg_score: avgScore,
      homework_completion_rate: hwRate,
      last_active: prog?.lastActive || null,
      total_sessions: sessions,
    };
  });

  const totalSubmissions = Object.values(homeworkByStudent || {}).reduce((sum, v) => sum + v.total, 0);
  const totalGraded = Object.values(homeworkByStudent || {}).reduce((sum, v) => sum + v.graded, 0);
  const totalScore = Object.values(homeworkByStudent || {}).reduce((sum, v) => sum + v.totalScore, 0);
  const totalCompleted = Object.values(progressByStudent || {}).reduce((sum, v) => sum + v.completed, 0);

  const classMetrics: ClassMetrics = {
    totalStudents: students?.length || 0,
    averageAttendance: sessionsByStudent ? Math.round((sessionsByStudent.completed / Math.max(sessionsByStudent.total, 1)) * 100) : 0,
    averageProgress: studentStats.length > 0 ? Math.round(studentStats.reduce((s, st) => s + st.lessons_completed, 0) / studentStats.length) : 0,
    completedLessons: totalCompleted,
    totalHomeworkSubmissions: totalSubmissions,
    averageScore: totalGraded > 0 ? Math.round(totalScore / totalGraded) : 0,
  };

  return {
    studentStats,
    classMetrics,
    sessionData: sessionsByStudent ? { total: sessionsByStudent.total, completed: sessionsByStudent.completed, upcoming: sessionsByStudent.upcoming } : null,
    isLoading: studentsLoading || homeworkLoading || progressLoading || sessionLoading,
  };
};
