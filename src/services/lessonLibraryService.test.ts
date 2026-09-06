// Regression test for a real production bug: the student "Start" button
// and the teacher "View Lesson" button both used to navigate unconditionally
// to /lesson/:id (built for Academy/Success's AI-slide content). For a
// Playground row with no content.playground_unit, that route silently
// tried to freshly AI-generate a different, generic lesson instead of
// opening the real, hand-authored one — the actual cause of "the lesson
// couldn't go forward" for an assigned Playground lesson.
// resolvePlaygroundLessonRoute() is the fix; this pins its contract so a
// future change to the routing scheme can't regress it silently.
import { describe, test, expect } from 'vitest';
import { resolvePlaygroundLessonRoute } from './lessonLibraryService';

describe('resolvePlaygroundLessonRoute', () => {
  test('lep1-rich, unit 1 uses the legacy un-prefixed lesson route', () => {
    expect(
      resolvePlaygroundLessonRoute('id-1', { contentFormat: 'lep1-rich', unit_number: 1, lesson_number: 3 }),
    ).toBe('/playground-scene/lesson-3');
  });

  test('lep1-rich, unit > 1 uses the unit-scoped route so lesson numbers cannot collide across units', () => {
    expect(
      resolvePlaygroundLessonRoute('id-2', { contentFormat: 'lep1-rich', unit_number: 2, lesson_number: 1 }),
    ).toBe('/playground-scene/unit-2-lesson-1');
  });

  test('wt-rich (A1 Welcome Town) ignores unit_number — its own route family', () => {
    expect(
      resolvePlaygroundLessonRoute('id-3', { contentFormat: 'wt-rich', unit_number: 5, lesson_number: 2 }),
    ).toBe('/playground-scene/welcome-town-lesson-2');
  });

  test('wt-a2-rich (A2 Welcome Town) is unit-scoped, separate from A1', () => {
    expect(
      resolvePlaygroundLessonRoute('id-4', { contentFormat: 'wt-a2-rich', unit_number: 1, lesson_number: 3 }),
    ).toBe('/playground-scene/a2-unit-1-lesson-3');
  });

  test('scene-player is keyed by lesson id, not unit/lesson number', () => {
    expect(
      resolvePlaygroundLessonRoute('the-lesson-id', { contentFormat: 'scene-player' }),
    ).toBe('/playground-scene/play/the-lesson-id');
  });

  test('academy-v2 (new Academy engine) is keyed by lesson id, routes to PlayAcademyLesson', () => {
    expect(
      resolvePlaygroundLessonRoute('the-lesson-id', { contentFormat: 'academy-v2' }),
    ).toBe('/academy-scene/the-lesson-id');
  });

  test('missing unit_number/lesson_number default to 1', () => {
    expect(resolvePlaygroundLessonRoute('id-5', { contentFormat: 'lep1-rich' })).toBe('/playground-scene/lesson-1');
  });

  test('an unrecognized or missing contentFormat returns null — the caller must fall back to /lesson/:id, never navigate blind', () => {
    expect(resolvePlaygroundLessonRoute('id-6', { contentFormat: undefined })).toBeNull();
    expect(resolvePlaygroundLessonRoute('id-7', { contentFormat: 'some-academy-format' })).toBeNull();
    expect(resolvePlaygroundLessonRoute('id-8', null)).toBeNull();
  });
});
