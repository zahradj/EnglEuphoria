// Academy Deck lesson A1-S01-E3 "Fake or Real?" (Pattern Lab): data checks against the blueprint + real play-throughs of the new grammar games.
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { Deck } from '../Deck';
import { PATTERN_LAB, CRITERIA, OBJECTIVE, CHUNKS } from '../lessons/patternLab';
import { ACADEMY_LESSON_BLUEPRINTS } from '../../curriculum/academy';
import { PARTS, type Slide } from '../types';
import { slideLines } from '../spoken';
import { normaliseSentence } from '../slides/pattern';

afterEach(cleanup);
const bp = ACADEMY_LESSON_BLUEPRINTS.find((b) => b.id === 'A1-S01-E3')!;
const slides = PATTERN_LAB.slides;
const idx = (id: string) => slides.findIndex((s) => s.id === id);
const open = (id: string) => render(<Deck script={PATTERN_LAB} teacher slide={idx(id)} />);

describe('Pattern Lab: blueprint and objective', () => {
  it('reads the Academy blueprint: lesson id, cast, 10 chunks, the structure, the clue and the Mission / Release jobs', () => {
    expect(PATTERN_LAB.lessonId).toBe(bp.id);
    expect([...PATTERN_LAB.cast].sort()).toEqual(bp.cast.appears.map((c) => c.name).sort());
    expect(CHUNKS).toHaveLength(bp.newItems.count);
    expect(bp.structures.map((s) => s.id)).toEqual(['be-present']);
    expect(bp.clue.no).toBe(3);
    expect(bp.mission.job).toMatch(/question-and-answer|sentence-building/);
    expect(bp.release.job).toMatch(/write 3-5 sentences/);
    expect(OBJECTIVE).toMatch(/^By the end I can use am, is and are/);
    expect(CRITERIA).toHaveLength(5);
    slides.forEach((s) => (s.actors ?? []).forEach((a) => expect(PATTERN_LAB.cast, `${s.id} uses ${a.who}`).toContain(a.who)));
    expect(new Set(slides.map((s) => s.id)).size).toBe(slides.length);
  });

  it('follows the run of show: 8 parts in order; Mission = dial, Take 1, feedback (fade), Take 2; Release = hidden-model writing; Wrap gives clue 3 of 8', () => {
    const parts = slides.map((s) => s.part);
    expect([...parts].sort((a, b) => a - b)).toEqual(parts);
    expect(new Set(parts)).toEqual(new Set([0, 1, 2, 3, 4, 5, 6, 7]));
    expect(PATTERN_LAB.partGoals).toHaveLength(PARTS.length);
    const mission = slides.filter((s) => s.part === 5);
    expect(mission[0].kind).toBe('dial');
    expect(mission.findIndex((s) => s.id === 'say-take1')).toBeLessThan(mission.findIndex((s) => s.kind === 'fade'));
    expect(mission.findIndex((s) => s.kind === 'fade')).toBeLessThan(mission.findIndex((s) => s.id === 'say-take2'));
    const release = slides.filter((s) => s.part === 6);
    expect(release.map((s) => s.kind)).toEqual(['write']);
    const wrap = slides[slides.length - 1];
    expect(wrap.kind === 'wrap' && wrap.clue).toMatch(/Clue 3 of 8/);
    expect(slides.filter((s) => s.part === 2).map((s) => s.kind)).toEqual(expect.arrayContaining(['teach', 'model']));
  });
});

describe('Pattern Lab: sequencing (nothing is asked before it is taught)', () => {
  it('negatives, questions and short answers are taught (teach-not) before any game asks for them', () => {
    const taught = idx('teach-not');
    const firstGameWithNot = slides.findIndex((s) => s.id !== 'checkin-chat' && ['whosaid', 'bepick', 'build', 'findwrong', 'convo', 'factcheck', 'memory', 'phonechat'].includes(s.kind) && /\bnot\b|\bAre you\b|\bIs (she|he)\b|\bYes, /.test(JSON.stringify(s)) && s.part >= 2);
    expect(taught).toBeLessThan(firstGameWithNot);
    expect(idx('teach-be')).toBeLessThan(idx('bepick'));
    expect(idx('model-fake')).toBeLessThan(idx('whosaid-check'));
  });
});

