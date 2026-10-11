import { describe, expect, it } from 'vitest';
import { initState, replayTo, step } from '../engine';
import { academySyncId, reconcilePlayerState, shareable } from '../liveSync';
import { A1S01E1 } from '../samples/a1s01e1';

describe('live classroom: sharing the lesson state', () => {
  it('a real state survives the trip over the wire', () => {
    let s = initState(A1S01E1, 1);
    for (let i = 0; i < 6; i++) s = step(A1S01E1, s, { type: 'next' });
    const wire = JSON.parse(JSON.stringify(shareable(s)));
    const back = reconcilePlayerState(wire, A1S01E1);
    expect(back).not.toBeNull();
    expect(back!.beatIndex).toBe(s.beatIndex);
    expect(back!.rev).toBe(s.rev);
    expect(back!.stage.segment).toBe(s.stage.segment);
    expect(back!.stage.bg).toEqual(s.stage.bg);
    expect(back!.history).toEqual([]);
  });

  it('never trusts a bad snapshot (the student screen must not crash)', () => {
    const bad: unknown[] = [null, 'x', 7, [], {}, { beatIndex: -1, rev: 0, stage: { segment: 0, sprites: {} } }, { beatIndex: 99999, rev: 0, stage: { segment: 0, sprites: {} } }, { beatIndex: 3, rev: 'a', stage: {} }, { beatIndex: 3, rev: 1, stage: { segment: 'a', sprites: {} } }, { beatIndex: 3, rev: 1, stage: { segment: 0, sprites: [] } }];
    for (const b of bad) expect(reconcilePlayerState(b, A1S01E1)).toBeNull();
  });

  it('drops sprites that are not in the lesson cast and tolerates missing optional fields', () => {
    const r = reconcilePlayerState({ beatIndex: 1, rev: 2, stage: { segment: 1, sprites: { Vee: { pos: 'left', expr: 'happy' }, Nobody: { pos: 'left', expr: 'happy' } } } }, A1S01E1)!;
    expect(Object.keys(r.stage.sprites)).toEqual(['Vee']);
    expect(r.vars).toEqual({});
    expect(r.answers).toEqual([]);
  });

  it('tags snapshots with the lesson id so another lesson cannot be applied', () => {
    expect(academySyncId(A1S01E1)).toBe(`academy:${A1S01E1.id}`);
  });

  it('a late joiner is caught up to the teacher position by replay', () => {
    let s = initState(A1S01E1, 1);
    for (let i = 0; i < 40; i++) s = step(A1S01E1, s, { type: 'next' });
    const caught = replayTo(A1S01E1, 1, s.beatIndex);
    expect(caught.beatIndex).toBeGreaterThanOrEqual(s.beatIndex - 0);
    expect(caught.stage.bg).toBeTruthy();
    expect(caught.stage.segment).toBeGreaterThanOrEqual(0);
  });
});
