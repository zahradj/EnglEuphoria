import { createContext, useContext } from 'react';
import type { Vars } from './types';

/** What a slide can ask of the deck. Every game talks to the deck only through this. */
export interface DeckCtx {
  artBase?: string;
  vars: Vars;
  setVars: (patch: Vars) => void;
  /** call once when the slide is finished: unlocks "Next" */
  done: () => void;
  right: () => void;
  wrong: () => void;
  award: (stamp: string) => void;
  stamps: string[];
  reduced: boolean;
  seed: number;
}
export const DeckContext = createContext<DeckCtx | null>(null);
export const useDeck = (): DeckCtx => {
  const c = useContext(DeckContext);
  if (!c) throw new Error('DeckContext missing');
  return c;
};

/** Small seeded shuffle (mulberry32): the same slide always shuffles the same way, so tests and live classes agree. */
export function shuffled<T>(items: T[], seed: number): T[] {
  const a = [...items];
  let s = seed >>> 0;
  const rnd = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
