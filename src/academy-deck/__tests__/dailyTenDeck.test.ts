import { describe, expect, it } from 'vitest';
import { addLessonItems, applyDailyResults, plusDays } from '../../curriculum/academy';
import { buildDailyTenDeck } from '../dailyTenDeck';

const T0 = '2026-10-14';
describe('Daily 10 deck from the scheduler', () => {
  it('nothing is due on the day of the lesson; the next day brings back the new items as hear-and-pick', () => {
    const s = addLessonItems([], ['pin', 'tin', 'phone', 'map'], T0);
    expect(buildDailyTenDeck(s, T0)).toBeNull();
    const d = buildDailyTenDeck(s, plusDays(T0, 1))!;
    expect(d.script.slides.map((x) => x.kind)).toEqual(['hearpick']);
    const hp = d.script.slides[0];
    if (hp.kind !== 'hearpick') throw new Error('x');
    expect(hp.rounds.map((r) => r.answer).sort()).toEqual(['map', 'phone', 'pin', 'tin']);
    hp.rounds.forEach((r) => expect(r.options).toContain(r.answer));
    expect(d.tasks.every((t) => t.task === 'recognise')).toBe(true);
  });
  it('later the same items are said aloud (speaking), and secure items are used in a sentence', () => {
    let s = addLessonItems([], ['pin', 'tin'], T0);
    s = applyDailyResults(s, [{ item: 'pin', ok: true }, { item: 'tin', ok: true }], plusDays(T0, 1));
    const d = buildDailyTenDeck(s, plusDays(T0, 4))!;
    expect(d.script.slides.every((x) => x.kind === 'say')).toBe(true);
    expect(d.tasks.map((t) => t.task)).toEqual(['say', 'say']);
  });
  it('the pack never has more than ten items', () => {
    const s = addLessonItems([], Array.from({ length: 30 }, (_, i) => `w${i}`), T0);
    expect(buildDailyTenDeck(s, plusDays(T0, 1))!.tasks.length).toBe(10);
  });
});
