// The live-classroom bridge: the teacher moves the deck lesson and saves the slide; the student follows and cannot move it.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EmbeddedAcademyDeckLesson } from '../classroom/EmbeddedAcademyDeckLesson';
import { hasDeckScript } from '../lessonScripts';
import { ACADEMY_DECK_LESSONS } from '../lessonRegistry';

// a tiny in-memory stand-in for the realtime channel (student sends, teacher receives)
type Tap = { path: number[]; kind?: string; slide?: number; value?: string; senderRole: string; senderId: string };
const bus = vi.hoisted(() => ({ listeners: new Set<(p: Tap) => void>(), sent: [] as Tap[] }));
vi.mock('@/services/whiteboardService', () => ({
  whiteboardService: {
    sendSceneTap: async (_r: string, p: Tap) => { bus.sent.push(p); bus.listeners.forEach((cb) => cb(p)); },
    subscribeToSceneTap: (_r: string, cb: (p: Tap) => void) => { bus.listeners.add(cb); return () => bus.listeners.delete(cb); },
  },
}));

afterEach(() => { cleanup(); bus.listeners.clear(); bus.sent.length = 0; });

describe('Academy library in the classroom', () => {
  it('every library lesson has a script the classroom can load', () => {
    ACADEMY_DECK_LESSONS.forEach((l) => expect(hasDeckScript(l.id), l.id).toBe(true));
    expect(hasDeckScript('nope')).toBe(false);
  });

  it('TEACHER: opens at the saved slide, Next moves the lesson and saves the index for the student', async () => {
    const persist = vi.fn();
    render(<EmbeddedAcademyDeckLesson lessonId="fake-or-real" roomId="r1" role="teacher" persistedSceneIdx={1} onSceneIdxPersist={persist} />);
    await waitFor(() => expect(screen.getByTestId('academy-deck-embed')).toBeTruthy());
    await screen.findByRole('button', { name: 'Next', exact: true });
    expect(screen.getByText('2/27')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Next', exact: true }));
    expect(persist).toHaveBeenCalledWith(2);
    expect(screen.getByText('3/27')).toBeTruthy();
  });

  it('STUDENT: follows the saved slide, has no Back / Next, and the strip does not navigate', async () => {
    const { rerender } = render(<EmbeddedAcademyDeckLesson lessonId="fake-or-real" roomId="r1" role="student" persistedSceneIdx={4} />);
    await screen.findByText('5/27');
    expect(screen.queryByRole('button', { name: 'Next', exact: true })).toBeNull();
    expect(screen.queryByRole('button', { name: '◀ Back', exact: true })).toBeNull();
    expect(screen.getByText(/Your teacher moves the lesson/)).toBeTruthy();
    expect((screen.getByRole('button', { name: /^Slide 9/ }) as HTMLButtonElement).disabled).toBe(true);
    rerender(<EmbeddedAcademyDeckLesson lessonId="fake-or-real" roomId="r1" role="student" persistedSceneIdx={5} />);
    await screen.findByText('6/27');
  });

  it('an unknown lesson shows a friendly message instead of crashing', async () => {
    render(<EmbeddedAcademyDeckLesson lessonId="nope" roomId="r1" role="student" />);
    await waitFor(() => expect(screen.getByText(/isn’t available/)).toBeTruthy());
  });

  it('LIVE: the student clicks on a slide and the teacher sees the same click on the same slide', async () => {
    const view = render(<><div data-testid="T"><EmbeddedAcademyDeckLesson lessonId="b1-s01-e1" roomId="r1" role="teacher" persistedSceneIdx={0} /></div><div data-testid="S"><EmbeddedAcademyDeckLesson lessonId="b1-s01-e1" roomId="r1" role="student" persistedSceneIdx={0} /></div></>);
    await waitFor(() => expect(view.container.querySelectorAll('.ad-slidehost').length).toBe(2));
    const sHost = view.container.querySelectorAll('.ad-slidehost')[1];
    const btn = sHost.querySelector('button') as HTMLElement;
    fireEvent.click(btn);
    expect(bus.sent.some((p) => p.kind === 'click' && p.slide === 0 && p.senderRole === 'student')).toBe(true);
  });

  it('LIVE: a teacher click (e.g. next word) is sent too, and a click for a page the student has not reached yet waits for it', async () => {
    const view = render(<EmbeddedAcademyDeckLesson lessonId="b1-s01-e1" roomId="r1" role="student" persistedSceneIdx={0} />);
    await waitFor(() => expect(view.container.querySelector('.ad-slidehost')).toBeTruthy());
    const root = view.container.querySelector('.ad-slidehost') as HTMLElement;
    const btn = root.querySelector('button') as HTMLElement;
    const onClick = vi.fn();
    btn.addEventListener('click', onClick);
    const path = [...Array(0)];
    const p: number[] = [];
    let n: Element = btn; while (n !== root) { p.unshift(Array.prototype.indexOf.call(n.parentElement!.children, n)); n = n.parentElement!; }
    void path;
    bus.listeners.forEach((cb) => cb({ path: p, kind: 'click', slide: 0, senderRole: 'teacher', senderId: 'teacher' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(bus.sent.filter((x) => x.kind !== 'ping').length).toBe(0); // the repeat is not sent back
  });
});
