import React from 'react';
import { QuizResponse } from '@/services/quizService';
import { Check, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface QuizResponsesGridProps {
  responses: QuizResponse[];
  showResults: boolean;
  options: Array<{ id: string; text: string }>;
}

export const QuizResponsesGrid: React.FC<QuizResponsesGridProps> = ({
  responses,
  showResults,
  options
}) => {
  // Calculate distribution
  const distribution = options.map(opt => ({
    optionId: opt.id,
    text: opt.text,
    count: responses.filter(r => r.selectedOptionId === opt.id).length,
    percentage: responses.length > 0 
      ? (responses.filter(r => r.selectedOptionId === opt.id).length / responses.length) * 100 
      : 0
  }));

  const correctCount = responses.filter(r => r.isCorrect).length;
  const correctPercentage = responses.length > 0 ? (correctCount / responses.length) * 100 : 0;

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border">
      <h4 className="text-sm font-medium text-muted-foreground mb-3">
        Live Responses ({responses.length})
      </h4>

      {/* Student Avatars */}
      <div className="flex flex-wrap gap-2 mb-4">
        <AnimatePresence mode="popLayout">
          {responses.map((response) => (
            <motion.div
              key={response.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2",
                showResults
                  ? response.isCorrect
                    ? "bg-green-500/20 border-green-500 text-green-400"
                    : "bg-red-500/20 border-red-500 text-red-400"
                  : "bg-primary/20 border-primary text-primary"
              )}
              title={response.studentName}
            >
              {showResults ? (
                response.isCorrect ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />
              ) : (
                response.studentName.charAt(0).toUpperCase()
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Distribution Bars */}
      <div className="space-y-2">
        {distribution.map((item, index) => (
          <div key={item.optionId} className="flex items-center gap-2">
            <span className="w-6 text-xs font-medium text-muted-foreground">
              {String.fromCharCode(65 + index)}
            </span>
            <div className="flex-1 h-6 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-primary/60 rounded-full flex items-center justify-end pr-2"
              >
                {item.percentage > 15 && (
                  <span className="text-xs font-medium text-primary-foreground">
                    {item.count}
                  </span>
                )}
              </motion.div>
            </div>
            <span className="w-12 text-xs text-muted-foreground text-right">
              {Math.round(item.percentage)}%
            </span>
          </div>
        ))}
      </div>

      {/* Results Summary */}
      {showResults && responses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 pt-4 border-t border-border"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Correct Answers:</span>
            <span className={cn(
              "font-bold",
              correctPercentage >= 70 ? "text-green-400" : 
              correctPercentage >= 50 ? "text-yellow-400" : "text-red-400"
            )}>
              {correctCount}/{responses.length} ({Math.round(correctPercentage)}%)
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
