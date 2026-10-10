// Homework quest (Daily 10): logic, data rules and the app. Recall-only, auto-marked, no new teaching, no emoji, no ranking.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { HomeworkApp } from '../homework/Homework';
import { addDays, applyResult, availableOn, chestState, emptyProgress, loadProgress, saveProgress, starsFor, totalStars, weakItems } from '../homework/quest';
import { SIGN_ME_UP_QUEST as Q } from '../homework/signMeUpQuest';
import { INVENTORY_ITEMS } from './inventory';

afterEach(cleanup);
beforeEach(() => window.localStorage.clear());

describe('quest logic', () => {
  it('stars: 3 for at most 1 wrong try, 2 for up to 4, otherwise 1 (never 0: wrong tries do not block)', () => {
    expect([0, 1, 2, 4, 5, 20].map(starsFor)).toEqual([3, 3, 2, 2, 1, 1]);
  });

  it('chests unlock on calendar days after the previous one (1, 2, 4, 14 days) and never before the previous is done', () => {
    let p = emptyProgress();
    expect(availableOn(Q, p, 1, '2026-10-10')).toBe('2026-10-11');
    expect(chestState(Q, p, 1, '2026-10-10', '2026-10-10')).toBe('waiting');
    expect(chestState(Q, p, 1, '2026-10-11', '2026-10-10')).toBe('open');
    expect(chestState(Q, p, 2, '2026-10-30', '2026-10-10')).toBe('locked');
    p = applyResult(p, Q[0], [{ slideId: 'a', items: ['one'], wrong: 0 }], '2026-10-11');
    expect(availableOn(Q, p, 2, '2026-10-10')).toBe('2026-10-13');
    expect(chestState(Q, p, 2, '2026-10-12', '2026-10-10')).toBe('waiting');
    expect(chestState(Q, p, 2, '2026-10-13', '2026-10-10')).toBe('open');
    expect(addDays('2026-10-30', 3)).toBe('2026-11-02');
    expect(chestState(Q, emptyProgress(), 1, '2026-10-10', '2026-10-10', true)).toBe('open'); // demo
  });

  it('a finished chest logs one result per item, counts the day once, and stars never go down', () => {
    let p = applyResult(emptyProgress(), Q[0], [{ slideId: 's1', items: ['one', 'two'], wrong: 0 }, { slideId: 's2', items: ['three'], wrong: 3 }], '2026-10-11');
    expect(p.stars[1]).toBe(2);
    expect(p.log).toHaveLength(3);
    expect(p.log.filter((e) => e.ok).map((e) => e.item)).toEqual(['one', 'two']);
    p = applyResult(p, Q[0], [{ slideId: 's1', items: ['one'], wrong: 9 }], '2026-10-11');
    expect(p.stars[1]).toBe(2); // a worse replay does not lower the stars
    expect(p.days).toEqual(['2026-10-11']);
    expect(totalStars(p)).toBe(2);
  });

  it('weak items are listed worst first for the teacher', () => {
    const p = applyResult(emptyProgress(), Q[0], [{ slideId: 'a', items: ['four'], wrong: 2 }, { slideId: 'b', items: ['one'], wrong: 0 }], '2026-10-11');
    expect(weakItems(p)[0].item).toBe('four');
    expect(weakItems(p)[0].rate).toBe(0);
  });

  it('saving and loading survive blocked storage', () => {
    saveProgress('x', applyResult(emptyProgress(), Q[0], [{ slideId: 'a', items: ['one'], wrong: 0 }], '2026-10-11'));
    expect(loadProgress('x').stars[1]).toBe(3);
    const real = Object.getOwnPropertyDescriptor(window, 'localStorage')!;
    Object.defineProperty(window, 'localStorage', { get: () => { throw new Error('denied'); }, configurable: true });
    expect(() => saveProgress('x', emptyProgress())).not.toThrow();
    expect(loadProgress('x')).toEqual(emptyProgress());
    Object.defineProperty(window, 'localStorage', real);
  });
});

describe('quest data rules (homework is recall, not teaching)', () => {
  it('4 chests of 3 games, spaced 1/2/4/14 days, ending with a "big check"', () => {
    expect(Q.map((c) => c.slides.length)).toEqual([3, 3, 3, 3]);
    expect(Q.map((c) => c.gapDays)).toEqual([1, 2, 4, 14]);
    expect(Q[3].title).toMatch(/big check/);
  });

  it('only auto-marked recall games: no teaching, no modelling, no say-it, no wrap', () => {
    const banned = ['teach', 'model', 'say', 'wrap', 'title', 'brief', 'fade', 'dial'];
    for (const c of Q) for (const s of c.slides) expect(banned, s.id).not.toContain(s.kind);
  });

  it('every game is tagged to knowledge items from the lesson, and no two neighbouring games are the same kind', () => {
    for (const c of Q) {
      c.slides.forEach((s, i) => {
        expect(s.items?.length, s.id).toBeGreaterThan(0);
        s.items!.forEach((it) => expect(INVENTORY_ITEMS, `${s.id}: ${it}`).toContain(it));
        if (i > 0) expect(s.kind).not.toBe(c.slides[i - 1].kind);
      });
    }
  });

  it('hidden-object targets show the number their word names, and shadow answers are among their options', () => {
    const W: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
    for (const c of Q) for (const s of c.slides) {
      if (s.kind === 'hunt') s.targets.forEach((t) => expect(W[t.word]).toBe(t.n));
      if (s.kind === 'shadow') s.rounds.forEach((r) => expect(r.options).toContain(r.answer));
    }
  });
});

describe('the app', () => {
  it('hub -> adventure map: chest 1 is ready, the others are locked until the previous is done (demo mode)', () => {
    render(<HomeworkApp demo />);
    expect(screen.getByRole('button', { name: /Quest/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Quest/ }));
    expect(screen.getByRole('button', { name: /Day 1: numbers: ready/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Day 3: nationalities: locked/ })).toBeDisabled();
  });

  it('real calendar mode: chest 1 waits for its day and says when it opens', () => {
    render(<HomeworkApp demo={false} lessonDate="2999-01-01" />);
    fireEvent.click(screen.getByRole('button', { name: /Quest/ }));
    expect(screen.getByRole('button', { name: /opens on 2999-01-02/ })).toBeDisabled();
  });

  it('playing a chest opens its first game in homework mode; the teacher view starts empty', () => {
    render(<HomeworkApp demo />);
    fireEvent.click(screen.getByRole('button', { name: /Quest/ }));
    fireEvent.click(screen.getByRole('button', { name: /Day 1: numbers: ready/ }));
    expect(screen.getByText(/Shadow match/)).toBeTruthy();
    expect(screen.getByText(/Day 1: numbers · game 1 of 3/)).toBeTruthy();
    cleanup();
    render(<HomeworkApp demo />);
    fireEvent.click(screen.getByRole('button', { name: /Teacher/ }));
    expect(screen.getByText(/No results yet/)).toBeTruthy();
  });
});
