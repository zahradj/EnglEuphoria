// HomeworkGenerationDialog — Flat 2.0 modal that wraps generateHomeworkSafe()
// with an explicit 7-stage progress stepper, retry button, and detail panel.

import React, { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, AlertCircle, Loader2, RefreshCw, ExternalLink, ChevronDown } from 'lucide-react';
import {
  generateHomeworkSafe,
  HOMEWORK_STAGES,
  type HomeworkStage,
  type GenerateHomeworkInput,
  type GenerateHomeworkResult,
} from '@/lib/homeworkGuard';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  input: Omit<GenerateHomeworkInput, 'onProgress' | 'silent'>;
}

const STAGE_LABEL: Record<HomeworkStage, string> = {
  auth: 'Auth',
  context: 'Loading Lesson Context',
  blueprint: 'Building Blueprint',
  activities: 'Generating Activities',
  adaptive: 'Adapting Difficulty',
  validate: 'Validating Output',
  persist: 'Saving Homework',
  assign: 'Assigning to Students',
};

type Status = 'idle' | 'running' | 'done' | 'error';

const hubAccent = (hub: GenerateHomeworkInput['hub']) => {
  if (hub === 'playground') return 'from-amber-400 to-orange-500';
  if (hub === 'success') return 'from-emerald-500 to-teal-600';
  return 'from-indigo-500 to-purple-600';
};

export const HomeworkGenerationDialog: React.FC<Props> = ({ open, onOpenChange, input }) => {
  const [status, setStatus] = useState<Status>('idle');
  const [currentStage, setCurrentStage] = useState<HomeworkStage | null>(null);
  const [result, setResult] = useState<GenerateHomeworkResult | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const run = useCallback(async () => {
    setStatus('running');
    setCurrentStage('context');
    setResult(null);
    setShowDetail(false);

    const r = await generateHomeworkSafe({
      ...input,
      silent: true,
      onProgress: (s) => setCurrentStage(s),
    });

    setResult(r);
    setStatus(r.ok ? 'done' : 'error');
    if (r.ok) setCurrentStage('assign');
  }, [input]);

  useEffect(() => {
    if (open && status === 'idle') {
      run();
    }
    if (!open) {
      // reset for next opening
      setTimeout(() => {
        setStatus('idle');
        setCurrentStage(null);
        setResult(null);
        setShowDetail(false);
      }, 200);
    }
  }, [open, status, run]);

  const errorStageIndex = result?.stage ? HOMEWORK_STAGES.indexOf(result.stage) : -1;
  const currentIndex = currentStage ? HOMEWORK_STAGES.indexOf(currentStage) : -1;

  const assignmentId = result?.data?.assignment?.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className={`inline-block w-2 h-6 rounded bg-gradient-to-b ${hubAccent(input.hub)}`} />
            Generate Homework
          </DialogTitle>
          <DialogDescription>
            Running the Unified Curriculum pipeline for{' '}
            <span className="font-medium text-foreground">{input.title || 'this lesson'}</span>.
          </DialogDescription>
        </DialogHeader>

        {/* Stage stepper */}
        <ol className="space-y-1.5 mt-2">
          {HOMEWORK_STAGES.map((stage, idx) => {
            const isError = status === 'error' && errorStageIndex === idx;
            const isDone =
              (status === 'done' && true) ||
              (status === 'running' && idx < currentIndex) ||
              (status === 'error' && idx < errorStageIndex);
            const isActive = status === 'running' && idx === currentIndex && !isError;

            return (
              <li
                key={stage}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm border ${
                  isError
                    ? 'border-destructive/40 bg-destructive/5 text-destructive'
                    : isDone
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900'
                    : isActive
                    ? 'border-primary/40 bg-primary/5 text-foreground'
                    : 'border-border bg-muted/30 text-muted-foreground'
                }`}
              >
                <span className="w-5 h-5 inline-flex items-center justify-center">
                  {isError ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : isDone ? (
                    <Check className="w-4 h-4" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
                  )}
                </span>
                <span className="flex-1">{STAGE_LABEL[stage]}</span>
                {isError && <span className="text-xs">failed</span>}
              </li>
            );
          })}
        </ol>

        {/* Result */}
        {status === 'error' && result && (
          <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <div className="font-medium text-destructive">{result.error}</div>
            {result.detail && (
              <button
                type="button"
                onClick={() => setShowDetail((v) => !v)}
                className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ChevronDown className={`w-3 h-3 transition-transform ${showDetail ? 'rotate-180' : ''}`} />
                {showDetail ? 'Hide' : 'Show'} details
              </button>
            )}
            {showDetail && result.detail && (
              <pre className="mt-2 whitespace-pre-wrap break-words text-[11px] bg-background/60 rounded p-2 max-h-40 overflow-auto">
                {result.detail}
              </pre>
            )}
          </div>
        )}

        {status === 'done' && (
          <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900 p-3 text-sm text-emerald-700 dark:text-emerald-300">
            Homework is published and assigned. Students will see it immediately.
          </div>
        )}

        <div className="flex justify-end gap-2 pt-3">
          {status === 'error' && (
            <Button variant="outline" size="sm" onClick={run}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry
            </Button>
          )}
          {status === 'done' && assignmentId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/homework/${assignmentId}`, '_blank')}
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Preview
            </Button>
          )}
          <Button
            variant={status === 'done' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={status === 'running'}
          >
            {status === 'done' ? 'Done' : 'Close'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HomeworkGenerationDialog;
