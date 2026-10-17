// Student responses on the shortest path through a lesson (Wave 2 metric, owner target: at least 80 per hour for Lesson 2).
// One response = one answer the student gives: an item answered, a speaking turn, a rule ticked, a word chosen for a clue.
// It counts the MINIMUM path (every item right the first time, no hints, no retries), so it never flatters a lesson.
// Not counted: reading, listening, comic and teach pages, the model steps, the lobby. Pure functions (unit-tested).
import type { LessonScript, SceneBase } from '../types';

type Loose = SceneBase & Record<string, unknown>;
const arr = (x: unknown): unknown[] => (Array.isArray(x) ? x : []);
const n = (x: unknown) => arr(x).length;

/** how many responses one scene asks for on the shortest path */
const COUNTERS: Record<string, (s: Loose) => number> = {
  choice: (s) => n(s.questions),
  build: (s) => n(s.items),
  match: (s) => n(s.pairs),
  memory: (s) => n(s.pairs),
  sort: (s) => n(s.items),
  write: (s) => n(s.rows),
  speak: (s) => n(s.turns),
  rule: (s) => n(s.lines),
  hunt: (s) => n(s.targets),
  rapport: (s) => n(s.exchanges),
  boss: (s) => n(s.rounds),
  forge: (s) => n(s.rounds) * 3,
  cipher: (s) => n(s.cards),
  objection: (s) => n(s.evidence),
  wrap: () => 1,
  inspect: (s) => arr(s.batches).reduce<number>((a, b) => a + n((b as { items?: unknown }).items), 0) + (s.finale ? 1 : 0),
  interview: (s) => {
    const personas = n(s.personas); const tiles = n(s.tiles);
    return (s.look === 'lineup' ? Number(s.minAsks ?? 3) : personas * tiles) + 1;
  },
  // Wave 2: a find round = 1 tap; a build round = the new words that must be chosen + 1 send
  finder: (s) => arr(s.grids).reduce<number>((a, g) => {
    const gr = g as { mode?: string; minNewWords?: number };
    return a + (gr.mode === 'build' ? Number(gr.minNewWords ?? 1) + 1 : 1);
  }, 0),
  // a chunk is two picks; then one gap sentence per chunk
  workshop: (s) => n(s.items) * 3,
  // stress pad + accent lane per word, plus the stress pad of an -ed/-ing partner
  beats: (s) => arr(s.items).reduce<number>((a, i) => a + 2 + ((i as { pair?: unknown }).pair ? 1 : 0), 0),
  // forward: marker + verb form; reverse: zone + marker; free: two sentences of marker + verb form
  // On Air: show = one card per exchange; two truths = the follow-up questions asked, the pin and the sentence said
  // Archive: a search-and-pin plus an answer per desk task; Fact-Check: a verdict per card; Red Pen: one rewrite per marked sentence
  archive: (s) => n(s.tasks) * 2,
  factcheck: (s) => n(s.cards),
  redpen: (s) => arr(s.drafts).filter((d) => (d as { marked?: boolean }).marked).length,
  onair: (s) => (s.look === 'twotruths' ? Number(s.minProbes ?? 3) + 2 : n(s.exchanges)),
  switchboard: (s) => arr(s.levels).reduce<number>((a, l) => a + (((l as { mode?: string }).mode === 'free') ? Number((l as { count?: number }).count ?? 2) * 2 : 2), 0),
};

export const responsesOf = (s: SceneBase): number => COUNTERS[s.kind]?.(s as Loose) ?? 0;

/** minimum-path student responses of the whole lesson, and per part (0-7) */
export function lessonResponses(script: LessonScript): { total: number; byPart: number[]; byKind: Record<string, number> } {
  const byPart = Array.from({ length: 8 }, () => 0);
  const byKind: Record<string, number> = {};
  for (const sc of script.scenes) {
    const r = responsesOf(sc);
    byPart[sc.part] += r;
    byKind[sc.kind] = (byKind[sc.kind] ?? 0) + r;
  }
  return { total: byPart.reduce((a, b) => a + b, 0), byPart, byKind };
}
