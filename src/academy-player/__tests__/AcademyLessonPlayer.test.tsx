import { createRef } from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach } from 'vitest';

// An in-memory classroom channel: every sender reaches every OTHER listener (like `broadcast: { self: false }`).
const bus = vi.hoisted(() => {
  type L = (p: any) => void;
  const lists = { state: new Set<L>(), perm: new Set<L>(), req: new Set<L>() };
  return {
    lists,
    sent: [] as any[],
    reset() { lists.state.clear(); lists.perm.clear(); lists.req.clear(); this.sent.length = 0; },
  };
});
vi.mock('@/services/whiteboardService', () => ({
  whiteboardService: {
    async sendSceneActivityState(_room: string, p: any) { bus.sent.push(p); [...bus.lists.state].forEach((cb) => cb({ ...p, timestamp: 1 })); },
    subscribeToSceneActivityState(_room: string, cb: any) { bus.lists.state.add(cb); return () => bus.lists.state.delete(cb); },
    async sendSceneInteractionPermission(_room: string, p: any) { [...bus.lists.perm].forEach((cb) => cb({ ...p, timestamp: 1 })); },
    subscribeToSceneInteractionPermission(_room: string, cb: any) { bus.lists.perm.add(cb); return () => bus.lists.perm.delete(cb); },
    async sendSceneStateRequest(_room: string, p: any) { [...bus.lists.req].forEach((cb) => cb({ ...p, timestamp: 1 })); },
    subscribeToSceneStateRequest(_room: string, cb: any) { bus.lists.req.add(cb); return () => bus.lists.req.delete(cb); },
  },
}));

import AcademyLessonPlayer, { type AcademyLessonHandle } from '../AcademyLessonPlayer';
import { A1S01E1 } from '../samples/a1s01e1';

const flush = () => act(async () => { await Promise.resolve(); });

describe('Academy lesson player in the live classroom', () => {
  beforeEach(() => { bus.reset(); window.sessionStorage.clear(); });
  afterEach(cleanup);

  const mount = () => {
    const t = createRef<AcademyLessonHandle>();
    const s = createRef<AcademyLessonHandle>();
    const tNav = vi.fn();
    const sNav = vi.fn();
    render(<AcademyLessonPlayer ref={t} script={A1S01E1} sessionKey="t" role="teacher" roomId="r" hideInternalNav onNavState={tNav} />);
    render(<AcademyLessonPlayer ref={s} script={A1S01E1} sessionKey="s" role="student" roomId="r" hideInternalNav onNavState={sNav} />);
    return { t, s, tNav, sNav };
  };
  const last = (fn: ReturnType<typeof vi.fn>) => fn.mock.calls[fn.mock.calls.length - 1][0];

  it('only the teacher can move the lesson; the student follows the teacher\'s screen', async () => {
    const { t, s, tNav, sNav } = mount();
    await flush();
    expect(last(tNav).canNavigate).toBe(true);
    expect(last(sNav).canNavigate).toBe(false);
    const start = last(sNav).sceneIdx;

    act(() => s.current!.goNext()); // a student cannot navigate
    await flush();
    expect(last(tNav).sceneIdx).toBe(start);

    act(() => t.current!.goNext());
    await flush();
    expect(last(tNav).sceneIdx).toBeGreaterThan(start);
    expect(last(sNav).sceneIdx).toBe(last(tNav).sceneIdx); // the student's screen followed
  });

  it('the teacher can jump to a position and the student lands on the same beat', async () => {
    const { t, tNav, sNav } = mount();
    await flush();
    act(() => t.current!.goToIndex(60));
    await flush();
    expect(last(tNav).sceneIdx).toBeGreaterThanOrEqual(60);
    expect(last(sNav).sceneIdx).toBe(last(tNav).sceneIdx);
  });

  it('the pause button reaches the student', async () => {
    const { t, sNav } = mount();
    await flush();
    expect(last(sNav).interactionUnlocked).toBe(true);
    act(() => t.current!.setInteractionUnlocked(false));
    await flush();
    expect(last(sNav).interactionUnlocked).toBe(false);
  });

  it('a student who joins late asks for the state and gets the teacher\'s position', async () => {
    const t = createRef<AcademyLessonHandle>();
    const tNav = vi.fn();
    render(<AcademyLessonPlayer ref={t} script={A1S01E1} sessionKey="t" role="teacher" roomId="r" hideInternalNav onNavState={tNav} />);
    await flush();
    act(() => t.current!.goToIndex(40));
    await flush();
    const sNav = vi.fn();
    render(<AcademyLessonPlayer script={A1S01E1} sessionKey="late" role="student" roomId="r" hideInternalNav onNavState={sNav} />);
    await flush();
    expect(last(sNav).sceneIdx).toBe(last(tNav).sceneIdx);
  });

  it('a bad snapshot on the channel is ignored (the student screen keeps working)', async () => {
    const { sNav } = mount();
    await flush();
    const before = last(sNav).sceneIdx;
    act(() => { bus.lists.state.forEach((cb) => cb({ state: { beatIndex: 'x' }, senderId: 'teacher', sceneId: `academy:${A1S01E1.id}`, timestamp: 1 })); });
    act(() => { bus.lists.state.forEach((cb) => cb({ state: null, senderId: 'teacher', sceneId: `academy:${A1S01E1.id}`, timestamp: 1 })); });
    await flush();
    expect(last(sNav).sceneIdx).toBe(before);
  });
});
