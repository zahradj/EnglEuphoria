import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface GameButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'orange' | 'green' | 'pink' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  showSparkle?: boolean;
  className?: string;
}

const variantStyles = {
  orange: {
    bg: 'bg-gradient-to-b from-[#FFBF00] to-[#FF9F1C]',
    shadow: '0 6px 0 #c2410c',
    shadowActive: '0 2px 0 #c2410c',
  },
  green: {
    bg: 'bg-gradient-to-b from-emerald-400 to-green-500',
    shadow: '0 6px 0 #166534',
    shadowActive: '0 2px 0 #166534',
  },
  pink: {
    bg: 'bg-gradient-to-b from-pink-400 to-rose-500',
    shadow: '0 6px 0 #9f1239',
    shadowActive: '0 2px 0 #9f1239',
  },
  purple: {
    bg: 'bg-gradient-to-b from-purple-400 to-violet-500',
    shadow: '0 6px 0 #5b21b6',
    shadowActive: '0 2px 0 #5b21b6',
  },
};

const sizeStyles = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export const GameButton: React.FC<GameButtonProps> = ({
  onClick,
  children,
  variant = 'orange',
  size = 'md',
  disabled = false,
  showSparkle = false,
  className = '',
}) => {
  const style = variantStyles[variant];

  return (
    <motion.button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98, y: 2 } : {}}
      className={`
        relative rounded-full font-bold text-white
        ${style.bg} ${sizeStyles[size]}
        border-2 border-white/30
        transition-all duration-150
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        boxShadow: style.shadow,
        fontFamily: "'Fredoka', cursive",
      }}
    >
      {/* Top shine effect */}
      <div
        className="absolute inset-0 rounded-full bg-white/20"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 55%)' }}
      />

      <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-md">
        {showSparkle && <Sparkles className="w-4 h-4" />}
        {children}
      </span>
    </motion.button>
  );
};
