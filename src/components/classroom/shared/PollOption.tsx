import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface PollOptionProps {
  option: {
    id: string;
    text: string;
  };
  index: number;
  isSelected: boolean;
  voteCount?: number;
  totalVotes?: number;
  showResults: boolean;
  disabled: boolean;
  onSelect: (optionId: string) => void;
}

const OPTION_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
];

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export const PollOption: React.FC<PollOptionProps> = ({
  option,
  index,
  isSelected,
  voteCount = 0,
  totalVotes = 0,
  showResults,
  disabled,
  onSelect,
}) => {
  const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
  const colorClass = OPTION_COLORS[index % OPTION_COLORS.length];

  return (
    <button
      onClick={() => !disabled && onSelect(option.id)}
      disabled={disabled}
      className={cn(
        'w-full p-4 rounded-xl border-2 transition-all duration-300 relative overflow-hidden',
        'flex items-center gap-4',
        isSelected
          ? 'border-primary bg-primary/10 ring-2 ring-primary'
          : 'border-muted hover:border-primary/50 bg-card',
        disabled && !isSelected && 'opacity-60 cursor-not-allowed'
      )}
    >
      {/* Background bar for results */}
      {showResults && (
        <div
          className={cn(
            'absolute inset-0 transition-all duration-500 ease-out opacity-20',
            colorClass
          )}
          style={{ width: `${percentage}%` }}
        />
      )}

      {/* Option letter badge */}
      <div
        className={cn(
          'relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0',
          colorClass
        )}
      >
        {isSelected ? <Check className="h-5 w-5" /> : OPTION_LETTERS[index]}
      </div>

      {/* Option text */}
      <span className="relative z-10 flex-1 text-left font-medium text-foreground">
        {option.text}
      </span>

      {/* Vote count/percentage */}
      {showResults && (
        <div className="relative z-10 text-right shrink-0">
          <div className="text-lg font-bold text-foreground">{percentage}%</div>
          <div className="text-xs text-muted-foreground">{voteCount} votes</div>
        </div>
      )}
    </button>
  );
};
