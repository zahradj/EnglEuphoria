import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExplainMistake } from '@/hooks/useExplainMistake';

interface WhyWrongButtonProps {
  lessonContext?: string;
  questionText?: string;
  correctAnswer: string;
  userAnswer: string;
}

export default function WhyWrongButton({ lessonContext, questionText, correctAnswer, userAnswer }: WhyWrongButtonProps) {
  const { loading, explanation, explain } = useExplainMistake();

  if (explanation) {
    return (
      <div className="mt-2 bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm text-indigo-700 animate-in fade-in slide-in-from-bottom-1 duration-300">
        <p className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-indigo-500" />
          <span>{explanation}</span>
        </p>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => explain({ lessonContext, questionText, correctAnswer, userAnswer })}
      disabled={loading}
      className="mt-1 text-xs text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 gap-1"
    >
      {loading ? (
        <><Loader2 className="w-3 h-3 animate-spin" /> Thinking…</>
      ) : (
        <><Sparkles className="w-3 h-3" /> Why is this wrong?</>
      )}
    </Button>
  );
}
