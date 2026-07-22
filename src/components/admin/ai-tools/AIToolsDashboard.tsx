import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  BookOpen, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  BarChart3,
  Sparkles,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResult {
  overallScore: number;
  gaps: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    recommendation: string;
  }>;
  strengths: string[];
  recommendations: Array<{
    priority: number;
    action: string;
    impact: string;
  }>;
}

interface QualityReport {
  lessonId: string;
  lessonTitle: string;
  scores: {
    overall: number;
    pedagogy: number;
    engagement: number;
    clarity: number;
    ageAppropriateness: number;
    interactivity: number;
  };
  issues: Array<{
    category: string;
    description: string;
    suggestion: string;
  }>;
}

interface PerformanceAnalysis {
  classInsight: {
    averageProgress: number;
    engagementRate: number;
    commonChallenges: string[];
    topPerformers: string[];
    needsAttention: string[];
    recommendations: string[];
  };
  studentInsights: Array<{
    studentId: string;
    riskLevel: 'low' | 'medium' | 'high';
    strengths: string[];
    challenges: string[];
  }>;
}

export function AIToolsDashboard() {
  const { toast } = useToast();
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);
  const [curriculumResult, setCurriculumResult] = useState<AnalysisResult | null>(null);
  const [qualityResult, setQualityResult] = useState<{ reports: QualityReport[]; summary: any } | null>(null);
  const [performanceResult, setPerformanceResult] = useState<PerformanceAnalysis | null>(null);

  const runCurriculumAnalysis = async () => {
    setActiveAnalysis('curriculum');
    try {
      const { data, error } = await supabase.functions.invoke('ai-curriculum-analyzer', {
        body: { analysisType: 'full' }
      });

      if (error) throw error;

      if (data.success) {
        setCurriculumResult(data.analysis);
        toast({
          title: 'Curriculum Analysis Complete',
          description: `Overall score: ${data.analysis.overallScore}/100`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Curriculum analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setActiveAnalysis(null);
    }
  };

  const runQualityCheck = async () => {
    setActiveAnalysis('quality');
    try {
      const { data, error } = await supabase.functions.invoke('ai-quality-checker', {
        body: { batchSize: 10 }
      });

      if (error) throw error;

      if (data.success) {
        setQualityResult({ reports: data.reports, summary: data.summary });
        toast({
          title: 'Quality Check Complete',
          description: `Analyzed ${data.reports.length} lessons`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Quality check error:', error);
      toast({
        title: 'Quality Check Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setActiveAnalysis(null);
    }
  };

  const runPerformanceAnalysis = async () => {
    setActiveAnalysis('performance');
    try {
      const { data, error } = await supabase.functions.invoke('ai-performance-analyzer', {
        body: { analysisType: 'class' }
      });

      if (error) throw error;

      if (data.success) {
        setPerformanceResult(data.analysis);
        toast({
          title: 'Performance Analysis Complete',
          description: `Analyzed ${data.metadata.studentsAnalyzed} students`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Performance analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setActiveAnalysis(null);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI Analysis Tools
          </h2>
          <p className="text-muted-foreground">
            Powered by Google Gemini AI for intelligent curriculum and performance analysis
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Sparkles className="h-3 w-3" />
          Gemini 2.5
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={runCurriculumAnalysis}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              Curriculum Analyzer
            </CardTitle>
            <CardDescription>
              Analyze curriculum for gaps, CEFR alignment, and progression issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              disabled={activeAnalysis === 'curriculum'}
              onClick={(e) => { e.stopPropagation(); runCurriculumAnalysis(); }}
            >
              {activeAnalysis === 'curriculum' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Run Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={runQualityCheck}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Quality Checker
            </CardTitle>
            <CardDescription>
              Score lessons on pedagogy, engagement, clarity, and interactivity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              variant="secondary"
              disabled={activeAnalysis === 'quality'}
              onClick={(e) => { e.stopPropagation(); runQualityCheck(); }}
            >
              {activeAnalysis === 'quality' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Check Quality
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={runPerformanceAnalysis}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Student Analyzer
            </CardTitle>
            <CardDescription>
              Identify at-risk students and generate personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              variant="outline"
              disabled={activeAnalysis === 'performance'}
              onClick={(e) => { e.stopPropagation(); runPerformanceAnalysis(); }}
            >
              {activeAnalysis === 'performance' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analyze Students
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      <Tabs defaultValue="curriculum" className="space-y-4">
        <TabsList>
          <TabsTrigger value="curriculum">Curriculum Results</TabsTrigger>
          <TabsTrigger value="quality">Quality Results</TabsTrigger>
          <TabsTrigger value="performance">Student Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="curriculum">
          {curriculumResult ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Overall Curriculum Score</span>
                    <span className={`text-3xl font-bold ${getScoreColor(curriculumResult.overallScore)}`}>
                      {curriculumResult.overallScore}/100
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={curriculumResult.overallScore} className="h-3" />
                </CardContent>
              </Card>

              {curriculumResult.gaps.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      Identified Gaps ({curriculumResult.gaps.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {curriculumResult.gaps.map((gap, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{gap.type}</span>
                            <Badge className={getSeverityColor(gap.severity)}>
                              {gap.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{gap.description}</p>
                          <p className="text-sm">
                            <span className="font-medium">Recommendation:</span> {gap.recommendation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {curriculumResult.strengths.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {curriculumResult.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Run the Curriculum Analyzer to see results here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="quality">
          {qualityResult ? (
            <div className="space-y-4">
              {qualityResult.summary?.averageScores && (
                <Card>
                  <CardHeader>
                    <CardTitle>Average Quality Scores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(qualityResult.summary.averageScores).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className={`text-2xl font-bold ${getScoreColor(value as number)}`}>
                            {value as number}
                          </div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {qualityResult.reports.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Lesson Reports ({qualityResult.reports.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {qualityResult.reports.map((report, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{report.lessonTitle}</span>
                            <span className={`font-bold ${getScoreColor(report.scores.overall)}`}>
                              {report.scores.overall}/100
                            </span>
                          </div>
                          <Progress value={report.scores.overall} className="h-2" />
                          {report.issues.length > 0 && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              {report.issues.length} issue(s) found
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Run the Quality Checker to see results here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance">
          {performanceResult ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Class Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(performanceResult.classInsight.averageProgress)}`}>
                        {performanceResult.classInsight.averageProgress}%
                      </div>
                      <div className="text-sm text-muted-foreground">Average Progress</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(performanceResult.classInsight.engagementRate)}`}>
                        {performanceResult.classInsight.engagementRate}%
                      </div>
                      <div className="text-sm text-muted-foreground">Engagement Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {performanceResult.classInsight.needsAttention.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      Students Needing Attention
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {performanceResult.classInsight.needsAttention.map((studentId, index) => (
                        <Badge key={index} variant="destructive">
                          {studentId.slice(0, 8)}...
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {performanceResult.classInsight.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {performanceResult.classInsight.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Run the Student Analyzer to see insights here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
