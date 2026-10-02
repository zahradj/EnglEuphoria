import { LIBRARY_GAMES, type LibraryGame } from './gamesCatalog';
import type { Scene } from './welcome-town/scenes';

/**
 * Playground games as CLASSROOM lessons.
 *
 * The teacher's Lesson Library opens a game exactly like a scene lesson: it puts a
 * `sceneLessonRef` slide on the shared display, and the stage plays it through the
 * Welcome Town scene player — so the game gets live teacher-to-student sync, the
 * crash guard, and the teacher's next/back controls for free. The lesson is just
 * the game's stops (one scene each) followed by a finale card.
 *
 * Lesson numbers are 1-based positions in LIBRARY_GAMES (unit number is always 0).
 */
export const GAME_LESSON_FORMAT = 'game-rich';

export function gameLessonNumber(gameId: string): number {
  return LIBRARY_GAMES.findIndex((g) => g.id === gameId) + 1;
}

export function gameToScenes(game: LibraryGame): Scene[] {
  return [
    ...game.stages.map((s) => s.scene),
    { id: `${game.id}-finale`, kind: 'finale', bg: game.cover, who: 'pip', line: `You finished ${game.title}!` },
  ];
}

export function getGameClassroomLesson(lessonNumber: number): { scenes: Scene[]; title: string; objective: string } | null {
  const game = LIBRARY_GAMES[lessonNumber - 1];
  if (!game) return null;
  return { scenes: gameToScenes(game), title: game.title, objective: game.tagline };
}
