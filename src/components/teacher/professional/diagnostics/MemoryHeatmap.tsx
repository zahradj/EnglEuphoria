import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VocabEntry {
  word: string;
  firstSeenAt: string;
  masteryLevel: string;
  unitId?: string;
}

interface MemoryHeatmapProps {
  vocabulary: VocabEntry[];
  studentName?: string;
}

const getDaysSince = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

// Ebbinghaus forgetting curve intervals (days)
const REVIEW_INTERVALS = [1, 3, 7, 14, 30];

const getRetentionRisk = (daysSince: number, mastery: string): 'safe' | 'due' | 'overdue' => {
  if (mastery === 'mastered') return 'safe';
  // Find next review point
  const nextReview = REVIEW_INTERVALS.find(d => d >= daysSince);
  if (!nextReview && daysSince > 30) return 'overdue';
  if (daysSince >= 7 && mastery !== 'mastered') return 'due';
  return 'safe';
};

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'overdue': return 'bg-[#EF5350]';
    case 'due': return 'bg-amber-500';
    default: return 'bg-[#2E7D32]';
  }
};

export const MemoryHeatmap: React.FC<MemoryHeatmapProps> = ({ vocabulary, studentName }) => {
  // Group by week
  const weeks: Record<string, VocabEntry[]> = {};
  vocabulary.forEach(v => {
    const date = new Date(v.firstSeenAt);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const key = weekStart.toISOString().split('T')[0];
    if (!weeks[key]) weeks[key] = [];
    weeks[key].push(v);
  });

  const sortedWeeks = Object.entries(weeks)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 8); // Last 8 weeks

  const overdueWords = vocabulary.filter(v => getRetentionRisk(getDaysSince(v.firstSeenAt), v.masteryLevel) === 'overdue');
  const dueWords = vocabulary.filter(v => getRetentionRisk(getDaysSince(v.firstSeenAt), v.masteryLevel) === 'due');

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-[#6B21A8]">
            🧠 Memory Retention Heatmap
          </CardTitle>
          <div className="flex items-center gap-2">
            {overdueWords.length > 0 && (
              <Badge variant="outline" className="text-[10px] border-[#EF5350]/30 bg-[#EF5350]/5 text-[#EF5350]">
                {overdueWords.length} overdue
              </Badge>
            )}
            {dueWords.length > 0 && (
              <Badge variant="outline" className="text-[10px] border-amber-500/30 bg-amber-500/5 text-amber-600">
                {dueWords.length} due
              </Badge>
            )}
          </div>
        </div>
        {studentName && (
          <p className="text-xs text-muted-foreground">
            Forgetting curve analysis — words needing refresher sessions
          </p>
        )}
      </CardHeader>
      <CardContent>
        {vocabulary.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No vocabulary data to analyze</p>
        ) : (
          <TooltipProvider>
            <div className="space-y-3">
              {sortedWeeks.map(([weekKey, words]) => (
                <div key={weekKey} className="space-y-1.5">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Week of {new Date(weekKey).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {words.map((word, i) => {
                      const days = getDaysSince(word.firstSeenAt);
                      const risk = getRetentionRisk(days, word.masteryLevel);
                      return (
                        <Tooltip key={i}>
                          <TooltipTrigger asChild>
                            <div
                              className={`h-6 px-2 rounded flex items-center justify-center text-[10px] font-medium text-white cursor-default ${getRiskColor(risk)}`}
                            >
                              {word.word}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              <strong>{word.word}</strong> — learned {days}d ago, {word.masteryLevel}
                              {risk === 'overdue' && ' ⚠ Needs refresher!'}
                              {risk === 'due' && ' ⏰ Review recommended'}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-[#2E7D32]" />
                <span className="text-[10px] text-muted-foreground">Retained</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-amber-500" />
                <span className="text-[10px] text-muted-foreground">Review Due</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-[#EF5350]" />
                <span className="text-[10px] text-muted-foreground">Overdue</span>
              </div>
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
};
