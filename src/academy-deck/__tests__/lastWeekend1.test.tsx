// A2-S01-E1 "The Missing Poster" (Free Time Club, Cold Open, version 2): blueprint, the sequencing law (context, model, rule, controlled, free, produce), modelling + the stated rule, originality (new scene and games), vocabulary games, time, and play-throughs of the new Explore and Sort games.
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Deck } from '../Deck';
import { LAST_WEEKEND_1, CRITERIA, ITEMS, OBJECTIVE } from '../lessons/lastWeekend1';
import { ACADEMY_LESSON_BLUEPRINTS } from '../../curriculum/academy';
import { PARTS, STAGE_ORDER, type Slide } from '../types';
import { slideLines } from '../spoken';

afterEach(cleanup);
const bp = ACADEMY_LESSON_BLUEPRINTS.find((b) => b.id === 'A2-S01-E1')!;
const slides = LAST_WEEKEND_1.slides;
const idx = (id: string) => slides.findIndex((s) => s.id === id);

// Slow-beginner estimate (listen, repeat, hesitate, try again).
const minutes = (s: Slide): number => {
  switch (s.kind) {
    case 'title': return 0.2;
    case 'brief': return 0.8;
    case 'badge': return 1;
    case 'dial': return 0.4;
    case 'teach': return s.pages.length * 0.6;
    case 'model': return s.lines.length * 0.35;
    case 'rule': return 0.6 + s.lines.length * 0.5;
    case 'whosaid': return 0.6 + s.items.length * 0.4 + (s.replay?.length ?? 0) * 0.3;
    case 'convo': return 0.6 + s.steps.length * 0.5;
    case 'memory': return 0.8 + s.pairs.length * 0.4;
    case 'match': return 0.6 + s.pairs.length * 0.35;
    case 'build': return s.rounds.length * 1.2;
    case 'hearpick': return 0.5 + s.rounds.length * 0.5;
    case 'fade': return 0.6 + s.lines.length * 0.6;
    case 'write': return 1 + s.rows.length * 1.2;
    case 'shadow': return 0.5 + s.rounds.length * 0.5;
    case 'hunt': return 0.8 + s.targets.length * 0.5;
    case 'explore': return 1 + s.spots.length * 0.6;
    case 'sort': return 0.8 + s.items.length * 0.4;
    case 'story': return 0.4 + s.beats.reduce((n, b) => n + b.lines.length, 0) * 0.4;
    case 'phonechat': return 0.4 + s.steps.length * 0.65;
    case 'spell': return 0.8 + 0.2 * s.target.length;
    case 'say': return 2;
    case 'wrap': return 3.2;
    default: return 1;
  }
};

