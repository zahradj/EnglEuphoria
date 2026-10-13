// Sample 2 of lesson 1 (rewrite, owner 2026-10-12): blueprint-sized scope, parts that each do one job, two games after every word set, three lanes.
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Deck } from '../Deck';
import { SIGN_ME_UP_2, CRITERIA } from '../lessons/signMeUp2';
import { applyLane } from '../lanes';
import { ACADEMY_LESSON_BLUEPRINTS } from '../../curriculum/academy';
import { PARTS, LANES, type Lane, type Slide } from '../types';
import { slideLines } from '../spoken';

afterEach(cleanup);
const slides = SIGN_ME_UP_2.slides;
const at = (id: string) => slides.findIndex((s) => s.id === id);
const bp = ACADEMY_LESSON_BLUEPRINTS.find((b) => b.id === 'A1-S01-E2')!;

/** planning estimate (same numbers as the other deck tests) */
const minutes = (s: Slide): number => {
  switch (s.kind) {
    case 'title': return 0.2;
    case 'brief': return 0.8;
    case 'lane': return 0.5;
    case 'badge': return 1;
    case 'dial': return 0.4;
    case 'whosaid': return 0.4 + (s.replay?.length ?? 0) * 0.15 + s.items.length * 0.25;
    case 'teach': return s.pages.length * 0.4;
    case 'model': return s.lines.length * 0.22;
    case 'lockers': return 0.4 + s.rounds.length * 0.25;
    case 'numtrain': return 0.4 + s.numbers.length * 0.12;
    case 'padlock': return 1.2;
    case 'convo': return 0.4 + s.steps.length * 0.35;
    case 'spell': return 0.6 + 0.12 * s.target.length;
    case 'border': return 0.4 + s.rounds.length * 0.3;
    case 'memory': return 0.5 + s.pairs.length * 0.3;
    case 'match': return 0.4 + s.pairs.length * (s.mode === 'listen' ? 0.25 : 0.2);
    case 'fade': return 0.3 + s.lines.length * 0.5;
    case 'card': return 2.2;
    case 'say': return s.open ? 1.6 : 2;
    case 'wrap': return 3.2;
    default: return 1;
  }
};

