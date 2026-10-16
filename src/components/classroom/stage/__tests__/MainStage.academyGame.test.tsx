import { describe, expect, it, vi, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

// The Academy classroom: a Game Library game on the shared display plays full-stage; teacher and student each play their own copy.
vi.mock('../TransparentCanvas', () => ({ TransparentCanvas: () => <div data-testid="pen-layer" /> }));
vi.mock('../ClassroomToolOverlay', () => ({ ClassroomToolOverlay: () => null }));
vi.mock('../StageContent', () => ({ StageContent: () => <div data-testid="plain-stage" /> }));
vi.mock('@/components/classroom/engagement/LiveReactionBar', () => ({ LiveReactionBar: () => null, STUDENT_REACTIONS: [] }));
vi.mock('@/hooks/useLetterboxSize', () => ({ useLetterboxSize: () => ({ width: 960, height: 540 }) }));
vi.mock('@/hooks/useCollapseWatcher', () => ({ useCollapseWatcher: () => undefined }));
vi.mock('@/components/playground-player/PlaygroundLessonPlayer', () => ({ PlaygroundLessonPlayer: () => null }));
vi.mock('../EmbeddedSceneLesson', () => ({ EmbeddedSceneLesson: () => null }));
vi.mock('../EmbeddedWelcomeTownLesson', () => ({ EmbeddedWelcomeTownLesson: () => null }));
vi.mock('@/academy-games/AcademyGamePlayer', () => ({ AcademyGamePlayer: ({ gameId }: { gameId: string }) => <div data-testid="game-player" data-game={gameId} /> }));

import { MainStage } from '../MainStage';

afterEach(cleanup);
const base = {
  mode: 'slide' as const, currentSlideIndex: 0, embeddedUrl: null, drawingEnabled: true, activeTool: 'pen' as const, activeColor: '#000', strokes: [],
  roomId: 'room-1', userId: 'u1', userName: 'Mina', hubType: 'academy' as const, onAddStroke: () => {},
};
const gameSlides = [{ id: 'academy-game-time-hop', type: 'academy_game', academyGameRef: { gameId: 'time-hop' } }];

describe('Academy classroom stage: Game Library games', () => {
  it.each(['teacher', 'student'] as const)('%s: the game on the display plays full-stage, not as plain slide content', async (role) => {
    render(<MainStage {...base} slides={gameSlides} rawSlides={gameSlides} role={role} />);
    const player = await screen.findByTestId('game-player');
    expect(player.getAttribute('data-game')).toBe('time-hop');
    expect(screen.getByTestId('academy-game-stage')).toBeTruthy();
    expect(screen.queryByTestId('plain-stage')).toBeNull();
    expect(screen.queryByTestId('pen-layer')).toBeNull();
  });

  it('an ordinary Academy slide still uses the normal stage', () => {
    const plain = [{ id: 's1' }];
    render(<MainStage {...base} slides={plain} rawSlides={plain} role="teacher" />);
    expect(screen.getByTestId('plain-stage')).toBeTruthy();
    expect(screen.queryByTestId('academy-game-stage')).toBeNull();
  });

  it('the game only plays in the Academy hub', () => {
    render(<MainStage {...base} hubType="playground" slides={gameSlides} rawSlides={gameSlides} role="teacher" />);
    expect(screen.queryByTestId('game-player')).toBeNull();
  });
});
