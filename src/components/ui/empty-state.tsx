import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type EmptyStateHub = 'playground' | 'academy' | 'success' | 'neutral';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  hub?: EmptyStateHub;
  className?: string;
  compact?: boolean;
}

const HUB_STYLES: Record<EmptyStateHub, {
  iconBg: string;
  iconColor: string;
  glow: string;
  button: string;
}> = {
  playground: {
    iconBg: 'bg-gradient-to-br from-orange-400/20 to-yellow-300/10',
    iconColor: 'text-orange-500',
    glow: 'shadow-[0_0_60px_-12px_rgba(254,106,47,0.35)]',
    button: 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white',
  },
  academy: {
    iconBg: 'bg-gradient-to-br from-purple-500/20 to-violet-400/10',
    iconColor: 'text-purple-500',
    glow: 'shadow-[0_0_60px_-12px_rgba(107,33,168,0.35)]',
    button: 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white',
  },
  success: {
    iconBg: 'bg-gradient-to-br from-emerald-500/20 to-teal-400/10',
    iconColor: 'text-emerald-500',
    glow: 'shadow-[0_0_60px_-12px_rgba(5,150,105,0.35)]',
    button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white',
  },
  neutral: {
    iconBg: 'bg-gradient-to-br from-primary/15 to-primary/5',
    iconColor: 'text-primary',
    glow: 'shadow-[0_0_60px_-12px_hsl(var(--primary)/0.3)]',
    button: '',
  },
};

/**
 * Glassmorphism empty state used across student, teacher, and classroom dashboards.
 * Renders a large hub-themed icon, friendly message, and an optional CTA.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  hub = 'neutral',
  className,
  compact = false,
}) => {
  const styles = HUB_STYLES[hub];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'relative mx-auto flex w-full max-w-md flex-col items-center justify-center text-center',
        'rounded-2xl border border-border/40 bg-card/50 backdrop-blur-xl',
        compact ? 'p-6' : 'p-10',
        styles.glow,
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className={cn(
          'mb-5 flex items-center justify-center rounded-2xl',
          compact ? 'h-14 w-14' : 'h-20 w-20',
          styles.iconBg
        )}
      >
        <Icon className={cn(compact ? 'h-7 w-7' : 'h-10 w-10', styles.iconColor)} strokeWidth={1.75} />
      </motion.div>

      <h3 className={cn(
        'font-semibold text-foreground',
        compact ? 'text-base' : 'text-lg'
      )}>
        {title}
      </h3>
      <p className={cn(
        'mt-2 max-w-sm text-muted-foreground',
        compact ? 'text-xs' : 'text-sm'
      )}>
        {description}
      </p>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className={cn('mt-6', styles.button)}
          size={compact ? 'sm' : 'default'}
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};
