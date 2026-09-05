import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, CircleDashed, Loader2, CheckCircle2 } from 'lucide-react';

interface AssignmentStatusPanelProps {
  teacherId: string;
}

interface AssignmentRow {
  id: string;
  student_id: string;
  lesson_id: string;
  status: string;
  assigned_at: string;
  completed_at: string | null;
  curriculum_lessons: { title: string | null } | null;
}

const STATUS_META: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  pending: { label: 'Not started', icon: CircleDashed, className: 'bg-muted text-muted-foreground' },
  in_progress: { label: 'In progress', icon: Loader2, className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  completed: { label: 'Completed', icon: CheckCircle2, className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
};

/**
 * Real, currently-wired assignment tracking — reads student_assignments
 * directly (created by AssignLessonModal, moved to 'in_progress' when the
 * student hits Start in PendingAssignments). Deliberately separate from
 * StudentLearningAnalytics below, which reads interactive_lesson_progress —
 * a table nothing in the app writes to yet, so it always shows zeros.
 */
export const AssignmentStatusPanel: React.FC<AssignmentStatusPanelProps> = ({ teacherId }) => {
  const { data: assignments, isLoading } = useQuery({
    queryKey: ['teacher-assignment-status', teacherId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_assignments')
        .select('id, student_id, lesson_id, status, assigned_at, completed_at, curriculum_lessons(title)')
        .eq('teacher_id', teacherId)
        .order('assigned_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as AssignmentRow[];
    },
    enabled: !!teacherId,
  });

  const studentIds = [...new Set((assignments || []).map((a) => a.student_id))];

  const { data: profiles } = useQuery({
    queryKey: ['teacher-assignment-student-profiles', studentIds.join(',')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .in('id', studentIds);
      if (error) throw error;
      return data || [];
    },
    enabled: studentIds.length > 0,
  });

  const nameFor = (studentId: string) => {
    const p = profiles?.find((p) => p.id === studentId);
    return p?.display_name || p?.email || 'Student';
  };

  if (isLoading) return null;
  if (!assignments || assignments.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Rocket className="h-5 w-5 text-primary" />
          Assigned Lessons
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {assignments.map((a) => {
            const meta = STATUS_META[a.status] || STATUS_META.pending;
            const Icon = meta.icon;
            return (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/50 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {a.curriculum_lessons?.title || 'Lesson'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {nameFor(a.student_id)} · assigned {new Date(a.assigned_at).toLocaleDateString()}
                    {a.completed_at ? ` · completed ${new Date(a.completed_at).toLocaleDateString()}` : ''}
                  </p>
                </div>
                <Badge variant="secondary" className={`shrink-0 gap-1 ${meta.className}`}>
                  <Icon className={`h-3 w-3 ${a.status === 'in_progress' ? 'animate-spin' : ''}`} />
                  {meta.label}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
