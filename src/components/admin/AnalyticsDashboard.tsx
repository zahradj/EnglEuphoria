
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAdminMetrics } from '@/hooks/admin/useAdminMetrics';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Star, 
  BookOpen, 
  DollarSign,
  Calendar,
  Target,
  Award,
  Activity,
  BarChart3,
  PieChart,
  GraduationCap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('week');
  const { metrics, loading } = useAdminMetrics();

  const analytics = {
    userEngagement: {
      dailyActiveUsers: 1247,
      sessionDuration: '24:32',
      bounceRate: 23.4,
      pageViews: 45632,
      growth: 12.5
    },
    learningMetrics: {
      completionRate: 87.3,
      averageScore: 84.2,
      totalLessons: 3456,
      xpEarned: 234567,
      streak: 15.3
    },
    revenue: {
      totalRevenue: 156780,
      subscriptions: 892,
      averageRevenue: 175.6,
      conversionRate: 4.8
    },
    teacherMetrics: {
      avgRating: 4.7,
      responseTime: '2.3h',
      satisfaction: 94.2,
      retention: 89.4
    }
  };

  const weeklyData = [
    { day: 'Mon', users: 320, lessons: 45, revenue: 2340 },
    { day: 'Tue', users: 450, lessons: 67, revenue: 3200 },
    { day: 'Wed', users: 380, lessons: 52, revenue: 2850 },
    { day: 'Thu', users: 520, lessons: 78, revenue: 4100 },
    { day: 'Fri', users: 490, lessons: 71, revenue: 3800 },
    { day: 'Sat', users: 340, lessons: 48, revenue: 2600 },
    { day: 'Sun', users: 280, lessons: 35, revenue: 1950 }
  ];

  const topPerformers = [
    { name: 'Sarah Johnson', metric: 'Student Satisfaction', value: '98.5%', trend: '+2.3%' },
    { name: 'Ahmed Hassan', metric: 'Lesson Completion', value: '94.8%', trend: '+5.1%' },
    { name: 'Emma Wilson', metric: 'Response Time', value: '< 30min', trend: '-15%' },
    { name: 'Lisa Chen', metric: 'Student Retention', value: '92.1%', trend: '+3.7%' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive platform insights and metrics</p>
        </div>
        <div className="flex gap-2">
          {['day', 'week', 'month', 'year'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="capitalize"
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="learning">Learning Metrics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-foreground/90">Daily Active Users</p>
                    <p className="text-3xl font-bold">{analytics.userEngagement.dailyActiveUsers}</p>
                    <p className="text-sm text-primary-foreground/90">+{analytics.userEngagement.growth}% vs last week</p>
                  </div>
                  <Users className="h-10 w-10 text-primary-foreground/80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-success to-success/80 text-success-foreground">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-success-foreground/90">Completion Rate</p>
                    <p className="text-3xl font-bold">{analytics.learningMetrics.completionRate}%</p>
                    <p className="text-sm text-success-foreground/90">Above industry average</p>
                  </div>
                  <Target className="h-10 w-10 text-success-foreground/80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-accent to-accent-light text-accent-foreground">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-accent-foreground/90">Monthly Revenue</p>
                    <p className="text-3xl font-bold">{analytics.revenue.totalRevenue.toLocaleString()} DZD</p>
                    <p className="text-sm text-accent-foreground/90">+18% vs last month</p>
                  </div>
                  <DollarSign className="h-10 w-10 text-accent-foreground/80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-warning to-warning/80 text-warning-foreground">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-warning-foreground/90">Teacher Rating</p>
                    <p className="text-3xl font-bold">{analytics.teacherMetrics.avgRating}</p>
                    <p className="text-sm text-warning-foreground/90">Out of 5.0 stars</p>
                  </div>
                  <Star className="h-10 w-10 text-warning-foreground/80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Weekly Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyData.map((day, index) => (
                    <div key={day.day} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-12 text-sm font-medium">{day.day}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Progress value={(day.users / 600) * 100} className="flex-1" />
                            <span className="text-xs text-muted-foreground w-12">{day.users}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{day.revenue.toLocaleString()} DZD</p>
                        <p className="text-xs text-muted-foreground">{day.lessons} lessons</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((performer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-surface-2 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {performer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{performer.name}</p>
                          <p className="text-xs text-muted-foreground">{performer.metric}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{performer.value}</p>
                        <p className="text-xs text-green-600">{performer.trend}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">User Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Session Duration</span>
                  <span className="font-medium">{analytics.userEngagement.sessionDuration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Bounce Rate</span>
                  <span className="font-medium">{analytics.userEngagement.bounceRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Page Views</span>
                  <span className="font-medium">{analytics.userEngagement.pageViews.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Growth Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">New Users</span>
                    <span className="font-medium">+{analytics.userEngagement.growth}%</span>
                  </div>
                  <Progress value={analytics.userEngagement.growth * 4} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">User Retention</span>
                    <span className="font-medium">78.9%</span>
                  </div>
                  <Progress value={78.9} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Active Sessions</span>
                    <span className="font-medium">892</span>
                  </div>
                  <Progress value={65} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Geographic Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Algeria</span>
                  <div className="flex items-center gap-2">
                    <Progress value={65} className="w-16" />
                    <span className="text-sm font-medium">65%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">France</span>
                  <div className="flex items-center gap-2">
                    <Progress value={20} className="w-16" />
                    <span className="text-sm font-medium">20%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Canada</span>
                  <div className="flex items-center gap-2">
                    <Progress value={10} className="w-16" />
                    <span className="text-sm font-medium">10%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Other</span>
                  <div className="flex items-center gap-2">
                    <Progress value={5} className="w-16" />
                    <span className="text-sm font-medium">5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="learning" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Lesson Completion Rate</span>
                    <span className="font-medium">{analytics.learningMetrics.completionRate}%</span>
                  </div>
                  <Progress value={analytics.learningMetrics.completionRate} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Average Score</span>
                    <span className="font-medium">{analytics.learningMetrics.averageScore}%</span>
                  </div>
                  <Progress value={analytics.learningMetrics.averageScore} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Streak Consistency</span>
                    <span className="font-medium">{analytics.learningMetrics.streak} days</span>
                  </div>
                  <Progress value={analytics.learningMetrics.streak * 6.67} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>XP & Achievements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {analytics.learningMetrics.xpEarned.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600">Total XP Earned</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">156</p>
                    <p className="text-xs text-gray-600">Badges Earned</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">89</p>
                    <p className="text-xs text-gray-600">Milestones</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {analytics.revenue.totalRevenue.toLocaleString()} DZD
                  </div>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Subscriptions</span>
                    <span className="font-medium">{analytics.revenue.subscriptions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg. Revenue/User</span>
                    <span className="font-medium">{analytics.revenue.averageRevenue} DZD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Conversion Rate</span>
                    <span className="font-medium">{analytics.revenue.conversionRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Subscription Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Basic Plan</span>
                  <div className="flex items-center gap-2">
                    <Progress value={45} className="w-16" />
                    <span className="text-sm font-medium">45%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Premium Plan</span>
                  <div className="flex items-center gap-2">
                    <Progress value={35} className="w-16" />
                    <span className="text-sm font-medium">35%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pro Plan</span>
                  <div className="flex items-center gap-2">
                    <Progress value={20} className="w-16" />
                    <span className="text-sm font-medium">20%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Growth Trends</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">+18%</div>
                  <p className="text-sm text-gray-600">Revenue Growth</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">+24%</div>
                  <p className="text-sm text-gray-600">New Subscriptions</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
