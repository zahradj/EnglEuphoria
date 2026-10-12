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
    // eslint-disable-next-line no-misleading-character-class -- FE0F is meant as a stand-alone code point
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
    case 'match': return 0.4 + s.pairs.length * (s.mode === 'listen' ? 0.25 : 0.2);
    case 'countup': return 0.4 + s.rounds.length * 0.4;
    case 'bepick': case 'build': case 'factcheck': case 'write': return 1;
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
    // Lesson 1 teaches the classroom words (Listen, Look…) with a matching practice and a "introduce yourself" paragraph inside the Check-in
    // (owner, 2026-10-12): the Check-in may run up to 3.5 min over its 5. Remember? also revises the numbers 1-100 (count-up + listen-and-match), practises the help phrases and reads the messages aloud (up to 5 min over its 7). Notice & Build adds the big numbers (hundreds: teach page + Locker Pop, up to 2.5 min over its 10). The whole lesson must still fit the hour.
    const ALLOWANCE: Record<number, number> = { 0: 3.5, 1: 5, 3: 2.5 };
    per.forEach((m, i) => {
      expect(m, `${PARTS[i].name}: ${m.toFixed(1)} min`).toBeGreaterThanOrEqual(PARTS[i].minutes * 0.6);
      expect(m, `${PARTS[i].name}: ${m.toFixed(1)} min`).toBeLessThanOrEqual(PARTS[i].minutes * 1.15 + (ALLOWANCE[i] ?? 0));
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

describe('lesson 1 fixes (owner 2026-10-12)', () => {
  const at = (id: string) => slides.findIndex((s) => s.id === id);

  it('FIRST PAGE: the title card is the intro, no part card slides over it', () => {
    render(<Deck script={SIGN_ME_UP} />);
    expect(screen.getByText('Sign Me Up', { selector: 'h1' })).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('PART CARD: later parts still announce themselves, and fade out instead of vanishing', () => {
    render(<Deck script={SIGN_ME_UP} teacher slide={at('whosaid')} />);
    const card = screen.getByRole('dialog');
    expect(card.textContent).toMatch(/Remember\?/);
    fireEvent.click(card);
    expect(card.getAttribute('data-leaving')).toBe('true');
  });

  it('ORDER: after the classroom words comes a picture-word match; after the feelings chat comes the "introduce yourself" paragraph', () => {
    expect(at('teach-words')).toBeLessThan(at('match-words'));
    expect(slides[at('teach-words') + 1].id).toBe('match-words');
    expect(at('badge')).toBeLessThan(at('checkin-chat'));
    expect(slides[at('checkin-chat') + 1].id).toBe('intro-me');
    const intro = slides[at('intro-me')];
    expect(intro.kind === 'say' && intro.model).toMatch(/My name is \{name\}\. I am \{age\} years old\. I feel happy today\. I am great!/);
    expect(intro.kind === 'say' && intro.open).toBe(true);
  });

  it('MATCH: every picture gets its word; a wrong word says Not yet; the last match unlocks Next', () => {
    open(at('match-words'));
    const m = slides[at('match-words')] as Extract<Slide, { kind: 'match' }>;
    const cards = () => screen.getAllByRole('button', { name: /Picture: drop the word here/ });
    fireEvent.click(screen.getByRole('button', { name: m.pairs[1].word })); // wrong word for the first picture
    fireEvent.click(cards()[0]);
    expect(screen.getByText(/Not yet/)).toBeTruthy();
    m.pairs.forEach((p, k) => {
      fireEvent.click(screen.getByRole('button', { name: p.word }));
      fireEvent.click(screen.getAllByRole('button', { name: /Picture: drop the word here|matched/ })[k]);
    });
    expect(screen.getByRole('button', { name: /Next ▶/ })).toBeEnabled();
  });
});

describe('lesson 1: messages, help practice, counting and big numbers (owner 2026-10-12)', () => {
  const at = (id: string) => slides.findIndex((s) => s.id === id);

  it('WHO SAID: the remembered conversation is a text-message chat with speech bubbles, and every line is heard AND repeated ("I said it")', () => {
    open(at('whosaid'));
    expect(document.querySelector('.ad-chatwin')).toBeTruthy();
    expect(document.querySelectorAll('.ad-cm-bubble').length).toBe(1);
    expect(screen.getByText(/Then say it out loud/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^I said it ▸/ }));
    expect(document.querySelectorAll('.ad-cm-bubble').length).toBe(2);
  });

  it('HELP PHRASES: after the help words there is a picture match (grab and drag)', () => {
    expect(slides[at('teach-help') + 1].id).toBe('match-help');
    const m = slides[at('match-help')];
    expect(m.kind === 'match' && m.pairs.map((p) => p.word)).toEqual(['Sorry?', 'Slowly, please.', 'I don’t understand.', 'What does it mean?']);
  });

  it('NUMBERS: before the number words are taught the student revises counting (1-10, 11-20, by tens to 100), then listens and matches', () => {
    expect(at('count-revise')).toBeLessThan(at('teach-nums'));
    expect(at('listen-numbers')).toBeLessThan(at('teach-nums'));
    const c = slides[at('count-revise')] as Extract<Slide, { kind: 'countup' }>;
    const seqs = c.rounds.map((r) => r.seq);
    expect(seqs[0]).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(seqs[1][0]).toBe(11);
    expect(seqs[2][seqs[2].length - 1]).toBe(100);
    expect((slides[at('listen-numbers')] as Extract<Slide, { kind: 'match' }>).mode).toBe('listen');
  });

  it('COUNT UP: gaps are filled in counting order; a wrong number says Not yet; the last round unlocks Next', () => {
    open(at('count-revise'));
    const c = slides[at('count-revise')] as Extract<Slide, { kind: 'countup' }>;
    c.rounds.forEach((r, k) => {
      r.blanks.forEach((bi, j) => {
        if (k === 0 && j === 0) {
          const wrong = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].find((v) => !r.seq.slice(0, 0).includes(v) && v !== r.seq[bi] && screen.queryByRole('button', { name: String(v), exact: true }));
          if (wrong !== undefined) fireEvent.click(screen.getByRole('button', { name: String(wrong), exact: true }));
          expect(screen.getByText(/Not yet/)).toBeTruthy();
        }
        fireEvent.click(screen.getAllByRole('button', { name: String(r.seq[bi]), exact: true }).find((b) => b.className.includes('ad-chip'))!);
      });
      if (k + 1 < c.rounds.length) fireEvent.click(screen.getByRole('button', { name: /Next counting/ }));
    });
    expect(screen.getByRole('button', { name: /Next ▶/ })).toBeEnabled();
  });

  it('LISTEN AND MATCH: the number is heard, the student chooses the card; wrong cards say Not yet; every card is matched at the end', () => {
    open(at('listen-numbers'));
    const m = slides[at('listen-numbers')] as Extract<Slide, { kind: 'match' }>;
    let matched = 0;
    let guard = 0;
    while (matched < m.pairs.length && guard++ < 40) {
      const cards = screen.getAllByRole('button', { name: /^Picture \d+$/ });
      for (const c of cards) {
        fireEvent.click(c);
        const now = screen.queryAllByRole('button', { name: /: matched$/ }).length;
        if (now > matched) { matched = now; break; }
      }
    }
    expect(matched).toBe(m.pairs.length);
    expect(screen.getByRole('button', { name: /Next ▶/ })).toBeEnabled();
  });

  it('BIG NUMBERS: hundreds are taught before Locker Pop uses them, and 431 becomes 400 (four hundred)', async () => {
    const { numberWord } = await import('../spoken');
    expect(numberWord(400)).toBe('four hundred');
    expect(numberWord(431)).toBe('four hundred thirty-one');
    expect(numberWord(100)).toBe('one hundred');
    expect(at('teach-hundreds')).toBeLessThan(at('lockers-hundreds'));
    const l = slides[at('lockers-hundreds')] as Extract<Slide, { kind: 'lockers' }>;
    expect(l.rounds.every((n) => n % 100 === 0 && n >= 100)).toBe(true);
    const wall = slides[at('numwall')] as Extract<Slide, { kind: 'numwall' }>;
    expect(wall.hundreds).toBe(true);
  });
});

describe('lesson 1 round 3: characters with flags, border control, triplet numbers, voices (owner 2026-10-12)', () => {
  const at = (id: string) => slides.findIndex((s) => s.id === id);

  it('NATIONS: each country page shows a cast character holding that country’s flag, and a match comes right after', () => {
    const t = slides[at('teach-nations')] as Extract<Slide, { kind: 'teach' }>;
    expect(t.pages.every((p) => p.art.type === 'bearer')).toBe(true);
    expect(t.pages.map((p) => p.art.type === 'bearer' && `${p.art.who}:${p.art.code}`)).toEqual(['Ava:es', 'Theo:it', 'Mia:br', 'Vee:fr']);
    expect(slides[at('teach-nations') + 1].id).toBe('match-nations');
    const m = slides[at('match-nations')] as Extract<Slide, { kind: 'match' }>;
    expect(m.pairs.map((p) => p.word)).toEqual(t.pages.map((p) => p.word));
  });

  it('BEARER: the character picture, the pole and the waving flag are drawn (animated, not a flat card)', () => {
    open(at('teach-nations'));
    expect(document.querySelector('.ad-bearer .ad-bearer-pole')).toBeTruthy();
    expect(document.querySelector('.ad-bearer .ad-pole-flag svg')).toBeTruthy();
    expect(screen.getByRole('img', { name: /Ava holding the flag of es/ })).toBeTruthy();
  });

  it('BORDER CONTROL: characters arrive holding their flags (no flat traveller cards) and a passport gets the APPROVED stamp', () => {
    const b = slides[at('border')] as Extract<Slide, { kind: 'border' }>;
    expect(b.rounds.every((r) => !!r.who)).toBe(true);
    open(at('border'));
    expect(document.querySelector('.ad-booth .ad-bearer')).toBeTruthy();
    expect(document.querySelector('.ad-traveller-art')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Traveller: I am from Spain/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Passport: Spanish' }));
    expect(screen.getByText('APPROVED')).toBeTruthy();
  });

  it('TRIPLET NUMBERS: the number train has two- and three-digit numbers, and the padlock code is a three-digit number read in words', async () => {
    const t = slides[at('numtrain')] as Extract<Slide, { kind: 'numtrain' }>;
    expect(t.numbers).toEqual(expect.arrayContaining([88, 180, 503]));
    const { numberWord } = await import('../spoken');
    t.numbers.forEach((n) => expect(t.words[n]).toBe(numberWord(n)));
    const pl = slides[at('padlock')] as Extract<Slide, { kind: 'padlock' }>;
    expect(pl.code).toBe('427');
    expect(pl.clue).toBe('four hundred twenty-seven');
    expect(at('teach-hundreds')).toBeLessThan(at('numtrain'));
    const th = slides[at('teach-hundreds')] as Extract<Slide, { kind: 'teach' }>;
    expect(th.pages.map((p) => p.word)).toContain('four hundred twenty-seven');
    expect(JSON.stringify(slides)).not.toMatch(/four, two, seven/);
  });

  it('NUMBER CARD: big numbers show their parts (503 = 500 + 3) instead of hundreds of dots', () => {
    open(at('numtrain'));
    const cards = document.querySelectorAll('.ad-car svg');
    expect(cards.length).toBe(4);
    expect(document.querySelectorAll('.ad-car circle').length).toBe(0);
    expect(document.body.textContent).toMatch(/500/);
  });

  it('VOICES: spelled letters are said as letter names, Ava has a female approved voice, and letter clips are listed', async () => {
    const { speechText, ALPHABET } = await import('../spoken');
    expect(speechText('A-V-A.')).toBe('ay, vee, ay.');
    expect(speechText('M-I-N-A.')).toBe('em, eye, en, ay.');
    expect(speechText('A')).toBe('ay.');
    expect(speechText('I am 13.')).toBe('I am 13.');
    expect(ALPHABET).toHaveLength(26);
    const { ACADEMY_VOICES } = await import('../voices');
    const { VOICE_PROFILES } = await import('../../lib/speechPolicy');
    const ava = VOICE_PROFILES.find((v: { id: string }) => v.id === ACADEMY_VOICES.Ava);
    expect(ava?.gender).toBe('female');
    expect(ava?.accent).toBe('american');
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
    for (let k = 0; k < 3; k++) fireEvent.click(screen.getByRole('button', { name: /^I said it ▸/ }));
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
      // numbers up to 100 are met on the number wall; hundreds are taught on the hundreds page (composition: four hundred twenty-seven)
      if (s.kind === 'numtrain') s.numbers.forEach((n) => expect(n <= 100 || (n < 1000 && taught.has('one hundred') && taught.has('four hundred twenty-seven')), `${s.id}: ${s.words[n]} not taught yet`).toBe(true));
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
    expect(stickers.length).toBeGreaterThanOrEqual(3);
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
    expect(screen.getByText(/1 of 3 lockers opened/)).toBeTruthy();
  });

  it('SPELL: tapping the letters in order spells the name and unlocks Next; a wrong letter is not placed', () => {
    open(idx('spell-me')); // the student's own name (no name typed yet: "friend")
    const tiles = () => within(document.querySelector('.ad-chips') as HTMLElement).getAllByRole('button');
    const tap = (l: string) => fireEvent.click(tiles().find((b) => b.textContent === l && !(b as HTMLButtonElement).disabled)!);
    tap('R'); // wrong first letter (F is next)
    expect(screen.getByText(/Not yet/)).toBeTruthy();
    ['F', 'R', 'I', 'E', 'N', 'D'].forEach(tap);
    expect(screen.getByText(/F-R-I-E-N-D/)).toBeTruthy();
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
    expect(cards()).toHaveLength(8); // four flags and their four nationality words
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
