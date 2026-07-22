import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Clock, 
  Trophy, 
  Target,
  Flame,
  BookOpen,
  Award,
  Zap
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface StudentKPICardsProps {
  studentLevel?: string;
}

export const StudentKPICards: React.FC<StudentKPICardsProps> = ({ 
  studentLevel = 'A1' 
}) => {
  // Mock data - in real app, this would come from props or API
  const weeklyData = [
    { day: 'Mon', minutes: 45 },
    { day: 'Tue', minutes: 30 },
    { day: 'Wed', minutes: 60 },
    { day: 'Thu', minutes: 25 },
    { day: 'Fri', minutes: 50 },
    { day: 'Sat', minutes: 35 },
    { day: 'Sun', minutes: 40 }
  ];

  const skillsData = [
    { skill: 'Speaking', progress: 75, color: '#3B82F6' },
    { skill: 'Listening', progress: 85, color: '#10B981' },
    { skill: 'Reading', progress: 60, color: '#F59E0B' },
    { skill: 'Writing', progress: 45, color: '#EF4444' }
  ];

  const levelThemeColor = {
    'A1': 'hsl(97, 54%, 53%)',
    'A2': 'hsl(217, 91%, 60%)',
    'B1': 'hsl(38, 92%, 50%)',
    'B2': 'hsl(0, 84%, 60%)',
    'C1': 'hsl(258, 90%, 66%)',
    'C2': 'hsl(231, 48%, 48%)'
  }[studentLevel] || 'hsl(217, 91%, 60%)';

  const kpiCards = [
    {
      id: 'study-time',
      title: 'This Week',
      value: '4h 35m',
      change: '+15%',
      changeType: 'positive' as const,
      icon: Clock,
      chart: (
        <ResponsiveContainer width="100%" height={60}>
          <AreaChart data={weeklyData}>
            <Area 
              type="monotone" 
              dataKey="minutes" 
              stroke={levelThemeColor}
              fill={levelThemeColor}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      )
    },
    {
      id: 'streak',
      title: 'Study Streak',
      value: '12 days',
      change: 'Personal best!',
      changeType: 'positive' as const,
      icon: Flame,
      chart: (
        <div className="flex items-center justify-center h-[60px]">
          <div className="text-2xl">🔥</div>
        </div>
      )
    },
    {
      id: 'xp',
      title: 'Total XP',
      value: '2,450',
      change: '+180 today',
      changeType: 'positive' as const,
      icon: Zap,
      chart: (
        <ResponsiveContainer width="100%" height={60}>
          <BarChart data={weeklyData.slice(-4)}>
            <Bar 
              dataKey="minutes" 
              fill={levelThemeColor}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )
    },
    {
      id: 'level-progress',
      title: `${studentLevel} Progress`,
      value: '67%',
      change: 'Almost to A2!',
      changeType: 'positive' as const,
      icon: Target,
      chart: (
        <div className="space-y-2">
          <Progress value={67} className="h-2" />
          <div className="text-xs text-muted-foreground text-center">
            8 lessons to go
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 animate-fade-in">
      {kpiCards.map((card) => {
        const IconComponent = card.icon;
        
        return (
          <Card key={card.id} className="group hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className="p-2 rounded-lg bg-primary/10">
                  <IconComponent className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Value and change */}
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{card.value}</div>
                  <div className={`text-xs flex items-center gap-1 ${
                    card.changeType === 'positive' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {card.changeType === 'positive' && (
                      <TrendingUp className="h-3 w-3" />
                    )}
                    {card.change}
                  </div>
                </div>

                {/* Chart */}
                <div className="h-[60px]">
                  {card.chart}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};