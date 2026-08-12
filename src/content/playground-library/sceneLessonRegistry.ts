import {
  LESSON_1_SCENES, LESSON_2_SCENES, LESSON_3_SCENES,
  LESSON_4_SCENES, LESSON_5_SCENES, LESSON_6_SCENES,
  LESSON_U2L1_SCENES, LESSON_U2L2_SCENES, LESSON_U2L3_SCENES, LESSON_U2L4_SCENES, LESSON_U2L5_SCENES, LESSON_U2L6_SCENES,
} from './unit1/scenes';
import type { Scene } from './unit1/scenes';

export const SCENE_LESSON_REGISTRY: Record<string, Scene[]> = {
  '1-1': LESSON_1_SCENES, '1-2': LESSON_2_SCENES, '1-3': LESSON_3_SCENES,
  '1-4': LESSON_4_SCENES, '1-5': LESSON_5_SCENES, '1-6': LESSON_6_SCENES,
  '2-1': LESSON_U2L1_SCENES, '2-2': LESSON_U2L2_SCENES, '2-3': LESSON_U2L3_SCENES, '2-4': LESSON_U2L4_SCENES,
  '2-5': LESSON_U2L5_SCENES, '2-6': LESSON_U2L6_SCENES,
};

export function getSceneLesson(unitNumber: number, lessonNumber: number): Scene[] | null {
  return SCENE_LESSON_REGISTRY[`${unitNumber}-${lessonNumber}`] ?? null;
}
