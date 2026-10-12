// Loads the deck script of an Academy library lesson by its library id (code-split: a lesson's script is fetched only when it is opened).
import type { DeckScript } from './types';

const LOADERS: Record<string, () => Promise<DeckScript>> = {
  'sign-me-up': async () => (await import('./lessons/signMeUp')).SIGN_ME_UP,
  'fake-or-real': async () => (await import('./lessons/patternLab')).PATTERN_LAB,
};

export const hasDeckScript = (id: string): boolean => id in LOADERS;
export const loadDeckScript = (id: string): Promise<DeckScript> | null => (LOADERS[id] ? LOADERS[id]() : null);
