import type { Hub } from '../types';

// Per-hub theme bans. Matched as case-insensitive substring/word boundary.

export const HUB_THEME_BANS: Record<Hub, RegExp[]> = {
  Playground: [
    /\bdat(e|ing)\b/i,
    /\bromantic\b/i,
    /\balcohol(ic)?\b/i,
    /\bbeer\b/i,
    /\bwine\b/i,
    /\bbar\b(?! ?chart)/i,
    /\bviolen(t|ce)\b/i,
    /\bweapon\b/i,
    /\bgun\b/i,
    /\bmurder\b/i,
    /\btax(es|ation)\b/i,
    /\bmortgage\b/i,
    /\bdivorce\b/i,
  ],
  Academy: [
    /\bbaby talk\b/i,
    /\bgoo[ -]?goo\b/i,
    /\bmurder\b/i,
  ],
  Success: [
    /\bbaby talk\b/i,
    /\bgoo[ -]?goo\b/i,
    /\btoddler\b/i,
    /\bnursery rhym(e|es)\b/i,
    /\bcuddly\b/i,
  ],
};

export const HUB_REQUIRED_REGISTER: Record<Hub, 'playful' | 'identity_safe' | 'professional'> = {
  Playground: 'playful',
  Academy: 'identity_safe',
  Success: 'professional',
};
