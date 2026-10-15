// B1-S01-E1 "Have You Ever...? · Cold Open": reads the roadmap blueprint, the approved plan (docs/academy-b1-s01-spec.md) and the new games (Trophy Forge, trio streak).
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { Deck } from '../Deck';
import { scoreGuess } from '../slides/games';
import { B1_S01_E1, BLOG, CRITERIA, ITEMS, OBJECTIVE, TRIOS, REVISED, HARD, streakRound } from '../lessons/b1s01e1';
import { ACADEMY_LESSON_BLUEPRINTS, SPEAKING_TARGETS } from '../../curriculum/academy';
import { partsFor, type Slide } from '../types';
import { slideLines } from '../spoken';

afterEach(cleanup);
const slides = B1_S01_E1.slides;
const bp = ACADEMY_LESSON_BLUEPRINTS.find((b) => b.id === 'B1-S01-E1')!;
const parts = (): number[] => [...new Set(slides.map((x) => x.part))];
const at = (id: string) => slides.findIndex((s) => s.id === id);
const open = (id: string) => render(<Deck script={B1_S01_E1} teacher slide={at(id)} />);

// Same estimate as the other lessons (a slow student: listen, say, hesitate, try again), plus the two new games.
const minutes = (s: Slide): number => {
  switch (s.kind) {
    case 'title': return 0.2;
    case 'brief': return 0.8;
    case 'dial': return 0.4;
    case 'teach': return s.pages.length * 0.6;
    case 'model': return s.lines.length * 0.35;
    case 'whosaid': return 0.6 + s.items.length * 0.4 + (s.replay?.length ?? 0) * 0.3;
    case 'convo': return 0.6 + s.steps.length * 0.5;
    case 'memory': return 0.8 + s.pairs.length * 0.4;
    case 'match': return 0.6 + s.pairs.length * 0.35;
    case 'build': return s.rounds.length * 1.2;
    case 'hearpick': return 0.5 + s.rounds.length * 0.5;
    case 'rule': return 1;
    case 'fade': return 0.6 + s.lines.length * 0.6;
    case 'say': return 2;
    case 'wrap': return 3.2;
    case 'explore': return 0.6 + s.spots.length * 0.4;
    case 'sort': return 0.6 + s.items.length * 0.45;
    case 'story': return 0.4 + s.beats.reduce((n, b) => n + b.lines.length, 0) * 0.4;
    case 'forge': return 0.5 + s.rounds.length * 0.7;
    case 'streak': return 0.5 + s.rounds.length * 0.35;
    case 'write': return 0.8 + s.rows.length * 1;
    case 'readq': return 0.4 + s.questions.length * 1;
    case 'passage': return 3.5;
    case 'quiz': return 0.5 + s.questions.length * 0.8;
    case 'boss': return 0.5 + s.rounds.length * 0.9;
    case 'wordle': return 0.5 + s.rounds.length * 1.0;
    case 'rpg': return 0.6 + s.scenes.length * 0.9;
    case 'triple': return 0.6 + s.verbs.length * 0.7;
    default: return 1;
  }
};

