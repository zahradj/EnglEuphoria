import React from 'react';
import { motion } from 'framer-motion';

interface FallingStarProps {
  icon: string;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
}

export const FallingStar = ({ icon, x, y, rotation, opacity }: FallingStarProps) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        opacity,
        transform: `rotate(${rotation}deg)`,
        filter: 'blur(1px)',
      }}
    >
      <div className="text-4xl drop-shadow-lg">
        {icon}
      </div>
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-yellow-400 to-transparent"
        style={{
          width: '4px',
          height: '40px',
          top: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: opacity * 0.6,
        }}
      />
    </motion.div>
  );
};
