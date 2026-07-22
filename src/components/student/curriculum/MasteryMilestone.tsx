import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MilestoneResult {
  id: string;
  unit_id: string;
  score: number;
  passed: boolean;
  skill_scores: Record<string, number>;
  weakest_skill: string | null;
  completed_at: string;
  unit_title?: string;
}

export const MasteryMilestone: React.FC = () => {
  const { user } = useAuth();

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['mastery-milestones', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('mastery_milestone_results')
        .select('*')
        .eq('student_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      if (!data?.length) return [];

      // Get unit titles
      const unitIds = [...new Set(data.map((r: any) => r.unit_id))];
      const { data: units } = await supabase
        .from('curriculum_units')
        .select('id, title')
        .in('id', unitIds);
      
      const unitMap = Object.fromEntries((units || []).map((u: any) => [u.id, u.title]));

      return data.map((r: any) => ({
        ...r,
        skill_scores: (r.skill_scores && typeof r.skill_scores === 'object') ? r.skill_scores : {},
        unit_title: unitMap[r.unit_id] || 'Unknown Unit',
      })) as MilestoneResult[];
    },
    enabled: !!user?.id,
    staleTime: 3 * 60 * 1000,
  });

  const skillLabels: Record<string, { label: string; emoji: string }> = {
    listening: { label: 'Listening', emoji: '👂' },
    speaking: { label: 'Speaking', emoji: '👄' },
    reading: { label: 'Reading', emoji: '📖' },
    writing: { label: 'Writing', emoji: '✍️' },
    grammar: { label: 'Grammar', emoji: '📝' },
    phonics: { label: 'Phonics', emoji: '🔤' },
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-amber-500" />
            Mastery Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Trophy className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No milestones completed yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Complete all 3 lessons in a unit to unlock the Mastery Milestone quiz.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  className={cn(
                    'rounded-xl border-2 p-4 transition-all',
                    result.passed
                      ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                      : 'border-destructive/30 bg-destructive/5'
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {result.passed ? (
                        <CheckCircle2 className="h-5 w-5 text-amber-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      <h3 className="font-semibold text-foreground">{result.unit_title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={result.passed ? 'default' : 'destructive'}>
                        {Math.round(result.score)}%
                      </Badge>
                      {result.passed && <span>🏆</span>}
                    </div>
                  </div>

                  {/* Skill breakdown */}
                  {Object.keys(result.skill_scores).length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {Object.entries(result.skill_scores).map(([skill, score]) => {
                        const info = skillLabels[skill] || { label: skill, emoji: '📊' };
                        const numScore = Number(score);
                        return (
                          <div
                            key={skill}
                            className={cn(
                              'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs',
                              skill === result.weakest_skill
                                ? 'bg-destructive/10 text-destructive'
                                : numScore >= 80
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                  : 'bg-muted text-muted-foreground'
                            )}
                          >
                            <span>{info.emoji}</span>
                            <span className="font-medium">{info.label}</span>
                            <span className="ml-auto font-bold">{Math.round(numScore)}%</span>
                            {skill === result.weakest_skill && (
                              <AlertTriangle className="h-3 w-3 ml-0.5" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <p className="text-[10px] text-muted-foreground mt-2">
                    {new Date(result.completed_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
