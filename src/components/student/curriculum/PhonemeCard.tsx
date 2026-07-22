import React from 'react';
import { PhonemeDefinition, MasteryLevel, MASTERY_COLORS } from '@/data/phonemeMap';
import { cn } from '@/lib/utils';

interface PhonemeCardProps {
  phoneme: PhonemeDefinition;
  mastery: MasteryLevel;
}

export const PhonemeCard: React.FC<PhonemeCardProps> = ({ phoneme, mastery }) => {
  const colors = MASTERY_COLORS[mastery];

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center rounded-xl border-2 p-3 transition-all duration-300 select-none',
        colors.bg,
        colors.border,
        mastery === 'mastered' && 'shadow-md shadow-amber-200/50 dark:shadow-amber-800/30 animate-pulse'
      )}
      title={`${phoneme.symbol} as in "${phoneme.example}" — ${mastery}`}
    >
      {mastery === 'mastered' && (
        <span className="absolute -top-1 -right-1 text-xs">⭐</span>
      )}
      <span className={cn('text-lg font-bold leading-none', colors.text)}>
        {phoneme.displayLabel}
      </span>
      <span className={cn('text-[10px] mt-1 opacity-70', colors.text)}>
        {phoneme.symbol}
      </span>
      <span className="text-[9px] text-muted-foreground mt-0.5 italic">
        {phoneme.example}
      </span>
    </div>
  );
};
