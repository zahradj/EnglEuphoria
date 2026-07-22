import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Sparkles } from 'lucide-react';
import { useHubClassroomTheme, type HubType } from '@/components/classroom/shared/useHubClassroomTheme';

interface XPStreakIndicatorProps {
  xp: number;
  streak: number;
  hubType?: HubType;
  className?: string;
}

/**
 * Compact pill showing in-session XP + current correct-answer streak.
 * Pulses on increment and uses hub-themed gradient.
 */
export const XPStreakIndicator: React.FC<XPStreakIndicatorProps> = ({
  xp,
  streak,
  hubType = 'academy',
  className = '',
}) => {
  const theme = useHubClassroomTheme(hubType);
  const [pulse, setPulse] = useState(false);
  const [prevXp, setPrevXp] = useState(xp);

  useEffect(() => {
    if (xp !== prevXp) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 600);
      setPrevXp(xp);
      return () => clearTimeout(t);
    }
  }, [xp, prevXp]);

  return (
    <motion.div
      animate={pulse ? { scale: [1, 1.12, 1] } : { scale: 1 }}
      transition={{ duration: 0.45 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-md ${className}`}
      style={theme.buttonGradient}
    >
      <Sparkles className="w-3.5 h-3.5" />
      <span className="tabular-nums">{xp} XP</span>
      <AnimatePresence>
        {streak >= 2 && (
          <motion.span
            key="streak"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            className="flex items-center pl-2 ml-1 border-l border-white/40"
          >
            <Flame className="w-3.5 h-3.5 animate-pulse" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default XPStreakIndicator;
