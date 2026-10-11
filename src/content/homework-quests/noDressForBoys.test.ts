import { describe, expect, it } from 'vitest';
import { HOMEWORK_QUESTS } from './registry';
import * as unit1 from '../playground-library/unit1/scenes';

/** Owner, 2026-10-11: "Don't dress males in females' clothes." Pip and Leo are boys: no dress-up game may give
 *  them a dress (no dress piece, never asked to put one on). */
const BOYS = ['pip', 'leo'];
const GIRL_ONLY = ['dress', 'skirt'];

describe('boys never wear girls’ clothes', () => {
  it('homework Dress Up levels give boys no dress or skirt', () => {
    for (const q of Object.values(HOMEWORK_QUESTS)) for (const l of q.levels) {
      if (l.kind !== 'dress-up') continue;
      l.friends.forEach((f, fi) => {
        if (!BOYS.includes(f.who)) return;
        for (const g of GIRL_ONLY) expect(f.layers[g], `${q.id}: ${f.name} has a ${g}`).toBeUndefined();
        for (const r of l.rounds) if (r.friend === fi) expect(GIRL_ONLY, `${q.id}: ${f.name} asks for a ${r.item}`).not.toContain(r.item);
      });
    }
  });
  it('lesson dress-up studios never ask a boy for a dress or skirt', () => {
    for (const [name, v] of Object.entries(unit1)) {
      if (!name.endsWith('_SCENES') || !Array.isArray(v)) continue;
      for (const s of v as { kind: string }[]) {
        if (s.kind !== 'dress-studio') continue;
        const sc = s as unknown as { pieces: { id: string }[]; rounds: { friend: string; piece: number }[] };
        sc.rounds.forEach((r, ri) => {
          if (BOYS.includes(r.friend)) expect(GIRL_ONLY, `${name} round ${ri + 1}: ${r.friend} asks for a ${sc.pieces[r.piece].id}`).not.toContain(sc.pieces[r.piece].id);
        });
      }
    }
  });
  it('lesson fashion shows never put a dress or skirt on a boy', () => {
    for (const [name, v] of Object.entries(unit1)) {
      if (!name.endsWith('_SCENES') || !Array.isArray(v)) continue;
      for (const s of v as { kind: string }[]) {
        if (s.kind !== 'wearing-show') continue;
        const sc = s as unknown as { cast: string[]; rounds: { outfits: string[][] }[] };
        sc.rounds.forEach((r, ri) => r.outfits.forEach((o, i) => {
          if (BOYS.includes(sc.cast[i])) for (const g of GIRL_ONLY) expect(o, `${name} round ${ri + 1}: ${sc.cast[i]} wears a ${g}`).not.toContain(g);
        }));
      }
    }
  });
  it('lesson Put It On! games never put a dress or skirt on a boy', () => {
    for (const [name, v] of Object.entries(unit1)) {
      if (!name.endsWith('_SCENES') || !Array.isArray(v)) continue;
      for (const s of v as { kind: string }[]) {
        if (s.kind !== 'put-on') continue;
        const sc = s as unknown as { dolls: { who: string }[]; clothes: { word: string }[]; rounds: { doll: number; item: number }[] };
        for (const r of sc.rounds) {
          if (!BOYS.includes(sc.dolls[r.doll]?.who)) continue;
          expect(GIRL_ONLY, `${name}: ${sc.dolls[r.doll].who} gets a ${sc.clothes[r.item]?.word}`).not.toContain(sc.clothes[r.item]?.word);
        }
      }
    }
  });
});
