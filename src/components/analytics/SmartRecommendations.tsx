import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { Lightbulb, Clock, BookOpen, Calendar, Star, CheckCircle, X } from 'lucide-react';

export const SmartRecommendations = () => {
  const { user } = useAuth();
  const { 
    recommendations, 
    isLoading,
    fetchRecommendations,
    updateRecommendationFeedback,
    createRecommendation
  } = useAdvancedAnalytics();

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const handleAcceptRecommendation = async (recommendationId: string, rating = 5) => {
    await updateRecommendationFeedback(recommendationId, true, rating);
  };

  const handleRejectRecommendation = async (recommendationId: string, rating = 1) => {
    await updateRecommendationFeedback(recommendationId, false, rating);
  };

  const generateSampleRecommendations = async () => {
    const sampleRecs = [
      {
        type: 'content',
        data: { title: 'Advanced Grammar Exercises', difficulty: 'intermediate' },
        reasoning: { based_on: 'Recent grammar quiz performance', confidence: 0.8 }
      },
      {
        type: 'study_schedule',
        data: { recommended_time: '10:00 AM', duration: 30, frequency: 'daily' },
        reasoning: { based_on: 'Peak performance analysis', confidence: 0.9 }
      },
      {
        type: 'learning_path',
        data: { next_skill: 'Business English', estimated_time: '2 weeks' },
        reasoning: { based_on: 'Career goals and current level', confidence: 0.7 }
      }
    ];

    for (const rec of sampleRecs) {
      await createRecommendation(
        rec.type,
        rec.data,
        {
          reasoning: rec.reasoning,
          priorityScore: rec.reasoning.confidence
        }
      );
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'content': return <BookOpen className="h-5 w-5 text-blue-500" />;
      case 'study_schedule': return <Calendar className="h-5 w-5 text-green-500" />;
      case 'learning_path': return <Star className="h-5 w-5 text-purple-500" />;
      case 'skill_focus': return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      default: return <Lightbulb className="h-5 w-5 text-primary" />;
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 0.8) return 'bg-red-100 text-red-800';
    if (score >= 0.6) return 'bg-orange-100 text-orange-800';
    if (score >= 0.4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const formatRecommendationData = (data: any) => {
    if (typeof data === 'object' && data !== null) {
      return Object.entries(data)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }
    return String(data);
  };

  const pendingRecommendations = recommendations.filter(r => r.accepted === undefined);
  const acceptedRecommendations = recommendations.filter(r => r.accepted === true);
  const rejectedRecommendations = recommendations.filter(r => r.accepted === false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Smart Recommendations</h2>
        </div>
        <div className="flex gap-2">
          <Button onClick={generateSampleRecommendations} variant="outline">
            Generate Sample Recommendations
          </Button>
          <Button onClick={() => fetchRecommendations()} disabled={isLoading}>
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingRecommendations.length})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted ({acceptedRecommendations.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedRecommendations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingRecommendations.length > 0 ? (
            <div className="space-y-4">
              {pendingRecommendations.map((rec) => (
                <Card key={rec.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getRecommendationIcon(rec.recommendation_type)}
                        <CardTitle className="capitalize">
                          {rec.recommendation_type.replace('_', ' ')} Recommendation
                        </CardTitle>
                      </div>
                      <Badge className={getPriorityColor(rec.priority_score || 0)}>
                        {Math.round((rec.priority_score || 0) * 100)}% priority
                      </Badge>
                    </div>
                    <CardDescription>
                      {formatRecommendationData(rec.recommendation_data)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {rec.reasoning && (
                      <div className="mb-4 p-3 bg-muted rounded-lg">
                        <h4 className="font-medium mb-1">Why this recommendation?</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatRecommendationData(rec.reasoning)}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Created {new Date(rec.created_at).toLocaleDateString()}
                        {rec.expires_at && (
                          <span className="ml-2">
                            • Expires {new Date(rec.expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => handleAcceptRecommendation(rec.id)}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Accept
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectRecommendation(rec.id)}
                          className="flex items-center gap-1"
                        >
                          <X className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Pending Recommendations</h3>
                <p className="text-muted-foreground">
                  Continue learning to receive personalized recommendations
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4">
          {acceptedRecommendations.length > 0 ? (
            <div className="space-y-4">
              {acceptedRecommendations.map((rec) => (
                <Card key={rec.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getRecommendationIcon(rec.recommendation_type)}
                        <CardTitle className="capitalize">
                          {rec.recommendation_type.replace('_', ' ')} Recommendation
                        </CardTitle>
                        <Badge className="bg-green-100 text-green-800">Accepted</Badge>
                      </div>
                      {rec.feedback_score && (
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${
                                i < rec.feedback_score! 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <CardDescription>
                      {formatRecommendationData(rec.recommendation_data)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Accepted {rec.acted_upon_at ? new Date(rec.acted_upon_at).toLocaleDateString() : 'recently'}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Accepted Recommendations</h3>
                <p className="text-muted-foreground">
                  Accepted recommendations will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedRecommendations.length > 0 ? (
            <div className="space-y-4">
              {rejectedRecommendations.map((rec) => (
                <Card key={rec.id} className="opacity-60">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getRecommendationIcon(rec.recommendation_type)}
                        <CardTitle className="capitalize">
                          {rec.recommendation_type.replace('_', ' ')} Recommendation
                        </CardTitle>
                        <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                      </div>
                    </div>
                    <CardDescription>
                      {formatRecommendationData(rec.recommendation_data)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Rejected {rec.acted_upon_at ? new Date(rec.acted_upon_at).toLocaleDateString() : 'recently'}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <X className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Rejected Recommendations</h3>
                <p className="text-muted-foreground">
                  Rejected recommendations will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};