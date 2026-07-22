import type { Hub } from './types';

export interface EscapeHubProfile {
  doors: number;
  allowed_kinds: Array<'unscramble' | 'cloze' | 'order' | 'odd_one_out' | 'riddle'>;
  max_tokens_per_puzzle: number;
}

export const ESCAPE_HUB_PROFILES: Record<Hub, EscapeHubProfile> = {
  playground: { doors: 3, allowed_kinds: ['unscramble', 'cloze', 'odd_one_out'],                       max_tokens_per_puzzle: 5 },
  academy:    { doors: 4, allowed_kinds: ['unscramble', 'cloze', 'order', 'odd_one_out', 'riddle'],    max_tokens_per_puzzle: 8 },
  success:    { doors: 5, allowed_kinds: ['cloze', 'order', 'odd_one_out', 'riddle'],                  max_tokens_per_puzzle: 12 },
};
