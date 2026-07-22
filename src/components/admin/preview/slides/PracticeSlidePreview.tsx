import React, { useState } from 'react';
import { PenTool, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Exercise {
  prompt: string;
  answer?: string;
  hint?: string;
}

interface PracticeSlidePreviewProps {
  slide: {
    title?: string;
    content?: {
      instructions?: string;
      exercises?: Exercise[];
    };
  };
}

export function PracticeSlidePreview({ slide }: PracticeSlidePreviewProps) {
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  
  const { instructions, exercises } = slide.content || {};

  const toggleAnswer = (idx: number) => {
    setRevealedAnswers(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <PenTool className="h-6 w-6 text-green-600" />
        <h2 className="text-2xl font-bold text-foreground">
          {slide.title || 'Controlled Practice'}
        </h2>
      </div>

      {instructions && (
        <p className="text-muted-foreground bg-muted/50 rounded-lg p-4">
          {instructions}
        </p>
      )}

      <div className="space-y-4">
        {exercises?.map((exercise, idx) => (
          <div 
            key={idx}
            className="bg-card border rounded-xl p-5 space-y-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  {idx + 1}
                </span>
                <p className="text-foreground pt-0.5">{exercise.prompt}</p>
              </div>
              
              {exercise.answer && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleAnswer(idx)}
                  className="shrink-0"
                >
                  {revealedAnswers[idx] ? (
                    <EyeOff className="h-4 w-4 mr-1" />
                  ) : (
                    <Eye className="h-4 w-4 mr-1" />
                  )}
                  {revealedAnswers[idx] ? 'Hide' : 'Show'}
                </Button>
              )}
            </div>

            {exercise.hint && !revealedAnswers[idx] && (
              <p className="text-sm text-muted-foreground italic ml-10">
                Hint: {exercise.hint}
              </p>
            )}

            {exercise.answer && revealedAnswers[idx] && (
              <div className="ml-10 bg-green-500/10 text-green-700 rounded-lg p-3 border border-green-500/20">
                <span className="font-semibold">Answer: </span>
                {exercise.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
