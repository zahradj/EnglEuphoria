import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, renderHook, screen } from '@testing-library/react';
import { reconcileSyncedState, useSceneScopedState, useSyncedState, type ActivitySync } from './sceneActivitySync';
import { ClassroomSceneErrorBoundary } from '@/components/classroom/stage/ClassroomSceneErrorBoundary';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { getUser: async () => ({ data: { user: null } }) }, from: () => ({ insert: async () => ({}) }) },
}));

const mirror = (state: unknown): ActivitySync => ({ isSynced: true, isAuthority: false, state, setState: () => {} });

describe('classroom: a snapshot from another scene can never crash the student view', () => {
  it('fills fields the snapshot is missing from the scene defaults', () => {
    const initial = { round: 0, order: [] as number[], wrongIdx: null as number | null };
    // e.g. a leftover snapshot from a different scene kind
    expect(reconcileSyncedState({ step: 3, revealed: true }, initial)).toMatchObject({ round: 0, order: [], wrongIdx: null });
    // wrong container type for an array field
    expect(reconcileSyncedState({ round: 2, order: 'x' }, initial).order).toEqual([]);
    // real snapshot passes straight through
    expect(reconcileSyncedState({ round: 2, order: [2, 0, 1], wrongIdx: 1 }, initial)).toEqual({ round: 2, order: [2, 0, 1], wrongIdx: 1 });
    expect(reconcileSyncedState(null, initial)).toBe(initial);
  });

  it('useSyncedState mirror renders safely from a wrong-shaped snapshot (the "undefined.length" crash)', () => {
    const initial = { round: 0, order: [] as number[] };
    const { result } = renderHook(() => useSyncedState(mirror({ step: 1, found: ['a'] }), initial));
    expect(result.current[0].order.length).toBe(0); // used to be: Cannot read properties of undefined (reading 'length')
  });

  it('the authority side is unaffected (plain local state)', () => {
    const sync: ActivitySync = { isSynced: true, isAuthority: true, state: { bogus: true }, setState: vi.fn() };
    const { result } = renderHook(() => useSyncedState(sync, { n: 1 }));
    expect(result.current[0]).toEqual({ n: 1 });
    act(() => result.current[1]({ n: 2 }));
    expect(result.current[0]).toEqual({ n: 2 });
    expect(sync.setState).toHaveBeenCalledWith({ n: 2 });
  });

  it('scene-scoped state is hidden the instant the scene changes (no stale previous-scene state for a render)', () => {
    const seen: unknown[] = [];
    const { result, rerender } = renderHook(({ id }) => { const r = useSceneScopedState(id); seen.push(r[0]); return r; }, { initialProps: { id: 'scene-a' } });
    act(() => result.current[1]({ order: [1, 2] }));
    expect(result.current[0]).toEqual({ order: [1, 2] });
    seen.length = 0;
    rerender({ id: 'scene-b' });
    expect(seen[0]).toBeNull(); // first render of scene-b: no scene-a leftovers
    expect(result.current[0]).toBeNull();
  });
});

describe('ClassroomSceneErrorBoundary: transient crashes heal without bothering the teacher', () => {
  afterEach(() => vi.useRealTimers());

  it('a one-off crash is remounted automatically — the "snag" card never shows', async () => {
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    let crashes = 1;
    const Flaky = () => { if (crashes-- > 0) throw new Error('boom'); return <div>lesson is showing</div>; };
    render(<ClassroomSceneErrorBoundary><Flaky /></ClassroomSceneErrorBoundary>);
    expect(screen.queryByText('This activity hit a snag')).toBeNull();
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    expect(screen.getByText('lesson is showing')).toBeTruthy();
  });

  it('a persistent crash still ends on the snag card (with the manual reload button)', async () => {
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const Broken = () => { throw new Error('always'); };
    render(<ClassroomSceneErrorBoundary><Broken /></ClassroomSceneErrorBoundary>);
    // step time so React flushes each quiet retry before the next one fires
    for (let i = 0; i < 6; i++) await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    expect(screen.getByText('This activity hit a snag')).toBeTruthy();
    expect(screen.getByText('Reload this activity')).toBeTruthy();
  });
});
