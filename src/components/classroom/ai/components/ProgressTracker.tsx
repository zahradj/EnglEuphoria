import React from "react";
import { Clock, Brain } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProgressTrackerProps {
  isGenerating: boolean;
  generationStep: string;
  generationProgress: number;
  elapsedTime: number;
}

export function ProgressTracker({ 
  isGenerating, 
  generationStep, 
  generationProgress, 
  elapsedTime 
}: ProgressTrackerProps) {
  if (!isGenerating) return null;

  const elapsedSeconds = Math.round(elapsedTime / 1000);

  return (
    <div className="px-4 py-3 bg-purple-50 border-b flex-shrink-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-600 animate-pulse" />
          <span className="text-sm font-medium text-purple-700">{generationStep}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-purple-600">
          <Clock className="h-3 w-3" />
          <span>{elapsedSeconds}s elapsed</span>
        </div>
      </div>
      <Progress value={generationProgress} className="h-2" />
      <div className="flex justify-between mt-1 text-xs text-purple-500">
        <span>{Math.round(generationProgress)}%</span>
        {generationProgress < 100 && <span>Please wait...</span>}
      </div>
    </div>
  );
}
