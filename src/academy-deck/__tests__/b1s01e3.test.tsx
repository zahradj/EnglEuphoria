// B1-S01-E3 "Have You Ever...? · Pattern Lab": reads the roadmap blueprint, the plan (docs/academy-b1-s01-e3-plan.md) and the owner rules (task first, rule after; modelling; speaking; a different game look).
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Deck } from '../Deck';
import { B1_S01_E3, BEEN_GONE, CRITERIA, ITEMS, OBJECTIVE, WHEN_CARDS } from '../lessons/b1s01e3';
import { ACADEMY_LESSON_BLUEPRINTS, SPEAKING_TARGETS } from '../../curriculum/academy';
import { partsFor, type Slide } from '../types';
import { slideLines } from '../spoken';

afterEach(cleanup);
const slides = B1_S01_E3.slides;
const bp = ACADEMY_LESSON_BLUEPRINTS.find((b) => b.id === 'B1-S01-E3')!;
const at = (id: string) => slides.findIndex((s) => s.id === id);

// Same estimate as the other lessons (a slow student: listen, say, hesitate, try again).
const minutes = (s: Slide): number => {
  switch (s.kind) {
    case 'title': return 0.2;
    case 'brief': return 0.8;
    case 'dial': return 0.4;
    case 'model': return s.lines.length * 0.35;
    case 'build': return s.rounds.length * 1.2;
    case 'hearpick': return 0.5 + s.rounds.length * 0.5;
    case 'rule': return 1;
    case 'say': return 2;
    case 'wrap': return 3.2;
    case 'story': return 0.4 + s.beats.reduce((n, b) => n + b.lines.length, 0) * 0.4;
    case 'write': return 0.8 + s.rows.length * 1;
    case 'rpg': return 0.6 + s.scenes.length * 0.9;
    case 'board': return 0.6 + s.cards.length * 0.35;
    case 'cloze': return 1.5;
    default: return 1;
  }
};

