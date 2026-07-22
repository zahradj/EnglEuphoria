
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Zap, 
  Target, 
  Calendar, 
  TrendingUp,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { progressAnalyticsService, ProgressSummary, ProgressAnalyticsError } from "@/services/progressAnalyticsService";
import { AchievementNotification } from "./AchievementNotification";
import { ErrorBoundary } from "./ErrorBoundary";
import { LoadingSpinner, ErrorState } from "@/components/ui/loading-states";

interface EnhancedProgressTrackerProps {
  studentId: string;
  studentName: string;
}

export function EnhancedProgressTracker({ studentId, studentName }: EnhancedProgressTrackerProps) {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadProgressSummary = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      
      if (!studentId) {
        throw new ProgressAnalyticsError('Student ID is required', 'INVALID_INPUT');
      }
      
      const data = await progressAnalyticsService.getProgressSummary(studentId);
      setSummary(data);
    } catch (error) {
      console.error('Error loading progress summary:', error);
      
      let errorMessage = 'Failed to load progress data';
      if (error instanceof ProgressAnalyticsError) {
        switch (error.code) {
          case 'NETWORK_ERROR':
            errorMessage = 'Network connection error. Please check your internet connection.';
            break;
          case 'UNAUTHORIZED':
            errorMessage = 'You need to be logged in to view progress.';
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
    loadProgressSummary();
  };

  useEffect(() => {
    loadProgressSummary();
  }, [studentId, retryCount]);

  const handleRefresh = () => {
    loadProgressSummary(false); // Don't show loading spinner for refresh
  };

  if (loading) {
    return (
      <LoadingSpinner 
        size="lg" 
        message="Loading your progress..." 
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Progress Unavailable"
        message={error}
        onRetry={handleRetry}
        retryLabel="Retry Loading"
      />
    );
  }

  if (!summary) {
    return (
      <ErrorState
        title="No Progress Data"
        message="No progress data available. Start learning to see your progress here!"
        showIcon={false}
      />
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {studentName}'s Progress
            </h2>
            <p className="text-gray-600">
              Track your learning journey and achievements
            </p>
          </div>
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

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total XP</p>
                  <p className="text-2xl font-bold text-blue-600">{summary.totalXP.toLocaleString()}</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Level</p>
                  <p className="text-2xl font-bold text-green-600">{summary.currentLevel}</p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Achievements</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {summary.achievementsEarned}/{summary.totalAchievements}
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-orange-600">{summary.weeklyActivity}m</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Level Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Level {summary.currentLevel}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(summary.xpProgress)}% to next level
                </span>
              </div>
              <Progress value={summary.xpProgress} className="h-3" />
              <p className="text-xs text-gray-500">
                Keep learning to reach the next level!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Content */}
        <Tabs defaultValue="achievements" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="achievements">Recent Achievements</TabsTrigger>
            <TabsTrigger value="skills">Skill Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                {summary.recentAchievements.length > 0 ? (
                  <div className="space-y-3">
                    {summary.recentAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="text-2xl">
                          {achievement.achievement?.icon || '🏆'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">
                            {achievement.achievement?.name || 'Achievement'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {achievement.achievement?.description || 'Well done!'}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          +{achievement.achievement?.xp_reward || 0} XP
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No achievements yet. Keep learning to unlock your first achievement!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Skill Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(summary.skillBreakdown).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(summary.skillBreakdown).map(([skill, xp]) => (
                      <div key={skill} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium capitalize">{skill}</span>
                          <Badge variant="outline">{xp} XP</Badge>
                        </div>
                        <Progress 
                          value={(xp / Math.max(...Object.values(summary.skillBreakdown))) * 100} 
                          className="h-2" 
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No skill data yet. Complete lessons to see your skill progress!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}
