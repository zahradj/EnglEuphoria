import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, Users, Award, Clock, Download, 
  BarChart3, AlertCircle, CheckCircle 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-states';

interface AnalyticsData {
  assessmentId: string;
  assessmentTitle: string;
  totalSubmissions: number;
  completionRate: number;
  averageScore: number;
  passRate: number;
  averageTimeMinutes: number;
  questionStats: QuestionStat[];
  scoreDistribution: { range: string; count: number }[];
  performanceByLevel: { level: string; avgScore: number; submissions: number }[];
  trendData: { date: string; avgScore: number; submissions: number }[];
}

interface QuestionStat {
  questionId: string;
  questionText: string;
  questionType: string;
  totalAnswers: number;
  correctAnswers: number;
  averageScore: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface AssessmentAnalyticsProps {
  assessmentId: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export function AssessmentAnalytics({ assessmentId }: AssessmentAnalyticsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [assessmentId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch assessment details
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .select('title')
        .eq('id', assessmentId)
        .single();

      if (assessmentError) throw assessmentError;

      // Fetch submissions
      const { data: submissions, error: submissionsError } = await supabase
        .from('assessment_submissions')
        .select(`
          id,
          score,
          time_spent_minutes,
          status,
          submitted_at,
          student_id,
          assessment_answers (
            question_id,
            is_correct,
            points_earned
          )
        `)
        .eq('assessment_id', assessmentId);

      if (submissionsError) throw submissionsError;

      // Fetch questions
      const { data: questions, error: questionsError } = await supabase
        .from('assessment_questions')
        .select('*')
        .eq('assessment_id', assessmentId)
        .order('question_order');

      if (questionsError) throw questionsError;

      // Calculate analytics
      const completedSubmissions = submissions?.filter(s => s.status === 'graded') || [];
      const totalSubmissions = completedSubmissions.length;
      
      const averageScore = totalSubmissions > 0
        ? completedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / totalSubmissions
        : 0;

      const passRate = totalSubmissions > 0
        ? (completedSubmissions.filter(s => (s.score || 0) >= 70).length / totalSubmissions) * 100
        : 0;

      const averageTimeMinutes = totalSubmissions > 0
        ? completedSubmissions.reduce((sum, s) => sum + (s.time_spent_minutes || 0), 0) / totalSubmissions
        : 0;

      // Question statistics
      const questionStats: QuestionStat[] = questions?.map(q => {
        const answers = completedSubmissions.flatMap(s => 
          s.assessment_answers?.filter((a: any) => a.question_id === q.id) || []
        );
        
        const totalAnswers = answers.length;
        const correctAnswers = answers.filter((a: any) => a.is_correct).length;
        const correctRate = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

        let difficulty: 'easy' | 'medium' | 'hard';
        if (correctRate >= 80) difficulty = 'easy';
        else if (correctRate >= 50) difficulty = 'medium';
        else difficulty = 'hard';

        return {
          questionId: q.id,
          questionText: q.question_text,
          questionType: q.question_type,
          totalAnswers,
          correctAnswers,
          averageScore: correctRate,
          difficulty,
        };
      }) || [];

      // Score distribution
      const scoreDistribution = [
        { range: '0-20%', count: completedSubmissions.filter(s => (s.score || 0) < 20).length },
        { range: '20-40%', count: completedSubmissions.filter(s => (s.score || 0) >= 20 && (s.score || 0) < 40).length },
        { range: '40-60%', count: completedSubmissions.filter(s => (s.score || 0) >= 40 && (s.score || 0) < 60).length },
        { range: '60-80%', count: completedSubmissions.filter(s => (s.score || 0) >= 60 && (s.score || 0) < 80).length },
        { range: '80-100%', count: completedSubmissions.filter(s => (s.score || 0) >= 80).length },
      ];

      // Fetch student profiles for CEFR level analysis
      const studentIds = [...new Set(completedSubmissions.map(s => s.student_id))];
      const { data: profiles } = await supabase
        .from('student_profiles')
        .select('user_id, cefr_level')
        .in('user_id', studentIds);

      const performanceByLevel = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => {
        const studentsAtLevel = profiles?.filter(p => p.cefr_level === level).map(p => p.user_id) || [];
        const submissionsAtLevel = completedSubmissions.filter(s => studentsAtLevel.includes(s.student_id));
        const avgScore = submissionsAtLevel.length > 0
          ? submissionsAtLevel.reduce((sum, s) => sum + (s.score || 0), 0) / submissionsAtLevel.length
          : 0;

        return {
          level,
          avgScore: Math.round(avgScore),
          submissions: submissionsAtLevel.length,
        };
      });

      // Trend data (last 30 days)
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
      });

