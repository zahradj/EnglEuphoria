import { describe, expect, it } from 'vitest';
import { SCENE_LESSON_REGISTRY } from './sceneLessonRegistry';
import { WELCOME_TOWN_LESSON_REGISTRY } from './welcomeTownLessonRegistry';
import { lessonChecklist, statusFromRows, suggestVerdict, pgSkillTag, wrongTag } from './lessonChecklist';

/* Owner 2026-10-15: "each lesson should have a checklist … after the lesson, the report should have the checklist".
 * Every Playground lesson (Pre-A1 and the A1/A2 worlds) must produce one from its own pages. */
const lessons: [string, string, number, number][] = [
  ...Object.keys(SCENE_LESSON_REGISTRY).map((k) => { const [u, l] = k.split('-').map(Number); return [`lep1-rich ${k}`, 'lep1-rich', u, l] as [string, string, number, number]; }),
  ...Object.keys(WELCOME_TOWN_LESSON_REGISTRY).map((k) => { const m = /^(.*)-(\d+)-(\d+)$/.exec(k)!; return [k, m[1], Number(m[2]), Number(m[3])] as [string, string, number, number]; }),
];

describe('Playground lesson checklist', () => {
  it('covers the lessons', () => { expect(lessons.length).toBeGreaterThan(60); });
  it.each(lessons)('%s has a checklist of what the student does', (_k, fmt, u, l) => {
    const c = lessonChecklist(fmt, u, l);
    expect(c).not.toBeNull();
    expect(c!.items.length, 'at least 3 things to tick').toBeGreaterThanOrEqual(3);
    expect(new Set(c!.items.map((i) => i.id)).size, 'one line per page').toBe(c!.items.length);
    for (const it of c!.items) expect(it.label.trim().length).toBeGreaterThan(1);
    expect(c!.items.some((i) => ['title-card', 'finale', 'song', 'sticker-reward'].includes(i.kind))).toBe(false);
    // The report shows the lesson's core points, not every page (owner 2026-10-15): short, no repeats, all pages covered.
    expect(c!.points.length, 'core points').toBeGreaterThanOrEqual(2);
    expect(c!.points.length, 'core points').toBeLessThanOrEqual(14);
    expect(new Set(c!.points.map((p) => p.label)).size, 'no repeated point').toBe(c!.points.length);
    const covered = new Set(c!.points.flatMap((p) => p.pages));
    for (const it of c!.items) expect(covered.has(it.id), `${it.id} belongs to a point`).toBe(true);
  });
  it('reads the rows the student saved', () => {
    const c = lessonChecklist('monster-rich', 5, 3)!;
    const [a, b, d] = c.items;
    const st = statusFromRows(c.items, [
      { slide_id: a.id, is_correct: true, selected_option_id: wrongTag(0), skill_tag: pgSkillTag(a.kind) },
      { slide_id: b.id, is_correct: false, selected_option_id: wrongTag(3), skill_tag: pgSkillTag(b.kind) },
      { slide_id: d.id, is_correct: true, selected_option_id: 'other', skill_tag: 'grammar' }, // not ours
    ]);
    expect(st[a.id]).toEqual({ status: 'done', wrong: 0, recorded: true });
    expect(st[b.id]).toEqual({ status: 'help', wrong: 3, recorded: true });
    expect(st[d.id].status).toBe('unmarked');
    expect(c.isUnitTest).toBe(false);
    expect(lessonChecklist('monster-rich', 5, 9)).toBeNull();
  });
  it('suggests a verdict: 4 of 5 = nailed it (Boss Test pass mark)', () => {
    expect(suggestVerdict(['done', 'done', 'done', 'done', 'not-yet'])).toBe('nailed');
    expect(suggestVerdict(['done', 'help', 'help', 'not-yet'])).toBe('almost');
    expect(suggestVerdict(['not-yet', 'help', 'not-yet'])).toBe('practice');
    expect(suggestVerdict([])).toBeNull();
    expect(suggestVerdict(['unmarked', 'unmarked'])).toBeNull();
    expect(suggestVerdict(['done', 'unmarked', 'unmarked', 'unmarked'])).toBe('nailed');
  });
});
