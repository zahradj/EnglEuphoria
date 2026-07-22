import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { useOrganization } from '@/hooks/useOrganization';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Users,
  BookOpen,
  DollarSign
} from 'lucide-react';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  unit: string;
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export const PerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentOrganization } = useOrganization();

  useEffect(() => {
    loadPerformanceData();
    const interval = setInterval(loadPerformanceData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [currentOrganization]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadMetrics(),
        loadAlerts()
      ]);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    if (!currentOrganization) return;

    try {
      // Load various performance metrics
      const [
        usersResult,
        lessonsResult,
        revenueResult,
        satisfactionResult
      ] = await Promise.all([
        supabase
          .from('organization_members')
          .select('id')
          .eq('organization_id', currentOrganization.id)
          .eq('status', 'active'),
        supabase
          .from('lessons')
          .select('id, status')
          .gte('scheduled_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase
          .from('payments')
          .select('amount')
          .eq('status', 'completed')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase
          .from('teacher_reviews')
          .select('rating')
          .eq('is_public', true)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      const activeUsers = usersResult.data?.length || 0;
      const totalLessons = lessonsResult.data?.length || 0;
      const completedLessons = lessonsResult.data?.filter(l => l.status === 'completed').length || 0;
      const monthlyRevenue = revenueResult.data?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const avgSatisfaction = satisfactionResult.data?.length 
        ? satisfactionResult.data.reduce((sum, r) => sum + r.rating, 0) / satisfactionResult.data.length
        : 0;

      const newMetrics: PerformanceMetric[] = [
        {
          id: 'active_users',
          name: 'Active Users',
          value: activeUsers,
          target: 100,
          trend: 'up',
          status: activeUsers > 80 ? 'good' : activeUsers > 50 ? 'warning' : 'critical',
          unit: 'users'
        },
        {
          id: 'lesson_completion',
          name: 'Lesson Completion Rate',
          value: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
          target: 85,
          trend: 'stable',
          status: (completedLessons / totalLessons) * 100 > 80 ? 'good' : 'warning',
          unit: '%'
        },
        {
          id: 'monthly_revenue',
          name: 'Monthly Revenue',
          value: monthlyRevenue,
          target: 10000,
          trend: 'up',
          status: monthlyRevenue > 8000 ? 'good' : monthlyRevenue > 5000 ? 'warning' : 'critical',
          unit: 'DZD'
        },
        {
          id: 'satisfaction',
          name: 'Customer Satisfaction',
          value: avgSatisfaction,
          target: 4.5,
          trend: 'up',
          status: avgSatisfaction > 4.2 ? 'good' : avgSatisfaction > 3.8 ? 'warning' : 'critical',
          unit: '/5'
        }
      ];

      setMetrics(newMetrics);
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const loadAlerts = async () => {
    // In a real implementation, this would fetch from a system alerts table
    const mockAlerts: SystemAlert[] = [
      {
        id: '1',
        type: 'warning',
        title: 'High Server Load',
        message: 'Server CPU usage is above 85% for the last 15 minutes',
        timestamp: new Date().toISOString(),
        resolved: false
      },
      {
        id: '2',
        type: 'info',
        title: 'Scheduled Maintenance',
        message: 'Database maintenance scheduled for Sunday 2AM-4AM',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        resolved: false
      }
    ];

    setAlerts(mockAlerts);
  };

  const resolveAlert = async (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <CheckCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Performance Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time system metrics and alerts
          </p>
        </div>
        <Button onClick={loadPerformanceData} disabled={loading}>
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
          <TabsTrigger value="alerts">System Alerts</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  {getTrendIcon(metric.trend)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.value.toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {metric.unit}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Progress 
                      value={metric.unit === '%' ? metric.value : (metric.value / metric.target) * 100}
                      className="h-2"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        Target: {metric.target}{metric.unit}
                      </span>
                      <Badge variant="outline" className={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Online Users</span>
                    <span className="font-medium">23</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sessions Today</span>
                    <span className="font-medium">156</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Session Duration</span>
                    <span className="font-medium">24 min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Content Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Active Lessons</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Materials Downloaded</span>
                    <span className="font-medium">89</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Homework Submitted</span>
                    <span className="font-medium">67</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4">
            {alerts.filter(alert => !alert.resolved).map((alert) => (
              <Alert key={alert.id} className={alert.type === 'error' ? 'border-red-200' : alert.type === 'warning' ? 'border-yellow-200' : 'border-blue-200'}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <AlertTitle>{alert.title}</AlertTitle>
                      <AlertDescription className="mt-1">
                        {alert.message}
                      </AlertDescription>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => resolveAlert(alert.id)}
                  >
                    Resolve
                  </Button>
                </div>
              </Alert>
            ))}

            {alerts.filter(alert => !alert.resolved).length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All Systems Operational</h3>
                  <p className="text-muted-foreground text-center">
                    No active alerts. All systems are running smoothly.
                  </p>
                </CardContent>
              </Card>
            )}

            {alerts.filter(alert => alert.resolved).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Resolved Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alerts.filter(alert => alert.resolved).map((alert) => (
                      <div key={alert.id} className="flex items-center gap-3 opacity-60">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{alert.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Resolved • {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>System metrics over the past 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Response Time</p>
                        <p className="text-sm text-muted-foreground">Average: 150ms</p>
                      </div>
                    </div>
                    <TrendingDown className="h-5 w-5 text-green-600" />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Uptime</p>
                        <p className="text-sm text-muted-foreground">99.9%</p>
                      </div>
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="font-medium">Load Time</p>
                        <p className="text-sm text-muted-foreground">Average: 1.2s</p>
                      </div>
                    </div>
                    <TrendingUp className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
                <CardDescription>Current system resource utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">CPU Usage</span>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                    <Progress value={65} />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Memory Usage</span>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                    <Progress value={78} />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Disk Usage</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <Progress value={45} />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Network I/O</span>
                      <span className="text-sm font-medium">23%</span>
                    </div>
                    <Progress value={23} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};