// The lesson engine: a pure reducer. The UI never owns lesson logic (plan 2.1). Everything here is testable without React.
import type { SceneResult } from '../types';

export interface EngineState {
  total: number;
  index: number;
  /** highest scene index reached (resume, strip fill) */
  furthest: number;
  /** result per scene id */
  results: Record<string, SceneResult>;
  /** wrong tries per scene id (the Mistake Bank) */
  wrong: Record<string, number>;
  xp: number;
  gems: number;
  paused: boolean;
  /** the scene has reported done: Next is allowed */
  doneIds: string[];
}

export type EngineAction =
  | { type: 'go'; index: number }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'done'; id: string; result?: Partial<SceneResult> }
  | { type: 'wrong'; id: string }
  | { type: 'pause'; on: boolean }
  | { type: 'restore'; state: Partial<Pick<EngineState, 'index' | 'furthest' | 'results' | 'wrong' | 'xp' | 'gems' | 'doneIds'>> };

export const XP_CLEAN = 30;
export const XP_WIN = 20;
export const XP_SEEN = 5;

export const initialState = (total: number): EngineState => ({ total, index: 0, furthest: 0, results: {}, wrong: {}, xp: 0, gems: 0, paused: false, doneIds: [] });

const clamp = (n: number, total: number) => Math.max(0, Math.min(Math.max(total - 1, 0), n));

export function lessonReducer(s: EngineState, a: EngineAction): EngineState {
  switch (a.type) {
    case 'go': {
      const index = clamp(a.index, s.total);
      return { ...s, index, furthest: Math.max(s.furthest, index) };
    }
    case 'next': return lessonReducer(s, { type: 'go', index: s.index + 1 });
    case 'back': return lessonReducer(s, { type: 'go', index: s.index - 1 });
    case 'wrong': return { ...s, wrong: { ...s.wrong, [a.id]: (s.wrong[a.id] ?? 0) + 1 } };
    case 'done': {
      if (s.doneIds.includes(a.id)) return s; // a scene pays out once
      const wrongTries = s.wrong[a.id] ?? 0;
      const won = a.result?.won ?? true;
      const scored = a.result?.score !== undefined;
      const gem = scored && won && wrongTries === 0 && a.result?.gem !== false;
      const result: SceneResult = { won, score: a.result?.score ?? 0, mistakes: a.result?.mistakes ?? [], gem };
      const xp = !scored ? XP_SEEN : won ? (wrongTries === 0 ? XP_CLEAN : XP_WIN) : XP_SEEN;
      return { ...s, results: { ...s.results, [a.id]: result }, xp: s.xp + xp, gems: s.gems + (gem ? 1 : 0), doneIds: [...s.doneIds, a.id] };
    }
    case 'pause': return { ...s, paused: a.on };
    case 'restore': return { ...s, ...a.state, index: clamp(a.state.index ?? s.index, s.total), furthest: clamp(a.state.furthest ?? s.furthest, s.total) };
  }
}

/** The mistakes of this lesson so far, most tries first: feeds the Mistake Bank and the Wrap. */
export const mistakesOf = (s: EngineState, label: (id: string) => string) =>
  Object.entries(s.wrong).filter(([, n]) => n > 0).map(([id, n]) => ({ id, label: label(id), wrong: n })).sort((x, y) => y.wrong - x.wrong);
