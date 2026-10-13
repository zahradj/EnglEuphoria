// A1-S03-E1 "The Missing Poster" (Free Time Club, Cold Open, version 2): blueprint, the sequencing law (context, model, rule, controlled, free, produce), modelling + the stated rule, originality (new scene and games), vocabulary games, time, and play-throughs of the new Explore and Sort games.
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Deck } from '../Deck';
import { FREE_TIME_CLUB_1, CRITERIA, ITEMS, OBJECTIVE } from '../lessons/freeTimeClub1';
import { ACADEMY_LESSON_BLUEPRINTS } from '../../curriculum/academy';
import { PARTS, STAGE_ORDER, type Slide } from '../types';
import { slideLines } from '../spoken';

afterEach(cleanup);
const bp = ACADEMY_LESSON_BLUEPRINTS.find((b) => b.id === 'A1-S03-E1')!;
const slides = FREE_TIME_CLUB_1.slides;
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
    case 'phonechat': return 0.4 + s.steps.length * 0.65;
    case 'spell': return 0.8 + 0.2 * s.target.length;
    case 'say': return 2;
    case 'wrap': return 3.2;
    default: return 1;
  }
};

describe('A1 S3 E1 The Missing Poster: blueprint', () => {
  it('reads the Academy blueprint: id, cast, 14 receptive items, Season title, clue 1', () => {
    expect(FREE_TIME_CLUB_1.lessonId).toBe(bp.id);
    expect([...FREE_TIME_CLUB_1.cast].sort()).toEqual(bp.cast.appears.map((c) => c.name).sort());
    expect(ITEMS).toHaveLength(bp.newItems.count);
    expect(bp.newItems.kind).toBe('receptive');
    expect(bp.clue.no).toBe(1);
    expect(OBJECTIVE).toMatch(/^By the end I can/);
    expect(CRITERIA).toHaveLength(5);
    slides.forEach((s) => (s.actors ?? []).forEach((a) => expect(FREE_TIME_CLUB_1.cast, `${s.id} uses ${a.who}`).toContain(a.who)));
    expect(new Set(slides.map((s) => s.id)).size).toBe(slides.length);
    const wrap = slides[slides.length - 1];
    expect(wrap.kind === 'wrap' && wrap.clue).toMatch(/Clue 1 of 8/);
  });

  it('follows the run of show: 8 parts in order, Mission = dial, model, Take 1, feedback (fade), Take 2', () => {
    const parts = slides.map((s) => s.part);
    expect([...parts].sort((a, b) => a - b)).toEqual(parts);
    expect(new Set(parts)).toEqual(new Set([0, 1, 2, 3, 4, 5, 6, 7]));
    expect(FREE_TIME_CLUB_1.partGoals).toHaveLength(PARTS.length);
    const m = slides.filter((s) => s.part === 5).map((s) => s.id);
    expect(m[0]).toBe('dial');
    expect(m.indexOf('model-task')).toBeLessThan(m.indexOf('say-take1'));
    expect(m.indexOf('say-take1')).toBeLessThan(m.indexOf('fade'));
    expect(m.indexOf('fade')).toBeLessThan(m.indexOf('say-take2'));
  });
});

