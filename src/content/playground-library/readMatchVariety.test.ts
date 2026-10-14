import { describe, expect, it } from 'vitest';
import * as WT from './welcome-town/scenes';
import * as JA from './jungle-adventure/scenes';
import * as SM from './space-mission/scenes';
import * as FF from './food-festival/scenes';
import * as MC from './magic-castle/scenes';
// Same list as PICTURE_MATCH_LOOKS in PictureMatchScene.tsx (not imported: the component pulls in the Supabase client).
const PICTURE_MATCH_LOOKS = ['cards', 'frames', 'polaroids', 'chalk'];

/* Owner 2026-10-14: "change the design of the games to prevent repetition — make it a rule." The A1 Read and Match
 * (`picture-match`) has four designs; a lesson's first Read and Match must look different from the one in the lesson
 * right before it and from the same lesson of the unit before, and two in one lesson differ from each other.
 * Rule: CLAUDE.md "Vary the design of a repeated game". Designs: PictureMatchScene.tsx. */
type AnyScene = { id: string; kind: string; look?: string };
const lessons = new Map<string, AnyScene[]>();
for (const mod of [WT, JA, SM, FF, MC] as unknown as Record<string, unknown>[]) {
  for (const [name, v] of Object.entries(mod)) {
    if (!Array.isArray(v)) continue;
    const m = /^LESSON_A1U(\d+)L(\d+)_SCENES$/.exec(name) ?? (mod === (WT as unknown) ? /^LESSON_()(\d+)_SCENES$/.exec(name) : null);
    if (m) lessons.set(`${Number(m[1] || 1)}-${Number(m[2])}`, v as AnyScene[]);
  }
}
const matches = (u: number, l: number) => (lessons.get(`${u}-${l}`) ?? []).filter((s) => s.kind === 'picture-match');
const keys = [...lessons.keys()].filter((k) => { const [u, l] = k.split('-').map(Number); return matches(u, l).length > 0; });

describe('Read and Match: the design varies between neighbouring lessons', () => {
  it('is used in A1 lessons', () => { expect(keys.length).toBeGreaterThan(8); });
  it.each(keys)('U%s: every Read and Match names a known design, and they differ from the neighbours', (k) => {
    const [u, l] = k.split('-').map(Number);
    const mine = matches(u, l);
    for (const s of mine) expect(PICTURE_MATCH_LOOKS, `${s.id}: set look`).toContain(s.look);
    expect(new Set(mine.map((s) => s.look)).size, 'two Read and Match pages in one lesson share a design').toBe(mine.length);
    const before = matches(u, l - 1)[0]?.look;
    const lastUnit = matches(u - 1, l)[0]?.look;
    if (before) expect(mine[0].look, `same design as U${u}L${l - 1}`).not.toBe(before);
    if (lastUnit) expect(mine[0].look, `same design as U${u - 1}L${l}`).not.toBe(lastUnit);
  });
});
