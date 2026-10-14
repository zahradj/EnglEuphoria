import { describe, expect, it } from 'vitest';
import * as U from './unit1/scenes';

/* Owner 2026-10-14: "change the design of the games to prevent repetition — make it a rule." A game that comes in
 * many lessons (Listen and Match is in 45) must have several designs (`look`), and a lesson's design must differ from
 * the lesson right before it and from the same lesson of the unit before (the two a child met most recently).
 * Rule: CLAUDE.md "Vary the design of a repeated game"; blueprint §3f+. Designs: ListenMatchScene.tsx. */
type AnyScene = { id: string; kind: string; look?: string; scene?: AnyScene };
const mod = U as unknown as Record<string, AnyScene[]>;
const lessons: { u: number; l: number; name: string; scenes: AnyScene[] }[] = [];
for (const name of Object.keys(mod)) {
  let m = /^LESSON_U(\d+)L(\d+)_SCENES$/.exec(name);
  if (m) lessons.push({ u: Number(m[1]), l: Number(m[2]), name, scenes: mod[name] });
  m = /^LESSON_(\d)_SCENES$/.exec(name);
  if (m) lessons.push({ u: 1, l: Number(m[1]), name, scenes: mod[name] });
}
const lookOf = (u: number, l: number) => {
  const les = lessons.find((x) => x.u === u && x.l === l);
  const sc = les?.scenes.find((s) => (s.kind === 'prea1' ? s.scene?.kind : s.kind) === 'listen-match');
  return sc ? ((sc.kind === 'prea1' ? sc.scene : sc)?.look ?? 'cards') : undefined;
};

describe('Listen and Match: the design varies (no two neighbouring lessons look the same)', () => {
  const withGame = lessons.filter((x) => lookOf(x.u, x.l));
  it('exists in lessons', () => { expect(withGame.length).toBeGreaterThan(30); });
  it.each(withGame.map((x) => [x.name, x.u, x.l] as const))('%s names its design', (_n, u, l) => {
    const sc = lessons.find((x) => x.u === u && x.l === l)!.scenes.find((s) => (s.kind === 'prea1' ? s.scene?.kind : s.kind) === 'listen-match')!;
    expect((sc.kind === 'prea1' ? sc.scene : sc)?.look, 'set look: cards | balloons | doors | lilypads').toBeTruthy();
  });
  it.each(withGame.map((x) => [x.name, x.u, x.l] as const))('%s differs from the lesson before and from the same lesson of the unit before', (_n, u, l) => {
    const mine = lookOf(u, l);
    const before = lookOf(u, l - 1);
    const lastUnit = lookOf(u - 1, l);
    if (before) expect(mine, `same design as U${u}L${l - 1}`).not.toBe(before);
    if (lastUnit) expect(mine, `same design as U${u - 1}L${l}`).not.toBe(lastUnit);
  });
});

/* Owner 2026-10-13: "every time new words are shown, a matching activity follows" — Pre-A1 listens and matches. Every
 * Pre-A1 lesson that teaches words on a listen-repeat-cards page must have a Listen and Match. These five still wait
 * for pictures a non-reader can tell apart by sound alone (place pictures for in/on/under, body-part close-ups, shoe
 * colours, house questions, the sea story); take a lesson off this list when its pictures exist. */
const WAITING_FOR_PICTURES = new Set(['2-5', '3-5', '4-1', '6-5', '9-5']);
describe('Pre-A1: a Listen and Match follows the words', () => {
  const kindOf = (s: AnyScene) => (s.kind === 'prea1' ? s.scene?.kind : s.kind);
  const teaching = lessons.filter((x) => x.l <= 6 && x.scenes.some((s) => kindOf(s) === 'listen-repeat-cards'));
  it('finds the teaching lessons', () => { expect(teaching.length).toBeGreaterThan(40); });
  it.each(teaching.map((x) => [x.name, x.u, x.l] as const))('%s has a Listen and Match', (_n, u, l) => {
    const has = !!lookOf(u, l);
    if (WAITING_FOR_PICTURES.has(`${u}-${l}`)) return;
    expect(has, `U${u}L${l}: add a Listen and Match after the word page`).toBe(true);
  });
});
