import React from 'react';
import { Check, Loader2, Clock, AlertCircle, SkipForward } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type PipelineStageStatus = 'pending' | 'running' | 'complete' | 'error' | 'skipped';

export interface PipelineStage {
  id: string;
  name: string;
  description: string;
  status: PipelineStageStatus;
  progress: number;
  message?: string;
}

interface PipelineProgressProps {
  stages: PipelineStage[];
  overallProgress: number;
  isGenerating: boolean;
  onCancel?: () => void;
  elapsedTime?: number;
}

const StageIcon: React.FC<{ status: PipelineStageStatus }> = ({ status }) => {
  switch (status) {
    case 'complete':
      return <Check className="h-4 w-4 text-green-500" />;
    case 'running':
      return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    case 'skipped':
      return <SkipForward className="h-4 w-4 text-muted-foreground" />;
    case 'pending':
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

export const PipelineProgress: React.FC<PipelineProgressProps> = ({
  stages,
  overallProgress,
  isGenerating,
  onCancel,
  elapsedTime = 0,
}) => {
  if (!isGenerating && stages.every(s => s.status === 'pending')) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isGenerating ? (
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          ) : (
            <Check className="h-5 w-5 text-green-500" />
          )}
          <h3 className="text-sm font-medium text-foreground">
            {isGenerating ? 'Generating Lesson...' : 'Generation Complete'}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {elapsedTime > 0 && (
            <span className="text-xs text-muted-foreground">
              {formatTime(elapsedTime)}
            </span>
          )}
          {isGenerating && onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Stages */}
      <div className="space-y-3">
        {stages.map((stage) => (
          <div key={stage.id} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StageIcon status={stage.status} />
                <span className={cn(
                  "text-sm",
                  stage.status === 'running' && "font-medium text-foreground",
                  stage.status === 'complete' && "text-muted-foreground",
                  stage.status === 'pending' && "text-muted-foreground",
                  stage.status === 'skipped' && "text-muted-foreground line-through",
                  stage.status === 'error' && "text-destructive"
                )}>
                  {stage.name}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {stage.status === 'skipped' ? 'Skipped' : `${Math.round(stage.progress)}%`}
              </span>
            </div>
            
            {stage.status !== 'skipped' && (
              <Progress 
                value={stage.progress} 
                className={cn(
                  "h-1.5",
                  stage.status === 'error' && "[&>div]:bg-destructive"
                )}
              />
            )}
            
            {stage.message && (
              <p className="text-xs text-muted-foreground pl-6">
                {stage.message}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Overall Progress */}
      <div className="pt-3 border-t border-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Overall Progress</span>
          <span className="text-sm font-medium text-foreground">{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>
    </div>
  );
};
