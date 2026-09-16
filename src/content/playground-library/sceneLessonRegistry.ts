import {
  LESSON_1_SCENES, LESSON_1_TITLE, LESSON_1_OBJECTIVE,
  LESSON_2_SCENES, LESSON_2_TITLE, LESSON_2_OBJECTIVE,
  LESSON_3_SCENES, LESSON_3_TITLE, LESSON_3_OBJECTIVE,
  LESSON_4_SCENES, LESSON_4_TITLE, LESSON_4_OBJECTIVE,
  LESSON_5_SCENES, LESSON_5_TITLE, LESSON_5_OBJECTIVE,
  LESSON_6_SCENES, LESSON_6_TITLE, LESSON_6_OBJECTIVE,
  LESSON_U2L1_SCENES, LESSON_U2L1_TITLE, LESSON_U2L1_OBJECTIVE,
  LESSON_U2L2_SCENES, LESSON_U2L2_TITLE, LESSON_U2L2_OBJECTIVE,
  LESSON_U2L3_SCENES, LESSON_U2L3_TITLE, LESSON_U2L3_OBJECTIVE,
  LESSON_U2L4_SCENES, LESSON_U2L4_TITLE, LESSON_U2L4_OBJECTIVE,
  LESSON_U2L5_SCENES, LESSON_U2L5_TITLE, LESSON_U2L5_OBJECTIVE,
  LESSON_U2L6_SCENES, LESSON_U2L6_TITLE, LESSON_U2L6_OBJECTIVE,
  LESSON_U3L1_SCENES, LESSON_U3L1_TITLE, LESSON_U3L1_OBJECTIVE,
  LESSON_U3L2_SCENES, LESSON_U3L2_TITLE, LESSON_U3L2_OBJECTIVE,
  LESSON_U5L1_SCENES, LESSON_U5L1_TITLE, LESSON_U5L1_OBJECTIVE,
} from './unit1/scenes';
import type { Scene } from './unit1/scenes';

export const SCENE_LESSON_REGISTRY: Record<string, Scene[]> = {
  '1-1': LESSON_1_SCENES, '1-2': LESSON_2_SCENES, '1-3': LESSON_3_SCENES,
  '1-4': LESSON_4_SCENES, '1-5': LESSON_5_SCENES, '1-6': LESSON_6_SCENES,
  '2-1': LESSON_U2L1_SCENES, '2-2': LESSON_U2L2_SCENES, '2-3': LESSON_U2L3_SCENES, '2-4': LESSON_U2L4_SCENES,
  '2-5': LESSON_U2L5_SCENES, '2-6': LESSON_U2L6_SCENES,
  '3-1': LESSON_U3L1_SCENES, '3-2': LESSON_U3L2_SCENES,
  '5-1': LESSON_U5L1_SCENES,
};

export function getSceneLesson(unitNumber: number, lessonNumber: number): Scene[] | null {
  return SCENE_LESSON_REGISTRY[`${unitNumber}-${lessonNumber}`] ?? null;
}

/**
 * Title/objective per lesson, kept in the SAME registry file as the scenes
 * themselves — previously `SceneLessonPlayerModal.tsx` hand-maintained its
 * own separate `LESSON_META` table that only covered '1-1'..'2-1' and
 * silently drifted out of sync as new lessons ('2-2' onward, '3-1', '3-2',
 * '5-1') were added here without a matching entry there. That mismatch
 * made every one of those already-built lessons show "This lesson isn't
 * ready yet." to students despite having real, playable scene content —
 * confirmed as a live bug, fixed by deriving meta from this one registry
 * instead of a second hand-maintained map.
 */
export const SCENE_LESSON_META: Record<string, { title: string; objective: string }> = {
  '1-1': { title: LESSON_1_TITLE, objective: LESSON_1_OBJECTIVE },
  '1-2': { title: LESSON_2_TITLE, objective: LESSON_2_OBJECTIVE },
  '1-3': { title: LESSON_3_TITLE, objective: LESSON_3_OBJECTIVE },
  '1-4': { title: LESSON_4_TITLE, objective: LESSON_4_OBJECTIVE },
  '1-5': { title: LESSON_5_TITLE, objective: LESSON_5_OBJECTIVE },
  '1-6': { title: LESSON_6_TITLE, objective: LESSON_6_OBJECTIVE },
  '2-1': { title: LESSON_U2L1_TITLE, objective: LESSON_U2L1_OBJECTIVE },
  '2-2': { title: LESSON_U2L2_TITLE, objective: LESSON_U2L2_OBJECTIVE },
  '2-3': { title: LESSON_U2L3_TITLE, objective: LESSON_U2L3_OBJECTIVE },
  '2-4': { title: LESSON_U2L4_TITLE, objective: LESSON_U2L4_OBJECTIVE },
  '2-5': { title: LESSON_U2L5_TITLE, objective: LESSON_U2L5_OBJECTIVE },
  '2-6': { title: LESSON_U2L6_TITLE, objective: LESSON_U2L6_OBJECTIVE },
  '3-1': { title: LESSON_U3L1_TITLE, objective: LESSON_U3L1_OBJECTIVE },
  '3-2': { title: LESSON_U3L2_TITLE, objective: LESSON_U3L2_OBJECTIVE },
  '5-1': { title: LESSON_U5L1_TITLE, objective: LESSON_U5L1_OBJECTIVE },
};

export function getSceneLessonMeta(unitNumber: number, lessonNumber: number): { title: string; objective: string } | null {
  return SCENE_LESSON_META[`${unitNumber}-${lessonNumber}`] ?? null;
}
