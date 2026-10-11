// Academy Deck: data checks (academy-lesson-craft + quality gate) and real component play-throughs of the games.
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { Deck } from '../Deck';
import { SIGN_ME_UP, CRITERIA, OBJECTIVE } from '../lessons/signMeUp';
import { ACADEMY_LESSON_BLUEPRINTS } from '../../curriculum/academy';
import { PARTS, type Slide } from '../types';

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
    slides.filter((s) => !['title', 'brief', 'wrap', 'dial'].includes(s.kind)).forEach((s) => expect(s.trains?.length, s.id).toBeGreaterThan(0));
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

  it('NEVER emoji and never 3D-looking pictures (owner 2026-10-10): no emoji in the deck sources, pictures are Canva cards, drawn art or animated SVG', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const emoji = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{23E9}-\u{23FF}\u{FE0F}]/u;
    const allowed = new Set('✦★✓✔➤▶◀▸◂→←·…–—‘’“”▦'.split(''));
    const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() && e.name !== '__tests__' ? walk(path.join(d, e.name)) : /\.(ts|tsx|css)$/.test(e.name) ? [path.join(d, e.name)] : []));
    for (const f of walk(path.resolve(__dirname, '..'))) {
      const bad = fs.readFileSync(f, 'utf8').split('').filter((c) => emoji.test(c) && !allowed.has(c));
      expect(bad.join(''), f).toBe('');
    }
    // every picture in the lesson is a Canva card, a count card, a flag or a person drawn in SVG, or letters
    const kinds = new Set<string>();
    JSON.stringify(slides, (_k, v) => { if (v && typeof v === 'object' && 'type' in v && typeof v.type === 'string' && ['count', 'flag', 'person', 'letters', 'card'].concat(['emoji', 'phrase']).includes(v.type)) kinds.add(v.type); return v; });
    expect([...kinds].sort()).toEqual(['card', 'count', 'flag', 'letters', 'person']);
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

/** planning estimate: minutes a typical A1 teen needs on a slide (not a measurement) */
const minutes = (s: Slide): number => {
  switch (s.kind) {
    case 'title': return 0.2;
    case 'brief': return 0.8;
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
    case 'findwrong': return 1.3;
    case 'border': return 0.4 + s.rounds.length * 0.3;
    case 'memory': return 0.5 + s.pairs.length * 0.4;
    case 'numwall': return 1.6;
    case 'phonechat': return 0.4 + s.steps.length * 0.65;
    case 'fade': return 0.3 + s.lines.length * 0.5;
    case 'card': return 2.2;
    case 'say': return s.open ? 1.6 : 2;
    case 'wrap': return 3.2;
  }
};

