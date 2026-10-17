import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const svc = vi.hoisted(() => ({
  loadResume: vi.fn(),
  clearResume: vi.fn(),
  saveResume: vi.fn(),
  markLessonInProgress: vi.fn(),
}));
const complete = vi.hoisted(() => vi.fn());

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'U1' } }) }));
vi.mock('@/services/lessonResumeService', async () => {
  const actual = await vi.importActual<typeof import('@/services/lessonResumeService')>('@/services/lessonResumeService');
  // The real saver calls its module-internal write functions, so route them to the test doubles here.
  return {
    ...actual,
    ...svc,
    createResumeSaver: (o: Record<string, unknown>) => actual.createResumeSaver({ ...o, write: svc.saveResume, markStarted: svc.markLessonInProgress }),
  };
});
vi.mock('@/services/sceneLessonCompletionService', () => ({
  extractTaughtLetters: () => [],
  completeSceneLesson: complete,
}));

const SCENES = Array.from({ length: 8 }, (_, i) => ({ id: `scene-${i}`, kind: 'meet' }));
vi.mock('@/content/playground-library/sceneLessonRegistry', () => ({
  getSceneLesson: () => SCENES,
  getSceneLessonMeta: () => ({ title: 'Hello Friends', objective: 'Say hello.' }),
}));
vi.mock('@/content/playground-library/welcomeTownLessonRegistry', () => ({ getWelcomeTownLesson: () => null }));
vi.mock('@/content/playground-library/sceneLessonFormats', () => ({ isWelcomeTownFamilyFormat: () => false }));

// A fake player: shows the scene index it started at (from the same store the real one reads), reports moves, can finish.
vi.mock('@/pages/playground-scene/PlayUnitLesson', () => ({
  default: ({ sessionKey, onNavState, onFinaleReached }: { sessionKey: string; onNavState?: (s: { sceneIdx: number; total: number }) => void; onFinaleReached?: () => void }) => {
    const start = Number(window.sessionStorage.getItem(sessionKey) ?? 0);
    React.useEffect(() => { onNavState?.({ sceneIdx: start, total: 8 }); }, []); // eslint-disable-line
    return (
      <div>
        <span data-testid="start">{start}</span>
        <button onClick={() => onNavState?.({ sceneIdx: 5, total: 8 })}>go-5</button>
        <button onClick={() => onFinaleReached?.()}>finish</button>
      </div>
    );
  },
}));
vi.mock('@/pages/playground-scene/PlayWelcomeTownLesson', () => ({ default: () => null }));

import { SceneLessonPlayerModal } from '../SceneLessonPlayerModal';

const lesson = (status: 'current' | 'completed' = 'current') =>
  ({ id: 'L1', status, unitNumber: 1, lessonNumber: 2, title: 'x', contentFormat: 'lep1-rich' }) as never;

const open = (status: 'current' | 'completed' = 'current') =>
  render(
    <MemoryRouter>
      <SceneLessonPlayerModal isOpen lesson={lesson(status)} onClose={() => {}} onComplete={() => {}} />
    </MemoryRouter>,
  );

beforeEach(() => {
  Object.values(svc).forEach((f) => f.mockReset());
  svc.loadResume.mockResolvedValue(null);
  svc.clearResume.mockResolvedValue(undefined);
  svc.saveResume.mockResolvedValue(true);
  svc.markLessonInProgress.mockResolvedValue(undefined);
  complete.mockReset();
  complete.mockResolvedValue({ homeworkAssignmentId: null });
  window.sessionStorage.clear();
});

describe('SceneLessonPlayerModal — automatic progress saving', () => {
  it('a lesson with no saved position just starts', async () => {
    open();
    expect(await screen.findByText('Start!')).toBeTruthy();
    expect(screen.queryByText(/continue where i stopped/i)).toBeNull();
    expect(screen.getByText(/saved automatically/i)).toBeTruthy();
  });

  it('offers to continue where the student stopped, and the lesson opens there', async () => {
    svc.loadResume.mockResolvedValue({ sceneId: 'scene-4', sceneIndex: 4, totalScenes: 8, updatedAt: null });
    open();
    fireEvent.click(await screen.findByText(/continue where i stopped/i));
    expect(await screen.findByTestId('start')).toHaveProperty('textContent', '4');
  });

  it('"start from the beginning" clears the saved position and opens at scene 0', async () => {
    svc.loadResume.mockResolvedValue({ sceneId: 'scene-4', sceneIndex: 4, totalScenes: 8, updatedAt: null });
    open();
    fireEvent.click(await screen.findByText(/start from the beginning/i));
    expect((await screen.findByTestId('start')).textContent).toBe('0');
    expect(svc.clearResume).toHaveBeenCalledWith('U1', 'L1');
  });

  it('saves the scene the student reaches (and marks the lesson in progress)', async () => {
    open();
    fireEvent.click(await screen.findByText('Start!'));
    fireEvent.click(await screen.findByText('go-5'));
    await waitFor(() => expect(svc.saveResume).toHaveBeenCalledWith(expect.objectContaining({ userId: 'U1', lessonId: 'L1', sceneId: 'scene-5', sceneIndex: 5, totalScenes: 8 })), { timeout: 3000 });
    expect(svc.markLessonInProgress).toHaveBeenCalledWith('U1', 'L1');
  });

  it('finishing the lesson clears the saved position and records completion', async () => {
    svc.loadResume.mockResolvedValue({ sceneId: 'scene-4', sceneIndex: 4, totalScenes: 8, updatedAt: null });
    open();
    fireEvent.click(await screen.findByText(/continue where i stopped/i));
    fireEvent.click(await screen.findByText('finish'));
    await waitFor(() => expect(complete).toHaveBeenCalled());
    expect(svc.clearResume).toHaveBeenCalledWith('U1', 'L1');
  });

  it('replaying a COMPLETED lesson never saves a position (it must stay completed)', async () => {
    open('completed');
    fireEvent.click(await screen.findByText('Start!'));
    fireEvent.click(await screen.findByText('go-5'));
    await new Promise((r) => setTimeout(r, 1000));
    expect(svc.saveResume).not.toHaveBeenCalled();
    expect(svc.markLessonInProgress).not.toHaveBeenCalled();
    expect(svc.loadResume).not.toHaveBeenCalled();
  });
});
