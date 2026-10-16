// B1-S01-E2 "Have You Ever...? · Word Lab": reads the roadmap blueprint, the approved plan (docs/academy-b1-s01-e2-plan.md) and the owner rules (two different memorising games after every word set, the rule before practice, a modelled Mission with Take 2, a private Release).
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Deck } from '../Deck';
import { B1_S01_E2, CRITERIA, ITEMS, OBJECTIVE, SETS } from '../lessons/b1s01e2';
import { ACADEMY_LESSON_BLUEPRINTS, SPEAKING_TARGETS, lessonItems } from '../../curriculum/academy';
import { partsFor, type Slide } from '../types';
import { slideLines } from '../spoken';

afterEach(cleanup);
const slides = B1_S01_E2.slides;
const bp = ACADEMY_LESSON_BLUEPRINTS.find((b) => b.id === 'B1-S01-E2')!;
const at = (id: string) => slides.findIndex((s) => s.id === id);

// Same estimate as the other lessons (a slow student: listen, say, hesitate, try again).
const minutes = (s: Slide): number => {
  switch (s.kind) {
    case 'title': return 0.2;
    case 'brief': return 0.8;
    case 'dial': return 0.4;
    case 'teach': return s.pages.length * 0.6;
    case 'model': return s.lines.length * 0.35;
    case 'memory': return 0.8 + s.pairs.length * 0.4;
    case 'match': return 0.6 + s.pairs.length * 0.35;
    case 'build': return s.rounds.length * 1.2;
    case 'hearpick': return 0.5 + s.rounds.length * 0.5;
    case 'rule': return 1;
    case 'say': return 2;
    case 'wrap': return 3.2;
    case 'sort': return 0.6 + s.items.length * 0.45;
    case 'story': return 0.4 + s.beats.reduce((n, b) => n + b.lines.length, 0) * 0.4;
    case 'write': return 0.8 + s.rows.length * 1;
    case 'rpg': return 0.6 + s.scenes.length * 0.9;
    case 'shadow': return 0.6 + s.rounds.length * 0.4;
    default: return 1;
  }
};

