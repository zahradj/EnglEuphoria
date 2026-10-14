// Loads the deck script of an Academy library lesson by its library id (code-split: a lesson's script is fetched only when it is opened).
import type { DeckScript } from './types';

const LOADERS: Record<string, () => Promise<DeckScript>> = {
  'sign-me-up': async () => (await import('./lessons/signMeUp')).SIGN_ME_UP,
  'sign-me-up-2': async () => (await import('./lessons/signMeUp2')).SIGN_ME_UP_2,
  'pa1-s01-e1': async () => (await import('./lessons/pa1s01e1')).PA1_S01_E1,
  'pa1-s02-e1': async () => (await import('./lessons/pa1s02e1')).PA1_S02_E1,
  'free-time-club-1': async () => (await import('./lessons/freeTimeClub1')).FREE_TIME_CLUB_1,
  'free-time-club-2': async () => (await import('./lessons/freeTimeClub2')).FREE_TIME_CLUB_2,
  'fake-or-real': async () => (await import('./lessons/patternLab')).PATTERN_LAB,
};

export const hasDeckScript = (id: string): boolean => id in LOADERS;
export const loadDeckScript = (id: string): Promise<DeckScript> | null => (LOADERS[id] ? LOADERS[id]() : null);
