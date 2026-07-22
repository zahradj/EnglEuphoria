import { useState, useCallback } from 'react';

interface FallingLeafData {
  id: string;
  startPos: { x: number; y: number };
  type: '🍃' | '🍂';
  delay: number;
}

export const useTreePhysics = () => {
  const [fallingLeaves, setFallingLeaves] = useState<FallingLeafData[]>([]);

  const triggerLeafFall = useCallback((count: number, containerRef: HTMLElement | null) => {
    if (!containerRef) return;

    const rect = containerRef.getBoundingClientRect();
    const newLeaves: FallingLeafData[] = [];

    for (let i = 0; i < count; i++) {
      // Random position from tree canopy area
      const x = rect.width * 0.3 + Math.random() * rect.width * 0.4;
      const y = rect.height * 0.2 + Math.random() * rect.height * 0.3;

      newLeaves.push({
        id: `leaf-${Date.now()}-${i}`,
        startPos: { x, y },
        type: Math.random() > 0.5 ? '🍃' : '🍂',
        delay: i * 0.2,
      });
    }

    setFallingLeaves((prev) => [...prev, ...newLeaves]);
  }, []);

  const handleLeafLanded = useCallback((leafId: string) => {
    setFallingLeaves((prev) => prev.filter((leaf) => leaf.id !== leafId));
  }, []);

  const getWindStrength = (tier: string): 'calm' | 'breeze' | 'strong' => {
    if (tier === 'blooming_mentor') return 'calm';
    if (tier === 'healthy_educator') return 'breeze';
    return 'strong';
  };

  return {
    fallingLeaves,
    triggerLeafFall,
    handleLeafLanded,
    getWindStrength,
  };
};
