/**
 * Loader for unified lessons, keyed by lesson id. Two sources, tried in
 * order: the hand-authored pilot lessons (kept working forever as a known-
 * good reference/demo), then the unified_lessons table for real
 * creator-authored content. Modeled on the existing sceneLessonRegistry.ts
 * pattern, scoped to this new system only.
 */
import type { UnifiedLesson } from './types';
import { academyPilotLesson } from './academy-pilot-lesson';
import { successPilotLesson } from './success-pilot-lesson';
import { getUnifiedLesson } from './unifiedLessonsService';

export const unifiedLessonRegistry: Record<string, () => Promise<UnifiedLesson>> = {
  'academy-pilot-lesson': () => Promise.resolve(academyPilotLesson),
  'success-pilot-lesson': () => Promise.resolve(successPilotLesson),
};

export async function loadUnifiedLesson(lessonId: string): Promise<UnifiedLesson | null> {
  const staticLoader = unifiedLessonRegistry[lessonId];
  if (staticLoader) return staticLoader();
  return getUnifiedLesson(lessonId);
}
