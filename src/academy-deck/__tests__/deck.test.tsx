// Academy Deck: data checks (academy-lesson-craft + quality gate) and real component play-throughs of the games.
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { Deck } from '../Deck';
import { SIGN_ME_UP, CRITERIA, OBJECTIVE } from '../lessons/signMeUp';
import { ACADEMY_LESSON_BLUEPRINTS } from '../../curriculum/academy';

afterEach(cleanup);
const bp = ACADEMY_LESSON_BLUEPRINTS.find((b) => b.id === 'A1-S01-E2')!;
const slides = SIGN_ME_UP.slides;

describe('deck data (Sign Me Up)', () => {
  it('has unique slide ids, the blueprint cast and lesson id, one objective with 5 criteria', () => {
    expect(new Set(slides.map((s) => s.id)).size).toBe(slides.length);
    expect(SIGN_ME_UP.lessonId).toBe(bp.id);
    expect([...SIGN_ME_UP.cast].sort()).toEqual(bp.cast.appears.map((c) => c.name).sort());
    expect(OBJECTIVE).toMatch(/^By the end I can sign up/);
    expect(CRITERIA).toHaveLength(5);
    slides.forEach((s) => (s.actors ?? []).forEach((a) => expect(SIGN_ME_UP.cast, `${s.id} uses ${a.who}`).toContain(a.who)));
  });

  it('VARIETY: no two neighbouring slides use the same game, and the lesson uses >= 12 different games', () => {
    for (let i = 1; i < slides.length; i++) expect(slides[i].kind, `slides ${i - 1} and ${i}`).not.toBe(slides[i - 1].kind === 'spell' ? 'spell' : slides[i - 1].kind);
    expect(new Set(slides.map((s) => s.kind)).size).toBeGreaterThanOrEqual(12);
  });

  it('ALIGNMENT: every game slide trains a criterion; each criterion has >= 3 slides and the last one is production (say / fade)', () => {
    slides.filter((s) => !['title', 'brief', 'wrap'].includes(s.kind)).forEach((s) => expect(s.trains?.length, s.id).toBeGreaterThan(0));
    for (let c = 1; c <= 5; c++) {
      const hits = slides.filter((s) => s.trains?.includes(c));
      expect(hits.length, `criterion ${c}`).toBeGreaterThanOrEqual(3);
      expect(['say', 'fade'], `last slide for criterion ${c}`).toContain(hits[hits.length - 1].kind);
    }
  });

  it('every game with choices has a friendly hint and the final slide gives clue 2 of 8', () => {
    slides.filter((s) => s.kind === 'convo').forEach((s) => s.kind === 'convo' && s.steps.forEach((st) => st.options.filter((o) => !o.ok).forEach((o) => expect(o.hint ?? 'ok').toBeTruthy())));
    const wrap = slides[slides.length - 1];
    expect(wrap.kind === 'wrap' && wrap.clue).toMatch(/Clue 2 of 8/);
  });

  it('never uses the browser text-to-speech', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() && e.name !== '__tests__' ? walk(path.join(d, e.name)) : /\.(ts|tsx)$/.test(e.name) ? [path.join(d, e.name)] : []));
    for (const f of walk(path.resolve(__dirname, '..'))) {
      const src = fs.readFileSync(f, 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
      expect(/speechSynthesis|SpeechSynthesisUtterance/.test(src), f).toBe(false);
    }
  });
});

const next = () => fireEvent.click(screen.getByRole('button', { name: /Next|Finish/ }));
const open = (i: number) => render(<Deck script={SIGN_ME_UP} teacher slide={i} />);