describe('B1-S01-E1: the blueprint and the approved plan', () => {
  it('reads the blueprint: id, level, lead and cast, 12 receptive items, the eight parts, and keeps its main-idea objective', () => {
    expect(B1_S01_E1.lessonId).toBe(bp.id);
    expect(B1_S01_E1.level).toBe('B1');
    expect(bp.cast.lead).toBe('Vee');
    expect(B1_S01_E1.cast).toEqual(expect.arrayContaining(['Vee', 'Ava']));
    expect(ITEMS).toHaveLength(bp.newItems.count);
    expect(bp.newItems.kind).toBe('receptive');
    expect(partsFor(B1_S01_E1).map((p) => p.name)).toEqual(bp.runOfShow.map((r) => r.name));
    expect(bp.objective).toMatch(/main idea of a short text about experiences and bucket lists/);
    expect(OBJECTIVE).toMatch(/main idea and the detail of a short blog post/);
  });

  it('keeps to five observable "I can" success criteria, and every criterion is trained on at least three slides', () => {
    expect(CRITERIA).toHaveLength(5);
    CRITERIA.forEach((c) => expect(c).toMatch(/^I /));
    for (let c = 1; c <= 5; c++) expect(slides.filter((s) => s.trains?.includes(c)).length, `criterion ${c}`).toBeGreaterThanOrEqual(2);
    slides.filter((s) => !['title', 'brief', 'wrap', 'dial'].includes(s.kind)).forEach((s) => expect(s.trains?.length, s.id).toBeGreaterThan(0));
  });

  it('TIME: the lesson minutes add to 60, the REQUIRED pages fill each part (70-125 %) and the hour (57-64.5), optional pages at most 18 minutes', () => {
    const parts = partsFor(B1_S01_E1);
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
    expect(slides.filter((s) => s.optional).reduce((a, s) => a + minutes(s), 0)).toBeLessThanOrEqual(18);
  });

  it('INTENSIVE PRACTICE: at least 80 student responses, at least five different games, no two neighbouring pages of the same kind', () => {
    const responses = (s: Slide): number => {
      switch (s.kind) {
        case 'hearpick': case 'build': return s.rounds.length;
        case 'forge': return s.rounds.length * 2;
        case 'write': return s.rows.length;
        case 'readq': case 'quiz': return s.questions.length;
        case 'boss': case 'wordle': return s.rounds.length;
        case 'triple': return s.verbs.length * 3;
        case 'rpg': return s.scenes.length;
        case 'streak': return s.rounds.length * 2;
        case 'match': return s.pairs.length;
        case 'memory': return s.pairs.length * 2;
        case 'sort': return s.items.length;
        case 'explore': return s.spots.length;
        case 'convo': return s.steps.length;
        case 'say': return 1;
        case 'fade': return s.lines.length;
        default: return 0;
      }
    };
    const total = slides.reduce((a, s) => a + responses(s), 0);
    expect(total, `${total} responses`).toBeGreaterThanOrEqual(80);
    const games = new Set(slides.filter((s) => ['match', 'memory', 'sort', 'forge', 'streak', 'hearpick', 'build', 'explore', 'quiz', 'boss', 'wordle', 'rpg', 'triple'].includes(s.kind)).map((s) => s.kind));
    expect(games.size).toBeGreaterThanOrEqual(5);
    slides.slice(1).forEach((s, i) => expect(s.kind, `${slides[i].id} -> ${s.id}`).not.toBe(slides[i].kind));
  });

  it('modelling and the rule: the rule (3 lines) comes before the practice games of Notice & Build, the teacher models the Mission before Take 1, and the student teaches back in the Wrap', () => {
    const rule = slides.find((s) => s.kind === 'rule');
    expect(rule && rule.kind === 'rule' && rule.lines.length).toBe(3);
    expect(at('detective')).toBeLessThan(at('rule-trio')); // B1: notice first, then the rule
    expect(at('rule-trio')).toBeLessThan(at('write-forms'));
    expect(at('rule-trio')).toBeLessThan(at('forge'));
    expect(at('model-task')).toBeLessThan(at('say-take1'));
    expect(at('say-take1')).toBeLessThan(at('say-take2'));
    expect(slides.some((s) => s.id === 'teach-back' && s.part === 7)).toBe(true);
  });

  it('LADDER: every teaching page has a stage, the stages climb inside each part (watch → rule → practise together → your turn → make it yours), and the Mission is modelled before it is practised', () => {
    const rank: Record<string, number> = { review: 0, context: 1, model: 2, rule: 3, controlled: 4, free: 5, produce: 6 };
    slides.filter((x) => !['title', 'brief', 'dial', 'wrap'].includes(x.kind)).forEach((x) => expect(x.stage, x.id).toBeTruthy());
    parts().forEach((p) => {
      const inPart = slides.filter((x) => x.part === p && x.stage);
      inPart.slice(1).forEach((x, i) => expect(rank[x.stage!], `${inPart[i].id} (${inPart[i].stage}) -> ${x.id} (${x.stage})`).toBeGreaterThanOrEqual(rank[inPart[i].stage!]));
    });
    expect(slides[at('model-task')].stage).toBe('model');
    expect(at('model-task')).toBeLessThan(at('rpg'));
    expect(at('rpg')).toBeLessThan(at('say-take1'));
    expect(at('say-take2')).toBeLessThan(at('my-list'));
    expect(at('my-list')).toBeLessThan(at('say-release'));
    expect(at('say-release')).toBeLessThan(at('teach-back'));
    expect(at('rule-trio')).toBeLessThan(at('say-take1'));
  });

  it('after the six words come TWO different memorising games before anything new', () => {
    const i = at('teach-words');
    expect(slides.slice(i + 1, i + 3).map((s) => s.kind)).toEqual(['match', 'memory']);
  });

  it('FOUR SKILLS: the lesson listens (dialogue + questions), reads (a 150-220 word post + questions), writes (typed sentences) and speaks (5+ tasks), and the text is B1 length', () => {
    const kinds = new Set(slides.map((s) => s.kind));
    ['story', 'passage', 'readq', 'write', 'say', 'rpg'].forEach((k) => expect(kinds.has(k as Slide['kind']), k).toBe(true));
    const words = BLOG.join(' ').split(/\s+/).length;
    expect(words, `${words} words`).toBeGreaterThanOrEqual(150);
    expect(words).toBeLessThanOrEqual(220);
    const rq = slides.find((s) => s.kind === 'readq');
    if (rq?.kind !== 'readq') throw new Error('no readq');
    const types = new Set(rq.questions.map((q) => q.type));
    ['gist', 'detail', 'inference'].forEach((t) => expect(types.has(t as 'gist'), t).toBe(true));
    rq.questions.forEach((q) => expect(q.options).toContain(q.answer));
    const pass = slides.find((s) => s.kind === 'passage');
    if (pass?.kind !== 'passage') throw new Error('no passage');
    pass.keepFrom.forEach((w) => expect(BLOG.join(' ').toLowerCase()).toContain(w));
    const writes = slides.filter((s) => s.kind === 'write');
    expect(writes.length).toBeGreaterThanOrEqual(2);
  });

  it('VIDEO-GAME MECHANICS: the lesson plays a quiz-show ladder, a boss fight, a word puzzle, a dialogue RPG, a crafting forge and a speedrun, each tied to a criterion', () => {
    const kinds = slides.map((x) => x.kind);
    ['quiz', 'boss', 'wordle', 'rpg', 'forge', 'streak', 'triple'].forEach((k) => expect(kinds, k).toContain(k));
    ['hot-seat', 'boss', 'wordle', 'rpg', 'forge'].forEach((id) => expect(slides[at(id)].trains?.length, id).toBeGreaterThan(0));
    expect(at('hot-seat')).toBeLessThan(at('story-dare')); // activate the past simple before the new input
    expect(at('rule-trio')).toBeLessThan(at('boss')); // the rule comes before the boss fight
    expect(at('model-task')).toBeLessThan(at('rpg')); // modelled before the student plays
  });

  it('SPEAKING: the lesson reaches the free step (Mission Take 2, Release) with at least five distinct spoken tasks', () => {
    expect(SPEAKING_TARGETS.B1.reachesStep).toBe('free');
    const say = slides.filter((s) => s.kind === 'say');
    expect(say.length).toBeGreaterThanOrEqual(5);
    expect(slides.some((s) => s.id === 'say-release' && s.kind === 'say' && s.open)).toBe(true);
  });

  it('every spoken line can be baked (no variables or blanks) except the learner-filled model lines', () => {
    slides.forEach((s) => slideLines(s).forEach((l) => expect(l.text, s.id).not.toMatch(/[{}]/)));
  });
});

