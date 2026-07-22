import React from 'react';
import PipMascot from './PipMascot';
import { useActiveCompanion } from '@/hooks/useActiveCompanion';

export interface ActiveCompanionProps {
  size?: number;
  animation?: 'idle' | 'bounce' | 'wave' | 'jump' | 'celebrate';
  className?: string;
  /** Render the companion's name beneath the avatar. */
  showName?: boolean;
}

/**
 * Dynamic Student Companion.
 * Reads the active companion from the student's profile (with hub-aware
 * fallback) and renders its avatar with the same animations as PipMascot.
 * Use this everywhere we previously rendered a static mascot for a student.
 */
export default function ActiveCompanion({
  size = 80,
  animation = 'idle',
  className = '',
  showName = false,
}: ActiveCompanionProps) {
  const { companion } = useActiveCompanion();
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <PipMascot size={size} animation={animation} dynamic />
      {showName && companion?.name && (
        <span className="mt-1 text-xs font-semibold text-slate-700">{companion.name}</span>
      )}
    </div>
  );
}
