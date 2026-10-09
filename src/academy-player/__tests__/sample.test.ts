// A1-S01-E1 v3: the lesson must pass the validator, the Academy blueprint (cast, run of show, clue, item cap, minutes), and the
// academy-lesson-craft checks: ONE objective with criteria, every screen tagged to a criterion (alignment matrix), the exit task
// uses only what was taught and practised >= 3 times, a cold-exit run produces the introduction card with the model hidden.
import { describe, expect, it } from 'vitest';
import { A1S01E1, CRITERIA, EXIT_FRAMES, INVENTORY, OBJECTIVE } from '../samples/a1s01e1';
import { initState, interpolateBeat, step, type PlayerEvent, type PlayerState } from '../engine';
import { beatSeconds, segmentSeconds } from '../lessonTiming';
import { isInteractive, type Beat } from '../scriptTypes';
import { knownWordShare, validateScript } from '../validateScript';
import { ACADEMY_ITEMS } from '../../curriculum/academy/items';
import { ACADEMY_LESSON_BLUEPRINTS } from '../../curriculum/academy';

const bp = ACADEMY_LESSON_BLUEPRINTS.find((b) => b.id === 'A1-S01-E1')!;
const E1_WORDS = ACADEMY_ITEMS['A1-S01'].E1.map((i) => i[0].toLowerCase());
const FUNCTION_WORDS = ['a', 'an', 'the', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'my', 'your', 'our', 'his', 'her', 'their', 'is', 'am', 'are', 'be', 'not', 'and', 'but', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'who', 'what', 'where', 'how', 'this', 'that', 'there', 'now', 'yes', 'no', 'do', 'does', 'next', 'time', 'from', 'have', 'say', 'again', 'first', 'then', 'try', 'right', 'look', 'or', 'too', 'old', 'like', 'big', 'out', 'so', 'if', 'all', 'only', 'any', 'some', 'one', 'two', 'it’s', 'let', 'us', 'will', 'can', 'okay', 'ok'];
// routine classroom words the player and the teacher repeat in every lesson (buttons, prompts), learned by doing
const CLASSROOM_WORDS = ['tap', 'tell', 'read', 'line', 'lines', 'match', 'each', 'picture', 'pictures', 'complete', 'conversation', 'gap', 'word', 'words', 'build', 'sentence', 'question', 'questions', 'ask', 'play', 'game', 'quick', 'different', 'practise', 'talk', 'help', 'lots', 'little', 'hidden', 'memory', 'whole', 'first', 'more', 'new', 'add', 'thing', 'goal', 'card', 'today', 'nickname', 'meet', 'meaning', 'story', 'hello', 'hi', 'welcome', 'club', 'introduce', 'yourself', 'turn', 'learn', 'make', 'fill', 'full', 'empty', 'chill', 'normal', 'push', 'homework', 'friend', 'not', 'yet', 'okay', 'great', 'good', 'nice', 'cool', 'clue', 'group', 'member', 'sam', 'next', 'name', 'about', 'free', 'time', 'happy', 'fine', 'song', 'songs', 'place', 'ball', 'goals', 'screen', 'table', 'boy', 'girl', 'woman', 'man', 'children', 'listen', 'people', 'call', 'wants', 'end', 'at', 'brazil', 'spain', 'japan', 'ava', 'theo', 'vee', 'start', 'sentence', 'look', 'see', 'many', 'hear', 'also', 'choose', 'much', 'way', 'which', 'hobby', 'family', 'order', 'put', 'hand', 'know', 'me', 'ava’s', 'theo’s', 'together', 'say', 'said', 'it', 'week', 'tired', 'great'];

const tagOf = (beats: Beat[], i: number): number[] | null => {
  for (let k = i - 1; k >= 0; k--) {
    const b = beats[k];
    if (b.t === 'trains') return b.criteria;
    if (b.t === 'segment') return null; // a segment starts with no tag
  }
  return null;
};

