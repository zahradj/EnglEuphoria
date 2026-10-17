// Player gaps closed 2026-10-16: the eight-part segment strip, the Mistake Bank (saved + shown) and the clue-unlock animation.
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { Deck } from '../Deck';
import { B1_S01_E3, WHEN_CARDS } from '../lessons/b1s01e3';
import { loadBank, saveLessonMistakes } from '../mistakeBank';
import { partsFor } from '../types';

afterEach(cleanup);
const at = (id: string) => B1_S01_E3.slides.findIndex((s) => s.id === id);

describe('segment strip', () => {
  it('shows one segment per part of the run of show, with the current part marked', () => {
    render(<Deck script={B1_S01_E3} teacher slide={at('board-when')} />);
    const bar = screen.getByRole('progressbar', { name: /Lesson parts/ });
    const segs = bar.querySelectorAll('.ad-seg');
    expect(segs).toHaveLength(partsFor(B1_S01_E3).length);
    expect(bar.querySelectorAll('.ad-seg[data-state="now"]')).toHaveLength(1);
    expect(bar.querySelectorAll('.ad-seg[data-state="done"]').length).toBe(B1_S01_E3.slides[at('board-when')].part);
  });
});

describe('Mistake Bank', () => {
  it('keeps one entry per slide, replaces the lesson’s old entries and caps the list', () => {
    saveLessonMistakes('X-1', [{ id: 'a', label: 'First', wrong: 2 }, { id: 'b', label: 'Zero', wrong: 0 }], '2026-10-16');
    saveLessonMistakes('X-1', [{ id: 'a', label: 'First', wrong: 3 }], '2026-10-16');
    saveLessonMistakes('X-2', [{ id: 'c', label: 'Other', wrong: 1 }], '2026-10-16');
    const bank = loadBank();
    expect(bank.filter((e) => e.lesson === 'X-1')).toEqual([{ lesson: 'X-1', slide: 'a', label: 'First', wrong: 3, on: '2026-10-16' }]);
    expect(bank).toHaveLength(2);
  });

  it('a wrong try is saved and the More menu opens the Mistake Bank with it; Escape closes it', () => {
    render(<Deck script={B1_S01_E3} start={at('board-when')} />);
    const card = screen.getByRole('article').textContent ?? '';
    const c = WHEN_CARDS.find((x) => card.includes(x.text))!;
    const [whenBtn, nowBtn] = screen.getAllByRole('button', { name: /pin the card here/i });
    fireEvent.click(c.bin === 'when' ? nowBtn : whenBtn); // wrong
    expect(loadBank().some((e) => e.lesson === 'B1-S01-E3' && /Detective Board/.test(e.label))).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: /More/ }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Mistake Bank/ }));
    const dlg = screen.getByRole('dialog', { name: 'Mistake Bank' });
    expect(within(dlg).getByText(/Detective Board/)).toBeTruthy();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'Mistake Bank' })).toBeNull();
  });
});

describe('Wrap', () => {
  it('shows the Mistake Bank section and unlocks the clue with a seal, a kicker and the text', () => {
    render(<Deck script={B1_S01_E3} teacher slide={at('wrap')} />);
    expect(screen.getByRole('region', { name: 'Mistake Bank' })).toBeTruthy();
    for (const row of screen.getAllByText('tap')) fireEvent.click(row.closest('button')!);
    fireEvent.click(screen.getByRole('button', { name: /Clue for next time/ }));
    expect(screen.getByText('NEW CLUE UNLOCKED')).toBeTruthy();
    expect(screen.getByText(/Clue 3 of 8/)).toBeTruthy();
  });
});
