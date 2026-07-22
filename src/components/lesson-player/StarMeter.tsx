/**
 * StarMeter — 3-Star "Forgiving Gamification" feedback display.
 *
 * Pedagogy:
 *  • Every interactive slide starts with 3 GOLDEN stars.
 *  • Each wrong answer turns one gold star → grey (min 1, students always pass).
 *  • The remaining stars are the slide's earned XP multiplier.
 *
 * Visuals: flat gold fill (#FFC107) for active, soft grey (#cbd5e1) for lost.
 * No 3D / bevels (per the platform's Flat 2.0 design constraint).
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface StarMeterProps {
  /** Current stars remaining (1-3). */
  stars: number;
  /** Optional total — defaults to 3. */
  total?: number;
  size?: number;
  className?: string;
}

export const StarMeter: React.FC<StarMeterProps> = ({
  stars,
  total = 3,
  size = 28,
  className = '',
}) => {
  const safe = Math.max(0, Math.min(total, stars));
  return (
    <div
      role="img"
      aria-label={`${safe} of ${total} stars remaining`}
      className={`flex items-center justify-center gap-1.5 ${className}`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const earned = i < safe;
        return (
          <motion.span
            key={i}
            initial={false}
            animate={
              earned
                ? { scale: [1, 1.18, 1], rotate: [0, -6, 0] }
                : { scale: [1, 0.85, 1], rotate: [0, 6, 0] }
            }
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <Star
              size={size}
              strokeWidth={2}
              className="transition-colors"
              fill={earned ? '#FFC107' : 'transparent'}
              color={earned ? '#FFC107' : '#94a3b8'}
              aria-hidden
            />
          </motion.span>
        );
      })}
    </div>
  );
};

export default StarMeter;
