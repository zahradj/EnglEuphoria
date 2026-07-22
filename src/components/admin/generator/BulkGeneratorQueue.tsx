import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Play, 
  Pause, 
  Square, 
  Save, 
  Eye, 
  Check, 
  X, 
  Loader2,
  Clock,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BulkLessonItem } from "@/hooks/useBulkGenerator";

interface BulkGeneratorQueueProps {
  queue: BulkLessonItem[];
  isRunning: boolean;
  isPaused: boolean;
  currentIndex: number;
  selectedLessonId: string | null;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onSelectLesson: (id: string) => void;
  onSaveLesson: (id: string) => void;
  onSaveAll: () => void;
}

const statusColors = {
  pending: "bg-muted text-muted-foreground",
  generating: "bg-blue-500 text-white animate-pulse",
  completed: "bg-green-500 text-white",
  failed: "bg-red-500 text-white",
  saved: "bg-purple-500 text-white",
};

const statusIcons = {
  pending: Clock,
  generating: Loader2,
  completed: Check,
  failed: X,
  saved: Save,
};

export const BulkGeneratorQueue = ({
  queue,
  isRunning,
  isPaused,
  currentIndex,
  selectedLessonId,
  onStart,
  onPause,
  onResume,
  onCancel,
  onSelectLesson,
  onSaveLesson,
  onSaveAll,
}: BulkGeneratorQueueProps) => {
  const stats = {
    total: queue.length,
    pending: queue.filter(q => q.status === 'pending').length,
    generating: queue.filter(q => q.status === 'generating').length,
    completed: queue.filter(q => q.status === 'completed').length,
    failed: queue.filter(q => q.status === 'failed').length,
    saved: queue.filter(q => q.status === 'saved').length,
  };

  const progressPercent = queue.length > 0 
    ? ((stats.completed + stats.saved + stats.failed) / queue.length) * 100 
    : 0;

  const completedNotSaved = stats.completed;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Generation Queue</CardTitle>
            <CardDescription>
              {stats.completed + stats.saved} of {stats.total} lessons generated
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {!isRunning ? (
              <Button onClick={onStart} disabled={stats.pending === 0}>
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            ) : isPaused ? (
              <Button onClick={onResume} variant="outline">
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            ) : (
              <Button onClick={onPause} variant="outline">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            {isRunning && (
              <Button onClick={onCancel} variant="destructive" size="icon">
                <Square className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progressPercent} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progressPercent.toFixed(0)}% complete</span>
            {isRunning && !isPaused && (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Generating...
              </span>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-5 gap-2 text-center">
          <div className="p-2 rounded bg-muted">
            <div className="text-lg font-semibold">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="p-2 rounded bg-blue-100 dark:bg-blue-950">
            <div className="text-lg font-semibold text-blue-600">{stats.generating}</div>
            <div className="text-xs text-muted-foreground">Generating</div>
          </div>
          <div className="p-2 rounded bg-green-100 dark:bg-green-950">
            <div className="text-lg font-semibold text-green-600">{stats.completed}</div>
            <div className="text-xs text-muted-foreground">Ready</div>
          </div>
          <div className="p-2 rounded bg-purple-100 dark:bg-purple-950">
            <div className="text-lg font-semibold text-purple-600">{stats.saved}</div>
            <div className="text-xs text-muted-foreground">Saved</div>
          </div>
          <div className="p-2 rounded bg-red-100 dark:bg-red-950">
            <div className="text-lg font-semibold text-red-600">{stats.failed}</div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </div>
        </div>

        {/* Save All Button */}
        {completedNotSaved > 0 && (
          <Button onClick={onSaveAll} className="w-full" variant="default">
            <Save className="h-4 w-4 mr-2" />
            Save All ({completedNotSaved} lessons)
          </Button>
        )}

        {/* Queue List */}
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {queue.map((item, index) => {
              const StatusIcon = statusIcons[item.status];
              const isSelected = item.id === selectedLessonId;
              const isCurrent = index === currentIndex && isRunning;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                    isSelected && "ring-2 ring-primary",
                    isCurrent && "bg-blue-50 dark:bg-blue-950 border-blue-300",
                    !isSelected && !isCurrent && "hover:bg-muted/50"
                  )}
                  onClick={() => item.status !== 'pending' && onSelectLesson(item.id)}
                >
                  {/* Status Badge */}
                  <Badge className={cn("shrink-0", statusColors[item.status])}>
                    <StatusIcon className={cn(
                      "h-3 w-3 mr-1",
                      item.status === 'generating' && "animate-spin"
                    )} />
                    {item.status}
                  </Badge>

                  {/* Lesson Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.topic}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.levelName || item.level} • {item.durationMinutes}min
                      {item.validation && (
                        <span className={cn(
                          "ml-2",
                          item.validation.score >= 80 ? "text-green-600" : "text-yellow-600"
                        )}>
                          {item.validation.score}%
                        </span>
                      )}
                    </div>
                    {item.error && (
                      <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        {item.error}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 shrink-0">
                    {item.status === 'completed' && (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLesson(item.id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSaveLesson(item.id);
                          }}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {item.status === 'saved' && (
                      <Check className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
