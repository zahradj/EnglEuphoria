import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { plusDays } from '../../curriculum/academy';
import { emptyPractice, loadPractice, recordDaily10, recordLesson, reportInput, savePractice } from '../practiceStore';
import AcademyDailyTenPage from '../pages/AcademyDailyTenPage';

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: null }) }));

const T0 = '2026-10-14';
beforeEach(() => window.localStorage.clear());
afterEach(cleanup);

describe('practiceStore', () => {
  it('a finished lesson adds its items due tomorrow and keeps the Say it tally; replaying only updates the tally', () => {
    let d = recordLesson(emptyPractice(), 'pa1-s02-e1', ['pin', 'tin'], T0, 12);
    expect(d.items.map((i) => i.item)).toEqual(['pin', 'tin']);
    expect(d.items[0].dueOn).toBe(plusDays(T0, 1));
    d = recordLesson(d, 'pa1-s02-e1', ['pin', 'tin'], plusDays(T0, 2), 20);
    expect(d.items.length).toBe(2);
    expect(d.lessons).toEqual([{ id: 'pa1-s02-e1', on: plusDays(T0, 2), spoken: 20 }]);
  });
  it('saves and loads; a Daily 10 moves items up and records the day', () => {
    savePractice('s1', recordLesson(emptyPractice(), 'x', ['pin'], T0, 5));
    let d = loadPractice('s1');
    d = recordDaily10(d, [{ item: 'pin', ok: true }], plusDays(T0, 1));
    expect(d.items[0].box).toBe(1);
    expect(d.daily10Days).toEqual([plusDays(T0, 1)]);
  });
  it('builds the teacher report input: last lesson, Daily 10 done, spoken tally', () => {
    let d = recordLesson(emptyPractice(), 'x', ['pin'], T0, 7);
    d = recordDaily10(d, [{ item: 'pin', ok: true }], plusDays(T0, 1));
    const r = reportInput(d, 'A1', plusDays(T0, 6));
    expect(r).toMatchObject({ lastLessonOn: T0, daily10Done: 1, spokenLastLesson: 7 });
    expect(r.daily10Scheduled).toBeGreaterThanOrEqual(1);
  });
});

describe('Daily 10 page', () => {
  it('before any lesson it says the Daily 10 starts after the first lesson', () => {
    render(<MemoryRouter><AcademyDailyTenPage /></MemoryRouter>);
    expect(screen.getByText(/starts after your first lesson/)).toBeTruthy();
  });
  it('with items due it plays the Daily 10 deck', () => {
    const d = recordLesson(emptyPractice(), 'x', ['pin', 'tin', 'map'], plusDays(new Date().toISOString().slice(0, 10), -1), 4);
    savePractice('device', d);
    render(<MemoryRouter><AcademyDailyTenPage /></MemoryRouter>);
    expect(screen.getByText(/Daily 10 · game 1 of 1/)).toBeTruthy();
  });
});