describe('A1 S3 E1 The Missing Poster: sequencing and the owner rules (modelling, the rule)', () => {
  it('ORDER LAW: the stages never go backwards for the new language: model, rule, controlled, free, produce', () => {
    const staged = slides.filter((s) => s.stage && (STAGE_ORDER as string[]).includes(s.stage) && s.part >= 2 && s.part <= 4);
    const order = staged.map((s) => STAGE_ORDER.indexOf(s.stage!));
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(staged.map((s) => s.stage)).toEqual(expect.arrayContaining(['context', 'model', 'rule', 'controlled', 'free']));
  });

  it('MODELLING: the lesson models the language (model slide) before the rule, and models the Mission task before Take 1', () => {
    expect(idx('model-like')).toBeLessThan(idx('rule-like'));
    expect(idx('rule-like')).toBeLessThan(idx('match-hobby'));
    expect(idx('model-task')).toBeLessThan(idx('say-take1'));
  });

  it('THE RULE: stated in 3 lines or fewer with an example each, BEFORE any practice game of that language, and restated by the student (teach-back) at the end', () => {
    const rule = slides[idx('rule-like')];
    expect(rule.kind).toBe('rule');
    if (rule.kind === 'rule') {
      expect(rule.lines.length).toBeLessThanOrEqual(3);
      rule.lines.forEach((l) => expect(l.example).toMatch(/^I (like|love)/));
    }
    const firstPracticeOfLike = slides.findIndex((s) => ['match-hobby', 'hear-hobby', 'shadow-hobby', 'sort-like', 'build-badge'].includes(s.id));
    expect(idx('rule-like')).toBeLessThan(firstPracticeOfLike);
    expect(slides[idx('teach-back')].kind).toBe('say');
    expect(idx('teach-back')).toBeGreaterThan(idx('say-take2'));
  });

  it('RULE: after every vocabulary introduction come two different games; no two neighbouring slides share a game', () => {
    const GAMES = new Set(['match', 'memory', 'lockers', 'numtrain', 'countup', 'shadow', 'spell', 'bepick', 'build', 'hearpick', 'blend', 'reader']);
    slides.forEach((s, i) => {
      if (s.kind !== 'teach') return;
      const after = slides.slice(i + 1, i + 3);
      expect(after.every((g) => GAMES.has(g.kind)), `${s.id}: games after it`).toBe(true);
      expect(new Set(after.map((g) => g.kind)).size, `${s.id}: different kinds`).toBe(2);
    });
    for (let i = 1; i < slides.length; i++) expect(slides[i].kind, `${slides[i - 1].id} -> ${slides[i].id}`).not.toBe(slides[i - 1].kind);
    expect(new Set(slides.map((s) => s.kind)).size).toBeGreaterThanOrEqual(12);
  });

  it('ALIGNMENT: every criterion is practised on at least 3 slides and every non-intro slide trains one', () => {
    for (let c = 1; c <= 5; c++) expect(slides.filter((s) => s.trains?.includes(c)).length, `criterion ${c}`).toBeGreaterThanOrEqual(3);
    slides.filter((s) => !['title', 'brief', 'wrap', 'dial'].includes(s.kind)).forEach((s) => expect(s.trains?.length, s.id).toBeGreaterThan(0));
  });

  it('TIME: the core slides (without the bonus games) fill 70-125 % of each part and total 57-64.5 minutes; the bonus games add at most 15 more', () => {
    const core = slides.filter((s) => !s.flex);
    const per = PARTS.map((_, i) => core.filter((s) => s.part === i).reduce((a, s) => a + minutes(s), 0));
    per.forEach((m, i) => {
      expect(m, `${PARTS[i].name}: ${m.toFixed(1)} min`).toBeGreaterThanOrEqual(PARTS[i].minutes * 0.7);
      expect(m, `${PARTS[i].name}: ${m.toFixed(1)} min`).toBeLessThanOrEqual(PARTS[i].minutes * 1.25);
    });
    const total = per.reduce((a, b) => a + b, 0);
    expect(total, `core total ${total.toFixed(1)} min`).toBeGreaterThanOrEqual(57);
    expect(total, `core total ${total.toFixed(1)} min`).toBeLessThanOrEqual(64.5);
    const bonus = slides.filter((s) => s.flex).reduce((a, s) => a + minutes(s), 0);
    expect(bonus, `bonus ${bonus.toFixed(1)} min`).toBeLessThanOrEqual(15);
  });

  it('ORIGINALITY (owner 2026-10-14): new scene, new games, and none of the Season 1 opening pattern (badge-convo opening, brief card, who-said, border booth, padlock, find-the-wrong-line)', () => {
    const kinds = new Set(slides.map((x) => x.kind));
    ['explore', 'sort', 'hunt', 'phonechat', 'shadow', 'hearpick', 'rule'].forEach((k) => expect(kinds.has(k as never), k).toBe(true));
    ['brief', 'whosaid', 'border', 'padlock', 'findwrong', 'factcheck', 'card', 'numwall', 'lockers'].forEach((k) => expect(kinds.has(k as never), `must not use ${k}`).toBe(false));
    expect(slides.some((x) => x.bg === 'fair-night')).toBe(true);
    expect(new Set(slides.map((x) => x.bg)).size).toBeGreaterThanOrEqual(5);
    expect(slides[1].kind).not.toBe('convo');
  });

  it('VOCABULARY GAMES: the club words and the hobby words each get drag-match, listen/hear, memory and shadow games; every bonus game is marked so the teacher can skip it', () => {
    slides.filter((s) => s.flex).forEach((s) => expect(s.note, s.id).toMatch(/Bonus game/));
    expect(slides.filter((s) => s.kind === 'match' && (s.mode ?? 'drag') === 'drag').length).toBeGreaterThanOrEqual(2);
    expect(slides.filter((s) => s.kind === 'memory').length).toBeGreaterThanOrEqual(2);
    expect(slides.length).toBeGreaterThanOrEqual(30);
    expect(slides.length).toBeLessThanOrEqual(49);
  });

  it('every spoken line can be baked (no variables or blanks) except the learner-filled model lines', () => {
    slides.forEach((s) => slideLines(s).forEach((l) => expect(l.text, s.id).not.toMatch(/[{}]|_{2,}/)));
  });
});

describe('A1 S3 E1 The Missing Poster: play-through', () => {
  const open = (id: string) => render(<Deck script={FREE_TIME_CLUB_1} teacher slide={idx(id)} />);

  it('RULE slide: each line is said, then the slide is done and Next unlocks', () => {
    open('rule-like');
    expect(screen.getAllByRole('button', { name: /^I said it$/ })).toHaveLength(3);
    for (const b of screen.getAllByRole('button', { name: /^I said it$/ })) fireEvent.click(b);
    expect(screen.getByText(/You know the rule/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Next/ })).toBeEnabled();
  });

  it('HEAR AND PICK sentences: a wrong choice says Not yet, the right one moves on', () => {
    open('hear-hobby');
    fireEvent.click(screen.getByRole('button', { name: 'I love music.' }));
    expect(screen.getByText(/Not yet/)).toBeTruthy();
  });

  it('EXPLORE: tapping every stall hears its line, shows the bubble and finishes the slide', () => {
    open('walk');
    const spots = screen.getAllByRole('button', { name: /stall/ });
    expect(spots).toHaveLength(5);
    spots.forEach((b) => fireEvent.click(b));
    expect(screen.getByText(/visited every stall/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Next/ })).toBeEnabled();
  });

  it('SORT: tap a picture, tap a box, the sentence is built; no wrong answer; all placed finishes the slide', () => {
    open('sort-like');
    const words = ['music', 'games', 'drawing', 'football', 'films'];
    words.forEach((w, i) => {
      fireEvent.click(screen.getByRole('button', { name: w }));
      fireEvent.click(screen.getAllByRole('button', { name: i % 2 ? 'I love…' : 'I like…' })[0]);
    });
    expect(screen.getByText('I like music.')).toBeTruthy();
    expect(screen.getByText('I love games.')).toBeTruthy();
    expect(screen.getByText(/That is your hobby wall/)).toBeTruthy();
  });
});
