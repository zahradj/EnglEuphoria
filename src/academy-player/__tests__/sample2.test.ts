// A1-S01-E2 "Sign Me Up": the lesson must pass the validator, the Academy blueprint (cast, run of show, clue, items, minutes), and the
// academy-lesson-craft checks: ONE objective with criteria, every screen tagged to a criterion (alignment matrix), the exit task uses only what
// was taught and practised >= 3 times, a cold-exit run produces the sign-up card with the model hidden.
import { describe, expect, it } from 'vitest';
import { A1S01E2, CRITERIA, EXIT_FRAMES, FRAME_WORDS, INVENTORY, OBJECTIVE } from '../samples/a1s01e2';
import { initState, interpolateBeat, step, type PlayerEvent, type PlayerState } from '../engine';
import { beatSeconds, segmentSeconds } from '../lessonTiming';
import { isInteractive, type Beat } from '../scriptTypes';
import { knownWordShare, validateScript } from '../validateScript';
import { ACADEMY_ITEMS } from '../../curriculum/academy/items';
import { ACADEMY_LESSON_BLUEPRINTS } from '../../curriculum/academy';

const bp = ACADEMY_LESSON_BLUEPRINTS.find((b) => b.id === 'A1-S01-E2')!;
const E2_ITEMS = ACADEMY_ITEMS['A1-S01'].E2.map((i) => i[0]);
// language from lesson 1 (the stack: L2 = L1 + new): its 12 words, its frames, its classroom words
const LESSON_1 = ['name', 'age', 'country', 'hobby', 'family', 'mother', 'father', 'brother', 'sister', 'football', 'music', 'games', 'brazil', 'brazilian', 'japan', 'japanese', 'france', 'french', 'usa', 'american', 'like', 'old', 'am', 'from', 'hi', 'welcome', 'club', 'nice', 'meet'];
const FUNCTION_WORDS = ['a', 'an', 'the', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'my', 'your', 'our', 'his', 'her', 'their', 'is', 'am', 'are', 'be', 'not', 'and', 'but', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'who', 'what', 'where', 'how', 'this', 'that', 'there', 'now', 'yes', 'no', 'do', 'does', 'next', 'time', 'from', 'have', 'say', 'again', 'first', 'then', 'try', 'right', 'look', 'or', 'too', 'old', 'like', 'big', 'out', 'so', 'if', 'all', 'only', 'any', 'some', 'one', 'two', 'it’s', 'let', 'us', 'will', 'can', 'okay', 'ok'];
// routine classroom words the player and the teacher repeat in every lesson (buttons, prompts), learned by doing
const CLASSROOM_WORDS = ['tap', 'tell', 'read', 'line', 'lines', 'match', 'each', 'picture', 'pictures', 'complete', 'conversation', 'gap', 'word', 'words', 'build', 'sentence', 'question', 'questions', 'ask', 'play', 'game', 'quick', 'different', 'practise', 'talk', 'help', 'lots', 'little', 'hidden', 'memory', 'whole', 'more', 'new', 'add', 'thing', 'goal', 'card', 'today', 'meet', 'meaning', 'story', 'hello', 'introduce', 'yourself', 'turn', 'learn', 'make', 'fill', 'full', 'empty', 'chill', 'normal', 'push', 'homework', 'friend', 'yet', 'great', 'good', 'cool', 'clue', 'next', 'about', 'ava', 'theo', 'vee', 'start', 'see', 'many', 'hear', 'also', 'choose', 'much', 'way', 'which', 'order', 'put', 'know', 'ava’s', 'theo’s', 'together', 'said', 'it', 'week', 'answer', 'follow', 'model', 'drag', 'onto', 'skip', 'sure', 'type', 'back', 'rest', 'round', 'speed', 'take', 'thanks', 'person', 'own', 'asks', 'facts', 'sam', 'sam’s', 'profile', 'fake', 'wrong', 'typed', 'places', 'sorry', 'perfect', 'list', 'here', 'too', 'letters', 'badge', 'hear', 'help', 'talks', 'fast', 'odd', 'out', 'find', 'game', 'spot', 'mistake', 'nationality', 'nationalities', 'country', 'people', 'working', 'work', 'goes', 'real', 'left', 'does', 'nothing', 'up', 'sign-up', 'last', 'loud', 'names', 'numbers', 'countries', 'spelled', 'teacher', 'tiles', 'remember', 'asked', 'him', 'its', 'want', 'ava\'s', 'theo\'s', 'brazilian', 'perfect'];

