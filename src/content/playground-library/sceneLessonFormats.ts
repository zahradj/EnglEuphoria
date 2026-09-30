/**
 * Single source of truth for which `curriculum_lessons.ai_metadata.contentFormat`
 * values point at a real, buildable scene-player lesson.
 *
 * Before this file existed, this exact whitelist was hand-duplicated inline
 * across 10+ files (classroomLessonResolver, MainStage, lessonLibraryService,
 * LibraryDrawer, HomeworkPreviewModal, SceneLessonPlayerModal, KidsWorldMap,
 * CurriculumMap, PlaygroundLibraryPage, PlaygroundLibraryPublic). Every time a
 * new Playground world shipped (Jungle Adventure, then Magic Castle), it was
 * easy to update most of these and miss one — which is exactly what produced
 * a run of "Coming soon" / "not clickable" / "lesson not appearing" bug
 * reports even though the lesson's own content and DB row were already
 * correct. Add a new world's format here once; every consumer picks it up.
 */

/** Every contentFormat with a real scene-player lesson, across both
 *  scene-player families (Little Explorers Phonics + the Welcome Town
 *  renderer family). */
export const SCENE_LESSON_FORMATS = new Set([
  'lep1-rich',
  'wt-rich',
  'wt-a2-rich',
  'jungle-rich',
  'castle-rich',
]);

export function isSceneLessonFormat(contentFormat: string | null | undefined): boolean {
  return !!contentFormat && SCENE_LESSON_FORMATS.has(contentFormat);
}

/** The Welcome Town renderer family specifically — routes through
 *  PlayWelcomeTownLesson + welcomeTownLessonRegistry, NOT PlayUnitLesson +
 *  sceneLessonRegistry (that second path is lep1-rich only). */
export const WELCOME_TOWN_FAMILY_FORMATS = new Set([
  'wt-rich',
  'wt-a2-rich',
  'jungle-rich',
  'castle-rich',
]);

export function isWelcomeTownFamilyFormat(contentFormat: string | null | undefined): boolean {
  return !!contentFormat && WELCOME_TOWN_FAMILY_FORMATS.has(contentFormat);
}

/** Broader "ready to show as built" check used by Playground library/browse
 *  UIs, which also accept the generic `scene-player` format (content
 *  addressed by lesson id rather than a per-world registry). Academy's
 *  `academy-v2` format is deliberately NOT included here — it's a separate
 *  hub with its own readiness surface; callers that need to include it union
 *  it in locally (`new Set([...LIBRARY_READY_FORMATS, 'academy-v2'])`). */
export const LIBRARY_READY_FORMATS = new Set([
  ...SCENE_LESSON_FORMATS,
  'scene-player',
]);

export function isLibraryReadyFormat(contentFormat: string | null | undefined): boolean {
  return !!contentFormat && LIBRARY_READY_FORMATS.has(contentFormat);
}