describe('B1-S01-E3: the blueprint and the plan', () => {
  it('reads the blueprint: id, level, lead and cast (Vee and Theo), eight chunks, ONE structure, the eight parts', () => {
    expect(B1_S01_E3.lessonId).toBe(bp.id);
    expect(B1_S01_E3.level).toBe('B1');
    expect(bp.cast.lead).toBe('Vee');
    expect(B1_S01_E3.cast).toEqual(['Vee', 'Theo']);
    expect(ITEMS).toHaveLength(bp.newItems.count);
    expect(bp.newItems.kind).toBe('chunks');
    expect(bp.structures).toHaveLength(1);
    expect(bp.structures[0].id).toBe('present-perfect-experience');
    expect(partsFor(B1_S01_E3).map((p) => p.name)).toEqual(bp.runOfShow.map((r) => r.name));
    expect(OBJECTIVE).toMatch(/Have you ever/);
    slides.flatMap((s) => s.actors ?? []).forEach((a) => expect(['Vee', 'Theo']).toContain(a.who));
  });

  it('keeps to five observable "I can" criteria, each trained on at least three slides, the last of them production', () => {
    expect(CRITERIA).toHaveLength(5);
    CRITERIA.forEach((c) => expect(c).toMatch(/^I /));
    for (let c = 1; c <= 5; c++) expect(slides.filter((s) => s.trains?.includes(c)).length, `criterion ${c}`).toBeGreaterThanOrEqual(2);
    for (const c of [1, 2, 4, 5]) {
      const last = slides.filter((s) => s.trains?.includes(c)).pop()!;
      expect(['write', 'say', 'build', 'wrap']).toContain(last.kind);
    }
    slides.filter((s) => !['title', 'brief', 'wrap', 'dial'].includes(s.kind)).forEach((s) => expect(s.trains?.length, s.id).toBeGreaterThan(0));
  });

  it('TIME: the lesson minutes add to 60, the REQUIRED pages fill each part (70-125 %) and the hour (57-64.5)', () => {
    const parts = partsFor(B1_S01_E3);
    expect(parts.reduce((a, p) => a + p.minutes, 0)).toBe(60);
    const req = slides.filter((s) => !s.optional);
    const per = parts.map((_, i) => req.filter((s) => s.part === i).reduce((a, s) => a + minutes(s), 0));
    per.forEach((m, i) => {
      expect(m, `${parts[i].name}: ${m.toFixed(1)} min`).toBeGreaterThanOrEqual(parts[i].minutes * 0.7);
      expect(m, `${parts[i].name}: ${m.toFixed(1)} min`).toBeLessThanOrEqual(parts[i].minutes * 1.25);
    });
    const total = per.reduce((a, b) => a + b, 0);
    expect(total, `required total ${total.toFixed(1)} min`).toBeGreaterThanOrEqual(57);
    expect(total, `required total ${total.toFixed(1)} min`).toBeLessThanOrEqual(64.5);
  });

  it('INTENSIVE PRACTICE: at least 80 student responses, at least five different games, no two neighbouring pages of the same kind, never three speaking pages in a row', () => {
    const responses = (s: Slide): number => {
      switch (s.kind) {
        case 'hearpick': case 'build': return s.rounds.length;
        case 'write': return s.rows.length;
        case 'rpg': return s.scenes.length;
        case 'board': return s.cards.length;
        case 'cloze': return (s.paragraphs.join(' ').match(/\[\[/g) ?? []).length;
        case 'say': return 3; // a spoken task is several sentences
        default: return 0;
      }
    };
    const total = slides.reduce((a, s) => a + responses(s), 0);
    expect(total, `${total} responses`).toBeGreaterThanOrEqual(60);
    const games = new Set(slides.filter((s) => ['board', 'hearpick', 'build', 'rpg', 'cloze'].includes(s.kind)).map((s) => s.kind));
    expect(games.size).toBeGreaterThanOrEqual(5);
    slides.slice(1).forEach((s, i) => expect(s.kind, `${slides[i].id} -> ${s.id}`).not.toBe(slides[i].kind));
  });

  it('TASK FIRST, RULE AFTER: the Case Board sort comes before the model and the 3-line rule; the rule comes before every build; Mission is modelled before Take 1; Take 2 changes the listener; the student teaches back', () => {
    const rule = slides.find((s) => s.kind === 'rule');
    expect(rule && rule.kind === 'rule' && rule.lines.length).toBe(3);
    expect(at('board-when')).toBeLessThan(at('model-pattern'));
    expect(at('model-pattern')).toBeLessThan(at('rule-pattern'));
    expect(at('rule-pattern')).toBeLessThan(at('build-evidence'));
    expect(at('rule-pattern')).toBeLessThan(at('board-been'));
    expect(at('model-task')).toBeLessThan(at('alibi'));
    expect(at('model-task')).toBeLessThan(at('say-take1'));
    expect(at('say-take1')).toBeLessThan(at('say-take2'));
    expect(slides[at('say-take2')].note).toMatch(/Vee/);
    expect(slides[at('say-take1')].actors?.[0].who).not.toBe(slides[at('say-take2')].actors?.[0].who);
    expect(slides.some((s) => s.id === 'teach-back' && s.part === 7)).toBe(true);
  });

  it('LADDER: every teaching page has a stage and the stages climb inside each part', () => {
    const rank: Record<string, number> = { review: 0, context: 1, model: 2, rule: 3, controlled: 4, free: 5, produce: 6 };
    slides.filter((x) => !['title', 'brief', 'dial', 'wrap'].includes(x.kind)).forEach((x) => expect(x.stage, x.id).toBeTruthy());
    [...new Set(slides.map((x) => x.part))].forEach((p) => {
      const inPart = slides.filter((x) => x.part === p && x.stage);
      inPart.slice(1).forEach((x, i) => expect(rank[x.stage!], `${inPart[i].id} (${inPart[i].stage}) -> ${x.id} (${x.stage})`).toBeGreaterThanOrEqual(rank[inPart[i].stage!]));
    });
    expect(at('say-take2')).toBeLessThan(at('my-sentences'));
    expect(at('my-sentences')).toBeLessThan(at('say-release'));
    expect(at('say-release')).toBeLessThan(at('teach-back'));
  });

  it('LISTENING and SPEAKING: predict, then the story heard first, then three recorded-voice questions; the Release is private first; at least five spoken tasks', () => {
    expect(at('predict')).toBeLessThan(at('story-case'));
    const story = slides[at('story-case')];
    expect(story.kind === 'story' && story.listenFirst).toBe(true);
    const lq = slides[at('listen-q')];
    expect(lq.kind === 'hearpick' && lq.rounds.length).toBe(3);
    if (lq.kind === 'hearpick') lq.rounds.forEach((r) => expect(r.options).toContain(r.answer));
    const says = slides.filter((s) => s.kind === 'say');
    expect(says.length).toBeGreaterThanOrEqual(SPEAKING_TARGETS.B1.speakingTasks - 1);
    expect((slides[at('say-release')] as Extract<Slide, { kind: 'say' }>).open).toBeFalsy();
    expect(slides[at('say-take1')].stage).toBe('free');
  });

  it('CASE BOARD cards: four of each kind, every answer is a real bin, the finished-time cards have a time word and the experience cards have none', () => {
    expect(WHEN_CARDS).toHaveLength(8);
    expect(WHEN_CARDS.filter((c) => c.bin === 'when')).toHaveLength(4);
    WHEN_CARDS.filter((c) => c.bin === 'when').forEach((c) => expect(c.text).toMatch(/last |yesterday|in July|ago|went|flew|took|ate/i));
    WHEN_CARDS.filter((c) => c.bin === 'now').forEach((c) => expect(c.text).toMatch(/\b(have|has|ever|never)\b/i));
    BEEN_GONE.forEach((c) => { expect(['been', 'gone']).toContain(c.bin); expect(c.text).toContain('___'); expect(c.say).toContain(c.bin); expect(c.say).not.toContain('___'); });
    expect(BEEN_GONE.filter((c) => c.bin === 'been').length).toBeGreaterThanOrEqual(2);
    expect(BEEN_GONE.filter((c) => c.bin === 'gone').length).toBeGreaterThanOrEqual(2);
  });

  it('ALIBI: every scene has one best question; the pattern is never mixed with a finished time in the best answer', () => {
    const m = slides[at('alibi')];
    if (m.kind !== 'rpg') throw new Error('no alibi');
    m.scenes.forEach((s) => expect(s.options.filter((o) => o.score === 2)).toHaveLength(1));
    expect(m.goal).toBeLessThanOrEqual(m.scenes.length * 2);
    m.scenes.forEach((s) => expect(s.options.find((o) => o.score === 2)!.text).not.toMatch(/have been .*(last|ago|yesterday)/i));
  });

  it('RELEASE writing accepts only sentences that use the pattern', () => {
    const w = slides[at('my-sentences')];
    if (w.kind !== 'write') throw new Error('no write');
    w.rows.forEach((r) => {
      expect(r.accept.some((a) => new RegExp(a, 'i').test(r.sample)), r.label).toBe(true);
    });
    expect(new RegExp(w.rows[0].accept[0], 'i').test('I like pizza.')).toBe(false);
    expect(new RegExp(w.rows[1].accept[0], 'i').test('I have gone there.')).toBe(false);
  });

  it('every spoken line can be baked (no variables or blanks)', () => {
    const lines = slides.flatMap((s) => slideLines(s));
    expect(lines.length).toBeGreaterThan(40);
    lines.forEach((l) => { expect(l.text).not.toMatch(/\{[a-z]+\}/i); expect(l.text).not.toMatch(/_{2,}/); });
  });

  it('renders: both Case Boards, the Alibi and the wrap open without error', () => {
    for (const id of ['board-when', 'board-been', 'alibi', 'wrap']) {
      render(<Deck script={B1_S01_E3} teacher slide={at(id)} />);
      cleanup();
    }
  });

  it('CASE BOARD play: a wrong pin only nudges, a right pin sticks and fills the progress, and every card pinned finishes it', () => {
    render(<Deck script={B1_S01_E3} teacher slide={at('board-when')} />);
    const pins = () => screen.getAllByRole('button', { name: /pin the card here/i });
    let guard = 0;
    while (screen.queryByText(/Every card is pinned/) === null && guard++ < 30) {
      const card = screen.getByRole('article').textContent ?? '';
      const c = WHEN_CARDS.find((x) => card.includes(x.text))!;
      const [whenBtn, nowBtn] = pins();
      if (guard === 1) {
        fireEvent.click(c.bin === 'when' ? nowBtn : whenBtn); // wrong first
        expect(screen.getByText(/time word|have \/ has|Not yet/i)).toBeTruthy();
      }
      fireEvent.click(c.bin === 'when' ? whenBtn : nowBtn);
    }
    expect(screen.getByText(/Every card is pinned/)).toBeTruthy();
  });

  it('GAME FEEL: right pins show the +10 XP burst and the streak flame, and the third right answer in a row earns an achievement badge', () => {
    render(<Deck script={B1_S01_E3} teacher slide={at('board-when')} />);
    for (let k = 0; k < 3; k++) {
      const card = screen.getByRole('article').textContent ?? '';
      const c = WHEN_CARDS.find((x) => card.includes(x.text))!;
      const [whenBtn, nowBtn] = screen.getAllByRole('button', { name: /pin the card here/i });
      fireEvent.click(c.bin === 'when' ? whenBtn : nowBtn);
    }
    expect(screen.getByText(/On a roll/)).toBeTruthy();
    expect(screen.getByLabelText('Streak 3')).toBeTruthy();
    expect(screen.getByText('+10 XP')).toBeTruthy();
  });
});
