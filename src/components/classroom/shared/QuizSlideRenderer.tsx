import React from 'react';
import { QuizOption } from './QuizOption';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

interface QuizOptionData {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizSlideRendererProps {
  question: string;
  options: QuizOptionData[];
  selectedOptionId: string | null;
  showResult: boolean;
  disabled: boolean;
  onSelectOption: (optionId: string) => void;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export const QuizSlideRenderer: React.FC<QuizSlideRendererProps> = ({
  question,
  options,
  selectedOptionId,
  showResult,
  disabled,
  onSelectOption
}) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-background to-muted/30">
      {/* Question */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center max-w-2xl"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <HelpCircle className="h-8 w-8 text-primary" />
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Quiz Question
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-relaxed">
          {question}
        </h2>
      </motion.div>

      {/* Options Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-2xl grid gap-3"
      >
        {options.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * (index + 1) }}
          >
            <QuizOption
              id={option.id}
              text={option.text}
              letter={LETTERS[index] || String(index + 1)}
              isSelected={selectedOptionId === option.id}
              isCorrect={option.isCorrect}
              showResult={showResult}
              disabled={disabled}
              onClick={() => onSelectOption(option.id)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Status indicator */}
      {selectedOptionId && !showResult && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-sm text-muted-foreground"
        >
          Answer submitted! Waiting for teacher to reveal results...
        </motion.p>
      )}
    </div>
  );
};
