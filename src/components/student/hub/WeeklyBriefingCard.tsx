import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Flame, BarChart2, Sparkles, Lightbulb } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useWeeklyBriefingAI } from '@/hooks/useWeeklyBriefingAI';

interface WeeklyBriefingCardProps {
  isDarkMode?: boolean;
}

export const WeeklyBriefingCard: React.FC<WeeklyBriefingCardProps> = ({
  isDarkMode = false,
}) => {
  const { briefing, loading } = useWeeklyBriefingAI();

  if (loading) {
    return (
      <div className={`glass-card-hub glass-professional p-5 backdrop-blur-md space-y-3`}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-6 w-48 rounded-full" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!briefing) return null;

  const isPositive = briefing.improvementPct >= 0;

  return (
    <div className="glass-card-hub glass-professional p-5 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-bold text-sm flex items-center gap-1.5 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          📊 Weekly Briefing
        </h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
          isDarkMode
            ? 'bg-emerald-800/50 text-emerald-300'
            : 'bg-emerald-100 text-emerald-700'
        }`}>
          {briefing.aiGenerated ? <Sparkles className="w-3 h-3" /> : null}
          {briefing.aiGenerated ? 'AI Report' : 'Report'}
        </span>
      </div>

      {/* Main insight */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`flex items-start gap-3 p-3 rounded-xl mb-3 ${
          isDarkMode ? 'bg-white/5' : 'bg-white/50'
        }`}
      >
        <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
          isPositive
            ? isDarkMode ? 'bg-emerald-900/50' : 'bg-emerald-100'
            : isDarkMode ? 'bg-red-900/50' : 'bg-red-100'
        }`}>
          {isPositive
            ? <TrendingUp className="w-4 h-4 text-emerald-500" />
            : <TrendingDown className="w-4 h-4 text-red-500" />}
        </div>

        <div>
          <p className={`text-sm leading-snug ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            You improved your{' '}
            <span className={`font-semibold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
              {briefing.improvementArea}
            </span>{' '}
            by{' '}
            <span className={`text-lg font-extrabold ${
              isPositive
                ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                : isDarkMode ? 'text-red-400' : 'text-red-600'
            }`}>
              {isPositive ? '+' : ''}{briefing.improvementPct}%
            </span>{' '}
            this week.
          </p>
        </div>
      </motion.div>

      {/* AI insight */}
      {briefing.weeklyInsight && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`flex items-start gap-2 text-xs p-2.5 rounded-lg mb-3 ${
            isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-white/50 text-gray-700'
          }`}
        >
          <Lightbulb className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
          <span className="italic">{briefing.weeklyInsight}</span>
        </motion.div>
      )}

      {/* Focus recommendation */}
      <div className={`flex items-center gap-2 text-xs mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Next focus:</span>
        <span className={`px-2.5 py-0.5 rounded-full font-semibold ${
          isDarkMode
            ? 'bg-teal-900/50 text-teal-300 border border-teal-700/40'
            : 'bg-teal-100 text-teal-700 border border-teal-200'
        }`}>
          🎯 {briefing.focusArea}
        </span>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Sessions', value: briefing.sessionsThisWeek, icon: <BarChart2 className="w-3.5 h-3.5" /> },
          { label: 'Avg Score', value: `${briefing.avgScore}%`, icon: <Target className="w-3.5 h-3.5" /> },
          { label: 'Streak', value: `${briefing.streak}d`, icon: <Flame className="w-3.5 h-3.5" /> },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 + i * 0.07 }}
            className={`flex flex-col items-center py-2.5 px-1 rounded-xl text-center ${
              isDarkMode ? 'bg-white/5' : 'bg-white/50'
            }`}
          >
            <div className={`mb-1 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
              {stat.icon}
            </div>
            <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stat.value}
            </span>
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} leading-tight`}>
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Action tip */}
      {briefing.actionTip && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`mt-3 text-xs text-center italic ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
        >
          💡 {briefing.actionTip}
        </motion.p>
      )}
    </div>
  );
};
