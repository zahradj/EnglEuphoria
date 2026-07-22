/**
 * Teacher override for VocabGamesSlot archetype selection.
 *
 * Deterministic selection remains the default; teachers can pin a preferred
 * game per unit or lesson (e.g., "always SoundMatch for phonics unit 3").
 * Stored in localStorage keyed by scope id. Read by VocabGamesSlot at mount.
 *
 * No pedagogical logic here — selector still enforces hub × CEFR eligibility;
 * an override that violates eligibility is ignored downstream.
 */

import type { VocabGameId } from '@/vocab-games/types';

const KEY = 'vocab-games:overrides:v1';

type Store = Record<string, VocabGameId>;

function read(): Store {
  try {
    if (typeof window === 'undefined') return {};
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function write(s: Store) {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* noop */
  }
}

export function pinGame(scopeId: string, game: VocabGameId) {
  if (!scopeId) return;
  const s = read();
  s[scopeId] = game;
  write(s);
}

export function unpinGame(scopeId: string) {
  if (!scopeId) return;
  const s = read();
  delete s[scopeId];
  write(s);
}

export function getPinnedGame(scopeId?: string | null): VocabGameId | null {
  if (!scopeId) return null;
  const s = read();
  return s[scopeId] ?? null;
}

export function listOverrides(): Array<{ scopeId: string; game: VocabGameId }> {
  const s = read();
  return Object.entries(s).map(([scopeId, game]) => ({ scopeId, game }));
}

/**
 * Convenience: pin the compassionate Rescue Round variant for a scope
 * (unit, lesson, or student id). Useful for anxious/sensitive learners
 * where competitive Boss framing may cause disengagement.
 */
export function pinRescueRound(scopeId: string) {
  pinGame(scopeId, 'rescue_round');
}

/** Convenience: pin the competitive Boss Round for a scope. */
export function pinBossRound(scopeId: string) {
  pinGame(scopeId, 'boss_round');
}