describe('Pattern Lab: variety, alignment, time', () => {
  it('VARIETY: no two neighbouring slides share a game; at least 12 different games', () => {
    for (let i = 1; i < slides.length; i++) expect(slides[i].kind, `slides ${i - 1} and ${i}`).not.toBe(slides[i - 1].kind);
    expect(new Set(slides.map((s) => s.kind)).size).toBeGreaterThanOrEqual(12);
  });

  it('ALIGNMENT: every game trains a criterion; each criterion has >= 3 slides, the last one is production (say / fade / write)', () => {
    slides.filter((s) => !['title', 'brief', 'wrap', 'dial'].includes(s.kind)).forEach((s) => expect(s.trains?.length, s.id).toBeGreaterThan(0));
    for (let c = 1; c <= 5; c++) {
      const hits = slides.filter((s) => s.trains?.includes(c));
      expect(hits.length, `criterion ${c}`).toBeGreaterThanOrEqual(3);
      expect(['say', 'fade', 'write'], `last slide for criterion ${c}`).toContain(hits[hits.length - 1].kind);
    }
  });

  const minutes = (s: Slide): number => {
    switch (s.kind) {
      case 'title': return 0.2;
      case 'brief': return 0.8;
      case 'badge': return 1;
      case 'dial': return 0.4;
      case 'whosaid': return 0.4 + (s.replay?.length ?? 0) * 0.15 + s.items.length * 0.25;
      case 'teach': return s.pages.length * 0.4;
      case 'model': return s.lines.length * 0.22;
      case 'convo': return 0.4 + s.steps.length * 0.35;
      case 'spell': return 0.6 + 0.12 * s.target.length;
      case 'findwrong': return 1.3;
      case 'border': return 0.4 + s.rounds.length * 0.3;
      case 'memory': return 0.5 + s.pairs.length * 0.4;
      case 'phonechat': return 0.4 + s.steps.length * 0.65;
      case 'fade': return 0.3 + s.lines.length * 0.5;
      case 'say': return s.open ? 1.6 : 2;
      case 'bepick': return 0.5 + s.rounds.length * 0.15;
      case 'build': return 0.4 + s.rounds.length * 0.4;
      case 'factcheck': return 0.4 + s.claims.length * 0.35;
      case 'write': return 1 + s.rows.length * 0.9;
      case 'wrap': return 3.2;
      case 'match': return 0.4 + s.pairs.length * 0.2;
      case 'countup': return 0.4 + s.rounds.length * 0.4;
      default: return 1;
    }
  };
  it('every part fills its time (>= 60 % and <= 115 % of the blueprint minutes) and the lesson fits the hour', () => {
    expect(PARTS.map((p) => p.minutes)).toEqual(bp.runOfShow.map((r) => r.minutes));
    const per = PARTS.map((_, i) => slides.filter((s) => s.part === i).reduce((a, s) => a + minutes(s), 0));
    per.forEach((m, i) => {
      expect(m, `${PARTS[i].name}: ${m.toFixed(1)} min`).toBeGreaterThanOrEqual(PARTS[i].minutes * 0.6);
      expect(m, `${PARTS[i].name}: ${m.toFixed(1)} min`).toBeLessThanOrEqual(PARTS[i].minutes * 1.15);
    });
    expect(per.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(60);
  });
});

describe('Pattern Lab: exit-task coverage (academy-lesson-craft check 3)', () => {
  // text of every practice slide (not the teaching pages and the model) so we count PRACTICE, not display
  const practice = slides.filter((s) => !['teach', 'model', 'title', 'brief', 'wrap'].includes(s.kind));
  const text = (s: Slide): string => {
    switch (s.kind) {
      case 'bepick': return s.rounds.map((r) => r.frame.replace('___', r.answer)).join(' ');
      case 'build': return s.rounds.map((r) => r.target).join(' ');
      case 'convo': return s.steps.flatMap((st) => st.options.filter((o) => o.ok).map((o) => o.text)).join(' ');
      case 'phonechat': return s.steps.map((st) => st.reply).join(' ');
      case 'fade': return s.lines.map((l) => l.text).join(' ');
      case 'factcheck': return s.claims.map((c) => c.text + ' ' + (c.fixes ?? []).filter((f) => f.ok).map((f) => f.text).join(' ')).join(' ');
      case 'memory': return s.pairs.map((p) => p.text).join(' ');
      case 'say': return s.model;
      case 'write': return s.rows.map((r) => r.sample).join(' ');
      case 'findwrong': return s.rows.map((r) => r.fix ?? r.text).join(' ');
      case 'whosaid': return [...(s.replay ?? []).map((l) => l.text), ...s.items.map((i) => i.text)].join(' ');
      default: return '';
    }
  };
  const forms: [string, RegExp][] = [
    ['I am', /\bI am\b(?! not)/],
    ['You are', /\bYou are\b(?! not)/i],
    ['She/He is', /\b(she|he) is\b(?! not)/i],
    ['am not', /\bI am not\b/i],
    ['is not', /\b(she|he) is not\b/i],
    ['Are you…?', /\bAre you\b/],
    ['Is she/he…?', /\bIs (she|he|Ava|Theo)\b/],
    ['Yes, … is/am', /\bYes, (I am|he is|she is)\b/],
    ['No, … not', /\bNo, (I am not|he is not|she is not)\b/],
  ];
  for (const [name, re] of forms) {
    it(`"${name}" is practised on >= 3 slides before / in the exit task`, () => {
      const hits = practice.filter((s) => re.test(text(s)));
      expect(hits.length, `${name}: ${hits.map((s) => s.id).join(', ')}`).toBeGreaterThanOrEqual(3);
    });
  }

  it('95 % known words: nearly all words in the practised sentences were taught in lessons 1-3 or are closed-class words', () => {
    const KNOWN = new Set(`i you he she am is are not no yes my name your from where what how old the a an this that and or but it to in on at of for with
      hi hello thanks please ava theo vee sam mina spain spanish italy italian brazil brazilian france french japan japanese american america german germany 14 15 16 13 12 11
      one two three four five six seven eight nine ten age old number spell profile says say ask answer question true false real fake club new friend
      are ready detective yes tired great fine today how`.split(/\s+/));
    const words = practice.flatMap((s) => text(s).toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').split(/\s+/).filter(Boolean));
    const unknown = words.filter((w) => !KNOWN.has(w));
    expect(unknown.length / words.length, `unknown: ${[...new Set(unknown)].join(', ')}`).toBeLessThanOrEqual(0.05);
  });

  it('every chunk of the blueprint list is spoken or shown somewhere in the lesson text', () => {
    const all = JSON.stringify(slides).toLowerCase();
    CHUNKS.forEach((c) => expect(all, c).toContain(c.toLowerCase().replace(/\.|\?/g, '')));
  });

  it('COLD EXIT: an honest student types the five sentences with the model hidden; Next unlocks; "Show me" is counted', () => {
    open('write');
    expect(screen.queryByText(/Model:/)).toBeNull();
    const rows = slides[idx('write')] as Extract<Slide, { kind: 'write' }>;
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(rows.rows.length);
    inputs.forEach((el, k) => fireEvent.change(el, { target: { value: rows.rows[k].sample } }));
    expect(screen.getByRole('button', { name: /Next|Finish/ })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /Check my sentences/ }));
    expect(screen.getByText(/sentences are right/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Next|Finish/ })).toBeEnabled();
  });

  it('WRITE: every accepted shape works with contractions, and wrong shapes get the row hint (not a score)', () => {
    const rows = (slides[idx('write')] as Extract<Slide, { kind: 'write' }>).rows;
    const ok = (k: number, t: string) => rows[k].accept.some((a) => new RegExp(a, 'i').test(normaliseSentence(t)));
    expect(ok(0, 'I am 14.')).toBe(true);
    expect(ok(0, "I'm from Brazil.")).toBe(true);
    expect(ok(0, 'I am not 14.')).toBe(false);
    expect(ok(0, 'I is 14.')).toBe(false);
    expect(ok(1, 'He is Spanish.')).toBe(true);
    expect(ok(1, 'He are Spanish.')).toBe(false);
    expect(ok(2, 'I am not Spanish.')).toBe(true);
    expect(ok(2, 'I’m not Spanish.')).toBe(true);
    expect(ok(2, 'I am no Spanish.')).toBe(false);
    expect(ok(3, 'She isn’t 16.')).toBe(true);
    expect(ok(3, 'She is no 16.')).toBe(false);
    expect(ok(4, 'Is she Italian? Yes, she is.')).toBe(true);
    expect(ok(4, 'Are you Italian? No, I am not.')).toBe(true);
    expect(ok(4, 'Is she Italian?')).toBe(false);
    expect(ok(4, 'She is Italian? Yes, she is.')).toBe(false);
  });
});