describe('B1-S01-E1: Trophy Forge and the trio streak', () => {
  it('the trios are real: six new participles and four revised, base / past simple / past participle in order', () => {
    expect(TRIOS.map((t) => t[2])).toEqual(['gone', 'been', 'seen', 'eaten', 'taken', 'flown']);
    expect(REVISED.map((t) => t[0])).toEqual(['do', 'make', 'write', 'win']);
    expect(HARD.map((t) => t[2])).toEqual(['driven', 'chosen', 'begun', 'spoken']);
    expect(ITEMS).toEqual(expect.arrayContaining(TRIOS.map((t) => t[2])));
  });

  it('FORGE: a wrong tile says Not yet and places nothing; the forms go in order; the trophy is added', () => {
    open('forge');
    fireEvent.click(screen.getByRole('button', { name: 'gone' })); // the first form must be the base: go
    expect(screen.getByText(/Not yet/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'go' }));
    fireEvent.click(screen.getByRole('button', { name: 'went' }));
    fireEvent.click(screen.getByRole('button', { name: 'gone' }));
    expect(screen.getByRole('button', { name: /Add the trophy/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Add the trophy/ }));
    expect(screen.getByRole('list', { name: /Trophies: 1 of 2/ })).toBeTruthy();
  });

  it('STREAK: a miss resets the streak and costs nothing else; the right past simple moves to the participle; wrong options are real forms', () => {
    open('streak');
    const t = HARD[0]; // drive, drove, driven
    const r = streakRound(t, 0);
    expect(r.pastOptions).not.toContain(t[1]);
    expect(r.partOptions).not.toContain(t[2]);
    [...r.pastOptions, ...r.partOptions].forEach((o) => expect(/^[a-z]+$/.test(o)).toBe(true));
    fireEvent.click(screen.getByRole('button', { name: r.pastOptions[0] }));
    expect(screen.getByText(/Not yet/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'drove' }));
    expect(screen.getByRole('group', { name: 'Choose the past participle' })).toBeTruthy();
  });

  it('TRIO CHECK: a private three-box sort that saves what the student already knows', () => {
    const s = slides.find((x) => x.id === 'trio-check');
    expect(s?.kind).toBe('sort');
    if (s?.kind !== 'sort') throw new Error('no sort');
    expect(s.save).toBe('trioKnown');
    expect(s.bins).toHaveLength(3);
    expect(s.items.map((i) => i.word)).toEqual(TRIOS.map((t) => t[0]));
  });

  it('READING QUESTIONS: a wrong sentence says Not yet, the right one shows why, and Next moves on', () => {
    open('blog-q');
    fireEvent.click(screen.getByRole('button', { name: 'Everyone should learn to surf this term.' }));
    expect(screen.getByText(/Not yet/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'You are brave when you do something even though you are afraid.' }));
    expect(screen.getByText(/Paragraph 3/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Next ▸' }));
    expect(screen.getByText(/2 of 3/)).toBeTruthy();
  });

  it('BOSS: a wrong tense costs a shield and shows the hint; the right one strikes, shows why and cracks the clock', () => {
    open('boss');
    fireEvent.click(screen.getByRole('button', { name: 'went' }));
    expect(screen.getByText(/Not yet/)).toBeTruthy();
    expect(screen.getByRole('list', { name: /Shields: 2 of 3/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'have been' }));
    expect(screen.getByText(/no finished time/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Strike again/ })).toBeTruthy();
  });

  it('WORDLE: scoring marks green, gold and grey with duplicates counted once', () => {
    expect(scoreGuess('flown', 'flown')).toEqual(['hit', 'hit', 'hit', 'hit', 'hit']);
    expect(scoreGuess('taken', 'flown')).toEqual(['miss', 'miss', 'miss', 'miss', 'hit']);
    expect(scoreGuess('nolfw', 'flown')).toEqual(['near', 'near', 'near', 'near', 'near']);
    expect(scoreGuess('eeeee', 'taken')).toEqual(['miss', 'miss', 'miss', 'hit', 'miss']);
  });

  it('WORDLE: typing and Enter on the on-screen keyboard solves a word', () => {
    open('wordle');
    'flown'.split('').forEach((c) => fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${c}$`, 'i') })));
    fireEvent.click(screen.getByRole('button', { name: 'Enter' }));
    expect(screen.getByText(/First try/)).toBeTruthy();
  });

  it('RPG: the best reply raises Rapport by 2, a mistimed one by 0 and explains why', () => {
    open('rpg');
    fireEvent.click(screen.getByRole('button', { name: 'Yes, I have been to Italy last year.' }));
    expect(screen.getByText(/finished time/)).toBeTruthy();
    expect(screen.getByRole('meter', { name: 'Rapport' }).getAttribute('aria-valuenow')).toBe('0');
    fireEvent.click(screen.getByRole('button', { name: /Keep talking/ }));
    fireEvent.click(screen.getByRole('button', { name: 'I went last August with my family.' }));
    expect(screen.getByRole('meter', { name: 'Rapport' }).getAttribute('aria-valuenow')).toBe('2');
  });

  it('HOT SEAT: 50:50 hides two wrong answers, Ask Ava gives the hint, a wrong answer only greys that option', () => {
    open('hot-seat');
    fireEvent.click(screen.getByRole('button', { name: /Ask Ava/ }));
    expect(screen.getByText(/Yesterday is finished/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /50 : 50/ }));
    const left = screen.getAllByRole('button').filter((b) => /^[ABCD] /.test(b.textContent ?? '') && (b as HTMLElement).style.visibility !== 'hidden');
    expect(left.length).toBe(2);
  });

  it('TRIPLE MATCH: a wrong triple shakes and clears, the right three lock into a card and the combo rises', () => {
    open('triple-1');
    const tile = (label: string, col: number) => within(screen.getByRole('group', { name: ['Base', 'Past simple', 'Past participle'][col] })).getByRole('button', { name: label });
    fireEvent.click(tile('go', 0)); fireEvent.click(tile('ate', 1)); fireEvent.click(tile('gone', 2));
    expect(screen.getByText(/Not the same verb/)).toBeTruthy();
  });

  it('TRIPLE MATCH: matching go, went, gone locks the card and shows Combo x1', async () => {
    open('triple-1');
    const tile = (label: string, col: number) => within(screen.getByRole('group', { name: ['Base', 'Past simple', 'Past participle'][col] })).getByRole('button', { name: label });
    fireEvent.click(tile('go', 0)); fireEvent.click(tile('went', 1)); fireEvent.click(tile('gone', 2));
    expect(screen.getByRole('status', { name: /Matched 1 of 5. Combo 1/ })).toBeTruthy();
  });
});
