import React, { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Clock, Brain, FileText, CheckCircle, Sparkles, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type GenerationStage = 'connecting' | 'generating' | 'validating' | 'complete';

interface GenerationProgressProps {
  durationMinutes: number;
  stage: GenerationStage;
  startTime: number;
  onCancel?: () => void;
}

const STAGE_CONFIG = {
  connecting: {
    icon: Loader2,
    label: "Connecting to AI...",
    description: "Establishing connection",
    color: "text-blue-500",
  },
  generating: {
    icon: Brain,
    label: "Generating lesson structure...",
    description: "Creating slides and content",
    color: "text-purple-500",
  },
  validating: {
    icon: FileText,
    label: "Validating content...",
    description: "Checking completeness",
    color: "text-amber-500",
  },
  complete: {
    icon: CheckCircle,
    label: "Complete!",
    description: "Lesson ready for review",
    color: "text-green-500",
  },
};

const TIPS = [
  "Creating vocabulary with IPA transcriptions...",
  "Building interactive practice activities...",
  "Writing detailed teacher notes...",
  "Generating grammar explanations...",
  "Designing engaging warm-up activities...",
  "Crafting production exercises...",
  "Adding comprehension questions...",
  "Preparing review activities...",
];

// Estimated generation time based on lesson duration
function getEstimatedTime(durationMinutes: number): number {
  if (durationMinutes <= 30) return 20000; // 20 seconds
  if (durationMinutes <= 45) return 35000; // 35 seconds
  if (durationMinutes <= 60) return 50000; // 50 seconds
  return 75000; // 75 seconds for 90+ min
}

function getExpectedSlides(durationMinutes: number): number {
  if (durationMinutes <= 30) return 20;
  if (durationMinutes <= 45) return 30;
  if (durationMinutes <= 60) return 40;
  return 60;
}

export function GenerationProgress({ durationMinutes, stage, startTime, onCancel }: GenerationProgressProps) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const estimatedTime = getEstimatedTime(durationMinutes);
  const expectedSlides = getExpectedSlides(durationMinutes);

  // Update elapsed time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Rotate tips every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const remainingMs = Math.max(0, estimatedTime - elapsedMs);
  const remainingSeconds = Math.ceil(remainingMs / 1000);

  // Calculate progress percentage (cap at 95% until complete)
  let progressPercent = Math.min(95, (elapsedMs / estimatedTime) * 100);
  if (stage === 'validating') progressPercent = Math.max(progressPercent, 85);
  if (stage === 'complete') progressPercent = 100;

  const StageIcon = STAGE_CONFIG[stage].icon;
  const stageConfig = STAGE_CONFIG[stage];

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelDialog(false);
    onCancel?.();
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      {/* Stage indicator */}
      <div className="flex items-center gap-3 mb-6">
        <StageIcon 
          className={cn(
            "h-8 w-8",
            stageConfig.color,
            stage !== 'complete' && "animate-pulse"
          )} 
        />
        <div>
          <p className={cn("font-semibold", stageConfig.color)}>
            {stageConfig.label}
          </p>
          <p className="text-sm text-muted-foreground">
            {stageConfig.description}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm mb-4">
        <Progress 
          value={progressPercent} 
          className="h-3"
        />
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>{Math.round(progressPercent)}%</span>
          <span>~{expectedSlides} slides</span>
        </div>
      </div>

      {/* Time info */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{elapsedSeconds}s elapsed</span>
        </div>
        {stage !== 'complete' && remainingSeconds > 0 && (
          <>
            <span>•</span>
            <span>~{remainingSeconds}s remaining</span>
          </>
        )}
      </div>

      {/* Slide count info */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <FileText className="h-4 w-4" />
        <span>
          Creating {expectedSlides} slides for {durationMinutes}-min lesson
        </span>
      </div>

      {/* Rotating tip */}
      {stage === 'generating' && (
        <div className="flex items-center gap-2 text-sm text-primary animate-fade-in">
          <Sparkles className="h-4 w-4" />
          <span className="italic">{TIPS[tipIndex]}</span>
        </div>
      )}

      {/* Stage progress dots */}
      <div className="flex items-center gap-2 mt-6">
        {(['connecting', 'generating', 'validating', 'complete'] as GenerationStage[]).map((s, idx) => {
          const isActive = s === stage;
          const isPast = ['connecting', 'generating', 'validating', 'complete'].indexOf(stage) > idx;
          
          return (
            <div
              key={s}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                isActive && "w-3 h-3 bg-primary animate-pulse",
                isPast && "bg-primary",
                !isActive && !isPast && "bg-muted"
              )}
            />
          );
        })}
      </div>

      {/* Cancel button */}
      {stage !== 'complete' && onCancel && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancelClick}
          className="mt-6 text-muted-foreground hover:text-destructive hover:border-destructive"
        >
          <XCircle className="h-4 w-4 mr-1" />
          Cancel Generation
        </Button>
      )}

      {/* Cancel confirmation dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Lesson Generation?</AlertDialogTitle>
            <AlertDialogDescription>
              The AI is currently generating your lesson. Are you sure you want to cancel?
              You'll need to start over if you want to generate this lesson again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Generating</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
