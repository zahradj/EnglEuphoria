import React from 'react';
import { Star, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlaygroundTopBarProps {
  studentName: string;
  totalStars: number;
  dailyStreak: number;
}

export const PlaygroundTopBar: React.FC<PlaygroundTopBarProps> = ({
  studentName,
  totalStars,
  dailyStreak,
}) => {
  return (
    <div
      className="flex items-center justify-between px-6 py-3 bg-white/60 backdrop-blur rounded-2xl shadow-md border border-pink-200/40"
      style={{ fontFamily: "'Fredoka', cursive" }}
    >
      {/* Greeting */}
      <p className="text-lg font-bold text-purple-800">
        Hi, {studentName}! 👋
      </p>

      <div className="flex items-center gap-4">
        {/* Daily Streak */}
        <motion.div
          className="flex items-center gap-1 bg-orange-100 px-3 py-1.5 rounded-full"
          animate={{ scale: dailyStreak > 0 ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Flame className="w-5 h-5 text-orange-500 fill-orange-400" />
          <span className="text-sm font-bold text-orange-700">{dailyStreak}</span>
        </motion.div>

        {/* Star Balance */}
        <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1.5 rounded-full">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
          <span className="text-sm font-bold text-yellow-700">{totalStars}</span>
        </div>
      </div>
    </div>
  );
};
