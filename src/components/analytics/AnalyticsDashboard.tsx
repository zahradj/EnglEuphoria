
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Clock, Target, Award, Zap, RefreshCw, AlertCircle } from "lucide-react";
import { progressAnalyticsService, LearningAnalytics, PerformanceMetrics, ProgressAnalyticsError } from "@/services/progressAnalyticsService";
import { ErrorBoundary } from "./ErrorBoundary";
import { LoadingSpinner, ErrorState } from "@/components/ui/loading-states";

interface AnalyticsDashboardProps {
  studentId: string;
}

export function AnalyticsDashboard({ studentId }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<LearningAnalytics[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [timeRange, setTimeRange] = useState("7");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadAnalyticsData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      
      if (!studentId) {
        throw new ProgressAnalyticsError('Student ID is required', 'INVALID_INPUT');
      }
      
      const [analyticsData, metricsData] = await Promise.allSettled([
        progressAnalyticsService.getLearningAnalytics(studentId, parseInt(timeRange)),
        progressAnalyticsService.getPerformanceMetrics(studentId, 'weekly')
      ]);
      
      // Handle analytics data
      if (analyticsData.status === 'fulfilled') {
        setAnalytics(analyticsData.value);
      } else {
        console.error('Failed to load analytics:', analyticsData.reason);
        setAnalytics([]);
      }
      
      // Handle metrics data
      if (metricsData.status === 'fulfilled') {
        setMetrics(metricsData.value);
      } else {
        console.error('Failed to load metrics:', metricsData.reason);
        setMetrics([]);
      }
      
      // If both failed, show error
      if (analyticsData.status === 'rejected' && metricsData.status === 'rejected') {
        const error = analyticsData.reason instanceof ProgressAnalyticsError 
          ? analyticsData.reason 
          : new ProgressAnalyticsError('Failed to load analytics data');
        throw error;
      }
      
    } catch (error) {
      console.error('Error loading analytics:', error);
      
      let errorMessage = 'Failed to load analytics data';
      if (error instanceof ProgressAnalyticsError) {
        switch (error.code) {
          case 'NETWORK_ERROR':
            errorMessage = 'Network connection error. Please check your internet connection.';
            break;
          case 'UNAUTHORIZED':
            errorMessage = 'You need to be logged in to view analytics.';
            break;
          case 'INVALID_INPUT':
            errorMessage = 'Invalid student data. Please refresh the page.';
            break;
          default:
            errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    loadAnalyticsData();
  };

  const handleRefresh = () => {
    loadAnalyticsData(false);
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [studentId, timeRange, retryCount]);

  const getActivityStats = () => {
    const totalSessions = analytics.length;
    const totalDuration = analytics.reduce((sum, a) => sum + a.session_duration, 0);
    const totalXP = analytics.reduce((sum, a) => sum + a.xp_earned, 0);
    const averageAccuracy = analytics.length > 0 
      ? analytics.reduce((sum, a) => sum + (a.accuracy_score || 0), 0) / analytics.length 
      : 0;

    return { totalSessions, totalDuration, totalXP, averageAccuracy };
  };

  const getSkillDistribution = () => {
    const skillCounts: Record<string, number> = {};
    analytics.forEach(activity => {
      skillCounts[activity.skill_area] = (skillCounts[activity.skill_area] || 0) + 1;
    });
    return skillCounts;
  };

  const getDailyActivity = () => {
    const dailyData: Record<string, { sessions: number; xp: number; duration: number }> = {};
    analytics.forEach(activity => {
      const date = new Date(activity.recorded_at).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = { sessions: 0, xp: 0, duration: 0 };
      }
      dailyData[date].sessions += 1;
      dailyData[date].xp += activity.xp_earned;
      dailyData[date].duration += activity.session_duration;
    });
    return dailyData;
  };

  if (loading) {
    return (
      <LoadingSpinner 
        size="lg" 
        message="Loading analytics..." 
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Analytics Unavailable"
        message={error}
        onRetry={handleRetry}
        retryLabel="Retry Loading"
      />
    );
  }

  const stats = getActivityStats();
  const skillDistribution = getSkillDistribution();
  const dailyActivity = getDailyActivity();

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Learning Analytics</h2>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold">{stats.totalSessions}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Study Time</p>
                  <p className="text-2xl font-bold">{Math.round(stats.totalDuration / 60)}m</p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">XP Earned</p>
                  <p className="text-2xl font-bold">{stats.totalXP}</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Accuracy</p>
                  <p className="text-2xl font-bold">{Math.round(stats.averageAccuracy)}%</p>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="daily">Daily Activity</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Study Streak</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {Object.keys(dailyActivity).length}
                    </div>
                    <p className="text-sm text-gray-600">Active days in selected period</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Learning Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">XP per minute</span>
                      <span className="font-medium">
                        {stats.totalDuration > 0 ? (stats.totalXP / (stats.totalDuration / 60)).toFixed(1) : '0'}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(100, (stats.totalXP / (stats.totalDuration / 60)) * 10)} 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Skill Area Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(skillDistribution).map(([skill, count]) => (
                    <div key={skill} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium capitalize">{skill}</span>
                        <Badge variant="secondary">{count} sessions</Badge>
                      </div>
                      <Progress 
                        value={(count / Math.max(...Object.values(skillDistribution))) * 100} 
                        className="h-2" 
                      />
                    </div>
                  ))}
                  
                  {Object.keys(skillDistribution).length === 0 && (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        No skill data available for the selected time period.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="daily" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(dailyActivity)
                    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                    .slice(0, 7)
                    .map(([date, data]) => (
                      <div key={date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{new Date(date).toLocaleDateString()}</div>
                          <div className="text-sm text-gray-600">
                            {data.sessions} sessions • {Math.round(data.duration / 60)} minutes
                          </div>
                        </div>
                        <Badge variant="outline">{data.xp} XP</Badge>
                      </div>
                    ))}
                  
                  {Object.keys(dailyActivity).length === 0 && (
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        No activity data available for the selected time period.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium capitalize">{metric.metric_type.replace('_', ' ')}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(metric.date_recorded).toLocaleDateString()} • {metric.time_period}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{metric.metric_value}</div>
                      </div>
                    </div>
                  ))}
                  
                  {metrics.length === 0 && (
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        No performance metrics available yet.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}
