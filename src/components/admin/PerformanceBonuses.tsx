import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Award, Star, TrendingUp } from 'lucide-react';

interface TeacherPerformance {
  teacher_id: string;
  teacher_name: string;
  avg_mastery: number;
  total_students: number;
  qualifies_for_bonus: boolean;
}

export const PerformanceBonuses: React.FC = () => {
  const [performers, setPerformers] = useState<TeacherPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      // Get teachers with their student skill averages
      const { data: teachers } = await supabase
        .from('teacher_profiles')
        .select('user_id')
        .eq('can_teach', true);

      if (!teachers) { setLoading(false); return; }

      const results: TeacherPerformance[] = [];

      for (const t of teachers) {
        const { data: userName } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', t.user_id)
          .maybeSingle();

        // Get students assigned to this teacher via lessons
        const { data: lessons } = await supabase
          .from('lessons')
          .select('student_id')
          .eq('teacher_id', t.user_id)
          .eq('status', 'completed');

        const studentIds = [...new Set(lessons?.map(l => l.student_id) || [])];

        if (studentIds.length === 0) continue;

        // Get average mastery scores
        const { data: skills } = await supabase
          .from('student_skills')
          .select('current_score')
          .in('student_id', studentIds);

        const avgMastery = skills && skills.length > 0
          ? skills.reduce((sum, s) => sum + (s.current_score || 0), 0) / skills.length
          : 0;

        results.push({
          teacher_id: t.user_id,
          teacher_name: userName?.full_name || 'Unknown',
          avg_mastery: Math.round(avgMastery),
          total_students: studentIds.length,
          qualifies_for_bonus: avgMastery >= 85,
        });
      }

      setPerformers(results.sort((a, b) => b.avg_mastery - a.avg_mastery));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#6B21A8]">Performance-Based Bonuses</h2>
        <p className="text-sm text-muted-foreground">
          Teachers whose students maintain &gt;85% mastery qualify for the Quality Bonus
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Analyzing performance...</p>
      ) : performers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No teacher performance data yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {performers.map(p => (
            <Card key={p.teacher_id} className={p.qualifies_for_bonus ? 'border-amber-300 bg-amber-50/30' : ''}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${p.qualifies_for_bonus ? 'bg-amber-500/10' : 'bg-muted'}`}>
                      {p.qualifies_for_bonus
                        ? <Star className="h-5 w-5 text-amber-500" />
                        : <TrendingUp className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="font-medium">{p.teacher_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.total_students} students • Avg mastery: {p.avg_mastery}%
                      </p>
                    </div>
                  </div>
                  <div>
                    {p.qualifies_for_bonus ? (
                      <Badge className="bg-amber-500 text-white gap-1">
                        <Award className="h-3 w-3" /> Quality Bonus
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Below threshold</Badge>
                    )}
                  </div>
                </div>

                {/* Mastery bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${p.avg_mastery >= 85 ? 'bg-amber-500' : p.avg_mastery >= 60 ? 'bg-[#2E7D32]' : 'bg-red-400'}`}
                      style={{ width: `${Math.min(p.avg_mastery, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>0%</span>
                    <span className="text-amber-600 font-medium">85% threshold</span>
                    <span>100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
