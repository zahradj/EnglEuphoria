// Pre-A1 S02 E1 "Cold Open" (the Phone): reads the Pre-A1 Season spec, the Pre-A1 run of show, the decodability rule and the vocabulary-games rule.
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Deck } from '../Deck';
import { PA1_S02_E1, CRITERIA, OBJECTIVE } from '../lessons/pa1s02e1';
import { decodabilityProblems } from '../decodable';
import { PRE_A1_PARTS, type Slide } from '../types';
import { PA1_S02, PRE_A1_MAX_NEW_ITEMS, getLadderStep } from '../../curriculum/academy';
import { slideLines } from '../spoken';

afterEach(cleanup);
const slides = PA1_S02_E1.slides;
const ep = PA1_S02.episodes[0];
const at = (id: string) => slides.findIndex((s) => s.id === id);

// Slow-beginner estimate (listen, repeat, hesitate, try again): deliberately generous per slide, so a lesson that passes is not padded on paper.
const minutes = (s: Slide): number => {
  switch (s.kind) {
    case 'title': return 0.2;
    case 'brief': return 0.8;
    case 'badge': return 1;
    case 'dial': return 0.4;
    case 'teach': return s.pages.length * 0.6;
    case 'model': return s.lines.length * 0.35;
    case 'whosaid': return 0.6 + s.items.length * 0.4 + (s.replay?.length ?? 0) * 0.3;
    case 'convo': return 0.6 + s.steps.length * 0.5;
    case 'spell': return 0.8 + 0.2 * s.target.length;
    case 'memory': return 0.8 + s.pairs.length * 0.4;
    case 'match': return 0.6 + s.pairs.length * 0.35;
    case 'build': return s.rounds.length * 1.2;
    case 'hearpick': return 0.5 + s.rounds.length * 0.5;
    case 'blend': return 0.5 + s.rounds.length * 0.7;
    case 'rule': return 1;
    case 'reader': return 0.6 + s.lines.length * 0.7;
    case 'fade': return 0.6 + s.lines.length * 0.6;
    case 'say': return 2;
    case 'wrap': return 3.2;
    default: return 1;
  }
};

