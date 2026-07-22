import React from 'react';
import { HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizOption {
  text: string;
  isCorrect?: boolean;
}

interface QuizSlidePreviewProps {
  slide: {
    id: string;
    title?: string;
    content?: {
      question?: string;
      options?: QuizOption[];
      explanation?: string;
      questionType?: string;
    };
  };
  onAnswer: (slideId: string, questionId: string, selectedIndex: number, correctIndex: number) => boolean;
  isAnswered: (slideId: string, questionId: string) => boolean;
  isRevealed: (slideId: string, questionId: string) => boolean;
  getAnswer: (slideId: string, questionId: string) => { selectedIndex: number; isCorrect: boolean } | undefined;
}

export function QuizSlidePreview({ 
  slide, 
  onAnswer, 
  isAnswered, 
  isRevealed,
  getAnswer 
}: QuizSlidePreviewProps) {
  const { question, options, explanation, questionType } = slide.content || {};
  const questionId = `q-${slide.id}`;
  const answered = isAnswered(slide.id, questionId);
  const revealed = isRevealed(slide.id, questionId);
  const answerData = getAnswer(slide.id, questionId);
  
  const correctIndex = options?.findIndex(opt => opt.isCorrect) ?? -1;

  const handleOptionClick = (idx: number) => {
    if (answered) return;
    onAnswer(slide.id, questionId, idx, correctIndex);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle className="h-6 w-6 text-orange-600" />
        <h2 className="text-2xl font-bold text-foreground">
          {slide.title || 'Quick Quiz'}
        </h2>
        {questionType && (
          <span className="text-sm text-muted-foreground">
            ({questionType})
          </span>
        )}
      </div>

      {question && (
        <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
          <p className="text-xl font-medium text-foreground">{question}</p>
        </div>
      )}

      <div className="grid gap-3">
        {options?.map((option, idx) => {
          const isSelected = answerData?.selectedIndex === idx;
          const isCorrect = idx === correctIndex;
          const showCorrect = revealed && isCorrect;
          const showIncorrect = revealed && isSelected && !isCorrect;

          return (
            <button
              key={idx}
              onClick={() => handleOptionClick(idx)}
              disabled={answered}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3",
                !answered && "hover:border-primary/50 hover:bg-primary/5 cursor-pointer",
                answered && "cursor-default",
                showCorrect && "bg-green-500/10 border-green-500",
                showIncorrect && "bg-red-500/10 border-red-500",
                isSelected && !revealed && "bg-primary/10 border-primary",
                !isSelected && !showCorrect && "bg-card border-border"
              )}
            >
              <span className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                showCorrect && "bg-green-500 text-white",
                showIncorrect && "bg-red-500 text-white",
                isSelected && !revealed && "bg-primary text-primary-foreground",
                !isSelected && !showCorrect && !showIncorrect && "bg-muted text-muted-foreground"
              )}>
                {showCorrect ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : showIncorrect ? (
                  <XCircle className="h-5 w-5" />
                ) : (
                  String.fromCharCode(65 + idx)
                )}
              </span>
              <span className={cn(
                "flex-1",
                showCorrect && "text-green-700 font-medium",
                showIncorrect && "text-red-700"
              )}>
                {option.text}
              </span>
            </button>
          );
        })}
      </div>

      {revealed && explanation && (
        <div className="bg-blue-500/10 rounded-xl p-5 border border-blue-500/20 mt-4">
          <h3 className="font-semibold text-blue-700 mb-2">Explanation</h3>
          <p className="text-foreground">{explanation}</p>
        </div>
      )}

      {revealed && answerData && (
        <div className={cn(
          "text-center py-3 rounded-lg",
          answerData.isCorrect ? "bg-green-500/10 text-green-700" : "bg-amber-500/10 text-amber-700"
        )}>
          {answerData.isCorrect ? (
            <span className="font-semibold">✓ Correct! Well done!</span>
          ) : (
            <span className="font-semibold">Keep practicing! Review the correct answer above.</span>
          )}
        </div>
      )}
    </div>
  );
}