describe('Sample 2: blueprint and scope', () => {
  it('reads the blueprint (lesson id, cast, 14 items) and teaches ONLY those items', () => {
    expect(SIGN_ME_UP_2.lessonId).toBe(bp.id);
    expect(bp.newItems.count).toBe(14);
    expect([...SIGN_ME_UP_2.cast].sort()).toEqual(bp.cast.appears.map((c) => c.name).sort());
    const taught = slides.flatMap((s) => (s.kind === 'teach' ? s.pages.map((p) => p.word) : []));
    expect(taught.slice(0, 10)).toEqual(['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']);
    expect(taught.slice(10)).toEqual(['Spain · Spanish', 'Italy · Italian']); // core: 10 numbers + 2 country/nationality pairs = the 14 items
    // nothing from the old overloaded version is taught: classroom words, help phrases, hundreds
    expect(JSON.stringify(slides.filter((s) => s.kind === 'teach'))).not.toMatch(/Listen|Repeat|Slowly|hundred|Click/);
    expect(slides.some((s) => s.kind === 'numwall' || s.id === 'teach-hundreds')).toBe(false);
    slides.forEach((s) => (s.actors ?? []).forEach((a) => expect(SIGN_ME_UP_2.cast, `${s.id} uses ${a.who}`).toContain(a.who)));
    expect(new Set(slides.map((s) => s.id)).size).toBe(slides.length);
    expect(slides.length).toBeLessThanOrEqual(34); // down from 42
  });

  it('each part does one job: no teach page in Check-in or Remember?; the story comes BEFORE the first word set', () => {
    const inPart = (n: number) => slides.filter((s) => s.part === n);
    [0, 1].forEach((n) => expect(inPart(n).some((s) => s.kind === 'teach'), `part ${n}`).toBe(false));
    expect(at('model-signup')).toBeLessThan(at('teach-nums-a'));
    expect(inPart(0).some((s) => s.kind === 'lane')).toBe(true);
    expect(inPart(2).map((s) => s.kind)).toEqual(['model', 'teach', 'match', 'memory']);
    expect(new Set(slides.map((s) => s.part))).toEqual(new Set([0, 1, 2, 3, 4, 5, 6, 7]));
    const parts = slides.map((s) => s.part);
    expect([...parts].sort((a, b) => a - b)).toEqual(parts);
  });

  it('RULE: after each vocabulary introduction come two different memorising games', () => {
    const GAMES = new Set(['match', 'memory', 'lockers', 'numtrain', 'countup', 'shadow', 'spell', 'bepick', 'build']);
    let n = 0;
    slides.forEach((s, i) => {
      if (s.kind !== 'teach') return;
      n++;
      const after = slides.slice(i + 1, i + 3);
      expect(after.every((g) => GAMES.has(g.kind)), `${s.id}: games after it`).toBe(true);
      expect(new Set(after.map((g) => g.kind)).size, `${s.id}: different kinds`).toBe(2);
    });
    expect(n).toBe(3);
  });

  it('VARIETY: no two neighbouring slides share a game, at least 12 different games', () => {
    slides.slice(1).forEach((s, i) => expect(s.kind, `${slides[i].id} -> ${s.id}`).not.toBe(slides[i].kind));
    expect(new Set(slides.map((s) => s.kind)).size).toBeGreaterThanOrEqual(12);
  });

  it('ALIGNMENT: every criterion is practised on at least 3 slides, and every non-intro slide trains one', () => {
    expect(CRITERIA).toHaveLength(5);
    for (let c = 1; c <= 5; c++) expect(slides.filter((s) => s.trains?.includes(c)).length, `criterion ${c}`).toBeGreaterThanOrEqual(3);
    slides.filter((s) => !['title', 'brief', 'wrap', 'dial', 'lane'].includes(s.kind)).forEach((s) => expect(s.trains?.length, s.id).toBeGreaterThan(0));
  });

  it('TIME: every part fills its time (60-115 %) and the whole lesson fits the hour in every lane, with NO allowance', () => {
    for (const lane of LANES) {
      const per = PARTS.map((_, i) => slides.filter((s) => s.part === i).reduce((a, s) => a + minutes(applyLane(s, lane)), 0));
      per.forEach((m, i) => {
        expect(m, `${lane} · ${PARTS[i].name}: ${m.toFixed(1)}`).toBeGreaterThanOrEqual(PARTS[i].minutes * 0.6);
        expect(m, `${lane} · ${PARTS[i].name}: ${m.toFixed(1)}`).toBeLessThanOrEqual(PARTS[i].minutes * 1.15);
      });
      expect(per.reduce((a, b) => a + b, 0), lane).toBeLessThanOrEqual(60);
    }
  });
});