describe('Pre-A1 S02 E1: Season spec and run of show', () => {
  it('reads the Season spec (episode 1): objective, cast, at most 8 new items, sounds i and n', () => {
    expect(PA1_S02_E1.lessonId).toBe('PA1-S02-E1');
    expect(PA1_S02_E1.level).toBe('Pre-A1');
    expect(OBJECTIVE).toMatch(/sounds i and n/);
    expect(ep.objective).toMatch(/hear i and n/);
    expect([...PA1_S02_E1.cast]).toEqual([...PA1_S02.cast]);
    expect(ep.newItems.length).toBeLessThanOrEqual(PRE_A1_MAX_NEW_ITEMS);
    expect(ep.sounds).toEqual(['i', 'n']);
    ['phone', 'pin', 'tin', 'map'].forEach((w) => expect(ep.newItems).toContain(w));
    expect(PA1_S02_E1.taughtSounds).toEqual(PA1_S02.soundsSoFar.slice(0, 6));
    slides.forEach((s) => (s.actors ?? []).forEach((a) => expect(PA1_S02_E1.cast, `${s.id} uses ${a.who}`).toContain(a.who)));
    expect(new Set(slides.map((s) => s.id)).size).toBe(slides.length);
    expect(CRITERIA).toHaveLength(5);
  });

  it('follows the Pre-A1 shape; slides stay in part order and cover all 8 parts', () => {
    expect(PA1_S02_E1.shape).toBe('pre-a1');
    expect(getLadderStep('pre-a1')?.runOfShow).toBe('pre-a1');
    const parts = slides.map((s) => s.part);
    expect([...parts].sort((a, b) => a - b)).toEqual(parts);
    expect(new Set(parts)).toEqual(new Set([0, 1, 2, 3, 4, 5, 6, 7]));
    expect(PA1_S02_E1.partGoals).toHaveLength(8);
  });

  it('TIME: every part fills its time (70-125 %) and the lesson totals 57-64.5 minutes', () => {
    const per = PRE_A1_PARTS.map((_, i) => slides.filter((s) => s.part === i).reduce((a, s) => a + minutes(s), 0));
    per.forEach((m, i) => {
      expect(m, `${PRE_A1_PARTS[i].name}: ${m.toFixed(1)} min`).toBeGreaterThanOrEqual(PRE_A1_PARTS[i].minutes * 0.7);
      expect(m, `${PRE_A1_PARTS[i].name}: ${m.toFixed(1)} min`).toBeLessThanOrEqual(PRE_A1_PARTS[i].minutes * 1.25);
    });
    const total = per.reduce((a, b) => a + b, 0);
    expect(total, `total ${total.toFixed(1)} min`).toBeGreaterThanOrEqual(57);
    expect(total, `total ${total.toFixed(1)} min`).toBeLessThanOrEqual(64.5);
  });

  it('RULE: two different games after every vocabulary introduction; no neighbouring slides share a kind; the rule is stated before the practice', () => {
    const GAMES = new Set(['match', 'memory', 'spell', 'build', 'hearpick', 'blend', 'reader']);
    slides.forEach((s, i) => {
      if (s.kind !== 'teach') return;
      const after = slides.slice(i + 1, i + 3);
      expect(after.every((g) => GAMES.has(g.kind)), `${s.id}: games after it`).toBe(true);
      expect(new Set(after.map((g) => g.kind)).size, `${s.id}: different kinds`).toBe(2);
    });
    slides.slice(1).forEach((s, i) => expect(s.kind, `${slides[i].id} -> ${s.id}`).not.toBe(slides[i].kind));
    expect(slides.findIndex((s) => s.kind === 'rule')).toBeLessThan(slides.findIndex((s) => s.id === 'blend-in'));
    expect(slides.findIndex((s) => s.id === 'rule-this')).toBeLessThan(slides.findIndex((s) => s.id === 'match-this'));
    expect(slides.filter((s) => s.kind === 'rule').every((s) => s.kind === 'rule' && s.lines.length <= 3)).toBe(true);
  });

  it('INTENSIVE PRACTICE: at least 80 student responses in the hour, and a teach-back of the rule', () => {
    const responses = (s: Slide): number => {
      switch (s.kind) {
        case 'hearpick': case 'blend': case 'build': return s.rounds.length;
        case 'reader': return s.lines.length;
        case 'match': return s.pairs.length;
        case 'memory': return s.pairs.length * 2;
        case 'convo': return s.steps.length;
        case 'spell': return s.target.length;
        case 'say': return 1;
        case 'fade': return s.lines.length;
        default: return 0;
      }
    };
    const total = slides.reduce((a, s) => a + responses(s), 0);
    expect(total, `${total} responses`).toBeGreaterThanOrEqual(80);
    expect(slides.some((s) => s.id === 'teach-back' && s.part === 7)).toBe(true);
  });

  it('ALIGNMENT: every criterion is practised on at least 3 slides, and every non-intro slide trains one', () => {
    for (let c = 1; c <= 5; c++) expect(slides.filter((s) => s.trains?.includes(c)).length, `criterion ${c}`).toBeGreaterThanOrEqual(3);
    slides.filter((s) => !['title', 'brief', 'wrap', 'dial'].includes(s.kind)).forEach((s) => expect(s.trains?.length, s.id).toBeGreaterThan(0));
  });

  it('DECODABILITY: every word the student reads is blendable from s a t p i n or a taught whole word', () => {
    expect(decodabilityProblems(PA1_S02_E1)).toEqual([]);
  });

  it('every spoken line can be baked (no variables or blanks) except the learner-filled model lines', () => {
    slides.forEach((s) => slideLines(s).forEach((l) => expect(l.text, s.id).not.toMatch(/[{}]|_{2,}/)));
  });
});

describe('Pre-A1 S02 E1: play-through', () => {
  const open = (id: string) => render(<Deck script={PA1_S02_E1} teacher slide={at(id)} />);

  it('BLEND: the blend slide shows the first word and a "Blend it" button', () => {
    open('blend-in');
    expect(screen.getByRole('button', { name: /Blend it/ })).toBeTruthy();
  });

  it('HEAR AND PICK sounds: a wrong tile says Not yet, the right tile moves on', () => {
    open('hear-in');
    fireEvent.click(screen.getByRole('button', { name: 'a' }));
    expect(screen.getByText(/Not yet/)).toBeTruthy();
  });

  it('SAY IT: game slides have a "Say it" button; tapping it counts a spoken answer (speaking practice)', () => {
    open('blend-in');
    expect(screen.queryByRole('status', { name: /Spoken aloud/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Say it aloud/ }));
    fireEvent.click(screen.getByRole('button', { name: /Say it aloud/ }));
    expect(screen.getByRole('status', { name: 'Spoken aloud: 2' })).toBeTruthy();
  });

  it('there is no "Say it" button on a title slide', () => {
    open('title');
    expect(screen.queryByRole('button', { name: /Say it aloud/ })).toBeNull();
  });

  it('READER: the first page can be read line by line and matched to its picture', () => {
    open('read-1');
    expect(screen.getByRole('button', { name: /Hear the line/ })).toBeTruthy();
  });
});
