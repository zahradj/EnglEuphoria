import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Trophy, AlertCircle, TrendingUp, Users, CheckCircle2, XCircle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface MasteryOverviewProps {
  teacherId: string;
}

export const MasteryOverview: React.FC<MasteryOverviewProps> = ({ teacherId }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['mastery-overview', teacherId],
    queryFn: async () => {
      // Fetch milestone results for students assigned to this teacher
      const { data: appointments } = await supabase
        .from('appointments')
        .select('student_id')
        .eq('teacher_id', teacherId);

      const studentIds = [...new Set(appointments?.map((a: any) => a.student_id) || [])];
      if (!studentIds.length) return { milestones: [], vocabProgress: [], summary: { total: 0, passed: 0, avgScore: 0 } };

      // Fetch milestone results
      const { data: milestones } = await supabase
        .from('mastery_milestone_results')
        .select('id, student_id, unit_id, score, passed, weakest_skill, completed_at')
        .in('student_id', studentIds)
        .order('completed_at', { ascending: false });

      // Fetch student profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', studentIds);

      // Fetch unit titles
      const unitIds = [...new Set(milestones?.map((m: any) => m.unit_id) || [])];
      const { data: units } = await supabase
        .from('curriculum_units')
        .select('id, title')
        .in('id', unitIds.length ? unitIds : ['none']);

      // Fetch vocabulary progress grouped
      const { data: vocabProgress } = await supabase
        .from('student_vocabulary_progress')
        .select('student_id, unit_id, mastery_level, word')
        .in('student_id', studentIds);

      const profileMap = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]));
      const unitMap = Object.fromEntries((units || []).map((u: any) => [u.id, u.title]));

      const enrichedMilestones = (milestones || []).map((m: any) => ({
        ...m,
        studentName: profileMap[m.student_id]?.display_name || 'Unknown Student',
        unitTitle: unitMap[m.unit_id] || 'Unknown Unit',
      }));

      const passed = enrichedMilestones.filter((m: any) => m.passed).length;
      const total = enrichedMilestones.length;
      const avgScore = total > 0
        ? Math.round(enrichedMilestones.reduce((sum: number, m: any) => sum + Number(m.score), 0) / total)
        : 0;

      // Group vocab by student+unit
      const vocabGrouped: Record<string, { student: string; unit: string; words: number; mastered: number }> = {};
      (vocabProgress || []).forEach((v: any) => {
        const key = `${v.student_id}_${v.unit_id}`;
        if (!vocabGrouped[key]) {
          vocabGrouped[key] = {
            student: profileMap[v.student_id]?.display_name || 'Unknown',
            unit: unitMap[v.unit_id] || v.unit_id,
            words: 0,
            mastered: 0,
          };
        }
        vocabGrouped[key].words++;
        if (v.mastery_level === 'mastered') vocabGrouped[key].mastered++;
      });

      return {
        milestones: enrichedMilestones,
        vocabProgress: Object.values(vocabGrouped),
        summary: { total, passed, avgScore },
      };
    },
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const { milestones = [], vocabProgress = [], summary = { total: 0, passed: 0, avgScore: 0 } } = data || {};
  const passRate = summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0;

  const filteredMilestones = statusFilter === 'all'
    ? milestones
    : statusFilter === 'passed'
      ? milestones.filter((m: any) => m.passed)
      : milestones.filter((m: any) => !m.passed);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Mastery Overview</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Trophy className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{summary.total}</p>
              <p className="text-sm text-muted-foreground">Milestones Taken</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold">{passRate}%</p>
              <p className="text-sm text-muted-foreground">Pass Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{summary.avgScore}%</p>
              <p className="text-sm text-muted-foreground">Average Score</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Milestone results table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Milestone Results</CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="passed">Passed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {filteredMilestones.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No milestone results yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium text-muted-foreground">Student</th>
                    <th className="pb-2 font-medium text-muted-foreground">Unit</th>
                    <th className="pb-2 font-medium text-muted-foreground">Score</th>
                    <th className="pb-2 font-medium text-muted-foreground">Status</th>
                    <th className="pb-2 font-medium text-muted-foreground">Weakest Skill</th>
                    <th className="pb-2 font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMilestones.map((m: any) => (
                    <tr key={m.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{m.studentName}</td>
                      <td className="py-2">{m.unitTitle}</td>
                      <td className="py-2">{Math.round(m.score)}%</td>
                      <td className="py-2">
                        {m.passed ? (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Pass
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/5">
                            <XCircle className="h-3 w-3 mr-1" /> Fail
                          </Badge>
                        )}
                      </td>
                      <td className="py-2">
                        {m.weakest_skill ? (
                          <Badge variant="secondary" className="text-xs">{m.weakest_skill}</Badge>
                        ) : '—'}
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {m.completed_at ? new Date(m.completed_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vocabulary progress */}
      <Collapsible>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <CardTitle className="text-base flex items-center gap-2">
                📚 Vocabulary Progress by Unit
                <span className="text-xs text-muted-foreground font-normal">(click to expand)</span>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              {vocabProgress.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No vocabulary data yet.</p>
              ) : (
                <div className="space-y-2">
                  {vocabProgress.map((vp: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b last:border-0">
                      <div>
                        <span className="font-medium text-sm">{vp.student}</span>
                        <span className="text-muted-foreground text-xs ml-2">— {vp.unit}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{vp.mastered}/{vp.words} mastered</span>
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${vp.words > 0 ? (vp.mastered / vp.words) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};
