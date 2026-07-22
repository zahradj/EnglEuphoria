import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const MonthlyStatistics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalLessons: 0,
    totalStudents: 0,
    regularStudents: 0,
    trialStudents: 0
  });

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get lessons for this month
      const { data: lessons } = await supabase
        .from('lessons')
        .select('student_id')
        .eq('teacher_id', user.id)
        .gte('scheduled_at', monthStart.toISOString())
        .eq('status', 'completed');

      if (lessons) {
        const uniqueStudents = new Set(lessons.map(l => l.student_id));
        setStats({
          totalLessons: lessons.length,
          totalStudents: uniqueStudents.size,
          regularStudents: Math.floor(uniqueStudents.size * 0.7), // Mock: 70% regular
          trialStudents: Math.ceil(uniqueStudents.size * 0.3) // Mock: 30% trial
        });
      }
    };

    fetchStats();
  }, [user?.id]);

  const statItems = [
    { label: 'Total lessons', value: stats.totalLessons },
    { label: 'Total students', value: stats.totalStudents },
    { label: 'Regular students', value: stats.regularStudents },
    { label: 'Trial students', value: stats.trialStudents }
  ];

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          Statistics for {currentMonth}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {statItems.map((item, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{item.value}</div>
              <div className="text-xs text-gray-600 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
