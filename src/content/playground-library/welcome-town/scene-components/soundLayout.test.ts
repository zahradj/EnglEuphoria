import { describe, it, expect } from 'vitest';
import { resolveSoundSides } from './soundLayout';
import type { SoundSide } from './soundAnchors';

type S = { id: string; kind: string; soundSide?: SoundSide };
const snd = (id: string, soundSide?: SoundSide): S => ({ id, kind: 'sound-model', soundSide });
const other = (id: string): S => ({ id, kind: 'meet' });

describe('sound-lesson layout pattern', () => {
  it('rotates centre → left → right across a lesson\'s sound scenes (other scenes untouched)', () => {
    const out = resolveSoundSides([other('a'), snd('1'), other('b'), snd('2'), snd('3'), snd('4')]);
    expect(out.filter((s) => s.kind === 'sound-model').map((s) => s.soundSide)).toEqual(['center', 'left', 'right', 'center']);
    expect(out[0]).toEqual(other('a'));
  });

  it('keeps a scene\'s own choice and never repeats the previous layout', () => {
    const out = resolveSoundSides([snd('1', 'left'), snd('2'), snd('3', 'right'), snd('4')]);
    const sides = out.map((s) => s.soundSide);
    expect(sides[0]).toBe('left');
    expect(sides[2]).toBe('right');
    for (let i = 1; i < sides.length; i++) expect(sides[i], `scene ${i}`).not.toBe(sides[i - 1]);
  });

  it('returns the same array when nothing needed filling, and never mutates its input', () => {
    const fixed = [snd('1', 'center'), other('x')];
    expect(resolveSoundSides(fixed)).toBe(fixed);
    const input = [snd('1')];
    const out = resolveSoundSides(input);
    expect(input[0].soundSide).toBeUndefined();
    expect(out[0].soundSide).toBe('center');
  });
});
