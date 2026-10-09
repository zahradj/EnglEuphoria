// Academy lesson player — pure engine. No React, no browser APIs, no Math.random: everything is deterministic from
// (script, state, event), so the same state can be saved, rewound, or mirrored to the other side of a live lesson.
import { isInteractive, type Beat, type CastName, type Expression, type Position, type SceneScript, type VarValue } from './scriptTypes';

export interface SpriteState {
  pos: Position;
  expr: Expression;
}

export interface StageState {
  bg: { id: string; alt: string } | null;
  sprites: Partial<Record<CastName, SpriteState>>;
  segment: number;
  /** 'story' = full-page acted scene (see the `layout` beat); optional so older snapshots still load */
  layout?: 'normal' | 'story';
}

export interface AnswerRecord {
  beatIndex: number;
  correct: boolean;
}

export interface PlayerState {
  /** index of the interactive beat the player is waiting on */
  beatIndex: number;
  vars: Record<string, VarValue>;
  stage: StageState;
  /** seeded randomness for shuffles (never Math.random in a scene) */
  seed: number;
  /** increments on every change; the live-sync authority uses it to order events */
  rev: number;
  answers: AnswerRecord[];
  /** earlier states for rewind (bounded) */
  history: Snapshot[];
  finished: boolean;
}

type Snapshot = Omit<PlayerState, 'history'>;

export type PlayerEvent =
  | { type: 'next' }
  | { type: 'choose'; index: number }
  | { type: 'answer'; correct: boolean }
  | { type: 'fill'; values: Record<string, VarValue> }
  | { type: 'back' }
  | { type: 'restart' };

const HISTORY_LIMIT = 60;
const MAX_STEPS = 10_000;

/** mulberry32: small, fast, deterministic. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic Fisher-Yates shuffle: both sides of a live lesson compute the same order. */
export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const rnd = mulberry32(seed);
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function labelIndex(script: SceneScript): Record<string, number> {
  const map: Record<string, number> = {};
  script.beats.forEach((b, i) => {
    if (b.t === 'label') map[b.name] = i;
  });
  return map;
}

const emptyStage = (): StageState => ({ bg: null, sprites: {}, segment: 0 });

/** Run the non-interactive beats from `from` until the next interactive beat; returns its index and the updated stage/vars. */
function runUntilStop(script: SceneScript, from: number, stage: StageState, vars: Record<string, VarValue>) {
  const labels = labelIndex(script);
  let i = from;
  const st: StageState = { ...stage, sprites: { ...stage.sprites } };
  const v = { ...vars };
  let steps = 0;
  while (i < script.beats.length) {
    if (++steps > MAX_STEPS) throw new Error('Scene script loops without an interactive beat.');
    const b: Beat = script.beats[i];
    if (isInteractive(b)) return { index: i, stage: st, vars: v };
    switch (b.t) {
      case 'bg':
        st.bg = { id: b.id, alt: b.alt };
        break;
      case 'show':
        st.sprites[b.who] = { pos: b.pos, expr: b.expr };
        break;
      case 'hide':
        delete st.sprites[b.who];
        break;
      case 'segment':
        st.segment = b.index;
        break;
      case 'layout':
        st.layout = b.mode;
        break;
      case 'set':
        v[b.key] = b.value;
        break;
      case 'jump':
        i = labels[b.label] ?? script.beats.length;
        continue;
      case 'if':
        if (v[b.key] === b.equals) {
          i = labels[b.goto] ?? script.beats.length;
          continue;
        }
        break;
      default:
        break; // label
    }
    i += 1;
  }
  // ran off the end: park on the last beat (an 'end' beat should be present; the validator requires it)
  return { index: Math.max(0, script.beats.length - 1), stage: st, vars: v };
}

export function initState(script: SceneScript, seed = 1): PlayerState {
  const r = runUntilStop(script, 0, emptyStage(), {});
  const finished = script.beats[r.index]?.t === 'end';
  return { beatIndex: r.index, vars: r.vars, stage: r.stage, seed, rev: 0, answers: [], history: [], finished };
}

function snapshot(s: PlayerState): Snapshot {
  const { history: _h, ...rest } = s;
  return JSON.parse(JSON.stringify(rest)) as Snapshot;
}

function advance(script: SceneScript, s: PlayerState, toIndex: number, vars: Record<string, VarValue>, answers: AnswerRecord[]): PlayerState {
  const r = runUntilStop(script, toIndex, s.stage, vars);
  const history = [...s.history, snapshot(s)].slice(-HISTORY_LIMIT);
  const finished = script.beats[r.index]?.t === 'end';
  return { ...s, beatIndex: r.index, vars: r.vars, stage: r.stage, answers, history, finished, rev: s.rev + 1 };
}

