import type { EncouragementStyle, MotivationProfile } from '../types';

/**
 * Returns a personalized encouragement copy variant.
 * Used by CelebrationOverlay, MotivationCoach, and mission encouragementCopy.
 */
export function styleEncouragement(
  baseMessage: string,
  profile: MotivationProfile,
): string {
  return wrap(baseMessage, profile.encouragementStyle);
}

function wrap(msg: string, style: EncouragementStyle): string {
  switch (style) {
    case 'calm': return `It's okay. ${msg}`;
    case 'enthusiastic': return `Yes! ${msg}`;
    case 'professional': return msg;
    case 'playful': return `Woohoo — ${msg}`;
    case 'supportive':
    default: return msg;
  }
}
