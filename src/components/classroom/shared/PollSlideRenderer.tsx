import React from 'react';
import { PollOption } from './PollOption';
import { BarChart3 } from 'lucide-react';

interface PollSlideRendererProps {
  question: string;
  options: Array<{ id: string; text: string }>;
  selectedOptionId: string | null;
  showResults: boolean;
  disabled: boolean;
  voteDistribution?: Record<string, number>;
  onSelectOption: (optionId: string) => void;
}

export const PollSlideRenderer: React.FC<PollSlideRendererProps> = ({
  question,
  options,
  selectedOptionId,
  showResults,
  disabled,
  voteDistribution = {},
  onSelectOption,
}) => {
  const totalVotes = Object.values(voteDistribution).reduce((sum, count) => sum + count, 0);

  return (
    <div className="w-full h-full flex flex-col p-8 bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
        <span className="text-sm font-medium text-primary uppercase tracking-wider">
          Poll
        </span>
      </div>

      {/* Question */}
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 leading-snug">
        {question}
      </h2>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {options.map((option, index) => (
          <PollOption
            key={option.id}
            option={option}
            index={index}
            isSelected={selectedOptionId === option.id}
            voteCount={voteDistribution[option.id] || 0}
            totalVotes={totalVotes}
            showResults={showResults}
            disabled={disabled}
            onSelect={onSelectOption}
          />
        ))}
      </div>

      {/* Total votes indicator */}
      {showResults && totalVotes > 0 && (
        <div className="mt-6 text-center text-muted-foreground">
          Total votes: <span className="font-bold text-foreground">{totalVotes}</span>
        </div>
      )}
    </div>
  );
};
