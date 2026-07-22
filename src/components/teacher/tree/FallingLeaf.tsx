import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface FallingLeafProps {
  startPosition: { x: number; y: number };
  leafType: '🍃' | '🍂';
  onComplete: () => void;
  delay?: number;
}

export const FallingLeaf = ({ 
  startPosition, 
  leafType, 
  onComplete, 
  delay = 0 
}: FallingLeafProps) => {
  const [windForce] = useState(() => Math.random() * 40 - 20);
  const [rotationSpeed] = useState(() => 180 + Math.random() * 360);
  
  return (
    <motion.div
      className="absolute pointer-events-none text-2xl z-50"
      style={{
        left: startPosition.x,
        top: startPosition.y,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
      }}
      initial={{ opacity: 1, scale: 1, rotate: 0 }}
      animate={{
        y: [0, 50, 150, 250, 400, 500],
        x: [
          0,
          windForce * 0.5,
          windForce * -0.3,
          windForce * 0.7,
          windForce * -0.2,
          windForce * 0.4
        ],
        rotate: [0, rotationSpeed * 0.5, rotationSpeed, rotationSpeed * 1.5, rotationSpeed * 2],
        scale: [1, 0.95, 0.85, 0.7, 0.5, 0.3],
        opacity: [1, 1, 0.9, 0.7, 0.4, 0],
      }}
      transition={{
        duration: 4 + Math.random() * 2,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
        times: [0, 0.15, 0.4, 0.65, 0.85, 1]
      }}
      onAnimationComplete={onComplete}
    >
      {leafType}
    </motion.div>
  );
};
