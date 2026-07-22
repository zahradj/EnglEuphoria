import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PendingAssignments: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['pending-assignments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_assignments')
        .select('id, lesson_id, assigned_at, curriculum_lessons(id, title, description, target_system, difficulty_level)')
        .eq('student_id', user!.id)
        .eq('status', 'pending')
        .order('assigned_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading || !assignments?.length) return null;

  return (
    <Card className="border-l-4 border-l-primary bg-primary/5 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-xl">📝</span>
          New Assignments!
          <Badge variant="destructive" className="ml-2">{assignments.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {assignments.map((a: any) => {
          const lesson = a.curriculum_lessons;
          return (
            <div
              key={a.id}
              className="flex items-center justify-between p-3 bg-card rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">
                    {lesson?.title || 'Lesson'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Assigned {new Date(a.assigned_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => navigate(`/lesson/${a.lesson_id}`)}
              >
                Start
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