describe('A2 S1 E1 The Photo Wall', () => {
  it('reads the Academy blueprint: id, cast, 10 receptive items, clue 1, 8 parts, Mission order', () => {
    expect(LAST_WEEKEND_1.lessonId).toBe(bp.id);
    expect([...LAST_WEEKEND_1.cast].sort()).toEqual(bp.cast.appears.map((c) => c.name).sort());
    expect(ITEMS).toHaveLength(bp.newItems.count);
    expect(bp.newItems.kind).toBe('receptive');
    expect(OBJECTIVE).toMatch(/^By the end I can/);
    slides.forEach((s) => (s.actors ?? []).forEach((a) => expect(LAST_WEEKEND_1.cast, `${s.id} uses ${a.who}`).toContain(a.who)));
    expect(new Set(slides.map((s) => s.id)).size).toBe(slides.length);
    const parts = slides.map((s) => s.part);
    expect([...parts].sort((a, b) => a - b)).toEqual(parts);
    expect(new Set(parts)).toEqual(new Set([0, 1, 2, 3, 4, 5, 6, 7]));
    const m = slides.filter((s) => s.part === 5).map((s) => s.id);
    expect(m[0]).toBe('dial');
    expect(m.indexOf('model-task')).toBeLessThan(m.indexOf('say-take1'));
    expect(m.indexOf('say-take1')).toBeLessThan(m.indexOf('fade'));
    expect(m.indexOf('fade')).toBeLessThan(m.indexOf('say-take2'));
    const wrap = slides[slides.length - 1];
    expect(wrap.kind === 'wrap' && wrap.clue).toMatch(/Clue 1 of 8/);
  });

  it('ORDER, MODELLING and THE RULE: model, rule (3 lines), then practice; Mission modelled; teach-back at the end', () => {
    const staged = slides.filter((s) => s.stage && (STAGE_ORDER as string[]).includes(s.stage) && s.part >= 2 && s.part <= 4);
    const order = staged.map((s) => STAGE_ORDER.indexOf(s.stage!));
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(idx('model-past')).toBeLessThan(idx('rule-past'));
    expect(idx('rule-past')).toBeLessThan(idx('match-events'));
    expect(idx('model-task')).toBeLessThan(idx('say-take1'));
    const rule = slides[idx('rule-past')];
    if (rule.kind === 'rule') {
      expect(rule.lines.length).toBeLessThanOrEqual(3);
      rule.lines.forEach((l) => expect(l.example).toMatch(/ (was|were|camped) /));
    }
    expect(slides[idx('teach-back')].kind).toBe('say');
    expect(idx('teach-back')).toBeGreaterThan(idx('say-take2'));
  });

  it('two different games after every word set; no two neighbours alike; 12+ kinds; 30-49 slides; bonus games marked', () => {
    const GAMES = new Set(['match', 'memory', 'shadow', 'spell', 'build', 'hearpick']);
    slides.forEach((s, i) => {
      if (s.kind !== 'teach') return;
      const after = slides.slice(i + 1, i + 3);
      expect(after.every((g) => GAMES.has(g.kind)), `${s.id}: games after it`).toBe(true);
      expect(new Set(after.map((g) => g.kind)).size, `${s.id}: different kinds`).toBe(2);
    });
    for (let i = 1; i < slides.length; i++) expect(slides[i].kind, `${slides[i - 1].id} -> ${slides[i].id}`).not.toBe(slides[i - 1].kind);
    expect(new Set(slides.map((s) => s.kind)).size).toBeGreaterThanOrEqual(12);
    slides.filter((s) => s.flex).forEach((s) => expect(s.note, s.id).toMatch(/Bonus game/));
    expect(slides.length).toBeGreaterThanOrEqual(30);
    expect(slides.length).toBeLessThanOrEqual(49);
  });

  it('ALIGNMENT: every criterion is practised on 3+ slides; every non-intro slide trains one', () => {
    for (let c = 1; c <= 5; c++) expect(slides.filter((s) => s.trains?.includes(c)).length, `criterion ${c}`).toBeGreaterThanOrEqual(3);
    slides.filter((s) => !['title', 'brief', 'wrap', 'dial'].includes(s.kind)).forEach((s) => expect(s.trains?.length, s.id).toBeGreaterThan(0));
  });

  it('TIME: core slides fill 70-125 % of each part and total 57-64.5 minutes; bonus at most 15', () => {
    const core = slides.filter((s) => !s.flex);
    const per = PARTS.map((_, i) => core.filter((s) => s.part === i).reduce((a, s) => a + minutes(s), 0));
    per.forEach((m, i) => {
      expect(m, `${PARTS[i].name}: ${m.toFixed(1)} min`).toBeGreaterThanOrEqual(PARTS[i].minutes * 0.7);
      expect(m, `${PARTS[i].name}: ${m.toFixed(1)} min`).toBeLessThanOrEqual(PARTS[i].minutes * 1.25);
    });
    const total = per.reduce((a, b) => a + b, 0);
    expect(total, `core total ${total.toFixed(1)} min`).toBeGreaterThanOrEqual(57);
    expect(total, `core total ${total.toFixed(1)} min`).toBeLessThanOrEqual(64.5);
    expect(slides.filter((s) => s.flex).reduce((a, s) => a + minutes(s), 0)).toBeLessThanOrEqual(15);
  });

  it('ORIGINALITY: new place, photo-wall Explore, story plates; none of the Season 1 pattern', () => {
    const kinds = new Set(slides.map((x) => x.kind));
    ['story', 'explore', 'sort', 'phonechat', 'shadow', 'hearpick', 'rule'].forEach((k) => expect(kinds.has(k as never), k).toBe(true));
    ['brief', 'whosaid', 'border', 'padlock', 'findwrong', 'factcheck', 'card', 'numwall', 'lockers'].forEach((k) => expect(kinds.has(k as never), `must not use ${k}`).toBe(false));
    expect(slides.some((x) => x.bg === 'weekend-gallery')).toBe(true);
    expect(new Set(slides.map((x) => x.bg)).size).toBeGreaterThanOrEqual(5);
  });

  it('every spoken line can be baked (no variables or blanks) except the learner-filled model lines', () => {
    slides.forEach((s) => slideLines(s).forEach((l) => expect(l.text, s.id).not.toMatch(/[{}]|_{2,}/)));
  });
});

describe('A2 S1 E1 The Photo Wall: play-through', () => {
  const open = (id: string) => render(<Deck script={LAST_WEEKEND_1} teacher slide={idx(id)} />);

  it('RULE: each line is said, then Next unlocks', () => {
    open('rule-past');
    for (const b of screen.getAllByRole('button', { name: /^I said it$/ })) fireEvent.click(b);
    expect(screen.getByText(/You know the rule/)).toBeTruthy();
  });

  it('EXPLORE: tapping every photo finishes the slide', () => {
    open('walk');
    const spots = screen.getAllByRole('button', { name: /photo/ });
    expect(spots).toHaveLength(5);
    spots.forEach((b) => fireEvent.click(b));
    expect(screen.getByRole('button', { name: /Next/ })).toBeEnabled();
  });

  it('SORT: no wrong answer; the sentence is built', () => {
    open('sort-was');
    ['lake', 'hill', 'camp', 'wedding'].forEach((w, i) => {
      fireEvent.click(screen.getByRole('button', { name: w }));
      fireEvent.click(screen.getAllByRole('button', { name: i % 2 ? 'I was not there' : 'I was there' })[0]);
    });
    expect(screen.getByText('I was at the lake.')).toBeTruthy();
    expect(screen.getByText('I was not at the hill.')).toBeTruthy();
  });

  it('HEAR AND PICK: a wrong choice says Not yet', () => {
    open('hear-events');
    fireEvent.click(screen.getByRole('button', { name: 'We are at the wedding.' }));
    expect(screen.getByText(/Not yet/)).toBeTruthy();
  });

  it('STORY: one subtitle per tap', () => {
    open('story-welcome');
    expect(screen.getByText(/Welcome to the Photo Gallery/)).toBeTruthy();
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole('button', { name: /Next line/ }));
    expect(screen.getByText(/Where were you/)).toBeTruthy();
  });
});
