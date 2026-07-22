import { useState } from 'react';
import { useGenerationHistory, GenerationHistoryEntry } from '@/hooks/useGenerationHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  History, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Ban,
  ChevronDown,
  ChevronUp,
  Loader2,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface GenerationHistoryPanelProps {
  onRetry?: (entry: GenerationHistoryEntry) => void;
}

export function GenerationHistoryPanel({ onRetry }: GenerationHistoryPanelProps) {
  const { history, isLoading, stats, refetch } = useGenerationHistory();
  const [isOpen, setIsOpen] = useState(false);

  const getStatusIcon = (status: GenerationHistoryEntry['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <Ban className="h-4 w-4 text-yellow-500" />;
      case 'generating':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: GenerationHistoryEntry['status']) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
      success: 'default',
      failed: 'destructive',
      cancelled: 'secondary',
      generating: 'outline',
      pending: 'outline',
    };

    return (
      <Badge variant={variants[status] || 'outline'} className="text-xs">
        {status}
      </Badge>
    );
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Card className="border-border/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Generation History</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {stats.total} total
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                {stats.total > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      {stats.successful}
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircle className="h-3 w-3 text-red-500" />
                      {stats.failed}
                    </span>
                    {stats.avgValidationScore > 0 && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-blue-500" />
                        {Math.round(stats.avgValidationScore)}%
                      </span>
                    )}
                  </div>
                )}
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No generation history yet</p>
              </div>
            ) : (
              <>
                {/* Stats Summary */}
                <div className="grid grid-cols-4 gap-3 mb-4 p-3 bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{stats.total}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">{stats.successful}</div>
                    <div className="text-xs text-muted-foreground">Success</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-red-600">{stats.failed}</div>
                    <div className="text-xs text-muted-foreground">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{formatDuration(Math.round(stats.avgDuration))}</div>
                    <div className="text-xs text-muted-foreground">Avg Time</div>
                  </div>
                </div>

                {/* History List */}
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {history.slice(0, 20).map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {getStatusIcon(entry.status)}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate max-w-[200px]">
                                {entry.topic}
                              </span>
                              {getStatusBadge(entry.status)}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <span>{entry.system_type}</span>
                              {entry.cefr_level && (
                                <>
                                  <span>•</span>
                                  <span>{entry.cefr_level}</span>
                                </>
                              )}
                              <span>•</span>
                              <span>{entry.duration_minutes}min</span>
                              <span>•</span>
                              <span>{formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {entry.validation_score !== null && (
                            <div className="flex items-center gap-1">
                              <span
                                className={`text-sm font-medium ${
                                  entry.validation_score >= 80
                                    ? 'text-green-600'
                                    : entry.validation_score >= 60
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {entry.validation_score}%
                              </span>
                              {entry.validation_score < 80 && (
                                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                              )}
                            </div>
                          )}

                          {entry.duration_seconds && (
                            <span className="text-xs text-muted-foreground">
                              {formatDuration(entry.duration_seconds)}
                            </span>
                          )}

                          {entry.status === 'failed' && onRetry && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRetry(entry)}
                              className="h-7 px-2"
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Retry
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex justify-end mt-3">
                  <Button variant="ghost" size="sm" onClick={() => refetch()}>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
