import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Radio } from 'lucide-react';

interface LiveSessionBadgeProps {
  classroomUrl: string;
  /** Visual variant — 'banner' for a full-width sticky bar, 'inline' for a compact pill */
  variant?: 'banner' | 'inline';
  isDarkMode?: boolean;
}

export const LiveSessionBadge: React.FC<LiveSessionBadgeProps> = ({
  classroomUrl,
  variant = 'banner',
  isDarkMode = false,
}) => {
  const navigate = useNavigate();

  if (variant === 'inline') {
    return (
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-500/40"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping absolute" />
        <span className="w-1.5 h-1.5 rounded-full bg-white relative" />
        LIVE
      </motion.span>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full"
      >
        <div
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-lg ${
            isDarkMode
              ? 'bg-gradient-to-r from-red-900/70 to-rose-900/70 border border-red-500/40'
              : 'bg-gradient-to-r from-red-500 to-rose-500'
          }`}
        >
          {/* Left: pulsing dot + text */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span className="absolute w-5 h-5 rounded-full bg-white/30 animate-ping" />
              <Radio className="w-5 h-5 text-white relative z-10" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">LIVE — Your class is in session!</p>
              <p className="text-white/70 text-xs mt-0.5">Your teacher is waiting for you</p>
            </div>
          </div>

          {/* Right: Join button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(classroomUrl)}
            className="flex-shrink-0 px-4 py-2 rounded-xl bg-white text-red-600 font-bold text-sm shadow-md hover:shadow-lg transition-shadow"
          >
            Join Now →
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
