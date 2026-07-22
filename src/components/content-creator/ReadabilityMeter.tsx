import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ReadabilityMeterProps {
  text: string;
}

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

function estimateCefrLevel(text: string): { level: string; score: number; label: string } {
  if (!text.trim()) return { level: 'A1', score: 0, label: 'No content' };

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const avgSentenceLen = sentences.length > 0 ? words.length / sentences.length : 0;
  const avgWordLen = words.length > 0 ? words.reduce((a, w) => a + w.length, 0) / words.length : 0;
  const longWords = words.filter(w => w.length > 7).length;
  const longWordRatio = words.length > 0 ? longWords / words.length : 0;

  // Composite score 0-100
  const score = Math.min(100, Math.round(
    avgSentenceLen * 2.5 + avgWordLen * 8 + longWordRatio * 60
  ));

  if (score < 20) return { level: 'A1', score, label: 'Beginner' };
  if (score < 35) return { level: 'A2', score, label: 'Elementary' };
  if (score < 50) return { level: 'B1', score, label: 'Intermediate' };
  if (score < 65) return { level: 'B2', score, label: 'Upper Intermediate' };
  if (score < 80) return { level: 'C1', score, label: 'Advanced' };
  return { level: 'C2', score, label: 'Proficient' };
}

export const ReadabilityMeter: React.FC<ReadabilityMeterProps> = ({ text }) => {
  const { level, score, label } = useMemo(() => estimateCefrLevel(text), [text]);
  const levelIndex = CEFR_LEVELS.indexOf(level as typeof CEFR_LEVELS[number]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Readability</span>
        <span className="font-semibold text-primary">{level} — {label}</span>
      </div>
      <div className="flex gap-1">
        {CEFR_LEVELS.map((l, i) => (
          <div
            key={l}
            className={cn(
              'h-2 flex-1 rounded-full transition-colors',
              i <= levelIndex ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>A1</span>
        <span>C2</span>
      </div>
    </div>
  );
};