      const trendData = last30Days.map(date => {
        const daySubmissions = completedSubmissions.filter(s => 
          s.submitted_at?.startsWith(date)
        );
        const avgScore = daySubmissions.length > 0
          ? daySubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / daySubmissions.length
          : 0;

        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          avgScore: Math.round(avgScore),
          submissions: daySubmissions.length,
        };
      }).filter(d => d.submissions > 0);

      setAnalytics({
        assessmentId,
        assessmentTitle: assessment?.title || 'Assessment',
        totalSubmissions,
        completionRate: 100, // Placeholder - would need total assigned vs completed
        averageScore: Math.round(averageScore),
        passRate: Math.round(passRate),
        averageTimeMinutes: Math.round(averageTimeMinutes),
        questionStats,
        scoreDistribution,
        performanceByLevel: performanceByLevel.filter(p => p.submissions > 0),
        trendData,
      });

    } catch (error: any) {
      toast({
        title: 'Error loading analytics',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!analytics) return;

    const csv = [
      ['Assessment Analytics Report'],
      ['Assessment', analytics.assessmentTitle],
      ['Generated', new Date().toLocaleString()],
      [''],
      ['Overview'],
      ['Total Submissions', analytics.totalSubmissions],
      ['Average Score', `${analytics.averageScore}%`],
      ['Pass Rate', `${analytics.passRate}%`],
      ['Average Time', `${analytics.averageTimeMinutes} minutes`],
      [''],
      ['Question Performance'],
      ['Question', 'Type', 'Total Answers', 'Correct', 'Difficulty'],
      ...analytics.questionStats.map(q => [
        q.questionText.substring(0, 50),
        q.questionType,
        q.totalAnswers,
        q.correctAnswers,
        q.difficulty,
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment-analytics-${assessmentId}.csv`;
    a.click();

    toast({ title: 'Analytics exported to CSV' });
  };

  if (loading) {
    return <LoadingSpinner message="Loading analytics..." />;
  }

  if (!analytics) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium">No analytics available</p>
        <p className="text-muted-foreground">This assessment hasn't been completed yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{analytics.assessmentTitle}</h2>
          <p className="text-muted-foreground">Performance Analytics</p>
        </div>
        <Button onClick={exportToCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Submissions</p>
              <p className="text-3xl font-bold">{analytics.totalSubmissions}</p>
            </div>
            <Users className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-3xl font-bold">{analytics.averageScore}%</p>
            </div>
            <BarChart3 className="w-8 h-8 text-secondary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pass Rate</p>
              <p className="text-3xl font-bold">{analytics.passRate}%</p>
            </div>
            <Award className="w-8 h-8 text-accent" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Time</p>
              <p className="text-3xl font-bold">{analytics.averageTimeMinutes}m</p>
            </div>
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">Question Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Score Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Performance by CEFR Level */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance by CEFR Level</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.performanceByLevel}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="level" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgScore" fill="hsl(var(--secondary))" name="Avg Score %" />
                  <Bar dataKey="submissions" fill="hsl(var(--accent))" name="Submissions" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Question Performance Analysis</h3>
            <div className="space-y-4">
              {analytics.questionStats.map((stat, idx) => (
                <div key={stat.questionId} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">Q{idx + 1}</Badge>
                        <Badge variant="secondary">{stat.questionType}</Badge>
                        <Badge 
                          variant={
                            stat.difficulty === 'easy' ? 'default' : 
                            stat.difficulty === 'medium' ? 'secondary' : 
                            'destructive'
                          }
                        >
                          {stat.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">{stat.questionText.substring(0, 100)}...</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Answered:</span>
                      <span className="ml-2 font-semibold">{stat.totalAnswers}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Correct:</span>
                      <span className="ml-2 font-semibold">{stat.correctAnswers}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Success Rate:</span>
                      <span className="ml-2 font-semibold">{Math.round(stat.averageScore)}%</span>
                    </div>
                  </div>

                  <div className="mt-2 bg-secondary/20 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${stat.averageScore}%` }}
                    />
                  </div>

                  {stat.averageScore < 50 && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      <span>Consider reviewing this topic with students</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Trends (Last 30 Days)</h3>
            {analytics.trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="avgScore" 
                    stroke="hsl(var(--primary))" 
                    name="Average Score %" 
                    strokeWidth={2}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="submissions" 
                    stroke="hsl(var(--secondary))" 
                    name="Submissions" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                <p>Not enough data to show trends yet</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
