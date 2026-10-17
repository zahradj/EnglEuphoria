// Loads the deck script of an Academy library lesson by its library id (code-split: a lesson's script is fetched only when it is opened).
// All lessons were removed on 2026-10-17 for the player v2 rebuild (docs/academy-player-v2-plan.md); new lessons register here.
import type { DeckScript } from './types';

const LOADERS: Record<string, () => Promise<DeckScript>> = {};

export const hasDeckScript = (id: string): boolean => id in LOADERS;
export const loadDeckScript = (id: string): Promise<DeckScript> | null => (LOADERS[id] ? LOADERS[id]() : null);
