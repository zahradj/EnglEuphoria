// The Season arc on a lesson's title card: "Chapter N of 8" and its sub-question (owner 2026-10-16, themed Seasons global).
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { Deck } from '../Deck';
import { B1_S01_E3 } from '../lessons/b1s01e3';
import { PA1_S01_E1 } from '../lessons/pa1s01e1';

afterEach(cleanup);

describe('Season chapter on the title card', () => {
  it('B1-S01-E3 shows Chapter 3 of 8 "Been or gone?" with its sub-question', () => {
    const { container } = render(<Deck script={B1_S01_E3} teacher slide={B1_S01_E3.slides.findIndex((x) => x.kind === 'title')} />);
    const el = container.querySelector('[data-chapter]');
    expect(el?.textContent).toMatch(/Chapter 3 of 8 · Been or gone\?/);
    expect(el?.textContent).toMatch(/ever \/ never change/);
  });
  it('a Pre-A1 lesson shows its chapter too (PA1-S01-E1: Chapter 1 of 8)', () => {
    const { container } = render(<Deck script={PA1_S01_E1} teacher slide={PA1_S01_E1.slides.findIndex((x) => x.kind === 'title')} />);
    expect(container.querySelector('[data-chapter]')?.textContent).toMatch(/Chapter 1 of 8 · The wall wakes up/);
  });
});
