// Live-classroom helpers for the Academy player (Academy-only; imports nothing from the Playground).
// The whole lesson state (`PlayerState`, engine.ts) is one JSON object ordered by `rev`, so it is what travels over the
// classroom's activity-state channel. A snapshot that arrives over the wire is NEVER trusted: `reconcilePlayerState`
// rebuilds a safe state from it or returns null, so a partial, old or other-lesson snapshot cannot crash the student's screen
// (the same rule as the Playground's `classroom-sync-robustness`).
import type { PlayerState } from './engine';
import type { SceneScript } from './scriptTypes';

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** The scene id the classroom channel tags this lesson's snapshots with (receivers drop snapshots for any other id). */
export const academySyncId = (script: SceneScript) => `academy:${script.id}`;

/** A snapshot from the wire -> a safe PlayerState for `script`, or null when it cannot be one. */
export function reconcilePlayerState(remote: unknown, script: SceneScript): PlayerState | null {
  if (!isObj(remote)) return null;
  const { beatIndex, rev, seed, vars, stage, answers, finished } = remote;
  if (typeof beatIndex !== 'number' || !Number.isInteger(beatIndex) || beatIndex < 0 || beatIndex >= script.beats.length) return null;
  if (typeof rev !== 'number' || !Number.isFinite(rev)) return null;
  if (!isObj(stage) || typeof stage.segment !== 'number' || !isObj(stage.sprites)) return null;
  const bg = isObj(stage.bg) && typeof stage.bg.id === 'string' && typeof stage.bg.alt === 'string' ? { id: stage.bg.id, alt: stage.bg.alt } : null;
  const sprites: PlayerState['stage']['sprites'] = {};
  for (const [who, sp] of Object.entries(stage.sprites)) {
    if (script.cast.includes(who as never) && isObj(sp) && typeof sp.pos === 'string' && typeof sp.expr === 'string') sprites[who as never] = { pos: sp.pos as never, expr: sp.expr as never };
  }
  return {
    beatIndex,
    rev,
    seed: typeof seed === 'number' && Number.isFinite(seed) ? seed : 1,
    vars: isObj(vars) ? (vars as PlayerState['vars']) : {},
    stage: { bg, sprites, segment: stage.segment },
    answers: Array.isArray(answers) ? (answers.filter((a) => isObj(a) && typeof a.correct === 'boolean') as PlayerState['answers']) : [],
    history: [], // never shared: rewinding is the teacher's own local undo
    finished: finished === true,
  };
}

/** The state without its undo history, which is local to each screen and not worth sending. */
export function shareable(s: PlayerState): Omit<PlayerState, 'history'> {
  const { history: _history, ...rest } = s;
  return rest;
}
