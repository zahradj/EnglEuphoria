// Builds today's Daily 10 as a short deck from the scheduler's pack (src/curriculum/academy/dailyTen.ts): recognise (hear and pick), say it aloud,
// and use it in a sentence. Recall only, no new teaching; played in homework mode (Deck `homework`). Pure; no React. Docs: docs/academy-recall-spacing-progression.md.
import { dailyTenFor, taskFor, type DailyItem } from '../curriculum/academy';
import type { CastName, DeckScript, Slide } from './types';

const VEE: { who: CastName; pos: 'right'; expr: 'happy' } = { who: 'Vee', pos: 'right', expr: 'happy' };

export interface DailyTenDeck {
  script: DeckScript;
  /** the items by task, so the results can be logged per item */
  tasks: { item: string; task: 'recognise' | 'say' | 'use'; slideId: string }[];
}

export function buildDailyTenDeck(state: DailyItem[], today: string, level: DeckScript['level'] = 'A1'): DailyTenDeck | null {
  const pack = dailyTenFor(state, today);
  if (pack.length === 0) return null;
  const withTask = pack.map((s) => ({ item: s.item, task: taskFor(s, today) }));
  const rec = withTask.filter((x) => x.task === 'recognise').map((x) => x.item);
  const pool = pack.map((s) => s.item);
  const slides: Slide[] = [];
  const tasks: DailyTenDeck['tasks'] = [];
  if (rec.length) {
    const id = 'dt-recognise';
    slides.push({
      id, kind: 'hearpick', part: 1, bg: 'club-lobby', actors: [VEE], trains: [1],
      prompt: 'Daily 10 · Which one do you hear? Tap it.',
      rounds: rec.map((say, i) => ({ say, options: [say, ...pool.filter((p) => p !== say).slice(i % Math.max(1, pool.length - 1), (i % Math.max(1, pool.length - 1)) + 2)].filter((o, k, a) => a.indexOf(o) === k), answer: say })),
      hints: ['Listen, then look for the same words.'],
    });
    rec.forEach((item) => tasks.push({ item, task: 'recognise', slideId: id }));
  }
  withTask.filter((x) => x.task !== 'recognise').forEach((x, i) => {
    const id = `dt-${x.task}-${i}`;
    slides.push({
      id, kind: 'say', part: 3, bg: 'club-lobby', actors: [VEE], trains: [1], open: x.task === 'say',
      prompt: x.task === 'say' ? 'Daily 10 · Say it out loud.' : 'Daily 10 · Use it in a sentence. Say it out loud.',
      model: x.item,
      hints: ['Say it slowly. Not yet is okay!'],
    });
    tasks.push({ item: x.item, task: x.task, slideId: id });
  });
  const script: DeckScript = {
    lessonId: `DAILY-10-${today}`, level, title: 'Daily 10', objective: 'Bring back what you learned: hear it, say it, use it.',
    criteria: ['I remembered words from my lessons.'], cast: ['Vee'], slides,
  };
  return { script, tasks };
}
