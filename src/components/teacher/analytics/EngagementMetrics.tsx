import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, BarChart3, FileText, BookOpen } from 'lucide-react';
import type { ClassMetrics } from '@/hooks/useTeacherAnalytics';

interface EngagementMetricsProps {
  metrics: ClassMetrics;
  upcoming: number;
}

export const EngagementMetrics: React.FC<EngagementMetricsProps> = ({ metrics, upcoming }) => {
  const cards = [
    { icon: Users, color: 'text-blue-500', value: metrics.totalStudents, label: 'Total Students' },
    { icon: TrendingUp, color: 'text-green-500', value: `${metrics.averageAttendance}%`, label: 'Attendance Rate' },
    { icon: BarChart3, color: 'text-purple-500', value: `${metrics.averageProgress}%`, label: 'Avg Progress' },
    { icon: BookOpen, color: 'text-orange-500', value: metrics.completedLessons, label: 'Lessons Done' },
    { icon: FileText, color: 'text-teal-500', value: upcoming, label: 'Upcoming' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <card.icon className={`h-8 w-8 ${card.color}`} />
              <div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
