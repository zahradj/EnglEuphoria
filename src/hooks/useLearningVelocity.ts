import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface WeekPoint {
  week: string;
  points: number;
  lessonsCompleted: number;
  isMilestone: boolean;
  milestoneType?: '10th' | '20th';
}

export const useLearningVelocity = () => {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState<WeekPoint[]>([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_lesson_progress')
        .select('completed_at, score')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        setWeeklyData([]);
        setTotalLessons(0);
        setLoading(false);
        return;
      }

      // Group by ISO week
      const weekMap = new Map<string, { scores: number[]; count: number }>();
      let runningTotal = 0;
      const milestoneWeeks = new Set<string>();

      data.forEach((row) => {
        if (!row.completed_at) return;
        const d = new Date(row.completed_at);
        const weekStart = getISOWeekStart(d);
        const key = weekStart.toISOString().split('T')[0];

        if (!weekMap.has(key)) {
          weekMap.set(key, { scores: [], count: 0 });
        }
        const entry = weekMap.get(key)!;
        entry.scores.push(row.score ?? 0);
        entry.count += 1;
        runningTotal += 1;

        if (runningTotal === 10) milestoneWeeks.add(key + ':10th');
        if (runningTotal === 20) milestoneWeeks.add(key + ':20th');
      });

      setTotalLessons(runningTotal);

      const weeks = Array.from(weekMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, val], idx) => {
          const avgScore = val.scores.reduce((a, b) => a + b, 0) / val.scores.length;
          const points = Math.round(val.count * 10 + avgScore);
          const is10 = milestoneWeeks.has(key + ':10th');
          const is20 = milestoneWeeks.has(key + ':20th');
          return {
            week: `Week ${idx + 1}`,
            points,
            lessonsCompleted: val.count,
            isMilestone: is10 || is20,
            milestoneType: is20 ? '20th' : is10 ? '10th' : undefined,
          } as WeekPoint;
        });

      setWeeklyData(weeks);
    } catch (err) {
      console.error('useLearningVelocity error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { weeklyData, totalLessons, loading, refresh: fetch };
};

function getISOWeekStart(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}
