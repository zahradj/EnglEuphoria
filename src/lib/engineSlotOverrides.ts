/**
 * Teacher override for Language Engine Slot rotation.
 *
 * Mirrors vocabGamesOverrides. Deterministic Story→Escape→Detective→Hidden
 * rotation remains the default; teachers can pin a preferred engine per
 * unit / lesson scope. Stored in localStorage.
 *
 * Downstream: engineSlotInjector.buildLanguageEngineSlotSlide honors the
 * pinned engineType when passed. Validators still enforce hub × CEFR gates
 * so an override that violates eligibility is treated as advisory only.
 */

import type { LanguageEngineSlotType } from './engineSlotInjector';

const KEY = 'language-engine:overrides:v1';

type Store = Record<string, LanguageEngineSlotType>;

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

export function pinEngine(scopeId: string, engine: LanguageEngineSlotType) {
  if (!scopeId) return;
  const s = read();
  s[scopeId] = engine;
  write(s);
}

export function unpinEngine(scopeId: string) {
  if (!scopeId) return;
  const s = read();
  delete s[scopeId];
  write(s);
}

export function getPinnedEngine(
  scopeId?: string | null,
): LanguageEngineSlotType | null {
  if (!scopeId) return null;
  const s = read();
  return s[scopeId] ?? null;
}

export function listEngineOverrides(): Array<{
  scopeId: string;
  engine: LanguageEngineSlotType;
}> {
  const s = read();
  return Object.entries(s).map(([scopeId, engine]) => ({ scopeId, engine }));
}
