import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuizOptionProps {
  id: string;
  text: string;
  letter: string;
  isSelected: boolean;
  isCorrect?: boolean;
  showResult: boolean;
  disabled: boolean;
  onClick: () => void;
}

export const QuizOption: React.FC<QuizOptionProps> = ({
  id,
  text,
  letter,
  isSelected,
  isCorrect,
  showResult,
  disabled,
  onClick
}) => {
  const getStateStyles = () => {
    if (showResult) {
      if (isCorrect) {
        return 'bg-green-500/20 border-green-500 text-green-100';
      }
      if (isSelected && !isCorrect) {
        return 'bg-red-500/20 border-red-500 text-red-100';
      }
      return 'bg-muted/30 border-muted text-muted-foreground opacity-50';
    }
    
    if (isSelected) {
      return 'bg-primary/20 border-primary text-primary-foreground';
    }
    
    if (disabled) {
      return 'bg-muted/10 border-muted/30 text-muted-foreground cursor-not-allowed';
    }
    
    return 'bg-card/80 border-border hover:bg-primary/10 hover:border-primary/50 cursor-pointer';
  };

  const getLetterBadgeStyles = () => {
    if (showResult) {
      if (isCorrect) {
        return 'bg-green-500 text-white';
      }
      if (isSelected && !isCorrect) {
        return 'bg-red-500 text-white';
      }
      return 'bg-muted text-muted-foreground';
    }
    
    if (isSelected) {
      return 'bg-primary text-primary-foreground';
    }
    
    return 'bg-muted text-muted-foreground';
  };

  return (
    <motion.button
      whileHover={!disabled && !showResult ? { scale: 1.02 } : {}}
      whileTap={!disabled && !showResult ? { scale: 0.98 } : {}}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        'w-full p-4 rounded-xl border-2 transition-all duration-200',
        'flex items-center gap-4 text-left',
        getStateStyles()
      )}
    >
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shrink-0',
        getLetterBadgeStyles()
      )}>
        {showResult && isCorrect ? (
          <Check className="h-5 w-5" />
        ) : showResult && isSelected && !isCorrect ? (
          <X className="h-5 w-5" />
        ) : (
          letter
        )}
      </div>
      
      <span className="text-lg font-medium flex-1">{text}</span>
      
      {isSelected && !showResult && (
        <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
      )}
    </motion.button>
  );
};
