import { describe, expect, it } from 'vitest';
import * as WT from './welcome-town/scenes';
import * as JA from './jungle-adventure/scenes';
import * as SM from './space-mission/scenes';
import * as FF from './food-festival/scenes';

/**
 * A1 lessons (owner, 2026-10-13: "A1 lessons can be from 30 to 49 pages"): every rebuilt A1 lesson has 30-49 pages,
 * and no GAME is used twice in a unit (owner 2026-10-12; the Boss Test, L7, may reuse formats). Routines — the frame
 * every lesson repeats on purpose (title, Remember?, model pages, echo, songs, Reader, phonics routine, speaking stages,
 * brain breaks, check, sticker, home mission, finale) — are not games.
 */
type AnyScene = { id: string; kind: string; scene?: { kind: string } };
const kindOf = (s: AnyScene) => (s.kind === 'prea1' && s.scene ? s.scene.kind : s.kind);

const ROUTINES = new Set([
  'title-card', 'recall-warmup', 'cinematic', 'meet', 'vocab-spot', 'echo', 'listen-repeat-cards', 'numbers-learn',
  'song', 'reader', 'sound-model', 'sound-blend', 'tongue-twister', 'join-stage', 'roleplay', 'tpr-actions',
  'sticker-reward', 'home-mission', 'finale',
  // Read and match (owner 2026-10-13/14: after every word presentation a matching page — A1 reads and matches, "like the
  // one in the screenshot"): a routine, like Pre-A1's listen-match, so it may come after each new set of words.
  'drag-match',
  'pet-pal', // a short collecting moment like the sticker reward: Biscuit grows across the units, so it is in every lesson
]);

const UNITS: { unit: string; lessons: AnyScene[][] }[] = [
  { unit: 'A1 Unit 1 Welcome Town', lessons: [1, 2, 3, 4, 5, 6, 7].map((n) => (WT as unknown as Record<string, AnyScene[]>)[`LESSON_${n}_SCENES`]) },
  { unit: 'A1 Unit 2 Jungle', lessons: [1, 2, 3, 4, 5, 6, 7].map((n) => (JA as unknown as Record<string, AnyScene[]>)[`LESSON_A1U2L${n}_SCENES`]) },
  { unit: 'A1 Unit 3 Space', lessons: [1, 2, 3, 4, 5, 6, 7].map((n) => (SM as unknown as Record<string, AnyScene[]>)[`LESSON_A1U3L${n}_SCENES`]) },
  { unit: 'A1 Unit 4 Food', lessons: [1, 2, 3, 4, 5, 6, 7].map((n) => (FF as unknown as Record<string, AnyScene[]>)[`LESSON_A1U4L${n}_SCENES`]) },
];

describe('A1 lessons: 30-49 pages, no game twice in a unit', () => {
  for (const { unit, lessons } of UNITS) {
    it(`${unit}: every lesson has 30-49 pages`, () => {
      lessons.forEach((scenes, i) => {
        expect(scenes.length, `${unit} L${i + 1}`).toBeGreaterThanOrEqual(30);
        expect(scenes.length, `${unit} L${i + 1}`).toBeLessThanOrEqual(49);
      });
    });
    it(`${unit}: no game twice in the unit (Boss Test excepted)`, () => {
      const seen = new Map<string, string>();
      lessons.slice(0, 6).forEach((scenes, i) => {
        for (const s of scenes) {
          const k = kindOf(s);
          if (ROUTINES.has(k)) continue;
          const where = `L${i + 1} ${s.id}`;
          expect(seen.has(k), `${unit}: "${k}" in ${seen.get(k)} and ${where}`).toBe(false);
          seen.set(k, where);
        }
      });
    });
  }
});
