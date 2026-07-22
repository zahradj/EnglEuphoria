import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { AlertTriangle, TrendingUp, Brain, Target, Lightbulb, Star, Clock } from 'lucide-react';

interface StudentInsight {
  studentId: string;
  studentName: string;
  prediction: any;
  insights: any[];
  riskLevel: 'low' | 'medium' | 'high';
}

export const PredictiveAnalytics = () => {
  const { user } = useAuth();
  const { generatePredictiveInsights, insights, isLoading } = useAdvancedAnalytics();
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [currentPrediction, setCurrentPrediction] = useState<any>(null);
  const [currentInsights, setCurrentInsights] = useState<any[]>([]);
  const [allStudentInsights, setAllStudentInsights] = useState<StudentInsight[]>([]);

  useEffect(() => {
    if (user?.role === 'teacher' || user?.role === 'admin') {
      loadStudentData();
    } else if (user?.role === 'student') {
      loadPersonalAnalytics();
    }
  }, [user]);

  const loadStudentData = async () => {
    try {
      // Get real students from database
      const { data: students, error } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('role', 'student')
        .limit(10);

      if (error) {
        console.error('Error loading students:', error);
        return;
      }

      const insights: StudentInsight[] = [];
      
      for (const student of students || []) {
        try {
          const prediction = await generatePredictiveInsights(student.id);
          
          // Generate insights based on actual data if available
          const { data: analytics, error: analyticsError } = await supabase
            .from('learning_analytics')
            .select('*')
            .eq('student_id', student.id)
            .order('recorded_at', { ascending: false })
            .limit(5);

          const studentInsights = analytics && analytics.length > 0 ? [
            {
              title: 'Learning Progress Analysis',
              description: `Based on ${analytics.length} recent activities`,
              confidence: 0.8,
              type: 'opportunity',
              recommendations: ['Continue current study pattern', 'Focus on weaker areas']
            }
          ] : [];

          const riskLevel = prediction?.success_probability > 0.7 ? 'low' : 
                           prediction?.success_probability > 0.4 ? 'medium' : 'high';

          insights.push({
            studentId: student.id,
            studentName: student.full_name,
            prediction,
            insights: studentInsights,
            riskLevel
          });
        } catch (error) {
          console.error(`Error loading data for student ${student.id}:`, error);
        }
      }

      setAllStudentInsights(insights);
    } catch (error) {
      console.error('Error loading student data:', error);
    }
  };

  const loadPersonalAnalytics = async () => {
    if (!user?.id) return;

    try {
      const prediction = await generatePredictiveInsights(user.id);
      const mockInsights = [
        {
          title: 'Strong Learning Pattern',
          description: 'You consistently perform better during morning study sessions',
          confidence: 0.87,
          type: 'opportunity',
          recommendations: ['Schedule challenging topics in the morning', 'Maintain your current study routine']
        }
      ];

      setCurrentPrediction(prediction);
      setCurrentInsights(mockInsights);
    } catch (error) {
      console.error('Error loading personal analytics:', error);
    }
  };

  const handleStudentSelect = async (studentId: string) => {
    setSelectedStudent(studentId);
    const studentData = allStudentInsights.find(s => s.studentId === studentId);
    
    if (studentData) {
      setCurrentPrediction(studentData.prediction);
      setCurrentInsights(studentData.insights);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (user?.role === 'student') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Your Learning Analytics</h2>
        </div>

        {currentPrediction && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Success Prediction
                </CardTitle>
                <CardDescription>AI-powered analysis of your learning trajectory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Success Probability</span>
                      <span className="font-medium">
                        {Math.round(currentPrediction.success_probability * 100)}%
                      </span>
                    </div>
                    <Progress value={currentPrediction.success_probability * 100} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Engagement Level</span>
                    <Badge className={getRiskColor(currentPrediction.engagement_level)}>
                      {currentPrediction.engagement_level}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentPrediction.recommendations?.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <Star className="h-4 w-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentInsights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Learning Insights</CardTitle>
              <CardDescription>Personalized insights based on your recent activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentInsights.map((insight, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {insight.type === 'risk' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                        {insight.type === 'opportunity' && <TrendingUp className="h-5 w-5 text-blue-500" />}
                        {insight.type === 'achievement' && <Star className="h-5 w-5 text-yellow-500" />}
                        <h4 className="font-medium">{insight.title}</h4>
                      </div>
                      <Badge variant="outline">
                        {Math.round(insight.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                    {insight.recommendations && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Recommendations:</p>
                        {insight.recommendations.map((rec: string, recIndex: number) => (
                          <p key={recIndex} className="text-xs text-muted-foreground">• {rec}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Predictive Analytics</h2>
        </div>
        <Button onClick={loadStudentData} disabled={isLoading}>
          Refresh Analytics
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="individual">Individual Analysis</TabsTrigger>
          <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">High Risk Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {allStudentInsights.filter(s => s.riskLevel === 'high').length}
                </div>
                <p className="text-sm text-muted-foreground">Require immediate attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Average Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {allStudentInsights.length > 0 
                    ? Math.round(allStudentInsights.reduce((sum, s) => sum + (s.prediction?.success_probability || 0), 0) / allStudentInsights.length * 100)
                    : 0}%
                </div>
                <p className="text-sm text-muted-foreground">Across all students</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {allStudentInsights.reduce((sum, s) => sum + s.insights.length, 0)}
                </div>
                <p className="text-sm text-muted-foreground">Actionable recommendations</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Student Risk Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allStudentInsights.map((student) => (
                  <div key={student.studentId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="font-medium">{student.studentName}</div>
                      <Badge className={getRiskColor(student.riskLevel)}>
                        {student.riskLevel} risk
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        {Math.round((student.prediction?.success_probability || 0) * 100)}% success rate
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleStudentSelect(student.studentId)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Individual Student Analysis</CardTitle>
              <CardDescription>
                <Select value={selectedStudent} onValueChange={handleStudentSelect}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {allStudentInsights.map((student) => (
                      <SelectItem key={student.studentId} value={student.studentId}>
                        {student.studentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentPrediction ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Success Prediction</h4>
                      <Progress value={currentPrediction.success_probability * 100} />
                      <p className="text-sm text-muted-foreground mt-1">
                        {Math.round(currentPrediction.success_probability * 100)}% likelihood of success
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Engagement Level</h4>
                      <Badge className={getRiskColor(currentPrediction.engagement_level)}>
                        {currentPrediction.engagement_level}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">AI Recommendations</h4>
                    <div className="space-y-2">
                      {currentPrediction.recommendations?.map((rec: string, index: number) => (
                        <div key={index} className="text-sm p-2 bg-muted rounded">
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Select a student to view their analytics</p>
              )}
            </CardContent>
          </Card>

          {currentInsights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Learning Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentInsights.map((insight, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge variant="outline">
                          {Math.round(insight.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allStudentInsights
                  .filter(s => s.riskLevel === 'high')
                  .map((student) => (
                    <div key={student.studentId} className="border-l-4 border-red-500 pl-4 py-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-red-900">{student.studentName}</h4>
                          <p className="text-sm text-red-700">
                            High risk of poor outcomes - immediate intervention needed
                          </p>
                        </div>
                        <Button variant="destructive" size="sm">
                          Create Action Plan
                        </Button>
                      </div>
                    </div>
                  ))}
                
                {allStudentInsights.filter(s => s.riskLevel === 'high').length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No High-Risk Students</h3>
                    <p className="text-muted-foreground">All students are performing well!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};