import { useEffect } from 'react';
import { Sparkles, Trophy, Flame, Mic, Star, ArrowUp, HeartHandshake } from 'lucide-react';
import type { Celebration } from '@/gamification/types';

interface CelebrationOverlayProps {
  celebration: Celebration | null;
  onDismiss: () => void;
  /** When true (e.g. during a speaking task), overlay never blocks UI. */
  duringSpeakingTask?: boolean;
}

const ICONS = {
  speaking_bravery: Mic,
  mastery_milestone: Star,
  streak_milestone: Flame,
  mission_complete: Trophy,
  achievement_unlocked: Sparkles,
  level_up: ArrowUp,
  comeback: HeartHandshake,
} as const;

/**
 * Adaptive celebration moment. Intensity comes from the Celebration object.
 * Hard rule: NEVER blocks UI during active speaking/communication tasks.
 */
export function CelebrationOverlay({ celebration, onDismiss, duringSpeakingTask }: CelebrationOverlayProps) {
  useEffect(() => {
    if (!celebration) return;
    const duration = celebration.intensity === 'subtle' ? 1600 : celebration.intensity === 'medium' ? 2500 : 3500;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [celebration, onDismiss]);

  if (!celebration) return null;
  const Icon = ICONS[celebration.triggerType];

  const subtle = celebration.intensity === 'subtle' || duringSpeakingTask;

  if (subtle) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-card border border-border rounded-xl px-4 py-2 shadow-md flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-sm text-foreground">{celebration.copy}</span>
      </div>
    );
  }

  return (
    <div
      className={
        celebration.blocksUI
          ? 'fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-center justify-center'
          : 'fixed top-6 left-1/2 -translate-x-1/2 z-50'
      }
      onClick={onDismiss}
    >
      <div className="bg-card border border-border rounded-2xl px-6 py-5 max-w-sm text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
          <Icon className="h-6 w-6" />
        </div>
        <div className="text-base font-semibold text-foreground">{celebration.copy}</div>
      </div>
    </div>
  );
}
