// The Academy library is organised like the Playground library: level tabs (A1 A2 B1 B2 C1) → seasons → lessons.
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AcademyLevelLibrary } from '../library/AcademyLevelLibrary';
import { ACADEMY_LEVELS, groupAcademyLessons } from '../library/levels';
import { ACADEMY_DECK_LESSONS, ACADEMY_DECK_BLUEPRINT_IDS } from '../lessonRegistry';
import { ACADEMY_SEASONS } from '../../curriculum/academy';

afterEach(cleanup);

describe('Academy library by level', () => {
  it('has the five levels and every roadmap season of each level (10 / 12 / 16 / 16 / 16)', () => {
    expect([...ACADEMY_LEVELS]).toEqual(['A1', 'A2', 'B1', 'B2', 'C1']);
    const g = groupAcademyLessons(ACADEMY_DECK_LESSONS);
    expect(g.map((x) => x.seasons.length)).toEqual([10, 12, 16, 16, 16]);
    expect(g[0].seasons[0].title).toBe('Who Are You?');
  });

  it('places every library lesson in its blueprint season and level, in lesson order', () => {
    const g = groupAcademyLessons(ACADEMY_DECK_LESSONS);
    expect(g.reduce((n, x) => n + x.count, 0)).toBe(ACADEMY_DECK_LESSONS.length);
    for (const l of ACADEMY_DECK_LESSONS) {
      const bpId = ACADEMY_DECK_BLUEPRINT_IDS[l.id];
      const season = ACADEMY_SEASONS.find((s) => s.id === bpId.slice(0, 6))!;
      expect([season.level, season.no], l.id).toEqual([l.level, l.season]);
    }
    const s1 = g[0].seasons[0].lessons.map((l) => l.id);
    expect(s1).toEqual(['sign-me-up', 'sign-me-up-2', 'fake-or-real']);
  });

  it('shows level tabs with counts, opens the first season with lessons, and says "Coming soon" for the rest', () => {
    render(<AcademyLevelLibrary lessons={ACADEMY_DECK_LESSONS} renderLesson={(l) => <span>{l.title}</span>} />);
    for (const lv of ACADEMY_LEVELS) expect(screen.getByRole('tab', { name: new RegExp(`^${lv}`) })).toBeTruthy();
    expect(screen.getByRole('tab', { name: /^A1/ }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText('Sign Me Up')).toBeTruthy();
    expect(screen.getByText('Fake or Real?')).toBeTruthy();
    expect(screen.getAllByText('Coming soon').length).toBe(9); // the other A1 seasons
    fireEvent.click(screen.getByRole('tab', { name: /^C1/ }));
    expect(screen.queryByText('Sign Me Up')).toBeNull();
    expect(screen.getAllByText('Coming soon').length).toBe(16);
    // the first season of a level opens by itself; its header toggles it
    expect(screen.getByText('The lessons of this season are being built.')).toBeTruthy();
    fireEvent.click(screen.getAllByRole('button', { name: /Coming soon/ })[0]);
    expect(screen.queryByText('The lessons of this season are being built.')).toBeNull();
  });
});