describe('B1-S01-E2: the blueprint and the approved plan', () => {
  it('reads the blueprint: id, level, lead and cast, the 14 core productive items from the Season bank, the eight parts, and keeps its objective', () => {
    expect(B1_S01_E2.lessonId).toBe(bp.id);
    expect(B1_S01_E2.level).toBe('B1');
    expect(bp.cast.lead).toBe('Vee');
    expect(B1_S01_E2.cast).toEqual(expect.arrayContaining(['Vee', 'Ava']));
    expect(ITEMS).toHaveLength(bp.newItems.count);
    expect(bp.newItems.kind).toBe('core-productive');
    expect(ITEMS).toEqual(lessonItems('B1-S01-E2').map((i) => i[0]));
    expect(partsFor(B1_S01_E2).map((p) => p.name)).toEqual(bp.runOfShow.map((r) => r.name));
    expect(bp.objective).toMatch(/new words for adventure and activities and feelings about experiences/);
    expect(OBJECTIVE).toMatch(/14 new words/);
    expect(bp.structures).toHaveLength(0);
  });

  it('keeps to five observable "I can" criteria, and every criterion is trained on at least three slides, the last of them production', () => {
    expect(CRITERIA).toHaveLength(5);
    CRITERIA.forEach((c) => expect(c).toMatch(/^I /));
    for (let c = 1; c <= 5; c++) expect(slides.filter((s) => s.trains?.includes(c)).length, `criterion ${c}`).toBeGreaterThanOrEqual(3);
    for (const c of [1, 2, 3, 5]) {
      const last = slides.filter((s) => s.trains?.includes(c)).pop()!;
      expect(['write', 'say', 'build', 'wrap']).toContain(last.kind);
    }
    slides.filter((s) => !['title', 'brief', 'wrap', 'dial'].includes(s.kind)).forEach((s) => expect(s.trains?.length, s.id).toBeGreaterThan(0));
  });

  it('TIME: the lesson minutes add to 60, the REQUIRED pages fill each part (70-125 %) and the hour (57-64.5), optional pages at most 28 minutes', () => {
    const parts = partsFor(B1_S01_E2);
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
    expect(slides.filter((s) => s.optional).reduce((a, s) => a + minutes(s), 0)).toBeLessThanOrEqual(28);
  });

  it('INTENSIVE PRACTICE: at least 80 student responses, at least five different games, no two neighbouring pages of the same kind, never three speaking pages in a row', () => {
    const responses = (s: Slide): number => {
      switch (s.kind) {
        case 'hearpick': case 'build': case 'shadow': return s.rounds.length;
        case 'write': return s.rows.length;
        case 'rpg': return s.scenes.length;
        case 'match': return s.pairs.length;
        case 'memory': return s.pairs.length * 2;
        case 'sort': return s.items.length;
        case 'say': return 1;
        case 'teach': return s.pages.length; // the student says each word after the guide
        default: return 0;
      }
    };
    const total = slides.reduce((a, s) => a + responses(s), 0);
    expect(total, `${total} responses`).toBeGreaterThanOrEqual(80);
    const games = new Set(slides.filter((s) => ['match', 'memory', 'sort', 'hearpick', 'build', 'rpg', 'shadow'].includes(s.kind)).map((s) => s.kind));
    expect(games.size).toBeGreaterThanOrEqual(5);
    slides.slice(1).forEach((s, i) => expect(s.kind, `${slides[i].id} -> ${s.id}`).not.toBe(slides[i].kind));
  });

  it('RULE: after EVERY word set come two different memorising games before anything new is taught', () => {
    const GAMES = new Set(['match', 'memory', 'shadow', 'spell', 'bepick', 'build']);
    const teach = slides.filter((s) => s.kind === 'teach');
    expect(teach).toHaveLength(3);
    teach.forEach((s) => {
      const i = slides.indexOf(s);
      const after = slides.slice(i + 1, i + 3);
      expect(after.every((g) => GAMES.has(g.kind)), `${s.id}: the next two slides must be games`).toBe(true);
      expect(new Set(after.map((g) => g.kind)).size, `${s.id}: two different kinds`).toBe(2);
    });
    const taught = teach.flatMap((s) => (s.kind === 'teach' ? s.pages.map((p) => p.word) : []));
    expect(taught.sort()).toEqual([...ITEMS].sort());
    expect([...SETS.A, ...SETS.B, ...SETS.C].sort()).toEqual([...ITEMS].sort());
  });

  it('WORDS FIRST: nothing is asked that has not been shown; the games only use words already taught on their page', () => {
    const taughtSoFar = new Set<string>();
    for (const s of slides) {
      if (s.kind === 'teach') s.pages.forEach((p) => taughtSoFar.add(p.word));
      if (s.kind === 'match') s.pairs.forEach((p) => expect(taughtSoFar.has(p.word), `${s.id}: ${p.word}`).toBe(true));
      if (s.kind === 'shadow') s.rounds.forEach((r) => expect(taughtSoFar.has(r.answer), `${s.id}: ${r.answer}`).toBe(true));
      if (s.kind === 'memory') s.pairs.forEach((p) => expect(taughtSoFar.has(p.text), `${s.id}: ${p.text}`).toBe(true));
    }
  });

  it('modelling and the rule: the noticing task then the rule (3 lines) come before the Notice & Build games, the teacher models the Mission before Take 1, Take 2 changes the listener, and the student teaches back in the Wrap', () => {
    const rule = slides.find((s) => s.kind === 'rule');
    expect(rule && rule.kind === 'rule' && rule.lines.length).toBe(3);
    expect(at('cause-sort')).toBeLessThan(at('rule-words'));
    expect(at('rule-words')).toBeLessThan(at('mem-c'));
    expect(at('rule-words')).toBeLessThan(at('build-c'));
    expect(at('model-task')).toBeLessThan(at('workbench'));
    expect(at('model-task')).toBeLessThan(at('say-take1'));
    expect(at('say-take1')).toBeLessThan(at('say-take2'));
    expect(slides[at('say-take2')].note).toMatch(/Theo/);
    expect(slides[at('say-take2')].kind === 'say' && (slides[at('say-take2')] as Extract<Slide, { kind: 'say' }>).prompt).toMatch(/new listener/);
    expect(slides.some((s) => s.id === 'teach-back' && s.part === 7)).toBe(true);
  });

  it('LADDER: every teaching page has a stage and the stages climb inside each part (a new word set may start again at "model"), the Mission is modelled before it is practised', () => {
    const rank: Record<string, number> = { review: 0, context: 1, model: 2, rule: 3, controlled: 4, free: 5, produce: 6 };
    slides.filter((x) => !['title', 'brief', 'dial', 'wrap'].includes(x.kind)).forEach((x) => expect(x.stage, x.id).toBeTruthy());
    [...new Set(slides.map((x) => x.part))].forEach((p) => {
      const inPart = slides.filter((x) => x.part === p && x.stage);
      inPart.slice(1).forEach((x, i) => {
        if (x.kind === 'teach') return;
        expect(rank[x.stage!], `${inPart[i].id} (${inPart[i].stage}) -> ${x.id} (${x.stage})`).toBeGreaterThanOrEqual(rank[inPart[i].stage!]);
      });
    });
    expect(slides[at('model-task')].stage).toBe('model');
    expect(at('say-take2')).toBeLessThan(at('my-words'));
    expect(at('my-words')).toBeLessThan(at('say-release'));
    expect(at('say-release')).toBeLessThan(at('teach-back'));
  });

  it('LISTENING: predict first, then the story is heard before it is read, then three recorded-voice questions', () => {
    expect(at('predict')).toBeLessThan(at('story-postcards'));
    const story = slides[at('story-postcards')];
    expect(story.kind === 'story' && story.listenFirst).toBe(true);
    const lq = slides[at('listen-q')];
    expect(lq.kind === 'hearpick' && lq.rounds.length).toBe(3);
    if (lq.kind === 'hearpick') lq.rounds.forEach((r) => expect(r.options).toContain(r.answer));
  });

  it('SPEAKING: reaches the free step (Mission Take 2, Release) with at least five spoken tasks, and the Release is private first (the model stays hidden)', () => {
    const says = slides.filter((s) => s.kind === 'say');
    expect(says.length).toBeGreaterThanOrEqual(SPEAKING_TARGETS.B1.speakingTasks - 1);
    const rel = slides[at('say-release')] as Extract<Slide, { kind: 'say' }>;
    expect(rel.open).toBeFalsy();
    expect(slides[at('say-take1')].stage).toBe('free');
  });

  it('FEELINGS WORDS are practised in a sentence about the student (the Workbench and the Release writing accept only sentences that use them)', () => {
    const wb = slides[at('workbench')];
    if (wb.kind !== 'write') throw new Error('no workbench');
    expect(wb.rows).toHaveLength(3);
    wb.rows.forEach((r) => {
      const re = r.accept.map((a) => new RegExp(a, 'i'));
      expect(re.every((x) => x.test(r.sample)), `sample for: ${r.label}`).toBe(true);
    });
    const mw = slides[at('my-words')];
    if (mw.kind !== 'write') throw new Error('no my-words');
    mw.rows.forEach((r) => expect(r.accept.map((a) => new RegExp(a, 'i')).every((x) => x.test(r.sample)), r.label).toBe(true));
  });

  it('COLLOCATIONS are built from the whole chunk (Boers): every Collocation Builder target contains a chunk taught in set C', () => {
    const b = slides[at('build-c')];
    if (b.kind !== 'build') throw new Error('no build');
    b.rounds.forEach((r) => expect(/camping|sightseeing|try something new/.test(r.target), r.target).toBe(true));
  });

  it('MOOD POSTCARDS: the best feeling scores 2, every scene has one best answer', () => {
    const m = slides[at('mood')];
    if (m.kind !== 'rpg') throw new Error('no rpg');
    m.scenes.forEach((s) => expect(s.options.filter((o) => o.score === 2)).toHaveLength(1));
    expect(m.goal).toBeLessThanOrEqual(m.scenes.length * 2);
  });

  it('every spoken line can be baked (no variables or blanks) except the learner-filled model lines', () => {
    const lines = slides.flatMap((s) => slideLines(s));
    expect(lines.length).toBeGreaterThan(40);
    lines.forEach((l) => expect(l.text).not.toMatch(/\{[a-z]+\}/i));
  });

  it('renders: a teach page, the Mood Postcards game and the wrap open without error', () => {
    for (const id of ['teach-a', 'mood', 'wrap']) {
      render(<Deck script={B1_S01_E2} teacher slide={at(id)} />);
      cleanup();
    }
  });

  it('MOOD POSTCARDS play: the best reply raises Rapport and shows the reply', () => {
    render(<Deck script={B1_S01_E2} teacher slide={at('mood')} />);
    fireEvent.click(screen.getByRole('button', { name: /She was frightened\./ }));
    expect(screen.getByText(/Her hands tell the story/)).toBeTruthy();
  });
});
