import type { Celebration, CelebrationTrigger, MotivationProfile, Hub } from '../types';
import { getHubProfile } from '../hubGamificationProfiles';

export interface CelebrationContext {
  hub: Hub;
  profile: MotivationProfile;
  duringSpeakingTask?: boolean;        // hard gate: never block speaking
  payload: Record<string, unknown>;
}

/**
 * Decide whether and how to fire a celebration for a trigger.
 * Returns null when the celebration should be suppressed.
 */
export function buildCelebration(
  trigger: CelebrationTrigger,
  ctx: CelebrationContext,
): Celebration | null {
  const hub = getHubProfile(ctx.hub);

  // Hard rule: never interrupt active speaking/communication tasks
  if (ctx.duringSpeakingTask) {
    return {
      triggerType: trigger,
      payload: ctx.payload,
      copy: subtleCopy(trigger),
      intensity: 'subtle',
      blocksUI: false,
    };
  }

  // Anxious learners get gentler intensity
  const intensity =
    ctx.profile.profileType === 'anxious'
      ? 'subtle'
      : hub.celebrationStyle === 'animated'
        ? 'high'
        : hub.celebrationStyle === 'modern'
          ? 'medium'
          : 'subtle';

  return {
    triggerType: trigger,
    payload: ctx.payload,
    copy: copyFor(trigger, ctx.profile, ctx.hub),
    intensity,
    blocksUI: intensity === 'high' && hub.celebrationStyle === 'animated',
  };
}

function subtleCopy(t: CelebrationTrigger): string {
  switch (t) {
    case 'speaking_bravery': return 'Nice try.';
    case 'mastery_milestone': return 'Mastery rising.';
    case 'streak_milestone': return 'Streak grows.';
    case 'mission_complete': return 'Mission done.';
    case 'achievement_unlocked': return 'Achievement unlocked.';
    case 'level_up': return 'Level up.';
    case 'comeback': return 'Welcome back.';
  }
}

function copyFor(t: CelebrationTrigger, profile: MotivationProfile, hub: Hub): string {
  const playful = hub === 'playground';
  switch (t) {
    case 'speaking_bravery':
      return playful ? 'You spoke up — superstar move!' : 'Real speaking effort. That\'s how fluency grows.';
    case 'mastery_milestone':
      return playful ? 'You\'ve truly learned it — woohoo!' : 'Mastery reached. You can use this in real conversation.';
    case 'streak_milestone':
      return playful ? 'Streak superhero!' : 'Consistency pays off — your streak grows.';
    case 'mission_complete':
      return playful ? 'Mission complete — amazing!' : 'Mission complete. Real progress.';
    case 'achievement_unlocked':
      return playful ? 'New badge unlocked!' : 'Achievement unlocked — well earned.';
    case 'level_up':
      return playful ? 'Level UP!' : 'You\'ve reached a new level.';
    case 'comeback':
      return profile.profileType === 'anxious'
        ? 'Welcome back. Right where you left off.'
        : 'Welcome back — let\'s keep building.';
  }
}
