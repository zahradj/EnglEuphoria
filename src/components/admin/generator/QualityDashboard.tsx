import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Filter,
  BarChart3,
  Loader2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface LessonWithScore {
  id: string;
  title: string;
  target_system: string;
  difficulty_level: string;
  created_at: string;
  content: {
    validationScore?: number;
    validationIssues?: {
      hasIpaIssues?: boolean;
      missingFields?: string[];
      totalSlides?: number;
    };
  } | null;
}

export function QualityDashboard() {
  const [systemFilter, setSystemFilter] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<string>('all');

  const { data: lessons = [], isLoading, refetch } = useQuery({
    queryKey: ['lesson-quality-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('curriculum_lessons')
        .select('id, title, target_system, difficulty_level, created_at, content')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as LessonWithScore[];
    },
  });

  const lessonsWithScores = useMemo(() => {
    return lessons
      .map((lesson) => {
        const content = lesson.content as Record<string, unknown> | null;
        const validationScore = (content?.validationScore as number) || null;
        const validationIssues = content?.validationIssues as Record<string, unknown> | undefined;
        
        return {
          ...lesson,
          validationScore,
          hasIpaIssues: validationIssues?.hasIpaIssues as boolean || false,
          missingFields: (validationIssues?.missingFields as string[]) || [],
          totalSlides: (validationIssues?.totalSlides as number) || 0,
        };
      })
      .filter((lesson) => {
        if (systemFilter !== 'all' && lesson.target_system !== systemFilter) {
          return false;
        }
        if (scoreFilter === 'high' && (lesson.validationScore === null || lesson.validationScore < 80)) {
          return false;
        }
        if (scoreFilter === 'medium' && (lesson.validationScore === null || lesson.validationScore < 50 || lesson.validationScore >= 80)) {
          return false;
        }
        if (scoreFilter === 'low' && (lesson.validationScore === null || lesson.validationScore >= 50)) {
          return false;
        }
        if (scoreFilter === 'unscored' && lesson.validationScore !== null) {
          return false;
        }
        return true;
      });
  }, [lessons, systemFilter, scoreFilter]);

  const stats = useMemo(() => {
    const scored = lessons.filter((l) => {
      const content = l.content as Record<string, unknown> | null;
      return content?.validationScore != null;
    });
    
    const scores = scored.map((l) => {
      const content = l.content as Record<string, unknown> | null;
      return (content?.validationScore as number) || 0;
    });

    const avgScore = scores.length > 0 
      ? scores.reduce((a, b) => a + b, 0) / scores.length 
      : 0;

    const highQuality = scores.filter((s) => s >= 80).length;
    const mediumQuality = scores.filter((s) => s >= 50 && s < 80).length;
    const lowQuality = scores.filter((s) => s < 50).length;
    const unscored = lessons.length - scored.length;

    const ipaIssuesCount = lessons.filter((l) => {
      const content = l.content as Record<string, unknown> | null;
      const issues = content?.validationIssues as Record<string, unknown> | undefined;
      return issues?.hasIpaIssues;
    }).length;

    return {
      total: lessons.length,
      scored: scored.length,
      avgScore,
      highQuality,
      mediumQuality,
      lowQuality,
      unscored,
      ipaIssuesCount,
    };
  }, [lessons]);

  const pieData = [
    { name: 'High (80-100%)', value: stats.highQuality, color: '#22c55e' },
    { name: 'Medium (50-79%)', value: stats.mediumQuality, color: '#eab308' },
    { name: 'Low (<50%)', value: stats.lowQuality, color: '#ef4444' },
    { name: 'Unscored', value: stats.unscored, color: '#94a3b8' },
  ].filter((d) => d.value > 0);

  const systemTypes = [...new Set(lessons.map((l) => l.target_system))];

  const getScoreBadge = (score: number | null) => {
    if (score === null) {
      return <Badge variant="outline" className="text-xs">Unscored</Badge>;
    }
    if (score >= 80) {
      return <Badge className="bg-green-100 text-green-700 text-xs">{score}%</Badge>;
    }
    if (score >= 50) {
      return <Badge className="bg-yellow-100 text-yellow-700 text-xs">{score}%</Badge>;
    }
    return <Badge className="bg-red-100 text-red-700 text-xs">{score}%</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Avg Score</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {stats.avgScore > 0 ? `${Math.round(stats.avgScore)}%` : 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">High Quality</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-green-600">
              {stats.highQuality}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Needs Review</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-yellow-600">
              {stats.mediumQuality + stats.lowQuality}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-muted-foreground">IPA Issues</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-red-600">
              {stats.ipaIssuesCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart and List */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={40}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend 
                    layout="vertical" 
                    align="right" 
                    verticalAlign="middle"
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lessons List */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Lessons by Quality</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={systemFilter} onValueChange={setSystemFilter}>
                  <SelectTrigger className="h-8 w-[120px] text-xs">
                    <Filter className="h-3 w-3 mr-1" />
                    <SelectValue placeholder="System" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Systems</SelectItem>
                    {systemTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={scoreFilter} onValueChange={setScoreFilter}>
                  <SelectTrigger className="h-8 w-[120px] text-xs">
                    <SelectValue placeholder="Score" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scores</SelectItem>
                    <SelectItem value="high">High (80%+)</SelectItem>
                    <SelectItem value="medium">Medium (50-79%)</SelectItem>
                    <SelectItem value="low">Low (&lt;50%)</SelectItem>
                    <SelectItem value="unscored">Unscored</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="ghost" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              {lessonsWithScores.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No lessons match the filter criteria
                </div>
              ) : (
                <div className="space-y-2">
                  {lessonsWithScores.slice(0, 20).map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-2 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate max-w-[300px]">
                            {lesson.title}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{lesson.target_system}</span>
                            <span>•</span>
                            <span>{lesson.difficulty_level}</span>
                            {lesson.hasIpaIssues && (
                              <>
                                <span>•</span>
                                <span className="text-red-500 flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  IPA issues
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {getScoreBadge(lesson.validationScore)}
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Quality Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Overall Quality Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>High Quality Lessons (80%+)</span>
                <span className="font-medium">
                  {stats.scored > 0 
                    ? `${Math.round((stats.highQuality / stats.scored) * 100)}%` 
                    : '0%'}
                </span>
              </div>
              <Progress 
                value={stats.scored > 0 ? (stats.highQuality / stats.scored) * 100 : 0} 
                className="h-2"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.highQuality} of {stats.scored} scored lessons are high quality
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
