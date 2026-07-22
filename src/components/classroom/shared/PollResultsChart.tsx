import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PollResultsChartProps {
  options: Array<{ id: string; text: string }>;
  voteDistribution: Record<string, number>;
  showAnimation?: boolean;
}

const BAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
];

export const PollResultsChart: React.FC<PollResultsChartProps> = ({
  options,
  voteDistribution,
  showAnimation = true,
}) => {
  const totalVotes = Object.values(voteDistribution).reduce((sum, count) => sum + count, 0);
  const maxVotes = Math.max(...Object.values(voteDistribution), 1);

  return (
    <div className="space-y-4">
      {options.map((option, index) => {
        const votes = voteDistribution[option.id] || 0;
        const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
        const barWidth = totalVotes > 0 ? (votes / maxVotes) * 100 : 0;
        const colorClass = BAR_COLORS[index % BAR_COLORS.length];

        return (
          <div key={option.id} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-foreground truncate max-w-[70%]">
                {option.text}
              </span>
              <span className="text-muted-foreground">
                {percentage}% ({votes})
              </span>
            </div>
            <div className="h-8 bg-muted rounded-lg overflow-hidden relative">
              <motion.div
                initial={showAnimation ? { width: 0 } : false}
                animate={{ width: `${barWidth}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={cn('h-full rounded-lg', colorClass)}
              />
            </div>
          </div>
        );
      })}

      <div className="pt-4 border-t border-border text-center text-muted-foreground">
        Total responses: <span className="font-bold text-foreground">{totalVotes}</span>
      </div>
    </div>
  );
};
