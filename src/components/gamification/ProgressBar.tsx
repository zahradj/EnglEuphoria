import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  total: number;
  xp?: number;
  className?: string;
}

export function ProgressBar({ current, total, xp, className }: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            Slide {current} of {total}
          </span>
          {xp !== undefined && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-full"
            >
              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
              <span className="text-xs font-bold text-yellow-700">{xp} XP</span>
            </motion.div>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {Math.round(percentage)}% Complete
        </span>
      </div>
      
      <div className="h-3 bg-muted rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
