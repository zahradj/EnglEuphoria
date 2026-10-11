import { describe, expect, it } from 'vitest';
import { accuracy, backlog, initState, mulberry32, seededShuffle, step } from '../engine';
import type { SceneScript } from '../scriptTypes';
import { validateScript } from '../validateScript';

const tiny: SceneScript = {
  lessonId: 'A1-S01-E1',
  level: 'A1',
  title: 'tiny',
  cast: ['Vee', 'Ava'],
  beats: [
    { t: 'bg', id: 'room', alt: 'A room' },
    { t: 'show', who: 'Vee', pos: 'center', expr: 'happy' },
    { t: 'say', who: 'Vee', text: 'Hello!' },
    { t: 'choice', prompt: 'Pick', tests: 'language', options: [{ text: 'Right', correct: true, goto: 'good' }, { text: 'Wrong', correct: false, feedback: 'Try again', goto: 'bad' }] },
    { t: 'label', name: 'bad' },
    { t: 'say', who: 'Ava', text: 'Not yet.' },
    { t: 'jump', label: 'finish' },
    { t: 'label', name: 'good' },
    { t: 'show', who: 'Ava', pos: 'left', expr: 'happy' },
    { t: 'say', who: 'Ava', text: 'Yes!' },
    { t: 'label', name: 'finish' },
    { t: 'end' },
  ],
};

describe('engine', () => {
  it('runs silent beats up to the first interactive beat and sets the stage', () => {
    const s = initState(tiny, 7);
    expect(s.beatIndex).toBe(2);
    expect(s.stage.bg?.id).toBe('room');
    expect(s.stage.sprites.Vee?.expr).toBe('happy');
    expect(s.finished).toBe(false);
  });

  it('is pure: the same events give the same state, and the input state is never mutated', () => {
    const s0 = initState(tiny, 7);
    const frozen = JSON.stringify(s0);
    const a = step(tiny, step(tiny, s0, { type: 'next' }), { type: 'choose', index: 0 });
    const b = step(tiny, step(tiny, s0, { type: 'next' }), { type: 'choose', index: 0 });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(JSON.stringify(s0)).toBe(frozen);
  });

  it('follows choices to labels and records answers', () => {
    const s1 = step(tiny, initState(tiny), { type: 'next' });
    const good = step(tiny, s1, { type: 'choose', index: 0 });
    expect(tiny.beats[good.beatIndex]).toMatchObject({ t: 'say', text: 'Yes!' });
    expect(good.stage.sprites.Ava?.pos).toBe('left');
    const bad = step(tiny, s1, { type: 'choose', index: 1 });
    expect(tiny.beats[bad.beatIndex]).toMatchObject({ t: 'say', text: 'Not yet.' });
    expect(accuracy(good)).toBe(1);
    expect(accuracy(bad)).toBe(0);
  });

  it('jumps and finishes on the end beat', () => {
    let s = step(tiny, initState(tiny), { type: 'next' });
    s = step(tiny, s, { type: 'choose', index: 1 }); // bad
    s = step(tiny, s, { type: 'next' }); // jump -> finish -> end
    expect(s.finished).toBe(true);
    expect(tiny.beats[s.beatIndex].t).toBe('end');
  });

  it('rewinds to the previous stop and restores the stage', () => {
    const s1 = step(tiny, initState(tiny), { type: 'next' });
    const s2 = step(tiny, s1, { type: 'choose', index: 0 });
    const back = step(tiny, s2, { type: 'back' });
    expect(back.beatIndex).toBe(s1.beatIndex);
    expect(back.stage.sprites.Ava).toBeUndefined();
    expect(step(tiny, initState(tiny), { type: 'back' }).rev).toBe(0); // nothing to rewind
  });

  it('a choice cannot be skipped with next', () => {
    const s1 = step(tiny, initState(tiny), { type: 'next' });
    expect(step(tiny, s1, { type: 'next' })).toBe(s1);
  });

  it('builds a backlog of passed lines', () => {
    const s = step(tiny, step(tiny, initState(tiny), { type: 'next' }), { type: 'choose', index: 0 });
    expect(backlog(tiny, s)).toEqual([{ who: 'Vee', text: 'Hello!' }]);
  });

  it('seeded randomness is deterministic and a real permutation', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    const items = ['a', 'b', 'c', 'd', 'e', 'f'];
    expect(seededShuffle(items, 9)).toEqual(seededShuffle(items, 9));
    expect([...seededShuffle(items, 9)].sort()).toEqual(items);
    expect(items).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });

  it('refuses a script that loops forever', () => {
    const loop: SceneScript = { ...tiny, beats: [{ t: 'label', name: 'x' }, { t: 'jump', label: 'x' }, { t: 'end' }] };
    expect(() => initState(loop)).toThrow(/loops/);
  });
});

describe('validator', () => {
  it('accepts the tiny script apart from the silent-line warnings', () => {
    expect(validateScript(tiny).filter((i) => i.severity === 'error')).toEqual([]);
  });

  it('catches unknown labels, non-cast characters, long A1 lines and bad flash sets', () => {
    const bad: SceneScript = {
      lessonId: 'A1-S01-E1',
      level: 'A1',
      title: 'bad',
      cast: ['Vee', 'Sam' as never],
      beats: [
        { t: 'say', who: 'Vee', text: 'one two three four five six seven eight nine ten eleven twelve thirteen' },
        { t: 'jump', label: 'nowhere' },
        { t: 'flash', title: 'x', cards: [{ word: 'cat', chunk: 'a dog', pictureId: 'p', alt: 'alt' }] },
        { t: 'chat', title: 'c', messages: [{ who: 'Sam' as never, text: 'hi' }] },
      ],
    };
    const codes = validateScript(bad).map((i) => i.code);
    expect(codes).toEqual(expect.arrayContaining(['cast', 'too_long', 'jump', 'flash_size', 'chunk', 'no_end']));
  });
});
