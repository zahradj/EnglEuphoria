import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DynamicAvatar } from './DynamicAvatar';
import { Trophy, Zap, Star, ArrowRight, Sparkles, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionCompletionProps {
  studentId: string;
  hub: 'playground' | 'academy' | 'professional';
  lessonTitle: string;
  xpEarned: number;
  accuracy: number;
  timeSpent: string;
  unlockedAccessory?: {
    name: string;
    imageUrl: string | null;
  } | null;
  onContinue: () => void;
  onViewCollection: () => void;
}

const HUB_CONFIG = {
  playground: {
    xpLabel: 'Magic Points',
    xpIcon: '✨',
    rewardLabel: 'Reward Unlocked!',
    nextLabel: 'Continue the Adventure!',
    bg: 'from-amber-500/10 via-orange-500/5 to-yellow-500/10',
    accent: 'text-amber-500',
    buttonBg: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
    cardBorder: 'border-amber-400/30',
  },
  academy: {
    xpLabel: 'XP Earned',
    xpIcon: '⚡',
    rewardLabel: 'New Gear Unlocked!',
    nextLabel: 'Next Challenge',
    bg: 'from-violet-500/10 via-cyan-500/5 to-fuchsia-500/10',
    accent: 'text-cyan-400',
    buttonBg: 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600',
    cardBorder: 'border-cyan-400/30',
  },
  professional: {
    xpLabel: 'Competency Score',
    xpIcon: '📊',
    rewardLabel: 'Achievement Earned',
    nextLabel: 'Next Module',
    bg: 'from-slate-500/10 via-emerald-500/5 to-amber-500/10',
    accent: 'text-emerald-500',
    buttonBg: 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900',
    cardBorder: 'border-emerald-400/30',
  },
};

const CountUpNumber = ({ target, duration = 1.5 }: { target: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = target / (duration * 60);
    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [target, duration]);

  return <span>{count}</span>;
};

export const SessionCompletionSummary: React.FC<SessionCompletionProps> = ({
  studentId,
  hub,
  lessonTitle,
  xpEarned,
  accuracy,
  timeSpent,
  unlockedAccessory,
  onContinue,
  onViewCollection,
}) => {
  const config = HUB_CONFIG[hub];

  const stats = [
    {
      icon: <Zap className={cn('h-5 w-5', config.accent)} />,
      label: config.xpLabel,
      value: `+${xpEarned}`,
      prefix: config.xpIcon,
    },
    {
      icon: <Target className={cn('h-5 w-5', config.accent)} />,
      label: 'Accuracy',
      value: `${accuracy}%`,
      prefix: '🎯',
    },
    {
      icon: <TrendingUp className={cn('h-5 w-5', config.accent)} />,
      label: 'Time Spent',
      value: timeSpent,
      prefix: '⏱️',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.85, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 14, stiffness: 100 }}
        className={cn(
          'relative w-full max-w-lg rounded-3xl border border-border overflow-hidden',
          'bg-background/95 backdrop-blur-xl shadow-2xl',
        )}
      >
        {/* Header */}
        <div className={cn('bg-gradient-to-r p-6 text-center', config.bg)}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <DynamicAvatar
              studentId={studentId}
              hub={hub}
              size="md"
              className="mx-auto mb-4"
              showSparkle
            />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Star className={cn('h-5 w-5', config.accent)} />
              <h2 className="text-xl font-bold text-foreground">Lesson Complete!</h2>
              <Star className={cn('h-5 w-5', config.accent)} />
            </div>
            <p className="text-sm text-muted-foreground">{lessonTitle}</p>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.15 }}
                className={cn(
                  'rounded-2xl border p-3 text-center',
                  config.cardBorder,
                  'bg-muted/30',
                )}
              >
                <div className="text-lg mb-0.5">{stat.prefix}</div>
                <div className="text-lg font-bold text-foreground">
                  {stat.label === config.xpLabel ? (
                    <>+<CountUpNumber target={xpEarned} /></>
                  ) : (
                    stat.value
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Unlocked Accessory */}
          {unlockedAccessory && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              className={cn(
                'rounded-2xl border p-4 flex items-center gap-4',
                config.cardBorder,
                'bg-gradient-to-r',
                config.bg,
              )}
            >
              <div className="w-14 h-14 rounded-xl bg-background/50 flex items-center justify-center overflow-hidden shrink-0">
                {unlockedAccessory.imageUrl ? (
                  <img
                    src={unlockedAccessory.imageUrl}
                    alt={unlockedAccessory.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Trophy className={cn('h-6 w-6', config.accent)} />
                )}
              </div>
              <div className="flex-1">
                <Badge variant="secondary" className="text-[10px] mb-1">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {config.rewardLabel}
                </Badge>
                <p className="text-sm font-bold text-foreground">{unlockedAccessory.name}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onViewCollection}
                className="shrink-0 text-xs"
              >
                View
              </Button>
            </motion.div>
          )}

          {/* Continue Button */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <Button
              onClick={onContinue}
              className={cn(
                'w-full h-12 rounded-2xl text-white font-bold text-base shadow-lg',
                config.buttonBg,
              )}
            >
              {config.nextLabel}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};
