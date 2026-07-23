// Unit 1 phonics mastery tracker + lightweight analytics buffer.
// Client-only (uses localStorage + window). Ported verbatim from the source project.

export const UNIT1_PHONICS = ['H', 'M', 'N', 'W', 'S', 'A', 'B', 'T'] as const;
export type PhonicLetter = (typeof UNIT1_PHONICS)[number];

const MASTERY_KEY = 'pg.unit1.mastery.v1';
const EVENTS_KEY = 'pg.unit1.events.v1';
const MAX_EVENTS = 500;

export type MicroCheckEvent = {
  ts: number;
  sceneId: string;
  lesson: number;
  letter: string;
  tappedLetter: string;
  correct: boolean;
  attemptForLetter: number;
  responseTimeMs: number;
};

function safeLS(): Storage | null {
  try { return typeof window !== 'undefined' ? window.localStorage : null; } catch { return null; }
}

function readSet(): Set<string> {
  const ls = safeLS(); if (!ls) return new Set();
  try {
    const raw = ls.getItem(MASTERY_KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(arr.map((s) => s.toUpperCase()));
  } catch { return new Set(); }
}

function writeSet(s: Set<string>) {
  const ls = safeLS(); if (!ls) return;
  try { ls.setItem(MASTERY_KEY, JSON.stringify([...s])); } catch { /* noop */ }
}

export function getMastered(): Set<string> { return readSet(); }

export function markMastered(letter: string) {
  const L = letter.toUpperCase();
  if (!UNIT1_PHONICS.includes(L as PhonicLetter)) return;
  const s = readSet();
  if (s.has(L)) return;
  s.add(L);
  writeSet(s);
  try { window.dispatchEvent(new CustomEvent('pg-mastery-changed')); } catch { /* noop */ }
}

export function resetMastery() {
  writeSet(new Set());
  try { window.dispatchEvent(new CustomEvent('pg-mastery-changed')); } catch { /* noop */ }
}

export function logMicroCheck(ev: MicroCheckEvent) {
  const ls = safeLS();
  try { console.info('[pg-analytics] micro-check', ev); } catch { /* noop */ }
  if (!ls) return;
  try {
    const raw = ls.getItem(EVENTS_KEY);
    const arr: MicroCheckEvent[] = raw ? JSON.parse(raw) : [];
    arr.push(ev);
    if (arr.length > MAX_EVENTS) arr.splice(0, arr.length - MAX_EVENTS);
    ls.setItem(EVENTS_KEY, JSON.stringify(arr));
  } catch { /* noop */ }
  if (ev.correct) markMastered(ev.letter);
}

export function getEvents(): MicroCheckEvent[] {
  const ls = safeLS(); if (!ls) return [];
  try {
    const raw = ls.getItem(EVENTS_KEY);
    return raw ? (JSON.parse(raw) as MicroCheckEvent[]) : [];
  } catch { return []; }
}
