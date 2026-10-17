// The Academy library is organised like the Playground library: level tabs (A1 A2 B1 B2 C1) → seasons → lessons.
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AcademyLevelLibrary } from '../library/AcademyLevelLibrary';
import { ACADEMY_LEVELS, groupAcademyLessons, groupAcademyLibrary } from '../library/levels';
import { ACADEMY_DECK_LESSONS, ACADEMY_DECK_BLUEPRINT_IDS } from '../lessonRegistry';
import { ACADEMY_SEASONS } from '../../curriculum/academy';

afterEach(cleanup);

describe('Academy library by level (player v2 rebuild: only the proof lesson B1-S01-E1 is built so far, docs/academy-player-v2-plan.md)', () => {
  it('has the five levels and every roadmap season of each level (12 / 14 / 18 / 18 / 18)', () => {
    expect([...ACADEMY_LEVELS]).toEqual(['A1', 'A2', 'B1', 'B2', 'C1']);
    const g = groupAcademyLessons(ACADEMY_DECK_LESSONS);
    expect(g.map((x) => x.seasons.length)).toEqual([12, 14, 18, 18, 18]);
    expect(g[0].seasons[0].title).toBe('Who Are You?');
  });

  it('places any library lesson in its blueprint season and level (registry may be empty)', () => {
    const g = groupAcademyLessons(ACADEMY_DECK_LESSONS);
    const roadmapLessons = ACADEMY_DECK_LESSONS.filter((l) => l.level !== 'Pre-A1');
    expect(g.reduce((n, x) => n + x.count, 0)).toBe(roadmapLessons.length);
    for (const l of roadmapLessons) {
      const bpId = ACADEMY_DECK_BLUEPRINT_IDS[l.id];
      const season = ACADEMY_SEASONS.find((s) => s.id === bpId.slice(0, 6))!;
      expect([season.level, season.no], l.id).toEqual([l.level, l.season]);
    }
  });

  it('shows level tabs and says the lessons of every season are being built', () => {
    render(<AcademyLevelLibrary lessons={ACADEMY_DECK_LESSONS} renderLesson={(l) => <span>{l.title}</span>} />);
    for (const lv of ACADEMY_LEVELS) expect(screen.getByRole('tab', { name: new RegExp(`^${lv}`) })).toBeTruthy();
    // the library opens on the first level that has a lesson (B1: the proof lesson); the other seasons say "Coming soon"
    expect(screen.getByRole('tab', { name: /^B1/ }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getAllByText('Coming soon').length).toBe(17);
    fireEvent.click(screen.getByRole('tab', { name: /^C1/ }));
    expect(screen.getAllByText('Coming soon').length).toBe(18);
    fireEvent.click(screen.getByRole('tab', { name: /^A1/ }));
    expect(screen.getAllByText('Coming soon').length).toBe(12);
  });

  it('LADDER VIEW (teachers and creators): tabs are the lean ladder steps, Pre-A1 first with planned seasons, A1 Upper holds Seasons 7-12', () => {
    const g = groupAcademyLibrary(ACADEMY_DECK_LESSONS, true);
    expect(g.map((x) => x.id)).toEqual(['pre-a1', 'a1', 'a1-upper', 'a2', 'b1', 'b2', 'c1']);
    expect(g[0].seasons.map((s) => s.title)).toEqual(['Hello, letters', 'First sounds', 'Numbers and age', 'My things', 'People and places']);
    expect(g[0].seasons.every((s) => s.no === null)).toBe(true);
    // every Pre-A1 Season lists its 8 planned lessons and an overview (with the big question and chapters); so does every roadmap Season
    expect(g[0].seasons.every((x) => x.slots.length === 8 && !!x.overview && !!x.overview.question && x.overview.chapters?.length === 8)).toBe(true);
    expect(g.slice(1).every((x) => x.seasons.every((y) => !!y.overview && y.slots.length === 8 && y.overview.chapters?.length === 8))).toBe(true);
    expect(g[1].seasons.map((s) => s.no)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(g[2].seasons.map((s) => s.no)).toEqual([7, 8, 9, 10, 11, 12]);
    expect(g.reduce((n, x) => n + x.count, 0)).toBe(ACADEMY_DECK_LESSONS.length);
    // students keep plain levels (no Pre-A1, no Upper tab)
    expect(groupAcademyLibrary(ACADEMY_DECK_LESSONS, false).map((x) => x.id)).toEqual(['a1', 'a2', 'b1', 'b2', 'c1']);
  });

  it('SLOTS: every season lists its 8 episodes; only the proof lesson is built', () => {
    const g = groupAcademyLibrary(ACADEMY_DECK_LESSONS, false);
    for (const lv of g) for (const s of lv.seasons) {
      expect(s.slots.map((x) => x.episode)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
      expect(s.slots.filter((x) => x.built).map((x) => `${lv.id}-${s.no}-${x.episode}`)).toEqual(lv.id === 'b1' && s.no === 1 ? ['b1-1-1'] : []);
    }
  });

  it('the creator view shows the step tabs and the planned lesson slots', () => {
    render(<AcademyLevelLibrary showSteps lessons={ACADEMY_DECK_LESSONS} renderLesson={(l) => <span>{l.title}</span>} />);
    expect(screen.getByRole('tab', { name: /^Pre-A1/ })).toBeTruthy();
    expect(screen.getByRole('tab', { name: /^A1 Upper/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('tab', { name: /^Pre-A1/ }));
    expect(screen.getAllByText(/E1 · /).length).toBeGreaterThan(0);
    expect(screen.getByText('Hello, letters')).toBeTruthy();
    expect(screen.getAllByText('Planned').length).toBeGreaterThanOrEqual(5);
  });

  it('the student view has no Pre-A1 and no Upper tab', () => {
    render(<AcademyLevelLibrary lessons={ACADEMY_DECK_LESSONS} renderLesson={(l) => <span>{l.title}</span>} />);
    expect(screen.queryByRole('tab', { name: /Pre-A1/ })).toBeNull();
    expect(screen.queryByRole('tab', { name: /Upper/ })).toBeNull();
  });
});

describe('A1 curriculum in the library', () => {
  it('lists all 12 A1 seasons x 8 lessons, each with its goal, Mission, Release and clue from the lesson blueprint', async () => {
    const { groupAcademyLibrary } = await import('../library/levels');
    const a1 = groupAcademyLibrary([], false).find((g) => g.id === 'a1')!;
    expect(a1.seasons).toHaveLength(12);
    a1.seasons.forEach((s) => {
      expect(s.slots, s.title).toHaveLength(8);
      s.slots.forEach((x) => {
        expect(x.plan?.objective, `${s.title} E${x.episode}`).toMatch(/^I can /);
        expect(x.plan?.mission).toBeTruthy();
        expect(x.plan?.release).toBeTruthy();
        expect(x.plan?.clue).toBeTruthy();
      });
    });
  });
});
