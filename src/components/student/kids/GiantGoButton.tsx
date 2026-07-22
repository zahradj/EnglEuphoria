import React from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles } from 'lucide-react';

interface GiantGoButtonProps {
  onClick?: () => void;
  lessonTitle?: string;
  disabled?: boolean;
}

export const GiantGoButton: React.FC<GiantGoButtonProps> = ({
  onClick,
  lessonTitle = 'Next Adventure',
  disabled = false,
}) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 200, 
        damping: 15,
        delay: 0.5 
      }}
      className="fixed bottom-28 right-6 md:bottom-32 md:right-10 z-40"
    >
      {/* Outer glow ring */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.2, 0.5],
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 blur-xl"
        style={{ transform: 'scale(1.3)' }}
      />
      
      {/* Button container */}
      <motion.button
        onClick={!disabled ? onClick : undefined}
        disabled={disabled}
        whileHover={!disabled ? { scale: 1.1 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        className={`
          relative w-24 h-24 md:w-32 md:h-32 rounded-full
          bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500
          flex flex-col items-center justify-center
          shadow-2xl transition-all duration-300
          ${!disabled 
            ? 'cursor-pointer hover:shadow-green-500/50 animate-pulse-glow' 
            : 'opacity-50 cursor-not-allowed'}
          border-4 border-white/50
        `}
      >
        {/* Sparkle decorations */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        >
          <Sparkles className="absolute top-1 right-3 w-4 h-4 text-yellow-300" />
          <Sparkles className="absolute bottom-3 left-1 w-3 h-3 text-yellow-300" />
          <Sparkles className="absolute top-1/2 -left-1 w-3 h-3 text-yellow-300" />
        </motion.div>
        
        {/* Play icon */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Play className="w-10 h-10 md:w-14 md:h-14 text-white fill-white drop-shadow-lg" />
        </motion.div>
        
        {/* GO! text */}
        <span 
          className="text-xl md:text-2xl font-black text-white drop-shadow-lg"
          style={{ fontFamily: "'Fredoka', cursive" }}
        >
          GO!
        </span>
      </motion.button>
      
      {/* Lesson title tooltip */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="absolute right-full mr-4 top-1/2 -translate-y-1/2 hidden md:block"
      >
        <div className="bg-white rounded-2xl px-4 py-2 shadow-lg border-2 border-green-200 max-w-[200px]">
          <p className="text-sm text-gray-600">Continue with:</p>
          <p className="font-bold text-green-700 truncate" style={{ fontFamily: "'Fredoka', cursive" }}>
            "{lessonTitle}"
          </p>
        </div>
        {/* Arrow pointing to button */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
          <div className="w-0 h-0 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-white" />
        </div>
      </motion.div>
    </motion.div>
  );
};