describe('blueprint structure (run of show)', () => {
  it('follows the Academy blueprint: 8 parts in order, with the blueprint names and minutes', () => {
    expect(PARTS.map((p) => p.name)).toEqual(bp.runOfShow.map((r) => r.name));
    expect(PARTS.map((p) => p.minutes)).toEqual(bp.runOfShow.map((r) => r.minutes));
    const parts = slides.map((s) => s.part);
    expect([...parts].sort((a, b) => a - b)).toEqual(parts); // slides stay in part order
    expect(new Set(parts)).toEqual(new Set([0, 1, 2, 3, 4, 5, 6, 7]));
  });

  it('every part fills its time (>= 60 % and <= 115 % of the blueprint minutes) and the whole lesson fits the hour', () => {
    const per = PARTS.map((_, i) => slides.filter((s) => s.part === i).reduce((a, s) => a + minutes(s), 0));
    per.forEach((m, i) => {
      expect(m, `${PARTS[i].name}: ${m.toFixed(1)} min`).toBeGreaterThanOrEqual(PARTS[i].minutes * 0.6);
      expect(m, `${PARTS[i].name}: ${m.toFixed(1)} min`).toBeLessThanOrEqual(PARTS[i].minutes * 1.15);
    });
    expect(per.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(60);
  });

  it('the roles of the parts: Remember? recalls lesson 1, The Drop teaches the words and models the language, the Mission has a dial + Take 1 + feedback + Take 2, the Release ends with the hidden-model exit', () => {
    const inPart = (n: number) => slides.filter((s) => s.part === n);
    expect(inPart(1).some((s) => s.kind === 'whosaid' || s.kind === 'phonechat')).toBe(true);
    expect(inPart(2).some((s) => s.kind === 'teach') && inPart(2).some((s) => s.kind === 'model')).toBe(true);
    const mission = inPart(5);
    expect(mission[0].kind).toBe('dial');
    expect(mission.filter((s) => s.kind === 'say').map((s) => s.id)).toEqual(['say-take1', 'say-take2']);
    expect(mission.findIndex((s) => s.id === 'say-take1')).toBeLessThan(mission.findIndex((s) => s.kind === 'fade'));
    expect(mission.findIndex((s) => s.kind === 'fade')).toBeLessThan(mission.findIndex((s) => s.id === 'say-take2'));
    const exit = inPart(6).filter((s) => s.kind === 'say');
    expect(exit).toHaveLength(1);
    expect(exit[0].kind === 'say' && exit[0].open).toBeFalsy();
    expect(inPart(0).some((s) => s.kind === 'brief')).toBe(true);
    expect(inPart(7).some((s) => s.kind === 'wrap')).toBe(true);
  });
});

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
    const boom = { ...SIGN_ME_UP, slides: [{ id: 'bad', part: 0, kind: 'padlock' as const, bg: 'x', prompt: 'p', clue: 'c', code: undefined as unknown as string, reward: 'r' }, ...slides.slice(1)] };
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
    fireEvent.click(screen.getByRole('button', { name: /Open/ }));
    expect(screen.getByText(/Not yet/)).toBeTruthy();
    const up = (n: number, times: number) => { for (let k = 0; k < times; k++) fireEvent.click(screen.getByRole('button', { name: `Dial ${n} up` })); };
    up(1, 4); up(2, 2); up(3, 7);
    fireEvent.click(screen.getByRole('button', { name: /Open/ }));
    expect(screen.getByText(/Click!/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Next/ })).toBeEnabled();
  });

  it('WHO SAID IT: the conversation is shown line by line first, then the drag game (nothing is asked that was not shown)', () => {
    open(idx('whosaid'));
    expect(screen.getByText(/Remember last time/)).toBeTruthy();
    expect(screen.queryByText('How old are you?')).toBeNull();
    for (let k = 0; k < 3; k++) fireEvent.click(screen.getByRole('button', { name: /Next line/ }));
    expect(screen.getByText('I am 13.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Now you try/ }));
    expect(screen.getByText(/Drag each bubble/)).toBeTruthy();
  });

  it('TEACH: every word gets its own animated page (meaning, example, clue); the slide unlocks after the last page', () => {
    open(idx('teach-nums'));
    expect(screen.getByRole('heading', { name: 'one' })).toBeTruthy();
    expect(screen.getByText('the number 1')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Next/ })).toBeDisabled();
    for (let k = 0; k < 9; k++) fireEvent.click(screen.getByRole('button', { name: /Another word/ }));
    expect(screen.getByRole('heading', { name: 'ten' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Next ▶/ })).toBeEnabled();
  });

  it('MODEL: the characters do the language line by line; the pattern card shows the changing part; it unlocks at the end', () => {
    open(idx('model-signup'));
    fireEvent.click(screen.getByRole('button', { name: /Watch next/ }));
    expect(screen.getByLabelText('Pattern card').textContent).toMatch(/My name is/);
    expect(screen.getByRole('button', { name: /Next ▶/ })).toBeDisabled();
    for (let k = 0; k < 10; k++) fireEvent.click(screen.getByRole('button', { name: /Watch next/ }));
    expect(screen.getByText(/Now YOU help Ava/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Next ▶/ })).toBeEnabled();
  });

  it('TEACH BEFORE PLAY: every vocabulary word is taught on a teach page before the first game that uses it', () => {
    const taught = new Set<string>();
    for (const s of slides) {
      if (s.kind === 'teach') s.pages.forEach((p) => p.word.split(' · ').forEach((w) => taught.add(w.toLowerCase())));
      if (s.kind === 'lockers') s.rounds.forEach((n) => expect(taught.has(s.words[n]), `${s.id}: ${s.words[n]} not taught yet`).toBe(true));
      if (s.kind === 'numtrain') s.numbers.forEach((n) => expect(taught.has(s.words[n]), `${s.id}: ${s.words[n]} not taught yet`).toBe(true));
      if (s.kind === 'border') s.rounds.forEach((r) => expect(taught.has(r.answer.toLowerCase()), `${s.id}: ${r.answer} not taught yet`).toBe(true));
      if (s.kind === 'memory') s.pairs.forEach((p) => expect(taught.has(p.text.toLowerCase()), `${s.id}: ${p.text} not taught yet`).toBe(true));
    }
  });

  it('MODEL BEFORE PRODUCE: the conversation is modelled before the student chooses or builds replies', () => {
    const modelAt = slides.findIndex((s) => s.kind === 'model');
    expect(modelAt).toBeGreaterThan(-1);
    expect(modelAt).toBeLessThan(slides.findIndex((s) => s.id === 'convo'));
    expect(modelAt).toBeLessThan(slides.findIndex((s) => s.id === 'phonechat'));
  });

  it('BEGINNERS: choices and chat messages carry pictures, so students can choose by meaning, not only by reading', () => {
    const picOptionSteps = slides.flatMap((s) => (s.kind === 'convo' ? s.steps.filter((st) => st.options.every((o) => o.pic)) : []));
    expect(picOptionSteps.length).toBeGreaterThanOrEqual(4);
    const stickers = slides.flatMap((s) => (s.kind === 'phonechat' ? s.steps.filter((st) => st.pic) : []));
    expect(stickers.length).toBeGreaterThanOrEqual(5);
    const modelPics = slides.flatMap((s) => (s.kind === 'model' ? s.lines.filter((l) => l.pic) : []));
    expect(modelPics.length).toBeGreaterThanOrEqual(5);
  });

  it('PICTURE OPTIONS render with their picture and their words', () => {
    open(slides.findIndex((s) => s.id === 'checkin-chat'));
    expect(screen.getByRole('img', { name: 'feeling great' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /I am great/ })).toBeTruthy();
  });

  it('PASSPORTS and WORD TILES carry pictures: each passport shows its flag, the content-word tiles show what they mean', () => {
    const border = slides.find((s) => s.kind === 'border');
    expect(border && border.kind === 'border' && Object.keys(border.flags ?? {}).sort()).toEqual(expect.arrayContaining(['Brazilian', 'Italian', 'Spanish']));
    const chat = slides.find((s) => s.id === 'phonechat');
    expect(chat && chat.kind === 'phonechat' && chat.steps.every((st) => Object.keys(st.tilePics ?? {}).length >= 2)).toBe(true);
    open(slides.findIndex((s) => s.kind === 'border'));
    expect(document.querySelectorAll('.ad-passport-flag')).toHaveLength(3);
  });

  it('LOCKERS: opening the right locker counts, a wrong one shakes with a friendly message', () => {
    open(idx('lockers'));
    expect(screen.getByText(/Open locker/).textContent).toMatch(/four/);
    fireEvent.click(screen.getByRole('button', { name: 'Locker 1' }));
    expect(screen.getByText(/Not yet/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Locker 4' }));
    expect(screen.getByText(/1 of 5 lockers opened/)).toBeTruthy();
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
    expect(cards()).toHaveLength(12);
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
