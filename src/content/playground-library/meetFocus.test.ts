import { describe, it, expect } from 'vitest';
import * as unit1 from './unit1/scenes';
import * as welcomeTown from './welcome-town/scenes';
import * as a2 from './welcome-town-a2/scenes';
import * as castle from './magic-castle/scenes';
import * as jungle from './jungle-adventure/scenes';
import { splitFocus } from './FocusLine';

type MeetScene = { id: string; kind: 'meet'; line: string; focus?: string[] };

/** Every scene array exported by the lesson files. */
const allScenes = [unit1, welcomeTown, a2, castle, jungle]
  .flatMap((mod) => Object.values(mod as Record<string, unknown>))
  .filter((v): v is Array<{ kind?: string }> => Array.isArray(v) && v.length > 0 && typeof (v[0] as { kind?: unknown })?.kind === 'string')
  .flat();
const meetScenes = allScenes.filter((s): s is MeetScene & { kind: 'meet' } => s.kind === 'meet');

describe('vocabulary highlighted on the character-speaking (meet) scenes', () => {
  it('finds the meet scenes (guards against the test silently checking nothing)', () => {
    expect(meetScenes.length).toBeGreaterThan(30);
  });

  it('every meet scene names the vocabulary to highlight', () => {
    const missing = meetScenes.filter((s) => !s.focus || s.focus.length === 0).map((s) => s.id);
    expect(missing, `Add focus: ['word'] to these meet scenes (the vocabulary the line teaches):\n${missing.join('\n')}`).toEqual([]);
  });

  it('every highlighted word really appears in its line (whole word, any capitalisation)', () => {
    const bad: string[] = [];
    for (const s of meetScenes) {
      for (const f of s.focus ?? []) {
        if (!splitFocus(s.line, [f]).some((p) => p.focus)) bad.push(`${s.id}: "${f}" is not in "${s.line}"`);
      }
    }
    expect(bad, bad.join('\n')).toEqual([]);
  });

  it('at most two highlighted words per line, so the highlight keeps meaning something', () => {
    const many = meetScenes.filter((s) => (s.focus?.length ?? 0) > 2).map((s) => s.id);
    expect(many).toEqual([]);
  });
});
