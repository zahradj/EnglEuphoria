// Playground Rewards — Phase 6 thin layer on top of runGamification().
// Pure data + small helpers. Hooks into existing gamification XP/streaks;
// does NOT introduce a parallel XP system.

export type RewardKind =
  | 'xp_burst'
  | 'sticker_drop'
  | 'star_meter'
  | 'confetti'
  | 'retry_encouragement';

export interface RewardEvent {
  kind: RewardKind;
  message: string;          // student-facing copy
  xp?: number;              // forwarded to gamification engine
  sticker_id?: string;
}

export const RETRY_COPY_BANK = [
  'Great try! Tap to try once more.',
  'So close! One more go.',
  'Almost! Listen and try again.',
  'Brave attempt! Let’s try together.',
  'You’re close — try slowly this time.',
  'Nice effort! Take a breath and try again.',
];

export const CELEBRATION_COPY_BANK = [
  'You did it!',
  'Beautiful work!',
  'Amazing — keep going!',
  'You’re on fire today!',
  'Look at you go!',
  'Pip is proud of you!',
];

/** Pick a deterministic copy line based on attempt index. */
export function pickRetryCopy(attemptIndex: number): string {
  return RETRY_COPY_BANK[attemptIndex % RETRY_COPY_BANK.length];
}

export function pickCelebrationCopy(slideIndex: number): string {
  return CELEBRATION_COPY_BANK[slideIndex % CELEBRATION_COPY_BANK.length];
}

/**
 * Build a reward event for the renderer. The XP value is advisory — the
 * gamification engine is the source of truth and applies anti-farming caps.
 */
export function buildReward(kind: RewardKind, opts: { slideIndex?: number; attempt?: number; sticker_id?: string } = {}): RewardEvent {
  switch (kind) {
    case 'xp_burst':
      return { kind, message: '+10 XP', xp: 10 };
    case 'sticker_drop':
      return { kind, message: 'New sticker unlocked!', sticker_id: opts.sticker_id };
    case 'star_meter':
      return { kind, message: 'Star meter +1' };
    case 'confetti':
      return { kind, message: pickCelebrationCopy(opts.slideIndex ?? 0) };
    case 'retry_encouragement':
      return { kind, message: pickRetryCopy(opts.attempt ?? 0) };
  }
}