/** Pure reducer. */
export function step(script: SceneScript, s: PlayerState, e: PlayerEvent): PlayerState {
  const beat = script.beats[s.beatIndex];
  switch (e.type) {
    case 'restart':
      return { ...initState(script, s.seed), rev: s.rev + 1 };
    case 'back': {
      const prev = s.history[s.history.length - 1];
      if (!prev) return s;
      return { ...prev, history: s.history.slice(0, -1), rev: s.rev + 1 };
    }
    case 'answer': {
      // record a correctness result (from choices or widgets) without moving
      return { ...s, answers: [...s.answers, { beatIndex: s.beatIndex, correct: e.correct }], rev: s.rev + 1 };
    }
    case 'fill': {
      // a form / sort result: save the values, then move on
      if (!beat) return s;
      return advance(script, s, s.beatIndex + 1, { ...s.vars, ...e.values }, s.answers);
    }
    case 'choose': {
      if (!beat) return s;
      const options = beat.t === 'choice' ? beat.options : beat.t === 'chat' ? beat.reply?.options : undefined;
      const opt = options?.[e.index];
      if (!opt) return s;
      const vars = { ...s.vars, ...(opt.set ?? {}) };
      const answers = opt.correct === undefined ? s.answers : [...s.answers, { beatIndex: s.beatIndex, correct: opt.correct }];
      const labels = labelIndex(script);
      const to = opt.goto ? labels[opt.goto] ?? s.beatIndex + 1 : s.beatIndex + 1;
      return advance(script, s, to, vars, answers);
    }
    case 'next': {
      if (!beat || beat.t === 'end') return s;
      if (beat.t === 'choice') return s; // a choice needs a choice
      return advance(script, s, s.beatIndex + 1, s.vars, s.answers);
    }
  }
}

/** Lines the student has already passed, newest last (the backlog). */
export function backlog(script: SceneScript, s: PlayerState): { who: string; text: string }[] {
  const seen = new Set<number>();
  for (const h of s.history) seen.add(h.beatIndex);
  return script.beats
    .map((b, i) => ({ b, i }))
    .filter(({ b, i }) => b.t === 'say' && seen.has(i))
    .map(({ b }) => ({ who: (b as Extract<Beat, { t: 'say' }>).who, text: (b as Extract<Beat, { t: 'say' }>).text }));
}

/** Share of answered language questions that were right the first time (null if none answered). */
export function accuracy(s: PlayerState): number | null {
  if (!s.answers.length) return null;
  return s.answers.filter((a) => a.correct).length / s.answers.length;
}

const VAR_DEFAULTS: Record<string, string> = { name: 'friend', family: '—', age: '—', country: '—', hobby: '—' };

/** Fill {key} placeholders in every string of a beat from the student's saved answers. Pure; returns the same beat when nothing changes. */
export function interpolateBeat<T extends Beat>(beat: T, vars: Record<string, VarValue>): T {
  const raw = JSON.stringify(beat);
  if (!raw.includes('{')) return beat;
  const fillOnce = (t: string) => t.replace(/(?<!\{)\{(\w+)\}(?!\})/g, (_m, k: string) => String(vars[k] ?? VAR_DEFAULTS[k] ?? ''));
  const fillText = (t: string) => fillOnce(fillOnce(t)); // two passes: a saved value may itself hold a {placeholder} (the Mission models)
  return JSON.parse(raw, (_k, v) => (typeof v === 'string' ? fillText(v) : v)) as T;
}

/** The event that moves a beat along without the student doing anything (used to catch a late joiner up). */
export function autoEvent(b: Beat): PlayerEvent {
  switch (b.t) {
    case 'choice':
      return { type: 'choose', index: Math.max(0, b.options.findIndex((o) => o.correct !== false)) };
    case 'sort':
      return { type: 'fill', values: { [b.key]: [] } };
    case 'form':
      return { type: 'fill', values: Object.fromEntries(b.fields.map((f) => [f.key, ''])) };
    default:
      return { type: 'next' };
  }
}

/**
 * Live classroom catch-up: replay the lesson from the start, moving each beat along automatically, until it reaches the
 * interactive beat at `index` (or the nearest one after it). Used when a student joins late or reconnects and only the
 * teacher's position (an index) is known. Wrong tries are not recreated; answers and typed values are not recovered.
 */
export function replayTo(script: SceneScript, seed: number, index: number): PlayerState {
  let s = initState(script, seed);
  for (let n = 0; n < 5000 && s.beatIndex < index && !s.finished; n++) {
    const next = step(script, s, autoEvent(script.beats[s.beatIndex]));
    if (next.beatIndex === s.beatIndex && next.rev === s.rev) break;
    s = next;
  }
  return s;
}
