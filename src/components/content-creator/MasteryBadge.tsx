import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Award } from 'lucide-react';

interface MasteryBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MasteryBadge: React.FC<MasteryBadgeProps> = ({ className, size = 'md' }) => {
  const sizeMap = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-20 w-20',
  };

  const iconSize = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-10 w-10',
  };

  return (
    <motion.div
      initial={{ rotateY: 0 }}
      animate={{ rotateY: [0, 360] }}
      transition={{ duration: 2, ease: 'easeInOut', repeat: 0 }}
      style={{ perspective: 600 }}
      className={cn('inline-block', className)}
    >
      <div
        className={cn(
          'relative inline-flex items-center justify-center rounded-full',
          sizeMap[size],
          // Light mode: metallic gold coin
          'bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500',
          'shadow-[0_0_16px_rgba(245,158,11,0.35)]',
          // Dark mode: neon glow medal
          'dark:bg-gradient-to-br dark:from-primary dark:via-primary/80 dark:to-accent',
          'dark:shadow-[0_0_24px_hsl(var(--primary)/0.5),0_0_48px_hsl(var(--primary)/0.2)]',
        )}
      >
        {/* Inner ring */}
        <div className={cn(
          'absolute inset-[2px] rounded-full',
          'bg-gradient-to-br from-yellow-100 to-amber-200',
          'dark:from-background dark:to-card',
          'flex items-center justify-center'
        )}>
          <Award className={cn(
            iconSize[size],
            'text-amber-600 dark:text-primary',
            'drop-shadow-sm'
          )} />
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute -inset-full animate-[shine_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
        </div>
      </div>
    </motion.div>
  );
};
