import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, MessageSquare, BookOpen, Target, TrendingUp, Users, Sparkles } from 'lucide-react';
import { useAILearning } from '@/hooks/useAILearning';
import { useAITutor } from '@/hooks/useAITutor';
import { PersonalizedLearningPath } from './PersonalizedLearningPath';
import { AITutorInterface } from './AITutorInterface';
import { AdaptiveContentLibrary } from './AdaptiveContentLibrary';
import { LearningAnalytics } from './LearningAnalytics';

interface AILearningDashboardProps {
  studentId: string;
  cefrLevel: string;
  className?: string;
}

export const AILearningDashboard: React.FC<AILearningDashboardProps> = ({
  studentId,
  cefrLevel,
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const {
    learningPaths,
    adaptiveContent,
    isLoading: aiLoading,
    fetchLearningPaths,
    fetchAdaptiveContent,
    generateLearningPath
  } = useAILearning();

  const {
    currentSession,
    isConnected,
    getSessionAnalytics
  } = useAITutor();

  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (studentId) {
      fetchLearningPaths(studentId);
      fetchAdaptiveContent(cefrLevel);
      loadAnalytics();
    }
  }, [studentId, cefrLevel]);

  const loadAnalytics = async () => {
    const data = await getSessionAnalytics(studentId);
    setAnalytics(data);
  };

  const handleGeneratePath = async () => {
    await generateLearningPath(studentId, cefrLevel, 'mixed', 'adaptive');
  };

  const activePath = learningPaths.find(path => path.completed_at === null);
  const completedPaths = learningPaths.filter(path => path.completed_at !== null);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Learning Assistant</h1>
            <p className="text-muted-foreground">Personalized learning powered by artificial intelligence</p>
          </div>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Sparkles size={12} />
          {cefrLevel} Level
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Active Path</p>
                <p className="text-xl font-bold">
                  {activePath ? `${activePath.current_step}/${activePath.total_steps}` : 'None'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">AI Sessions</p>
                <p className="text-xl font-bold">{analytics?.totalSessions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Content Items</p>
                <p className="text-xl font-bold">{adaptiveContent.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-xl font-bold">
                  {activePath ? `${Math.round(activePath.completion_percentage)}%` : '0%'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Learning Path Progress */}
      {activePath && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Current Learning Path
            </CardTitle>
            <CardDescription>{activePath.path_name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {activePath.current_step} of {activePath.total_steps} completed
                </span>
              </div>
              <Progress value={activePath.completion_percentage} className="w-full" />
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{activePath.learning_style}</Badge>
                <Badge variant="outline">{activePath.difficulty_preference}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Brain size={16} />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="tutor" className="flex items-center gap-2">
            <MessageSquare size={16} />
            AI Tutor
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <BookOpen size={16} />
            Content
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp size={16} />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PersonalizedLearningPath
              studentId={studentId}
              cefrLevel={cefrLevel}
              activePath={activePath}
              onGeneratePath={handleGeneratePath}
              isLoading={aiLoading}
            />
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Start your AI-powered learning journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setActiveTab("tutor")} 
                  className="w-full justify-start"
                  variant={currentSession ? "default" : "outline"}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {currentSession ? 'Continue AI Tutoring' : 'Start AI Tutoring Session'}
                </Button>
                
                <Button 
                  onClick={() => setActiveTab("content")} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Adaptive Content
                </Button>
                
                {!activePath && (
                  <Button 
                    onClick={handleGeneratePath}
                    className="w-full justify-start"
                    variant="outline"
                    disabled={aiLoading}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Learning Path
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest learning interactions</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.recentSessions?.length > 0 ? (
                <div className="space-y-3">
                  {analytics.recentSessions.map((session: any) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {session.session_type === 'voice' ? 'Voice' : 'Text'} Tutoring Session
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(session.started_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {Math.floor((session.duration_seconds || 0) / 60)}min
                        </p>
                        {session.session_rating && (
                          <p className="text-xs text-muted-foreground">
                            ⭐ {session.session_rating}/5
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No recent activity. Start a tutoring session to begin!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tutor">
          <AITutorInterface 
            studentId={studentId} 
            cefrLevel={cefrLevel}
            onSessionComplete={loadAnalytics}
          />
        </TabsContent>

        <TabsContent value="content">
          <AdaptiveContentLibrary 
            studentId={studentId}
            cefrLevel={cefrLevel}
            content={adaptiveContent}
            onContentInteraction={loadAnalytics}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <LearningAnalytics 
            studentId={studentId}
            analytics={analytics}
            onRefresh={loadAnalytics}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};