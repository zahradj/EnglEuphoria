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
  /** recorded voices: on/off, and true once the clip list has loaded (so buttons only appear for lines that have a clip) */
  voice: boolean;
  clipsReady: boolean;
  /** true when a recorded clip exists for this line */
  canHear: (who: string, text: string) => boolean;
  /** speak one line (stops the previous one); resolves true if it played, false if silent */
  speak: (who: string, text: string) => Promise<boolean>;
  /** speak lines one after another; a newer call or leaving the slide cancels the rest */
  speakSeq: (lines: { who: string; text: string }[]) => Promise<void>;
  /** this lesson's mistakes so far (slides where the student needed more than one try), most tries first: feeds the Mistake Bank in the Wrap */
  mistakes: { id: string; label: string; wrong: number }[];
  /** the blueprint id of this lesson (e.g. 'B1-S01-E3'): the Season arc's chapter is read from it */
  lessonId: string;
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
