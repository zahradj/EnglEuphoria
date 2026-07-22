import React from 'react';
import { motion } from 'framer-motion';
import { Star, Lock, Play, Sparkles } from 'lucide-react';

interface LevelNodeProps {
  id: string;
  number: number;
  title: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  position: { x: number; y: number };
  onClick?: () => void;
  theme?: 'jungle' | 'space' | 'underwater';
  score?: number;
  isNew?: boolean;
  zoneName?: string;
}

export const LevelNode: React.FC<LevelNodeProps> = ({
  id,
  number,
  title,
  isCompleted,
  isCurrent,
  isLocked,
  position,
  onClick,
  theme = 'jungle',
  score,
  isNew = false,
  zoneName,
}) => {
  // Theme-specific colors
  const themeColors = {
    jungle: {
      completed: 'from-yellow-400 to-amber-500',
      current: 'from-green-400 to-emerald-500',
      locked: 'from-gray-400 to-gray-500',
      glow: 'shadow-yellow-400/50',
    },
    space: {
      completed: 'from-purple-400 to-pink-500',
      current: 'from-cyan-400 to-blue-500',
      locked: 'from-gray-600 to-gray-700',
      glow: 'shadow-purple-400/50',
    },
    underwater: {
      completed: 'from-teal-400 to-cyan-500',
      current: 'from-blue-400 to-indigo-500',
      locked: 'from-slate-500 to-slate-600',
      glow: 'shadow-teal-400/50',
    },
  };

  const colors = themeColors[theme];
  
  const getNodeStyle = () => {
    if (isCompleted) {
      return `bg-gradient-to-br ${colors.completed} ${colors.glow}`;
    }
    if (isCurrent) {
      return `bg-gradient-to-br ${colors.current} animate-pulse-glow`;
    }
    return `bg-gradient-to-br ${colors.locked}`;
  };

  const getIcon = () => {
    if (isCompleted) {
      return <Star className="w-8 h-8 text-white fill-white drop-shadow-lg" />;
    }
    if (isCurrent) {
      return <Play className="w-8 h-8 text-white fill-white drop-shadow-lg" />;
    }
    return <Lock className="w-6 h-6 text-white/70" />;
  };

  // Calculate stars based on score (3 stars for 80%+, 2 for 60%+, 1 for less)
  const getStarRating = () => {
    if (!isCompleted || score === undefined) return 0;
    if (score >= 80) return 3;
    if (score >= 60) return 2;
    return 1;
  };

  const starRating = getStarRating();

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 200, 
        damping: 15,
        delay: number * 0.08 
      }}
      style={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      className="z-10"
    >
      <motion.button
        onClick={!isLocked ? onClick : undefined}
        whileHover={!isLocked ? { scale: 1.15 } : {}}
        whileTap={!isLocked ? { scale: 0.95 } : {}}
        className={`
          relative w-20 h-20 md:w-24 md:h-24 rounded-full 
          ${getNodeStyle()}
          flex items-center justify-center
          shadow-lg transition-all duration-300
          ${!isLocked ? 'cursor-pointer hover:shadow-2xl' : 'cursor-not-allowed'}
          ${isCurrent ? 'ring-4 ring-white ring-offset-4 ring-offset-transparent' : ''}
        `}
        disabled={isLocked}
      >
        {/* Inner circle decoration */}
        <div className="absolute inset-2 rounded-full bg-white/20 flex items-center justify-center">
          {getIcon()}
        </div>
        
        {/* Level number badge */}
        <div className={`
          absolute -top-2 -right-2 w-8 h-8 rounded-full 
          flex items-center justify-center text-sm font-bold
          ${isCompleted ? 'bg-white text-amber-600' : 
            isCurrent ? 'bg-white text-emerald-600' : 
            'bg-gray-300 text-gray-600'}
          shadow-md
        `}>
          {number}
        </div>

        {/* NEW badge for freshly unlocked */}
        {isCurrent && isNew && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [-5, 5, -5] }}
            transition={{ rotate: { duration: 0.5, repeat: Infinity } }}
            className="absolute -top-4 -left-4 bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            NEW
          </motion.div>
        )}
        
        {/* Current level indicator */}
        {isCurrent && !isNew && (
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -top-10 left-1/2 -translate-x-1/2"
          >
            <div className="bg-white px-3 py-1 rounded-full shadow-lg text-sm font-bold text-emerald-600 whitespace-nowrap">
              Play Now!
            </div>
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white mx-auto" />
          </motion.div>
        )}

        {/* Star rating for completed lessons */}
        {isCompleted && starRating > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-0.5"
          >
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= starRating
                    ? 'text-yellow-400 fill-yellow-400 drop-shadow'
                    : 'text-gray-300 fill-gray-300'
                }`}
              />
            ))}
          </motion.div>
        )}
      </motion.button>
      
      {/* Title label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: number * 0.08 + 0.2 }}
        className={`
          mt-3 text-center text-sm md:text-base font-bold
          ${isLocked ? 'text-gray-400' : 'text-white drop-shadow-lg'}
          max-w-[100px] truncate
        `}
      >
        {isLocked ? '???' : title}
      </motion.div>

      {/* Zone name badge */}
      {zoneName && !isLocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: number * 0.08 + 0.4, type: 'spring' }}
          className="mt-1 px-3 py-0.5 rounded-full bg-white/80 backdrop-blur text-xs font-bold text-purple-700 shadow-sm whitespace-nowrap"
          style={{ fontFamily: "'Fredoka', cursive" }}
        >
          {zoneName}
        </motion.div>
      )}
    </motion.div>
  );
};
