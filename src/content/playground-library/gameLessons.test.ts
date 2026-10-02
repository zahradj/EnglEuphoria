import { describe, expect, it } from 'vitest';
import { LIBRARY_GAMES } from './gamesCatalog';
import { GAME_LESSON_FORMAT, gameLessonNumber, getGameClassroomLesson, gameToScenes } from './gameLessons';
import { getWelcomeTownLesson } from './welcomeTownLessonRegistry';
import { isWelcomeTownFamilyFormat } from './sceneLessonFormats';
import { SCENE_KINDS } from './unit1/sceneValidator';

describe('Playground games as classroom lessons', () => {
  it('the stage plays the game format through the Welcome Town scene player', () => {
    expect(isWelcomeTownFamilyFormat(GAME_LESSON_FORMAT)).toBe(true);
  });

  for (const game of LIBRARY_GAMES) {
    describe(game.title, () => {
      const n = gameLessonNumber(game.id);

      it('resolves from the lesson registry by (game-rich, 0, number)', () => {
        expect(n).toBeGreaterThan(0);
        const lesson = getWelcomeTownLesson(GAME_LESSON_FORMAT, 0, n);
        expect(lesson?.title).toBe(game.title);
        expect(lesson?.scenes.length).toBe(game.stages.length + 1); // each stop + a finale
      });

      it('has unique scene ids, ends on a finale, and only uses kinds the players know', () => {
        const scenes = gameToScenes(game);
        const ids = scenes.map((s) => s.id);
        expect(new Set(ids).size).toBe(ids.length);
        expect(scenes[scenes.length - 1].kind).toBe('finale');
        for (const s of scenes) expect((SCENE_KINDS as readonly string[]).includes(s.kind) || s.kind === 'finale').toBe(true);
      });
    });
  }

  it('an unknown game number resolves to nothing (the stage shows its friendly fallback)', () => {
    expect(getGameClassroomLesson(0)).toBeNull();
    expect(getGameClassroomLesson(LIBRARY_GAMES.length + 1)).toBeNull();
  });
});
