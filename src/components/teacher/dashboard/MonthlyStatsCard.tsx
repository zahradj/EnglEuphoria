import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, UserCheck, UserPlus } from 'lucide-react';

interface StatItem {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

interface MonthlyStatsCardProps {
  totalLessons: number;
  totalStudents: number;
  regularStudents: number;
  trialStudents: number;
}

export const MonthlyStatsCard: React.FC<MonthlyStatsCardProps> = ({
  totalLessons,
  totalStudents,
  regularStudents,
  trialStudents
}) => {
  const stats: StatItem[] = [
    { label: 'Total Lessons', value: totalLessons, icon: BookOpen, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Total Students', value: totalStudents, icon: Users, color: 'text-purple-500 bg-purple-500/10' },
    { label: 'Regular Students', value: regularStudents, icon: UserCheck, color: 'text-green-500 bg-green-500/10' },
    { label: 'Trial Students', value: trialStudents, icon: UserPlus, color: 'text-amber-500 bg-amber-500/10' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Statistics (This Month)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