describe('Pattern Lab: the new games', () => {
  it('BE PICK: a wrong form gets "Not yet" and the reason; the right form speaks the sentence and unlocks the next one; the last one unlocks the slide', () => {
    open('bepick');
    expect(screen.getByRole('button', { name: /Next ▶/ })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'is' }));
    expect(screen.getByText(/Not yet/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'am' }));
    expect(screen.getByText('I → am.')).toBeTruthy();
    const rounds = (slides[idx('bepick')] as Extract<Slide, { kind: 'bepick' }>).rounds;
    for (let k = 1; k < rounds.length; k++) {
      fireEvent.click(screen.getByRole('button', { name: /Next sentence/ }));
      fireEvent.click(screen.getByRole('button', { name: rounds[k].answer }));
    }
    expect(screen.getByRole('button', { name: /Next ▶/ })).toBeEnabled();
  });

  it('BUILD: tiles must go in order; a wrong form shakes and gives the hint; the last sentence unlocks Next', () => {
    open('build-1');
    const rounds = (slides[idx('build-1')] as Extract<Slide, { kind: 'build' }>).rounds;
    const tap = (w: string) => fireEvent.click(within(document.querySelector('.ad-chips') as HTMLElement).getAllByRole('button').find((b) => b.textContent === w && !(b as HTMLButtonElement).disabled)!);
    tap('am'); // wrong first word for "She is Italian."
    expect(screen.getByText(/Not yet/)).toBeTruthy();
    rounds.forEach((r, k) => {
      r.target.split(' ').forEach(tap);
      if (k + 1 < rounds.length) fireEvent.click(screen.getByRole('button', { name: /Next sentence/ }));
    });
    expect(screen.getByRole('button', { name: /Next ▶/ })).toBeEnabled();
  });

  it('FACT CHECK: judge each sentence on the card; a lie asks for the fix; a wrong fix gets a hint; the case closes after the last sentence', () => {
    open('factcheck');
    const s = slides[idx('factcheck')] as Extract<Slide, { kind: 'factcheck' }>;
    expect(screen.getByRole('group', { name: /Profile card: Ava/ })).toBeTruthy();
    s.claims.forEach((c, k) => {
      expect(screen.getByText(new RegExp(c.text.replace('.', '\\.')))).toBeTruthy();
      if (c.fact) fireEvent.click(screen.getByRole('button', { name: /True/ }));
      else {
        fireEvent.click(screen.getByRole('button', { name: 'True' })); // wrong judgement first
        expect(screen.getByText(/Not yet/)).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: /Not true/ }));
        const bad = c.fixes!.find((f) => !f.ok)!;
        fireEvent.click(screen.getByRole('button', { name: bad.text }));
        expect(screen.getByText(new RegExp(bad.hint!.slice(0, 12)))).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: c.fixes!.find((f) => f.ok)!.text }));
      }
      fireEvent.click(screen.getByRole('button', { name: k + 1 >= s.claims.length ? /Case closed/ : /Next sentence/ }));
    });
    expect(screen.getByRole('button', { name: /Next ▶/ })).toBeEnabled();
  });

  it('WRITE: a wrong sentence shows its hint and keeps Next locked', () => {
    open('write');
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((el) => fireEvent.change(el, { target: { value: 'I is happy' } }));
    fireEvent.click(screen.getByRole('button', { name: /Check my sentences/ }));
    expect(screen.getAllByText(/Not yet/).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Next|Finish/ })).toBeDisabled();
  });
});