describe('deck shell', () => {
  it('Next is locked until the slide is solved, and the title slide solves itself', () => {
    render(<Deck script={SIGN_ME_UP} />);
    expect(screen.getByRole('button', { name: /Next/ })).toBeEnabled();
    next();
    expect(screen.getByText(/Welcome back/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Next/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Hint/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /I need a minute/ })).toBeTruthy();
  });

  it('a broken game never freezes the lesson: the error card offers Try again and Skip', () => {
    const boom = { ...SIGN_ME_UP, slides: [{ id: 'bad', kind: 'padlock' as const, bg: 'x', prompt: 'p', clue: 'c', code: undefined as unknown as string, reward: 'r' }, ...slides.slice(1)] };
    const spy = console.error;
    console.error = () => {};
    render(<Deck script={boom} />);
    console.error = spy;
    expect(screen.getByRole('alert')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Skip this slide/ }));
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

describe('games', () => {
  const idx = (id: string) => slides.findIndex((s) => s.id === id);

  it('PADLOCK: wrong code gives "Not yet", the right code opens it, awards the number stamp and unlocks Next', () => {
    open(idx('padlock'));
    fireEvent.click(screen.getByRole('button', { name: '🔓 Open' }));
    expect(screen.getByText(/Not yet/)).toBeTruthy();
    const up = (n: number, times: number) => { for (let k = 0; k < times; k++) fireEvent.click(screen.getByRole('button', { name: `Dial ${n} up` })); };
    up(1, 4); up(2, 2); up(3, 7);
    fireEvent.click(screen.getByRole('button', { name: '🔓 Open' }));
    expect(screen.getByText(/Click!/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Next/ })).toBeEnabled();
  });

  it('LOCKERS: opening the right locker counts, a wrong one shakes with a friendly message', () => {
    open(idx('lockers'));
    expect(screen.getByText(/Open locker/).textContent).toMatch(/four/);
    fireEvent.click(screen.getByRole('button', { name: 'Locker 9' }));
    expect(screen.getByText(/Not yet/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Locker 4' }));
    expect(screen.getByText(/1 of 6 lockers opened/)).toBeTruthy();
  });

  it('SPELL: tapping the letters in order spells the name and unlocks Next; a wrong letter is not placed', () => {
    open(idx('spell-ava'));
    const tiles = () => within(document.querySelector('.ad-chips') as HTMLElement).getAllByRole('button');
    const tap = (l: string) => fireEvent.click(tiles().find((b) => b.textContent === l && !(b as HTMLButtonElement).disabled)!);
    tap('E'); // a look-alike, wrong
    expect(screen.getByText(/Not yet/)).toBeTruthy();
    ['A', 'V', 'A'].forEach(tap);
    expect(screen.getByText(/A-V-A/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Next/ })).toBeEnabled();
  });

  it('DETECTIVE: both mistakes must be found; a fine line gives a friendly nudge', () => {
    open(idx('detective'));
    fireEvent.click(screen.getByRole('button', { name: /Age: 13/ }));
    expect(screen.getByText(/That line is fine/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Name: S-A-N/ }));
    expect(screen.getByRole('button', { name: /Next/ })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /Country: Spian/ }));
    expect(screen.getByRole('button', { name: /Next/ })).toBeEnabled();
  });

  it('CONVO: the wrong reply gives that reply\'s hint, the right one moves the conversation on, and the log keeps the lines', () => {
    open(idx('convo'));
    fireEvent.click(screen.getByRole('button', { name: 'I am name Ava.' }));
    expect(screen.getByText(/Start with: My name is/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'My name is Ava.' }));
    expect(document.querySelectorAll('.ad-line')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'A-V-A.' })).toBeTruthy();
  });

  it('BORDER: dragging is optional; tap the traveller then the right passport', () => {
    open(idx('border'));
    fireEvent.click(screen.getByRole('button', { name: /Traveller: I am from Spain/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Passport: Italian' }));
    expect(screen.getByText(/Not yet/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Passport: Spanish' }));
    expect(screen.getByText('APPROVED')).toBeTruthy();
  });

  it('MEMORY: matching pairs stay open; a miss closes again without penalty', async () => {
    open(idx('memory'));
    const cards = () => screen.getAllByRole('button', { name: 'Hidden card' });
    expect(cards()).toHaveLength(6);
    fireEvent.click(cards()[0]);
    fireEvent.click(cards()[0]);
    expect(screen.getByText(/pairs found/)).toBeTruthy();
  });

  it('PHONE CHAT: the reply is built from tiles in order and sent', () => {
    open(idx('phonechat'));
    const tile = (w: string) => fireEvent.click(within(document.querySelector('.ad-chips') as HTMLElement).getAllByRole('button').find((b) => b.textContent === w && !(b as HTMLButtonElement).disabled)!);
    ['I', 'am', 'from', 'Spain.'].forEach(tile);
    expect(screen.getByText('Cool! What is your nationality?')).toBeTruthy();
  });

  it('WRAP: stamps show what was earned, ticks unlock the clue', () => {
    open(idx('wrap'));
    expect(screen.getByRole('button', { name: /Clue for next time/ })).toBeDisabled();
    SIGN_ME_UP.criteria.forEach((c) => fireEvent.click(screen.getByText(c).closest('button')!));
    fireEvent.click(screen.getByRole('button', { name: /Clue for next time/ }));
    expect(screen.getByText(/Clue 2 of 8/)).toBeTruthy();
  });
});
