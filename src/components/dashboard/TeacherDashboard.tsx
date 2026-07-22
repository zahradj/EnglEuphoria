import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  FileText,
  Presentation,
  PenTool,
  BarChart3,
  Calendar,
  Award,
  Zap,
  TrendingUp
} from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  variant?: 'default' | 'positive' | 'warning';
}

function KPICard({ title, value, change, icon, variant = 'default' }: KPICardProps) {
  const variantStyles = {
    default: 'bg-gradient-to-br from-brand-50 to-brand-100 border-brand-200',
    positive: 'bg-gradient-to-br from-brand-100 to-brand-200 border-brand-300',
    warning: 'bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20'
  };

  return (
    <Card className={`p-6 border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${variantStyles[variant]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          {change && (
            <p className="text-sm text-brand-600 mt-1">{change}</p>
          )}
        </div>
        <div className="p-3 bg-brand-500/10 rounded-2xl text-brand-600">
          {icon}
        </div>
      </div>
    </Card>
  );
}

interface ClassCardProps {
  title: string;
  time: string;
  level: string;
  students: number;
  status: 'upcoming' | 'in-progress' | 'completed';
}

function ClassCard({ title, time, level, students, status }: ClassCardProps) {
  const statusConfig = {
    upcoming: { color: 'bg-brand-500', text: 'Upcoming' },
    'in-progress': { color: 'bg-destructive', text: 'Live' },
    completed: { color: 'bg-brand-300', text: 'Completed' }
  };

  return (
    <Card className="p-6 border-2 border-brand-200 hover:border-brand-300 transition-all duration-200 hover:shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg text-foreground">{title}</h3>
          <p className="text-muted-foreground text-sm">{time}</p>
        </div>
        <Badge className={`${statusConfig[status].color} text-white`}>
          {statusConfig[status].text}
        </Badge>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Level:</span>
            <span className="ml-1 font-medium text-brand-700">{level}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Students:</span>
            <span className="ml-1 font-medium text-brand-700">{students}</span>
          </div>
        </div>
        
        {status === 'upcoming' && (
          <Button size="sm" className="bg-brand-500 hover:bg-brand-600 text-white">
            <Play className="w-4 h-4 mr-2" />
            Start Class
          </Button>
        )}
      </div>
    </Card>
  );
}

export function TeacherDashboard() {
  const [streakDays, setStreakDays] = useState(12);

  const kpiData = [
    {
      title: 'Today\'s Classes',
      value: 4,
      change: '+1 from yesterday',
      icon: <Calendar className="w-6 h-6" />,
      variant: 'default' as const
    },
    {
      title: 'Attendance Rate',
      value: '94%',
      change: '+3% this week',
      icon: <Users className="w-6 h-6" />,
      variant: 'positive' as const
    },
    {
      title: 'Items to Grade',
      value: 7,
      change: '2 urgent',
      icon: <CheckCircle className="w-6 h-6" />,
      variant: 'warning' as const
    },
    {
      title: 'Messages',
      value: 3,
      change: 'New inquiries',
      icon: <AlertTriangle className="w-6 h-6" />,
      variant: 'default' as const
    }
  ];

  const upcomingClasses = [
    {
      title: 'Advanced Grammar',
      time: '10:00 AM - 11:30 AM',
      level: 'B2',
      students: 8,
      status: 'upcoming' as const
    },
    {
      title: 'Conversation Practice',
      time: '2:00 PM - 3:00 PM',
      level: 'A2',
      students: 12,
      status: 'in-progress' as const
    },
    {
      title: 'IELTS Preparation',
      time: '4:00 PM - 5:30 PM',
      level: 'C1',
      students: 6,
      status: 'upcoming' as const
    }
  ];

  return (
    <div className="min-h-dvh bg-gradient-to-br from-brand-50 via-surface to-brand-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-500 to-brand-600 text-white p-8 rounded-b-3xl shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Good morning, Sarah!</h1>
              <p className="text-brand-100 mt-2">Ready to inspire your students today?</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="flex items-center gap-2 bg-white/20 rounded-2xl px-4 py-2">
                  <Zap className="w-5 h-5 text-yellow-300" />
                  <span className="font-semibold">{streakDays} Day Streak</span>
                </div>
                <p className="text-xs text-brand-100 mt-1">Timely Feedback</p>
              </div>
              <Button 
                size="lg" 
                className="bg-white text-brand-600 hover:bg-brand-50 hover:text-brand-700 font-semibold"
              >
                <Play className="w-5 h-5 mr-2" />
                Quick Start Class
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiData.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Classes Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Today's Classes</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-brand-300 text-brand-600 hover:bg-brand-50">
                  Filter by Level
                </Button>
                <Button variant="outline" size="sm" className="border-brand-300 text-brand-600 hover:bg-brand-50">
                  View Calendar
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {upcomingClasses.map((classItem, index) => (
                <ClassCard key={index} {...classItem} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6 border-2 border-brand-200">
              <h3 className="font-semibold text-lg mb-4 text-foreground">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start bg-brand-500 hover:bg-brand-600 text-white" 
                  size="lg"
                >
                  <Presentation className="w-5 h-5 mr-3" />
                  Create New Lesson
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-brand-300 text-brand-600 hover:bg-brand-50" 
                  size="lg"
                >
                  <PenTool className="w-5 h-5 mr-3" />
                  Open Whiteboard
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-brand-300 text-brand-600 hover:bg-brand-50" 
                  size="lg"
                >
                  <FileText className="w-5 h-5 mr-3" />
                  Import Content
                </Button>
              </div>
            </Card>

            {/* To-Do Panel */}
            <Card className="p-6 border-2 border-brand-200">
              <h3 className="font-semibold text-lg mb-4 text-foreground">Priority Tasks</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-brand-50 rounded-xl">
                  <div>
                    <p className="font-medium text-foreground">Grade Essay Submissions</p>
                    <p className="text-sm text-muted-foreground">B2 Advanced Class</p>
                  </div>
                  <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                    Urgent
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-brand-50 rounded-xl">
                  <div>
                    <p className="font-medium text-foreground">Student Messages</p>
                    <p className="text-sm text-muted-foreground">3 new inquiries</p>
                  </div>
                  <Badge className="bg-brand-500/10 text-brand-600 border-brand-300">
                    New
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-brand-50 rounded-xl">
                  <div>
                    <p className="font-medium text-foreground">Lesson Plan Review</p>
                    <p className="text-sm text-muted-foreground">Tomorrow's classes</p>
                  </div>
                  <Badge className="bg-brand-300/20 text-brand-700 border-brand-400">
                    Pending
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Insights Mini */}
            <Card className="p-6 border-2 border-brand-200">
              <h3 className="font-semibold text-lg mb-4 text-foreground">Weekly Insights</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Class Engagement</span>
                    <span className="text-sm font-medium text-brand-600">87%</span>
                  </div>
                  <Progress value={87} className="h-2 bg-brand-100" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Assignment Completion</span>
                    <span className="text-sm font-medium text-brand-600">92%</span>
                  </div>
                  <Progress value={92} className="h-2 bg-brand-100" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-brand-500" />
                  <span className="text-muted-foreground">+5% improvement this week</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}