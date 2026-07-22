import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Star, 
  Target,
  CheckCircle,
  Clock,
  BookOpen,
  Zap
} from 'lucide-react';

export const LearningInsights = () => {
  const { user } = useAuth();
  const { 
    insights, 
    isLoading,
    fetchInsights,
    createInsight,
    analyzeLearningPatterns,
    recordLearningEvent
  } = useAdvancedAnalytics();

  const [patterns, setPatterns] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadInsightsData();
    }
  }, [user]);

  const loadInsightsData = async () => {
    await fetchInsights();
    
    // Analyze learning patterns
    const patternData = await analyzeLearningPatterns();
    setPatterns(patternData);
  };

  const generateSampleInsights = async () => {
    const sampleInsights = [
      {
        type: 'learning_pattern',
        content: 'You consistently perform better during morning study sessions',
        data: { peak_hours: [9, 10, 11], performance_boost: '23%' },
        priority: 2,
        actionable: true
      },
      {
        type: 'achievement',
        content: 'Congratulations! You\'ve maintained a 7-day learning streak',
        data: { streak_days: 7, consistency_score: 0.95 },
        priority: 1,
        actionable: false
      },
      {
        type: 'warning',
        content: 'Your engagement with grammar exercises has decreased by 40%',
        data: { skill_area: 'grammar', decline_percentage: 40 },
        priority: 3,
        actionable: true
      },
      {
        type: 'recommendation',
        content: 'Based on your progress, you\'re ready for intermediate level content',
        data: { current_level: 'beginner', suggested_level: 'intermediate', confidence: 0.85 },
        priority: 2,
        actionable: true
      }
    ];

    for (const insight of sampleInsights) {
      await createInsight(
        insight.type,
        insight.content,
        {
          insightData: insight.data,
          priorityLevel: insight.priority,
          isActionable: insight.actionable
        }
      );
    }
  };

  const handleTakeAction = async (insight: any) => {
    // Record that user took action on this insight
    await recordLearningEvent(
      'insight_action_taken',
      { insight_id: insight.id, insight_type: insight.insight_type }
    );
    
    // Refresh insights
    await fetchInsights();
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'learning_pattern': return <Brain className="h-5 w-5 text-blue-500" />;
      case 'achievement': return <Star className="h-5 w-5 text-yellow-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'recommendation': return <Target className="h-5 w-5 text-green-500" />;
      default: return <Zap className="h-5 w-5 text-primary" />;
    }
  };

  const getPriorityColor = (level: number) => {
    switch (level) {
      case 4: return 'bg-red-100 text-red-800';
      case 3: return 'bg-orange-100 text-orange-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const formatInsightData = (data: any) => {
    if (!data) return null;
    
    return Object.entries(data).map(([key, value]) => (
      <div key={key} className="flex justify-between text-sm">
        <span className="capitalize">{key.replace('_', ' ')}:</span>
        <span className="font-medium">{String(value)}</span>
      </div>
    ));
  };

  const highPriorityInsights = insights.filter(i => i.priority_level >= 3);
  const actionableInsights = insights.filter(i => i.is_actionable && !i.action_taken);
  const completedInsights = insights.filter(i => i.action_taken);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Learning Insights</h2>
        </div>
        <div className="flex gap-2">
          <Button onClick={generateSampleInsights} variant="outline">
            Generate Sample Insights
          </Button>
          <Button onClick={loadInsightsData} disabled={isLoading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Insights Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{highPriorityInsights.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actionable</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{actionableInsights.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedInsights.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* High Priority Insights */}
      {highPriorityInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              High Priority Insights
            </CardTitle>
            <CardDescription>These insights require your immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {highPriorityInsights.map((insight) => (
                <div key={insight.id} className="border-l-4 border-red-500 pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getInsightIcon(insight.insight_type)}
                        <h4 className="font-medium">{insight.insight_content}</h4>
                      </div>
                      {insight.insight_data && (
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {formatInsightData(insight.insight_data)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(insight.priority_level)}>
                        Priority {insight.priority_level}
                      </Badge>
                      {insight.is_actionable && !insight.action_taken && (
                        <Button size="sm" onClick={() => handleTakeAction(insight)}>
                          Take Action
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Insights */}
      <Card>
        <CardHeader>
          <CardTitle>All Learning Insights</CardTitle>
          <CardDescription>
            AI-generated insights about your learning patterns and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          {insights.length > 0 ? (
            <div className="space-y-4">
              {insights.map((insight) => (
                <div key={insight.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.insight_type)}
                      <h4 className="font-medium">{insight.insight_content}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(insight.priority_level)}>
                        Priority {insight.priority_level}
                      </Badge>
                      {insight.is_actionable && (
                        <Badge variant="outline">Actionable</Badge>
                      )}
                      {insight.action_taken && (
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      )}
                    </div>
                  </div>
                  
                  {insight.insight_data && (
                    <div className="mb-3 p-3 bg-muted rounded-lg">
                      <h5 className="font-medium mb-2">Details:</h5>
                      <div className="space-y-1">
                        {formatInsightData(insight.insight_data)}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Generated {new Date(insight.created_at).toLocaleDateString()}
                      {insight.expires_at && (
                        <span className="ml-2">
                          • Expires {new Date(insight.expires_at).toLocaleDateString()}
                        </span>
                      )}
                    </span>
                    
                    {insight.is_actionable && !insight.action_taken && (
                      <Button size="sm" onClick={() => handleTakeAction(insight)}>
                        Take Action
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Insights Available</h3>
              <p className="text-muted-foreground">
                Continue learning to generate personalized insights
              </p>
              <Button onClick={generateSampleInsights} className="mt-4">
                Generate Sample Insights
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Patterns */}
      {patterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Learning Patterns
            </CardTitle>
            <CardDescription>
              Detected patterns in your learning behavior
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patterns.map((pattern, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2 capitalize">
                    {pattern.type?.replace('_', ' ')} Pattern
                  </h4>
                  <div className="text-sm text-muted-foreground">
                    {JSON.stringify(pattern)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};