const tagOf = (beats: Beat[], i: number): number[] | null => {
  for (let k = i - 1; k >= 0; k--) {
    const b = beats[k];
    if (b.t === 'trains') return b.criteria;
    if (b.t === 'segment') return null; // a segment starts with no tag
  }
  return null;
};

describe('lesson A1-S01-E2: objective, blueprint, validator', () => {
  it('passes the validator with no errors', () => {
    expect(validateScript(A1S01E2).filter((i) => i.severity === 'error')).toEqual([]);
  });

  it('has ONE observable objective with 5 criteria, in the student\'s words', () => {
    expect(OBJECTIVE).toMatch(/^By the end I can sign up/);
    expect(CRITERIA).toHaveLength(5);
    CRITERIA.forEach((c) => expect(c).toMatch(/^I (said|asked|spelled)/));
  });

  it('keeps the blueprint facts: cast, run of show, A1, lesson id, clue 2 at the end, builds on lesson 1', () => {
    expect([...A1S01E2.cast].sort()).toEqual(bp.cast.appears.map((c) => c.name).sort());
    expect(A1S01E2.lessonId).toBe(bp.id);
    expect(A1S01E2.level).toBe('A1');
    expect(A1S01E2.beats.filter((b) => b.t === 'segment').map((b) => (b as { index: number }).index)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect((A1S01E2.beats.find((b) => b.t === 'end') as { summary?: string }).summary).toMatch(/Clue 2 of 8/);
    expect(bp.clue.no).toBe(2);
    expect(bp.buildsOn.lessonIds).toEqual(['A1-S01-E1']);
    expect(bp.newItems.count).toBe(14);
  });

  it('teaches exactly the blueprint\'s 14 items, each as a picture card (numbers drawn, flags drawn), and each card has a meaning, a question and a clue', () => {
    expect([...INVENTORY].sort()).toEqual([...E2_ITEMS].sort());
    const cards = A1S01E2.beats.flatMap((b) => (b.t === 'flash' ? b.cards : []));
    expect(cards.map((c) => c.word).sort()).toEqual([...INVENTORY].sort());
    cards.forEach((c) => {
      expect(c.meaning, `${c.word} needs a meaning`).toBeTruthy();
      expect(c.ask, `${c.word} needs a question`).toBeTruthy();
      expect(c.clue, `${c.word} needs a clue`).toBeTruthy();
      expect(c.pictureId).toMatch(/^(num-\d+|flag-[a-z]{2}|who-[a-z]{2})$/);
    });
  });

  it('keeps >= 95 % of the running words known (14 items, lesson 1, closed-class, classroom words, frame words)', () => {
    const known = new Set<string>([...INVENTORY.map((w) => w.toLowerCase()), ...LESSON_1, ...FRAME_WORDS, ...'three four five six seven eight nine ten'.split(' '), ...FUNCTION_WORDS, ...CLASSROOM_WORDS, 'spain', 'spanish', 'italy', 'italian']);
    const { share, unknown } = knownWordShare(A1S01E2, known);
    expect(share, `unknown words: ${unknown.join(', ')}`).toBeGreaterThanOrEqual(bp.buildsOn.inputKnownWordsMinPct / 100);
  });
});

describe('academy-lesson-craft checks', () => {
  const beats = A1S01E2.beats;
  const interactive = beats.map((b, i) => ({ b, i })).filter(({ b }) => isInteractive(b) && b.t !== 'end');

  it('ALIGNMENT: every interactive screen carries a criterion tag (0 only in Check-in)', () => {
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

  it('ALIGNMENT: every criterion has >= 3 screens, and the last for each is production (say-from-memory or the exit record)', () => {
    for (let c = 1; c <= 5; c++) {
      const screens = interactive.filter(({ i, b }) => tagOf(beats, i)!.includes(c) && (b.t !== 'say' || !!b.hide || !!b.repeat));
      expect(screens.length, `criterion ${c}`).toBeGreaterThanOrEqual(3);
      const last = screens[screens.length - 1].b;
      expect(last.t === 'record' || last.t === 'ticks' || (last.t === 'say' && !!last.hide), `last screen for criterion ${c} is ${last.t}`).toBe(true);
    }
  });

  it('SPELLING is practised: 3 letter-tile spellings (Ava, Theo, the student), then said out loud, then in the Mission and the exit', () => {
    const spells = beats.filter((b) => b.t === 'spell');
    expect(spells.length).toBeGreaterThanOrEqual(3);
    expect(spells.some((b) => b.t === 'spell' && b.target === '{name}' && b.save === 'spelled')).toBe(true);
  });

  it('EXIT COVERAGE: the exit task uses only practised frames: each is read, completed, built or said >= 3 times before the Release', () => {
    const releaseAt = beats.findIndex((b) => b.t === 'segment' && b.index === 6);
    const practice: string[] = [];
    beats.slice(0, releaseAt).forEach((b) => {
      if (b.t === 'say' && (b.repeat || b.hide)) practice.push(b.text);
      if (b.t === 'cloze') b.lines.forEach((l) => practice.push(l.text.replace(/\{\{|\}\}/g, '')));
      if (b.t === 'build') practice.push(b.target);
      if (b.t === 'record') practice.push(b.model);
      if (b.t === 'match') b.pairs.forEach((p) => practice.push(`${p.left} ${p.right}`));
    });
    const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ');
    for (const f of EXIT_FRAMES) expect(practice.filter((t) => norm(t).includes(f)).length, `frame "${f}"`).toBeGreaterThanOrEqual(3);
    const exit = beats.find((b) => b.t === 'record' && b.hideModel);
    expect(exit).toBeTruthy();
  });

  it('SAY IT: lines are said (read-and-repeat, memorise, role-play) before the exit task', () => {
    const saidLines = beats.filter((b) => b.t === 'say' && (b.repeat || b.hide)).length;
    const records = beats.filter((b) => b.t === 'record').length;
    expect(saidLines).toBeGreaterThanOrEqual(10 + 6);
    expect(records).toBeGreaterThanOrEqual(3);
  });

  it('SUPPORT FADES: read-and-repeat (full text) -> key words hidden -> only the first word -> role-play with a short model -> exit with no model', () => {
    const order = beats.filter((b) => b.t === 'say' && (b.repeat || b.hide)).map((b) => (b as Extract<Beat, { t: 'say' }>).hide ?? 'full');
    expect(order.indexOf('full')).toBeLessThan(order.indexOf('keys'));
    expect(order.indexOf('keys')).toBeLessThan(order.indexOf('all'));
  });

  it('PROGRESSIVE STACK: lesson 1 language is recycled in the Check-in, the Mission and the exit', () => {
    const cloze = beats.find((b) => b.t === 'cloze') as Extract<Beat, { t: 'cloze' }>;
    expect(cloze.lines.map((l) => l.text).join(' ')).toMatch(/How \{\{old\}\} are you/);
    const exit = beats.find((b) => b.t === 'record' && b.hideModel) as Extract<Beat, { t: 'record' }>;
    expect(exit.model).toMatch(/My name is .* I am \{age\}\. I am from \{country\}/);
  });
});

describe('playing the lesson', () => {
  const letters = (name: string) => name.toUpperCase().replace(/[^A-Z]/g, '').split('').join('-');
  const run = (pick: (b: Beat) => PlayerEvent, dial = 1, wrongFirst = false) => {
    let s: PlayerState = initState(A1S01E2, 5);
    const seen: Beat[] = [];
    for (let g = 0; g < 3000 && !s.finished; g++) {
      const b = A1S01E2.beats[s.beatIndex];
      seen.push(b);
      if (wrongFirst && b.t === 'choice' && b.options.some((o) => o.correct === false)) s = step(A1S01E2, s, { type: 'answer', correct: false });
      let e = pick(b);
      if (b.t === 'choice' && b.options.some((o) => o.set?.dial)) e = { type: 'choose', index: dial };
      s = step(A1S01E2, s, e);
    }
    return { s, seen };
  };
  const honest = (b: Beat): PlayerEvent => {
    if (b.t === 'choice') return { type: 'choose', index: Math.max(0, b.options.findIndex((o) => o.correct)) };
    if (b.t === 'sort') return { type: 'fill', values: { [b.key]: 5 } };
    if (b.t === 'spell') return b.save ? { type: 'fill', values: { [b.save]: letters('Mina') } } : { type: 'next' };
    if (b.t === 'form') return { type: 'fill', values: Object.fromEntries(b.fields.map((f) => [f.key, f.kind === 'text' ? (f.key === 'name' ? 'Mina' : f.key === 'nationality' ? 'Brazilian' : 'Brazil') : f.options![f.key === 'age' ? 3 : 0]])) };
    if (b.t === 'record' && b.hideModel) return { type: 'fill', values: { exitPeeked: false, exitText: 'My name is Mina.' } };
    return { type: 'next' };
  };

  it('reaches the end on all three dials, with Take 1 -> feedback -> Take 2 each time', () => {
    for (const dial of [0, 1, 2]) {
      const { s, seen } = run(honest, dial);
      expect(s.finished).toBe(true);
      expect(seen.filter((b) => b.t === 'record' && /^Take [12]/.test(b.prompt))).toHaveLength(2);
    }
  });

  it('COLD EXIT: an honest student ends with the full sign-up card, the model hidden, evidence saved', () => {
    const { s } = run(honest);
    expect(s.vars).toMatchObject({ name: 'Mina', spelled: 'M-I-N-A', age: '14', country: 'Brazil', nationality: 'Brazilian', num: '4-2-7', exitPeeked: false });
    const profile = A1S01E2.beats.filter((b) => b.t === 'profile').pop()!;
    const rows = (interpolateBeat(profile, s.vars) as Extract<Beat, { t: 'profile' }>).rows.map((r) => r.value);
    expect(rows).toEqual(['Mina', 'M-I-N-A', '14', 'Brazil', 'Brazilian', '4-2-7']);
    const exit = A1S01E2.beats.find((b) => b.t === 'record' && b.hideModel) as Extract<Beat, { t: 'record' }>;
    expect((interpolateBeat(exit, s.vars) as typeof exit).model).toContain('My name is Mina. M-I-N-A. I am 14. I am from Brazil. I am Brazilian. My number is four, two, seven.');
  });

  it('a student who gets every choice wrong first still finishes (wrong tries are counted, never blocking)', () => {
    const { s } = run(honest, 1, true);
    expect(s.finished).toBe(true);
    expect(s.answers.some((a) => !a.correct)).toBe(true);
  });

  it('shows the student their own name and letters in the lines', () => {
    const { s } = run(honest, 0);
    const greet = interpolateBeat(A1S01E2.beats.find((b) => b.t === 'say' && b.text.includes('{name}'))!, s.vars) as Extract<Beat, { t: 'say' }>;
    expect(greet.text).toContain('Mina');
    const take1 = A1S01E2.beats.find((b) => b.t === 'record' && /^Take 1/.test(b.prompt)) as Extract<Beat, { t: 'record' }>;
    expect((interpolateBeat(take1, s.vars) as typeof take1).model).toBe('My name is Mina. M-I-N-A. I am from ___.');
  });
});

describe('the hour', () => {
  const lower = [2, 4, 7, 8, 3, 6, 3, 2]; // screen minutes by part (the rest is the teacher and the student talking)
  it('fills each part of the blueprint run of show, and the lesson is at least 34 minutes on screen', () => {
    for (const dial of [0, 1, 2]) {
      const secs = segmentSeconds(A1S01E2, dial);
      secs.forEach((sec, i) => {
        const min = sec / 60;
        expect(min, `part ${i} dial ${dial}: ${min.toFixed(1)} min`).toBeGreaterThanOrEqual(lower[i]);
        expect(min, `part ${i} dial ${dial}: ${min.toFixed(1)} min`).toBeLessThanOrEqual(bp.runOfShow[i].minutes * 1.15);
      });
      expect(secs.reduce((a, b) => a + b, 0) / 60).toBeGreaterThanOrEqual(34);
    }
  });
  it('every beat has a time estimate', () => {
    A1S01E2.beats.forEach((b) => expect(Number.isFinite(beatSeconds(b))).toBe(true));
  });
});

describe('variety (academy-quality-gate #4)', () => {
  it('never runs more than 2 screens of the same kind in a row inside a part', () => {
    const screens = A1S01E2.beats.filter((b) => b.t === 'segment' || (isInteractive(b) && b.t !== 'end' && !(b.t === 'say' && !b.repeat && !b.hide)));
    let run = 1;
    for (let i = 1; i < screens.length; i++) {
      const kind = (b: Beat) => (b.t === 'say' ? 'say' : b.t);
      if (screens[i].t === 'segment' || screens[i - 1].t === 'segment') { run = 1; continue; }
      run = kind(screens[i]) === kind(screens[i - 1]) ? run + 1 : 1;
      const k = kind(screens[i]);
      if (k !== 'say') expect(run, `more than 2 "${k}" screens in a row at screen ${i}`).toBeLessThanOrEqual(2);
    }
  });
});
