/**
 * Registry of unified pilot lessons, keyed by lesson id. Modeled on the
 * existing sceneLessonRegistry.ts pattern, scoped to this new pilot system
 * only. Async so a future phase can swap in a DB-backed loader without
 * changing the player's call site.
 */
import type { UnifiedLesson } from './types';
import { academyPilotLesson } from './academy-pilot-lesson';
import { successPilotLesson } from './success-pilot-lesson';

export const unifiedLessonRegistry: Record<string, () => Promise<UnifiedLesson>> = {
  'academy-pilot-lesson': () => Promise.resolve(academyPilotLesson),
  'success-pilot-lesson': () => Promise.resolve(successPilotLesson),
};
