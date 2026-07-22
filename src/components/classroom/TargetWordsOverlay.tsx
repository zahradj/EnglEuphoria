import React, { useState } from 'react';
import { useIdleOpacity } from '@/hooks/useIdleOpacity';

interface TargetWordsOverlayProps {
  sessionContext: Record<string, any>;
  isTeacher?: boolean;
}

const getTargetWords = (ctx: Record<string, any>): string[] => {
  const level = ctx?.level || 'playground';
  if (level === 'playground') return ['Animals', 'Colors', 'Numbers'];
  if (level === 'academy') return ['Furthermore', 'However', 'Nevertheless'];
  return ['Synergy', 'Leverage', 'Benchmark'];
};

export const TargetWordsOverlay: React.FC<TargetWordsOverlayProps> = ({
  sessionContext,
  isTeacher = false
}) => {
  const words = getTargetWords(sessionContext);
  const [covered, setCovered] = useState<Set<number>>(new Set());
  const idle = useIdleOpacity({ idleTimeout: 5000, idleOpacity: 0.15 });

  const handleClick = (index: number) => {
    if (!isTeacher) return;
    setCovered(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div
      className="absolute top-4 left-4 z-20 flex flex-col gap-1.5"
      style={idle.style}
      onMouseMove={idle.onMouseMove}
      onMouseEnter={idle.onMouseEnter}
    >
      {words.map((word, i) => (
        <button
          key={i}
          onClick={() => handleClick(i)}
          className={`px-3 py-1 rounded-full text-xs font-medium text-white backdrop-blur-sm transition-all ${
            covered.has(i)
              ? 'bg-emerald-500/40 line-through opacity-60'
              : 'bg-black/30 hover:bg-black/40'
          } ${isTeacher ? 'cursor-pointer' : 'cursor-default'}`}
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
        >
          {word}
        </button>
      ))}
    </div>
  );
};
