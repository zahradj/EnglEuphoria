// The Academy variety gate (deploy gate): lessons that are not grandfathered must be original: a new main scene, no Season 1 opening, enough different games, no game three times in a row, and a complete profile.
import { describe, expect, it } from 'vitest';
import { LESSON_PROFILES, ROUTINE_KINDS, SEASON1_PATTERN } from '../lessonProfiles';
import { ACADEMY_DECK_LESSONS } from '../lessonRegistry';
import { loadDeckScript } from '../lessonScripts';
import type { DeckScript } from '../types';

const script = async (id: string): Promise<DeckScript> => (await loadDeckScript(id))!;
const mostUsedBg = (s: DeckScript): string => {
  const n: Record<string, number> = {};
  s.slides.forEach((x) => { n[x.bg] = (n[x.bg] ?? 0) + 1; });
  return Object.entries(n).sort((a, b) => b[1] - a[1])[0][0];
};

describe('Academy lesson profiles and the variety gate', () => {
  it('every library lesson has a profile; a grandfathered one says why and what rebuilds it', () => {
    ACADEMY_DECK_LESSONS.forEach((l) => {
      const p = LESSON_PROFILES.find((x) => x.id === l.id);
      expect(p, `profile for ${l.id}`).toBeTruthy();
      if (p) [p.setting, p.mainPlate, p.look, p.frame, p.signature, p.funHook, p.evidence, p.homeMission].forEach((f) => expect(f.length, `${l.id} profile field`).toBeGreaterThan(2));
    });
    LESSON_PROFILES.filter((p) => p.grandfathered).forEach((p) => expect(p.grandfathered!.length).toBeGreaterThan(15));
  });

  for (const p of LESSON_PROFILES.filter((x) => !x.grandfathered)) {
    it(`${p.id} is original: its main scene is its profile's and differs from the lesson before it; no Season 1 opening or games; no game three in a row; at least 5 different games; the signature game is in the deck`, async () => {
      const s = await script(p.id);
      expect(mostUsedBg(s), 'main plate').toBe(p.mainPlate);
      if (p.previous) {
        const prev = await script(p.previous);
        expect(mostUsedBg(s), 'main plate must differ from the previous lesson').not.toBe(mostUsedBg(prev));
        expect(new Set(s.slides.map((x) => x.bg)).size).toBeGreaterThanOrEqual(5);
      }
      const kinds = s.slides.map((x) => x.kind);
      SEASON1_PATTERN.forEach((k) => expect(kinds, `must not use ${k}`).not.toContain(k));
      expect(kinds.slice(0, 4).filter((k) => k === 'brief' || k === 'convo').length, 'Season 1 opening').toBeLessThan(2);
      for (let i = 2; i < kinds.length; i++) expect(!(kinds[i] === kinds[i - 1] && kinds[i] === kinds[i - 2]), `three ${kinds[i]} in a row at ${i}`).toBe(true);
      const games = new Set(kinds.filter((k) => !(ROUTINE_KINDS as readonly string[]).includes(k)));
      expect(games.size, `distinct games: ${[...games].join(', ')}`).toBeGreaterThanOrEqual(5);
      expect(kinds).toContain(p.signature);
    });
  }
});
