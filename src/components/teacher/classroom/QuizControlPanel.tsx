import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Lock, Eye, RotateCcw, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizControlPanelProps {
  quizActive: boolean;
  quizLocked: boolean;
  quizRevealAnswer: boolean;
  responsesCount: number;
  onStartQuiz: () => void;
  onLockQuiz: () => void;
  onRevealAnswer: () => void;
  onResetQuiz: () => void;
}

export const QuizControlPanel: React.FC<QuizControlPanelProps> = ({
  quizActive,
  quizLocked,
  quizRevealAnswer,
  responsesCount,
  onStartQuiz,
  onLockQuiz,
  onRevealAnswer,
  onResetQuiz
}) => {
  return (
    <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm rounded-full px-3 py-2 border border-border shadow-lg">
      {/* Response Counter */}
      <div className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{responsesCount}</span>
      </div>

      <div className="h-6 w-px bg-border" />

      {/* Start Quiz */}
      {!quizActive && !quizRevealAnswer && (
        <Button
          size="sm"
          onClick={onStartQuiz}
          className="rounded-full gap-2"
        >
          <Play className="h-4 w-4" />
          Start Quiz
        </Button>
      )}

      {/* Lock Answers */}
      {quizActive && !quizLocked && !quizRevealAnswer && (
        <Button
          size="sm"
          variant="secondary"
          onClick={onLockQuiz}
          className="rounded-full gap-2"
        >
          <Lock className="h-4 w-4" />
          Lock Answers
        </Button>
      )}

      {/* Reveal Answer */}
      {(quizActive || quizLocked) && !quizRevealAnswer && (
        <Button
          size="sm"
          variant="default"
          onClick={onRevealAnswer}
          className="rounded-full gap-2 bg-green-600 hover:bg-green-700"
        >
          <Eye className="h-4 w-4" />
          Reveal Answer
        </Button>
      )}

      {/* Reset Quiz */}
      {quizRevealAnswer && (
        <Button
          size="sm"
          variant="outline"
          onClick={onResetQuiz}
          className="rounded-full gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Quiz
        </Button>
      )}

      {/* Status Indicator */}
      <div className={cn(
        "ml-2 px-3 py-1 rounded-full text-xs font-medium",
        quizRevealAnswer 
          ? "bg-green-500/20 text-green-400" 
          : quizLocked 
            ? "bg-yellow-500/20 text-yellow-400"
            : quizActive 
              ? "bg-blue-500/20 text-blue-400"
              : "bg-muted text-muted-foreground"
      )}>
        {quizRevealAnswer 
          ? "Results Shown" 
          : quizLocked 
            ? "Locked"
            : quizActive 
              ? "Active"
              : "Ready"}
      </div>
    </div>
  );
};
