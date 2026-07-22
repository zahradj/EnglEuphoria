import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target, 
  Brain,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Calendar,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

interface RevenueMetrics {
  current: number;
  previous: number;
  growth: number;
  forecast: number;
  churnRate: number;
}

interface UserMetrics {
  activeUsers: number;
  newUsers: number;
  retentionRate: number;
  engagementScore: number;
}

interface TeachingMetrics {
  lessonsCompleted: number;
  averageRating: number;
  completionRate: number;
  teacherSatisfaction: number;
}

interface PredictiveInsights {
  churnRisk: {
    high: number;
    medium: number;
    low: number;
  };
  revenueForecasting: {
    nextMonth: number;
    confidence: number;
  };
  marketDemand: {
    trend: 'increasing' | 'stable' | 'decreasing';
    category: string;
    growth: number;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const BusinessIntelligenceDashboard = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics>({
    current: 234567,
    previous: 198432,
    growth: 18.2,
    forecast: 267890,
    churnRate: 3.2
  });

  const [userMetrics, setUserMetrics] = useState<UserMetrics>({
    activeUsers: 12847,
    newUsers: 1234,
    retentionRate: 89.5,
    engagementScore: 8.7
  });

  const [teachingMetrics, setTeachingMetrics] = useState<TeachingMetrics>({
    lessonsCompleted: 4567,
    averageRating: 4.6,
    completionRate: 94.2,
    teacherSatisfaction: 8.9
  });

  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsights>({
    churnRisk: {
      high: 127,
      medium: 234,
      low: 1456
    },
    revenueForecasting: {
      nextMonth: 267890,
      confidence: 87.3
    },
    marketDemand: [
      { trend: 'increasing', category: 'Kids English', growth: 23.4 },
      { trend: 'stable', category: 'Business English', growth: 5.2 },
      { trend: 'increasing', category: 'IELTS Prep', growth: 31.8 },
      { trend: 'decreasing', category: 'Conversational', growth: -2.1 }
    ]
  });

  // Sample data for charts
  const revenueData = [
    { month: 'Jan', revenue: 145000, forecast: 150000 },
    { month: 'Feb', revenue: 167000, forecast: 170000 },
    { month: 'Mar', revenue: 189000, forecast: 185000 },
    { month: 'Apr', revenue: 210000, forecast: 205000 },
    { month: 'May', revenue: 234567, forecast: 230000 },
    { month: 'Jun', revenue: 0, forecast: 267890 }
  ];

  const churnData = [
    { name: 'High Risk', value: predictiveInsights.churnRisk.high, color: '#FF8042' },
    { name: 'Medium Risk', value: predictiveInsights.churnRisk.medium, color: '#FFBB28' },
    { name: 'Low Risk', value: predictiveInsights.churnRisk.low, color: '#00C49F' }
  ];

  const teachingEfficiencyData = [
    { category: 'Grammar', efficiency: 92, satisfaction: 4.7 },
    { category: 'Speaking', efficiency: 88, satisfaction: 4.6 },
    { category: 'Writing', efficiency: 85, satisfaction: 4.4 },
    { category: 'Reading', efficiency: 94, satisfaction: 4.8 },
    { category: 'Listening', efficiency: 90, satisfaction: 4.5 }
  ];

  const getGrowthIcon = (growth: number) => {
    return growth > 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getGrowthColor = (growth: number) => {
    return growth > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Target className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Business Intelligence</h2>
          <p className="text-muted-foreground">AI-powered analytics and predictive insights</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border rounded">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range as any)}
              >
                {range}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">${revenueMetrics.current.toLocaleString()}</p>
                <div className={`flex items-center gap-1 text-sm ${getGrowthColor(revenueMetrics.growth)}`}>
                  {getGrowthIcon(revenueMetrics.growth)}
                  {Math.abs(revenueMetrics.growth)}%
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{userMetrics.activeUsers.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  +{userMetrics.newUsers}
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Churn Rate</p>
                <p className="text-2xl font-bold">{revenueMetrics.churnRate}%</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingDown className="h-4 w-4" />
                  -0.8%
                </div>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{teachingMetrics.completionRate}%</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  +2.1%
                </div>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Insights</TabsTrigger>
          <TabsTrigger value="teaching">Teaching Optimization</TabsTrigger>
          <TabsTrigger value="market">Market Intelligence</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends & Forecasting</CardTitle>
                <CardDescription>
                  Historical revenue with AI-powered forecasting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="forecast" stroke="#82ca9d" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Churn Risk Analysis</CardTitle>
                <CardDescription>
                  AI-powered customer churn prediction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={churnData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {churnData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Revenue Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Next Month</span>
                      <span className="font-medium">${predictiveInsights.revenueForecasting.nextMonth.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Confidence</span>
                      <span className="font-medium">{predictiveInsights.revenueForecasting.confidence}%</span>
                    </div>
                    <Progress value={predictiveInsights.revenueForecasting.confidence} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Current Rate</span>
                      <span className="font-medium">{userMetrics.retentionRate}%</span>
                    </div>
                    <Progress value={userMetrics.retentionRate} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Engagement Score</span>
                      <span className="font-medium">{userMetrics.engagementScore}/10</span>
                    </div>
                    <Progress value={userMetrics.engagementScore * 10} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Teacher Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Avg Rating</span>
                      <span className="font-medium">{teachingMetrics.averageRating}/5</span>
                    </div>
                    <Progress value={teachingMetrics.averageRating * 20} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Satisfaction</span>
                      <span className="font-medium">{teachingMetrics.teacherSatisfaction}/10</span>
                    </div>
                    <Progress value={teachingMetrics.teacherSatisfaction * 10} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="teaching" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teaching Efficiency by Category</CardTitle>
              <CardDescription>
                AI analysis of teaching effectiveness across different categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={teachingEfficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="efficiency" fill="#8884d8" name="Efficiency %" />
                  <Bar dataKey="satisfaction" fill="#82ca9d" name="Satisfaction (x20)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Demand Analysis</CardTitle>
              <CardDescription>
                AI-powered market trends and demand forecasting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictiveInsights.marketDemand.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      {getTrendIcon(item.trend)}
                      <div>
                        <p className="font-medium">{item.category}</p>
                        <p className="text-sm text-muted-foreground capitalize">{item.trend} trend</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${getGrowthColor(item.growth)}`}>
                        {item.growth > 0 ? '+' : ''}{item.growth}%
                      </p>
                      <p className="text-sm text-muted-foreground">Growth</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};