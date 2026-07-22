import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const PerformanceTable = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    regularStudents: { last: 0, current: 0 },
    conversion: { last: 0, current: 0 },
    negativeFeedback: { last: 0, current: 0 },
    cancellations: { last: 0, current: 0 }
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Get regular students count
      const { data: currentStudents } = await supabase
        .from('lessons')
        .select('student_id')
        .eq('teacher_id', user.id)
        .gte('scheduled_at', currentMonthStart.toISOString())
        .eq('status', 'completed');

      const { data: lastStudents } = await supabase
        .from('lessons')
        .select('student_id')
        .eq('teacher_id', user.id)
        .gte('scheduled_at', lastMonthStart.toISOString())
        .lte('scheduled_at', lastMonthEnd.toISOString())
        .eq('status', 'completed');

      const currentRegular = new Set(currentStudents?.map(l => l.student_id) || []).size;
      const lastRegular = new Set(lastStudents?.map(l => l.student_id) || []).size;

      setStats({
        regularStudents: { last: lastRegular, current: currentRegular },
        conversion: { last: 45, current: 52 },
        negativeFeedback: { last: 2, current: 1 },
        cancellations: { last: 3, current: 2 }
      });
    };

    fetchStats();
  }, [user?.id]);

  const metrics = [
    { label: 'Regular students', ...stats.regularStudents },
    { label: "Students' conversion (%)", ...stats.conversion },
    { label: 'Negative feedbacks', ...stats.negativeFeedback },
    { label: 'Same-day cancellations', ...stats.cancellations },
    { label: 'Late cancellations', last: 1, current: 0 },
    { label: 'Teacher late', last: 0, current: 0 },
    { label: 'Teacher absent', last: 0, current: 0 },
    { label: 'Technical issues', last: 1, current: 1 }
  ];

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-purple-600" />
          Your performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="grid grid-cols-3 gap-2 pb-2 border-b text-xs font-medium text-gray-600">
            <div>Criteria</div>
            <div className="text-center">Last</div>
            <div className="text-center">Now</div>
          </div>
          {metrics.map((metric, index) => (
            <div key={index} className="grid grid-cols-3 gap-2 py-2 text-sm border-b border-gray-100 last:border-0">
              <div className="text-gray-700">{metric.label}</div>
              <div className="text-center text-gray-600">{metric.last}</div>
              <div className="text-center font-medium text-gray-900">{metric.current}</div>
            </div>
          ))}
        </div>
        <button className="text-xs text-purple-600 hover:text-purple-700 mt-3">
          See details →
        </button>
      </CardContent>
    </Card>
  );
};
