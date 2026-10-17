// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { act } from 'react-dom/test-utils';
import { EmbeddedPlayerLesson, type EmbeddedPlayerHandle } from '../classroom/EmbeddedPlayerLesson';
import type { LessonScript, SceneBase } from '../types';

vi.mock('../services/voice', () => ({ saySequence: vi.fn(async () => undefined), setMuted: vi.fn(), stopVoice: vi.fn() }));
vi.mock('@/services/whiteboardService', () => ({ whiteboardService: { sendSceneTap: vi.fn(async () => undefined), subscribeToSceneTap: vi.fn(() => () => undefined) } }));

const script: LessonScript = {
  blueprintId: 'B1-S01-E1', title: 'T', criteria: ['I can'], cast: ['Vee'], partMinutes: [5, 8, 8, 8, 8, 8, 8, 7],
  scenes: [{ id: 'a', part: 0, kind: 'lobby', heading: 'First page' } as SceneBase, { id: 'b', part: 0, kind: 'lobby', heading: 'Second page' } as SceneBase],
};
afterEach(cleanup);

describe('EmbeddedPlayerLesson', () => {
  it('the student follows the persisted page; the teacher handle moves and saves it', () => {
    const persist = vi.fn();
    const ref = createRef<EmbeddedPlayerHandle>();
    const { rerender } = render(<EmbeddedPlayerLesson ref={ref} script={script} roomId="r" role="teacher" onSceneIdxPersist={persist} />);
    expect(screen.getByText('First page')).toBeTruthy();
    act(() => ref.current?.goNext());
    expect(persist).toHaveBeenCalledWith(1);
    expect(screen.getByText('Second page')).toBeTruthy();
    cleanup();
    render(<EmbeddedPlayerLesson script={script} roomId="r" role="student" persistedSceneIdx={1} />);
    expect(screen.getByText('Second page')).toBeTruthy();
    void rerender;
  });
});