describe('Pattern Lab: voices and rules', () => {
  it('has spoken lines for the new games (prompts, built sentences, claims) — all with no variable or blank', () => {
    const all = slides.flatMap(slideLines);
    expect(all.length).toBeGreaterThan(80);
    all.forEach((l) => expect(l.text).not.toMatch(/[{}]|_{2,}/));
    const texts = new Set(all.map((l) => l.text));
    ['Is she Spanish?', 'She is not Italian.', 'Are you from Italy?', 'I am not 15.'].forEach((t) => expect(texts.has(t), t).toBe(true));
  });
  it('RULE (owner 2026-10-12): after each vocabulary introduction come two different games', () => {
    const GAMES = new Set(['match', 'memory', 'lockers', 'numtrain', 'countup', 'shadow', 'spell', 'bepick', 'build', 'findwrong', 'factcheck']);
    slides.forEach((s, i) => {
      if (s.kind !== 'teach') return;
      const after = slides.slice(i + 1, i + 3).filter((g) => g.kind !== 'model');
      expect(after.length, s.id).toBe(2);
      expect(after.every((g) => GAMES.has(g.kind)), `${s.id}: games after it`).toBe(true);
      expect(new Set(after.map((g) => g.kind)).size, `${s.id}: different kinds`).toBe(2);
    });
  });

  it('CAST CANON (same as lesson 1): Ava is 13 and Spanish, Theo is 15 and Italian; only the blueprint cast appears (art too)', () => {
    const fc = slides.find((s) => s.id === 'factcheck') as Extract<Slide, { kind: 'factcheck' }>;
    expect(fc.profile).toMatchObject({ who: 'Ava', age: 13, from: 'Spain', nationality: 'Spanish', flag: 'es' });
    const json = JSON.stringify(slides.filter((x) => x.id !== 'write'));
    expect(json).not.toMatch(/"who":"Mia"/);
    expect(json).not.toMatch(/I am 14|Ava is 14|She is 14|You are 14|Are you 14/);
    const mem = slides.find((s) => s.id === 'memory-be') as Extract<Slide, { kind: 'memory' }>;
    expect(mem.pairs.map((p) => p.art && p.art.type === 'bearer' && `${p.art.who}:${p.art.code}`)).toEqual(['Ava:es', 'Theo:it', 'Vee:fr']);
    const b = slides.find((s) => s.id === 'border') as Extract<Slide, { kind: 'border' }>;
    expect(b.rounds.every((r) => !!r.who)).toBe(true);
  });
});
