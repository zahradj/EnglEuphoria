import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { StudentStat } from '@/hooks/useTeacherAnalytics';

interface StudentProgressChartProps {
  students: StudentStat[];
}

export const StudentProgressChart: React.FC<StudentProgressChartProps> = ({ students }) => {
  const chartData = students.slice(0, 10).map(s => ({
    name: s.student_name.split(' ')[0],
    score: s.avg_score,
    lessons: s.lessons_completed,
  }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Student Progress</CardTitle></CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">No student data available yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Progress Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 8,
                color: 'hsl(var(--foreground))',
              }}
            />
            <Legend />
            <Bar dataKey="score" name="Avg Score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="lessons" name="Lessons" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
