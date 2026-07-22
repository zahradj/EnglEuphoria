import { Mic } from 'lucide-react';
import type { SpeakingBraveryReward } from '@/gamification/types';

interface SpeakingBraveryBadgeProps {
  reward: SpeakingBraveryReward;
}

/**
 * Visual badge for speaking BRAVERY — celebrates the attempt, not the score.
 * Used at the end of a speaking activity, alongside pronunciation accuracy feedback.
 */
export function SpeakingBraveryBadge({ reward }: SpeakingBraveryBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1.5">
      <Mic className="h-3.5 w-3.5" />
      <span className="text-xs font-semibold">{reward.message}</span>
      {reward.xp > 0 && (
        <span className="text-[10px] font-bold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
          +{reward.xp} XP
        </span>
      )}
    </div>
  );
}
