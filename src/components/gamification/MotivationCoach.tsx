import { Card } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import type { MotivationProfile } from '@/gamification/types';
import { styleEncouragement } from '@/gamification/motivation/encouragementStyler';

interface MotivationCoachProps {
  profile: MotivationProfile;
  baseMessage?: string;
}

/**
 * Personalized encouragement banner. Adapts tone to the learner's
 * motivation profile (anxious → calm, challenge → enthusiastic, etc.).
 */
export function MotivationCoach({ profile, baseMessage = 'You\'re on your way.' }: MotivationCoachProps) {
  const copy = styleEncouragement(baseMessage, profile);
  return (
    <Card className="p-4 bg-card border-border rounded-2xl flex items-start gap-3">
      <div className="rounded-xl bg-primary/10 text-primary p-2">
        <Heart className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
          Your coach
        </div>
        <div className="text-sm text-foreground">{copy}</div>
      </div>
    </Card>
  );
}
