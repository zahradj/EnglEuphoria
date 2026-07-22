import React from 'react';
import { motion } from 'framer-motion';
import logoBlack from '@/assets/logo-black.png';
import logoWhite from '@/assets/logo-white.png';
import { useThemeMode } from '@/hooks/useThemeMode';

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ size = 'md', className = '' }) => {
  const { resolvedTheme } = useThemeMode();
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16', 
    lg: 'w-20 h-20'
  };

  return (
    <motion.div
      className={`relative ${className}`}
      animate={{ 
        y: [0, -8, 0],
        scale: [1, 1.05, 1]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Minimal purple bubble background */}
      <motion.div
        className={`${sizeClasses[size]} rounded-full bg-purple-500/80 shadow-md flex items-center justify-center`}
        animate={{
          boxShadow: [
            "0 4px 20px rgba(147, 51, 234, 0.15)",
            "0 8px 30px rgba(147, 51, 234, 0.2)",
            "0 4px 20px rgba(147, 51, 234, 0.15)"
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Logo image */}
        <img 
          src={resolvedTheme === 'dark' ? logoBlack : logoWhite} 
          alt="Engleuphoria Logo" 
          className="w-3/4 h-3/4 object-contain"
        />
      </motion.div>
      
      {/* Very subtle pulse effect */}
      <motion.div
        className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-purple-400 opacity-10`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.02, 0.1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
};

export default AnimatedLogo;
