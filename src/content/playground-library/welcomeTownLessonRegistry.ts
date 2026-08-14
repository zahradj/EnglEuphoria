import { LESSON_1_SCENES, LESSON_1_TITLE, LESSON_2_SCENES, LESSON_2_TITLE } from './welcome-town/scenes';
import { LESSON_A2U1L1_SCENES, LESSON_A2U1L1_TITLE, LESSON_A2U1L2_SCENES, LESSON_A2U1L2_TITLE, LESSON_A2U1L3_SCENES, LESSON_A2U1L3_TITLE } from './welcome-town-a2/scenes';
import type { Scene } from './welcome-town/scenes';

/** Mirrors sceneLessonRegistry.ts's shape, but for the Welcome Town family
 *  (A1 `wt-rich` and A2 `wt-a2-rich`), which lives in a separate pair of
 *  scenes/SceneRenderer modules from Pre-A1's `lep1-rich` unit1 lessons —
 *  unit/lesson numbers alone collide across the two families (both have a
 *  "Unit 1, Lesson 1"), so lookups are keyed by contentFormat too. */
const WELCOME_TOWN_LESSON_REGISTRY: Record<string, { scenes: Scene[]; title: string }> = {
  'wt-rich-1-1': { scenes: LESSON_1_SCENES, title: LESSON_1_TITLE },
  'wt-rich-1-2': { scenes: LESSON_2_SCENES, title: LESSON_2_TITLE },
  'wt-a2-rich-1-1': { scenes: LESSON_A2U1L1_SCENES, title: LESSON_A2U1L1_TITLE },
  'wt-a2-rich-1-2': { scenes: LESSON_A2U1L2_SCENES, title: LESSON_A2U1L2_TITLE },
  'wt-a2-rich-1-3': { scenes: LESSON_A2U1L3_SCENES, title: LESSON_A2U1L3_TITLE },
};

export function getWelcomeTownLesson(
  contentFormat: string,
  unitNumber: number,
  lessonNumber: number,
): { scenes: Scene[]; title: string } | null {
  return WELCOME_TOWN_LESSON_REGISTRY[`${contentFormat}-${unitNumber}-${lessonNumber}`] ?? null;
}
