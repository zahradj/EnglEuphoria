import { describe, expect, it, vi, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

// The Academy classroom: a deck lesson on the shared display plays in the stage (teacher moves it, student follows).
vi.mock('../TransparentCanvas', () => ({ TransparentCanvas: () => <div data-testid="pen-layer" /> }));
vi.mock('../ClassroomToolOverlay', () => ({ ClassroomToolOverlay: () => null }));
vi.mock('../StageContent', () => ({ StageContent: () => <div data-testid="plain-stage" /> }));
vi.mock('@/components/classroom/engagement/LiveReactionBar', () => ({ LiveReactionBar: () => null, STUDENT_REACTIONS: [] }));
vi.mock('@/hooks/useLetterboxSize', () => ({ useLetterboxSize: () => ({ width: 960, height: 540 }) }));
vi.mock('@/hooks/useCollapseWatcher', () => ({ useCollapseWatcher: () => undefined }));
vi.mock('@/components/playground-player/PlaygroundLessonPlayer', () => ({ PlaygroundLessonPlayer: () => null }));
vi.mock('../EmbeddedSceneLesson', () => ({ EmbeddedSceneLesson: () => null }));
vi.mock('../EmbeddedWelcomeTownLesson', () => ({ EmbeddedWelcomeTownLesson: () => null }));

import { MainStage } from '../MainStage';

afterEach(cleanup);
const base = {
  mode: 'slide' as const, currentSlideIndex: 0, embeddedUrl: null, drawingEnabled: true, activeTool: 'pen' as const, activeColor: '#000', strokes: [],
  roomId: 'room-1', userId: 'u1', userName: 'Mina', hubType: 'academy' as const, onAddStroke: () => {},
};
const deckSlides = [{ id: 'deck-lesson-fake-or-real', deckLessonRef: { lessonId: 'fake-or-real' } }];

describe('Academy classroom stage', () => {
  it('teacher: a deck lesson on the display plays in the stage with the pen layer, not as plain slide content', async () => {
    render(<MainStage {...base} slides={deckSlides} rawSlides={deckSlides} role="teacher" sceneLessonIdx={2} onPersistSceneLessonIdx={() => {}} />);
    const embed = await screen.findByTestId('academy-deck-embed');
    expect(embed.getAttribute('data-role')).toBe('teacher');
    expect(screen.getByTestId('pen-layer')).toBeTruthy();
    expect(screen.queryByTestId('plain-stage')).toBeNull();
    expect(await screen.findByText('3/27')).toBeTruthy();
  });

  it('student: follows the teacher’s saved slide and cannot move the lesson', async () => {
    render(<MainStage {...base} slides={deckSlides} rawSlides={deckSlides} role="student" sceneLessonIdx={4} />);
    expect((await screen.findByTestId('academy-deck-embed')).getAttribute('data-role')).toBe('student');
    expect(await screen.findByText('5/27')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Next', exact: true })).toBeNull();
  });

  it('an ordinary Academy slide still uses the normal stage', () => {
    const plain = [{ id: 's1' }];
    render(<MainStage {...base} slides={plain} rawSlides={plain} role="teacher" />);
    expect(screen.getByTestId('plain-stage')).toBeTruthy();
    expect(screen.queryByTestId('academy-deck-embed')).toBeNull();
  });
});
