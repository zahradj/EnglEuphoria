import { useState, useEffect, useCallback } from 'react';
import { FallingStarEvent } from '@/types/constellation';

interface FallingStarPosition {
  x: number;
  y: number;
  rotation: number;
  opacity: number;
}

export const useConstellationPhysics = (fallingStars: FallingStarEvent[]) => {
  const [positions, setPositions] = useState<Map<string, FallingStarPosition>>(new Map());

  useEffect(() => {
    if (fallingStars.length === 0) return;

    const activeStars = new Map<string, FallingStarPosition>();
    fallingStars.forEach(star => {
      activeStars.set(star.id, {
        x: star.startPosition.x,
        y: star.startPosition.y,
        rotation: 0,
        opacity: 1,
      });
    });
    setPositions(activeStars);

    const startTime = Date.now();
    const duration = 3000; // 3 seconds fall time
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const newPositions = new Map<string, FallingStarPosition>();
      fallingStars.forEach(star => {
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const x = star.startPosition.x + (Math.random() - 0.5) * 50 * progress;
        const y = star.startPosition.y + (100 * easeOut);
        const rotation = progress * 720 + (Math.random() * 360);
        const opacity = Math.max(0, 1 - progress * 1.2);

        newPositions.set(star.id, { x, y, rotation, opacity });
      });

      setPositions(newPositions);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [fallingStars]);

  return positions;
};
