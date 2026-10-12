// Pre-A1 S01 E1 "Cold Open" (the Name Wall): reads the Pre-A1 Season spec, the Pre-A1 run of show, the decodability rule and the vocabulary-games rule.
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Deck } from '../Deck';
import { PA1_S01_E1, CRITERIA, OBJECTIVE } from '../lessons/pa1s01e1';
import { decodabilityProblems } from '../decodable';
import { PRE_A1_PARTS, type Slide } from '../types';
import { PA1_S01, PRE_A1_MAX_NEW_ITEMS, getLadderStep } from '../../curriculum/academy';
import { slideLines } from '../spoken';

afterEach(cleanup);
const slides = PA1_S01_E1.slides;
const ep = PA1_S01.episodes[0];
const at = (id: string) => slides.findIndex((s) => s.id === id);

const minutes = (s: Slide): number => {
  switch (s.kind) {
    case 'title': return 0.2;
    case 'brief': return 0.8;
    case 'badge': return 1;
    case 'dial': return 0.4;
    case 'teach': return s.pages.length * 0.4;
    case 'model': return s.lines.length * 0.22;
    case 'convo': return 0.4 + s.steps.length * 0.35;
    case 'spell': return 0.6 + 0.12 * s.target.length;
    case 'memory': return 0.5 + s.pairs.length * 0.3;
    case 'match': return 0.4 + s.pairs.length * (s.mode === 'listen' ? 0.25 : 0.2);
    case 'build': return 1;
    case 'hearpick': return 0.4 + s.rounds.length * 0.4;
    case 'blend': return 0.4 + s.rounds.length * 0.5;
    case 'reader': return 0.4 + s.lines.length * 0.5;
    case 'fade': return 0.3 + s.lines.length * 0.5;
    case 'say': return s.open ? 1.6 : 2;
    case 'wrap': return 3.2;
    default: return 1;
  }
};

describe('Pre-A1 S01 E1: Season spec and run of show', () => {
  it('reads the Season spec (episode 1): objective, cast, at most 8 new items, letters A-G, no sounds yet', () => {
    expect(PA1_S01_E1.lessonId).toBe('PA1-S01-E1');
    expect(PA1_S01_E1.level).toBe('Pre-A1');
    expect(OBJECTIVE).toMatch(/hello and my name/);
    expect(ep.objective).toMatch(/Name Wall/);
    expect([...PA1_S01_E1.cast]).toEqual([...PA1_S01.cast]);
    expect(ep.newItems.length).toBeLessThanOrEqual(PRE_A1_MAX_NEW_ITEMS);
    expect(ep.letters).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
    expect(ep.sounds).toEqual([]);
    const taught = slides.flatMap((s) => (s.kind === 'teach' ? s.pages.map((p) => p.word) : []));
    expect(taught).toEqual(['A', 'B', 'C', 'D', 'Hello!', 'Hi!', 'Bye!', 'My name is Ava.', 'I am Ava.', 'E', 'F', 'G']);
    ['hello', 'hi', 'bye', 'My name is', 'I am'].forEach((w) => expect(ep.newItems).toContain(w));
    slides.forEach((s) => (s.actors ?? []).forEach((a) => expect(PA1_S01_E1.cast, `${s.id} uses ${a.who}`).toContain(a.who)));
    expect(new Set(slides.map((s) => s.id)).size).toBe(slides.length);
    expect(CRITERIA).toHaveLength(5);
  });

  it('follows the Pre-A1 shape and the ladder says so; slides stay in part order and cover all 8 parts', () => {
    expect(PA1_S01_E1.shape).toBe('pre-a1');
    expect(getLadderStep('pre-a1')?.runOfShow).toBe('pre-a1');
    const parts = slides.map((s) => s.part);
    expect([...parts].sort((a, b) => a - b)).toEqual(parts);
    expect(new Set(parts)).toEqual(new Set([0, 1, 2, 3, 4, 5, 6, 7]));
    expect(PA1_S01_E1.partGoals).toHaveLength(8);
  });

  it('TIME: every Pre-A1 part fills its time (60-115 %) and the lesson fits the hour, with no allowance', () => {
    const per = PRE_A1_PARTS.map((_, i) => slides.filter((s) => s.part === i).reduce((a, s) => a + minutes(s), 0));
    per.forEach((m, i) => {
      expect(m, `${PRE_A1_PARTS[i].name}: ${m.toFixed(1)} min`).toBeGreaterThanOrEqual(PRE_A1_PARTS[i].minutes * 0.6);
      expect(m, `${PRE_A1_PARTS[i].name}: ${m.toFixed(1)} min`).toBeLessThanOrEqual(PRE_A1_PARTS[i].minutes * 1.15);
    });
    expect(per.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(60);
  });

  it('RULE: after every vocabulary introduction come two different memorising games; no two neighbouring slides share a game', () => {
    const GAMES = new Set(['match', 'memory', 'lockers', 'numtrain', 'countup', 'shadow', 'spell', 'bepick', 'build', 'hearpick', 'blend', 'reader']);
    slides.forEach((s, i) => {
      if (s.kind !== 'teach') return;
      const after = slides.slice(i + 1, i + 3);
      expect(after.every((g) => GAMES.has(g.kind)), `${s.id}: games after it`).toBe(true);
      expect(new Set(after.map((g) => g.kind)).size, `${s.id}: different kinds`).toBe(2);
    });
    slides.slice(1).forEach((s, i) => expect(s.kind, `${slides[i].id} -> ${s.id}`).not.toBe(slides[i].kind));
    expect(new Set(slides.map((s) => s.kind)).size).toBeGreaterThanOrEqual(12);
  });

  it('ALIGNMENT: every criterion is practised on at least 3 slides, and every non-intro slide trains one', () => {
    for (let c = 1; c <= 5; c++) expect(slides.filter((s) => s.trains?.includes(c)).length, `criterion ${c}`).toBeGreaterThanOrEqual(3);
    slides.filter((s) => !['title', 'brief', 'wrap', 'dial'].includes(s.kind)).forEach((s) => expect(s.trains?.length, s.id).toBeGreaterThan(0));
  });

  it('DECODABILITY: every word the student reads is a taught whole word (no sounds are taught in E1)', () => {
    expect(decodabilityProblems(PA1_S01_E1)).toEqual([]);
  });

  it('every spoken line can be baked (no variables or blanks) except the learner-filled model lines', () => {
    slides.forEach((s) => slideLines(s).forEach((l) => expect(l.text, s.id).not.toMatch(/[{}]|_{2,}/)));
  });
});

describe('Pre-A1 S01 E1: play-through', () => {
  const open = (id: string) => render(<Deck script={PA1_S01_E1} teacher slide={at(id)} />);

  it('shows the Pre-A1 part names (Read) on the part card', () => {
    open('read-names');
    expect(screen.getByRole('dialog', { name: /Part 5: Read/ })).toBeTruthy();
  });

  it('HEAR AND PICK letters: a wrong tile says Not yet, the right tile moves on, the last unlocks Next', () => {
    open('hear-abcd');
    fireEvent.click(screen.getByRole('button', { name: 'B' }));
    expect(screen.getByText(/Not yet/)).toBeTruthy();
    for (const l of ['A', 'C', 'D', 'B']) fireEvent.click(screen.getByRole('button', { name: l }));
    expect(screen.getByText('All found!')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Next/ })).toBeEnabled();
  });

  it('READER: the names page can be read line by line and matched to its picture', () => {
    open('read-names');
    expect(screen.getByRole('button', { name: /Hear the line/ })).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /^Picture \d$/ }).length).toBe(3);
  });
});