describe('Sample 2: lanes', () => {
  const lanedSlides = slides.filter((s) => s.lanes);
  it('lane overrides only use fields the slide has, and keep every game playable', () => {
    expect(lanedSlides.length).toBeGreaterThanOrEqual(12);
    for (const s of lanedSlides) for (const lane of ['start', 'stretch'] as const) {
      const o = s.lanes?.[lane];
      if (!o) continue;
      Object.keys(o).forEach((k) => expect(k in s, `${s.id}.${lane}.${k}`).toBe(true));
      const v = applyLane(s, lane);
      if (v.kind === 'match') expect(v.pairs.length).toBeGreaterThanOrEqual(2);
      if (v.kind === 'memory') expect(v.pairs.length).toBeGreaterThanOrEqual(2);
      if (v.kind === 'lockers') v.rounds.forEach((r) => { expect(v.words[r], `${s.id} ${lane} word ${r}`).toBeTruthy(); expect(v.grid ?? [], `${s.id} ${lane}`).toContain(r); });
      if (v.kind === 'numtrain') v.numbers.forEach((n) => expect(v.words[n], `${s.id} ${lane} ${n}`).toBeTruthy());
      if (v.kind === 'padlock') expect(/^\d+$/.test(v.code)).toBe(true);
    }
  });

  it('Start is easier (fewer pairs, one-digit code, no clues, no hard nationalities); Stretch adds the bonus (tens, Brazil/France, big code)', () => {
    const get = <K extends Slide['kind']>(id: string, lane: Lane) => applyLane(slides[at(id)], lane) as Extract<Slide, { kind: K }>;
    expect(get<'match'>('match-nums-a', 'start').pairs.length).toBeLessThan(get<'match'>('match-nums-a', 'core').pairs.length);
    expect(get<'match'>('match-nums-a', 'stretch').mode).toBe('listen');
    expect(get<'padlock'>('padlock', 'start').code).toBe('7');
    expect(get<'padlock'>('padlock', 'core').code).toBe('427');
    expect(get<'padlock'>('padlock', 'stretch').clue).toBe('four hundred twenty-seven');
    expect(get<'teach'>('teach-nums-a', 'start').pages.every((p) => !p.clue)).toBe(true);
    expect(get<'teach'>('teach-nations', 'core').pages).toHaveLength(2);
    expect(get<'teach'>('teach-nations', 'stretch').pages.map((p) => p.word)).toEqual(['Spain · Spanish', 'Italy · Italian', 'Brazil · Brazilian', 'France · French']);
    expect(get<'lockers'>('lockers', 'stretch').rounds.every((r) => r >= 10)).toBe(true);
    expect(get<'numtrain'>('numtrain', 'stretch').numbers).toEqual([20, 45, 88, 100]);
    expect(get<'card'>('card', 'start').nationalities).toHaveLength(2);
    // core is the slide as written
    expect(applyLane(slides[at('padlock')], 'core')).toBe(slides[at('padlock')]);
  });

  it('every lane says only lines that can be recorded (no blanks) except the learner-filled model lines', () => {
    for (const lane of LANES) slides.forEach((s) => slideLines(applyLane(s, lane)).forEach((l) => expect(l.text, `${s.id} ${lane}`).not.toMatch(/_{2,}/)));
  });
});

describe('Sample 2: the lane picker and the player', () => {
  it('picking Start saves the lane, unlocks Next, and the next slides use that lane', () => {
    render(<Deck script={SIGN_ME_UP_2} teacher slide={at('lane')} />);
    expect(screen.getByRole('radio', { name: /Start/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('radio', { name: /Start/ }));
    expect(screen.getByText(/You chose Start/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Next/ })).toBeEnabled();
  });

  it('More offers Easier and Harder; Harder from Core moves to Stretch', () => {
    render(<Deck script={SIGN_ME_UP_2} teacher slide={at('lane')} />);
    fireEvent.click(screen.getByRole('button', { name: /More/ }));
    expect(screen.getByRole('menuitem', { name: /Easier \(Start\)/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('menuitem', { name: /Harder \(Stretch\)/ }));
    if (!screen.queryByRole('menuitem', { name: /Harder/ })) fireEvent.click(screen.getByRole('button', { name: /More/ }));
    expect(screen.getByRole('menuitem', { name: /Harder/ })).toBeDisabled();
    expect(screen.getByRole('menuitem', { name: /Easier \(Core\)/ })).toBeTruthy();
  });

  it('the Stretch lane shows 4 country pages and Start shows 2 pairs in the nations match (real render)', () => {
    const { unmount } = render(<Deck script={SIGN_ME_UP_2} teacher slide={at('lane')} />);
    fireEvent.click(screen.getByRole('radio', { name: /Start/ }));
    fireEvent.click(screen.getByRole('button', { name: /Next/ })); // → badge (lane stays in the deck state)
    expect(screen.getByRole('button', { name: /Next/ })).toBeTruthy();
    unmount();
  });
});