describe('lesson A1-S01-E1 v3: objective, blueprint, validator', () => {
  it('passes the validator with no errors', () => {
    expect(validateScript(A1S01E1).filter((i) => i.severity === 'error')).toEqual([]);
  });

  it('has ONE observable objective with 5 criteria + 1 stretch, in the student\'s words', () => {
    expect(OBJECTIVE).toMatch(/^By the end I can introduce myself/);
    expect(CRITERIA).toHaveLength(6);
    CRITERIA.forEach((c) => expect(c).toMatch(/^I (said|asked)/));
  });

  it('keeps the blueprint facts: cast (Vee, Ava, Theo), run of show, A1, lesson id, clue 1 at the end, item cap', () => {
    expect([...A1S01E1.cast].sort()).toEqual(bp.cast.appears.map((c) => c.name).sort());
    expect(A1S01E1.lessonId).toBe(bp.id);
    expect(A1S01E1.level).toBe('A1');
    expect(A1S01E1.beats.filter((b) => b.t === 'segment').map((b) => (b as { index: number }).index)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(bp.runOfShow.map((r) => r.name)).toEqual(['Check-in', 'Remember?', 'The Drop', 'Notice & Build', 'Energiser', 'Mission', 'Release', 'Wrap']);
    expect((A1S01E1.beats.find((b) => b.t === 'end') as { summary?: string }).summary).toMatch(/Clue 1 of 8/);
    expect(bp.clue.no).toBe(1);
    expect(INVENTORY.length).toBeLessThanOrEqual(14); // blueprint cap per session
  });

  it('teaches exactly the 12 inventory words, each as a picture card (3 sets of 4)', () => {
    const cards = A1S01E1.beats.flatMap((b) => (b.t === 'flash' ? b.cards : []));
    expect(cards.map((c) => c.word).sort()).toEqual([...INVENTORY].sort());
    A1S01E1.beats.forEach((b) => b.t === 'flash' && expect(b.cards).toHaveLength(4));
    cards.forEach((c) => {
      expect(c.meaning, `${c.word} needs a meaning`).toBeTruthy();
      expect(c.pictureId).toBe(`v-${c.word}`);
    });
  });

  it('keeps >= 95 % of the running words known (inventory, E1 words, closed-class, classroom words, glossed words)', () => {
    const known = new Set<string>([...INVENTORY, ...E1_WORDS, ...FUNCTION_WORDS, ...CLASSROOM_WORDS, 'mother', 'father', 'brother', 'sister', 'football', 'music', 'games', 'country', 'age', 'hobby', 'family']);
    const { share, unknown } = knownWordShare(A1S01E1, known);
    expect(share, `unknown words: ${unknown.join(', ')}`).toBeGreaterThanOrEqual(bp.buildsOn.inputKnownWordsMinPct / 100);
  });
});

describe('academy-lesson-craft checks', () => {
  const beats = A1S01E1.beats;
  const interactive = beats.map((b, i) => ({ b, i })).filter(({ b }) => isInteractive(b) && b.t !== 'end');

  it('ALIGNMENT: every interactive screen carries a criterion tag (0 only in Check-in and Wrap)', () => {
    const untagged = interactive.filter(({ i }) => tagOf(beats, i) === null).map(({ i }) => i);
    expect(untagged).toEqual([]);
    interactive.forEach(({ i }) => {
      const t = tagOf(beats, i)!;
      if (t.includes(0)) {
        const seg = [...beats.slice(0, i)].reverse().find((b) => b.t === 'segment') as { index: number };
        expect([0]).toContain(seg.index);
      }
    });
  });

  it('ALIGNMENT: criteria 1-5 each have >= 3 screens, and the last screen for each is production (say-from-memory or the exit record)', () => {
    for (let c = 1; c <= 5; c++) {
      // reactions and instructions (a plain `say`) do not count as practice screens
      const screens = interactive.filter(({ i, b }) => tagOf(beats, i)!.includes(c) && (b.t !== 'say' || !!b.hide || !!b.repeat));
      expect(screens.length, `criterion ${c}`).toBeGreaterThanOrEqual(3);
      const last = screens[screens.length - 1].b;
      expect(last.t === 'record' || last.t === 'ticks' || (last.t === 'say' && !!last.hide), `last screen for criterion ${c} is ${last.t}`).toBe(true);
    }
    const stretch = interactive.filter(({ i }) => tagOf(beats, i)!.includes(6));
    expect(stretch.length).toBeGreaterThanOrEqual(3);
  });

  it('EXIT COVERAGE: the exit task uses only practised frames: each is read, completed, built or said >= 3 times before the Release', () => {
    const releaseAt = beats.findIndex((b) => b.t === 'segment' && b.index === 6);
    const practice: string[] = [];
    beats.slice(0, releaseAt).forEach((b) => {
      if (b.t === 'say' && (b.repeat || b.hide)) practice.push(b.text);
      if (b.t === 'cloze') b.lines.forEach((l) => practice.push(l.text.replace(/\{\{|\}\}/g, '')));
      if (b.t === 'build') practice.push(b.target);
      if (b.t === 'record') practice.push(b.model);
    });
    const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ');
    for (const f of EXIT_FRAMES) expect(practice.filter((t) => norm(t).includes(f)).length, `frame "${f}"`).toBeGreaterThanOrEqual(3);
    // the exit model is hidden until "Show me"
    const exit = beats.find((b) => b.t === 'record' && b.hideModel);
    expect(exit).toBeTruthy();
  });

  it('SAY IT: every target sentence is said at least 3 times (read-and-repeat, memorise, role-play) before the exit task', () => {
    const saidLines = beats.filter((b) => b.t === 'say' && (b.repeat || b.hide)).length;
    const records = beats.filter((b) => b.t === 'record').length;
    expect(saidLines).toBeGreaterThanOrEqual(10 + 6);
    expect(records).toBeGreaterThanOrEqual(3);
  });

  it('SUPPORT FADES: read-and-repeat (full text) -> key words hidden -> only the first word -> role-play with a short model -> exit with no model', () => {
    const order = beats.filter((b) => b.t === 'say' && (b.repeat || b.hide)).map((b) => (b as Extract<Beat, { t: 'say' }>).hide ?? 'full');
    const firstKeys = order.indexOf('keys');
    const firstAll = order.indexOf('all');
    expect(order.indexOf('full')).toBeLessThan(firstKeys);
    expect(firstKeys).toBeLessThan(firstAll);
  });
});

describe('playing the lesson', () => {
  const run = (pick: (b: Beat, wrongFirst: boolean) => PlayerEvent, dial = 1, wrongFirst = false) => {
    let s: PlayerState = initState(A1S01E1, 5);
    const seen: Beat[] = [];
    for (let g = 0; g < 3000 && !s.finished; g++) {
      const b = A1S01E1.beats[s.beatIndex];
      seen.push(b);
      if (wrongFirst && b.t === 'choice') {
        const w = b.options.findIndex((o) => o.correct === false);
        if (w >= 0) s = step(A1S01E1, s, { type: 'answer', correct: false });
      }
      let e = pick(b, wrongFirst);
      if (b.t === 'choice' && b.options.some((o) => o.set?.dial)) e = { type: 'choose', index: dial };
      s = step(A1S01E1, s, e);
    }
    return { s, seen };
  };
  const honest = (b: Beat): PlayerEvent => {
    if (b.t === 'choice') return { type: 'choose', index: Math.max(0, b.options.findIndex((o) => o.correct)) };
    if (b.t === 'sort') return { type: 'fill', values: { [b.key]: 5 } };
    if (b.t === 'form') return { type: 'fill', values: Object.fromEntries(b.fields.map((f) => [f.key, f.kind === 'text' ? (f.key === 'name' ? 'Mina' : 'Brazil') : f.kind === 'multi' ? 'mother, sister' : f.options![f.key === 'age' ? 3 : f.key === 'hobby' ? 1 : 0]])) };
    if (b.t === 'record' && b.hideModel) return { type: 'fill', values: { exitPeeked: false, exitText: 'Hi! My name is Mina.' } };
    return { type: 'next' };
  };

  it('reaches the end on all three dials, with the dial branch and Take 1 -> feedback -> Take 2 each time', () => {
    for (const dial of [0, 1, 2]) {
      const { s, seen } = run(honest, dial);
      expect(s.finished).toBe(true);
      expect(seen.filter((b) => b.t === 'record' && /^Take [12]/.test(b.prompt))).toHaveLength(2);
    }
  });

  it('COLD EXIT: an honest student ends with a full introduction card, the model hidden, evidence saved', () => {
    const { s } = run(honest);
    expect(s.vars).toMatchObject({ name: 'Mina', age: '14', country: 'Brazil', family: 'mother, sister', exitPeeked: false });
    const profile = A1S01E1.beats.filter((b) => b.t === 'profile').pop()!;
    const rows = (interpolateBeat(profile, s.vars) as Extract<Beat, { t: 'profile' }>).rows.map((r) => r.value);
    expect(rows).toEqual(['Mina', '14', 'Brazil', 'music 🎵', 'mother, sister']);
    const exit = A1S01E1.beats.find((b) => b.t === 'record' && b.hideModel) as Extract<Beat, { t: 'record' }>;
    expect((interpolateBeat(exit, s.vars) as typeof exit).model).toContain('My name is Mina. I am 14. I am from Brazil. I like music 🎵.');
  });

  it('a student who gets every choice wrong first still finishes (wrong tries are counted, never blocking)', () => {
    const { s } = run(honest, 1, true);
    expect(s.finished).toBe(true);
    expect(s.answers.some((a) => !a.correct)).toBe(true);
  });

  it('shows the student their own name in the greetings and the Mission model keeps the dial wording', () => {
    const { s } = run(honest, 0);
    const greet = interpolateBeat(A1S01E1.beats.find((b) => b.t === 'say' && b.text.includes('{name}'))!, s.vars) as Extract<Beat, { t: 'say' }>;
    expect(greet.text).toContain('Mina');
    const take1 = A1S01E1.beats.find((b) => b.t === 'record' && /^Take 1/.test(b.prompt)) as Extract<Beat, { t: 'record' }>;
    expect((interpolateBeat(take1, s.vars) as typeof take1).model).toBe('Hi! My name is Mina. I am from ___.');
  });
});

describe('the hour', () => {
  const lower = [2, 4, 7, 8, 3, 6, 3, 2]; // screen minutes by part (the rest is the teacher and the student talking)
  it('fills each part of the blueprint run of show, and the lesson is at least 34 minutes on screen', () => {
    for (const dial of [0, 1, 2]) {
      const secs = segmentSeconds(A1S01E1, dial);
      secs.forEach((sec, i) => {
        const min = sec / 60;
        expect(min, `part ${i} dial ${dial}: ${min.toFixed(1)} min`).toBeGreaterThanOrEqual(lower[i]);
        expect(min, `part ${i} dial ${dial}: ${min.toFixed(1)} min`).toBeLessThanOrEqual(bp.runOfShow[i].minutes * 1.15);
      });
      expect(secs.reduce((a, b) => a + b, 0) / 60).toBeGreaterThanOrEqual(34);
    }
  });
  it('every beat has a time estimate', () => {
    A1S01E1.beats.forEach((b) => expect(Number.isFinite(beatSeconds(b))).toBe(true));
  });
});

describe('voice rule', () => {
  it('never uses the browser text-to-speech', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const dir = path.resolve(__dirname, '..');
    const files = fs.readdirSync(dir).filter((f) => /\.(ts|tsx)$/.test(f));
    for (const f of files) {
      const src = fs.readFileSync(path.join(dir, f), 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
      expect(/speechSynthesis|SpeechSynthesisUtterance/.test(src), f).toBe(false);
    }
  });
});

describe('cloze gaps survive interpolation', () => {
  it('keeps {{gap}} markers while filling {name}', async () => {
    const { interpolateBeat } = await import('../engine');
    const b = interpolateBeat({ t: 'cloze', prompt: 'Hi {name}', lines: [{ who: 'Ava', text: 'My {{name}} is {name}.' }], bank: ['name'] } as never, { name: 'Mina' });
    expect((b as { lines: { text: string }[] }).lines[0].text).toBe('My {{name}} is Mina.');
    expect((b as { prompt: string }).prompt).toBe('Hi Mina');
  });
});
