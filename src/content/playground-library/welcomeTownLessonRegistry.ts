import { LESSON_1_SCENES, LESSON_1_TITLE, LESSON_1_OBJECTIVE, LESSON_2_SCENES, LESSON_2_TITLE, LESSON_2_OBJECTIVE, LESSON_3_SCENES, LESSON_3_TITLE, LESSON_3_OBJECTIVE, LESSON_4_SCENES, LESSON_4_TITLE, LESSON_4_OBJECTIVE } from './welcome-town/scenes';
import { LESSON_A2U1L1_SCENES, LESSON_A2U1L1_TITLE, LESSON_A2U1L1_OBJECTIVE, LESSON_A2U1L2_SCENES, LESSON_A2U1L2_TITLE, LESSON_A2U1L2_OBJECTIVE, LESSON_A2U1L3_SCENES, LESSON_A2U1L3_TITLE, LESSON_A2U1L3_OBJECTIVE } from './welcome-town-a2/scenes';
import { LESSON_A1U9L1_SCENES, LESSON_A1U9L1_TITLE, LESSON_A1U9L1_OBJECTIVE, LESSON_A1U9L2_SCENES, LESSON_A1U9L2_TITLE, LESSON_A1U9L2_OBJECTIVE, LESSON_A1U9L3_SCENES, LESSON_A1U9L3_TITLE, LESSON_A1U9L3_OBJECTIVE } from './magic-castle/scenes';
import { LESSON_A1U2L1_SCENES, LESSON_A1U2L1_TITLE, LESSON_A1U2L1_OBJECTIVE } from './jungle-adventure/scenes';
import type { Scene } from './welcome-town/scenes';
import { GAME_LESSON_FORMAT, getGameClassroomLesson } from './gameLessons';

/** Mirrors sceneLessonRegistry.ts's shape, but for the Welcome Town family
 *  (A1 `wt-rich` and A2 `wt-a2-rich`), which lives in a separate pair of
 *  scenes/SceneRenderer modules from Pre-A1's `lep1-rich` unit1 lessons —
 *  unit/lesson numbers alone collide across the two families (both have a
 *  "Unit 1, Lesson 1"), so lookups are keyed by contentFormat too. */
/** `skin: 'quest'` — the lesson plays in the Homework Quest look (see
 *  PlayWelcomeTownLesson's QUEST_SKIN_CSS); omit for the classic look. */
export type LessonSkin = 'quest';
const WELCOME_TOWN_LESSON_REGISTRY: Record<string, { scenes: Scene[]; title: string; objective: string; skin?: LessonSkin }> = {
  'wt-rich-1-1': { scenes: LESSON_1_SCENES, title: LESSON_1_TITLE, objective: LESSON_1_OBJECTIVE },
  'wt-rich-1-2': { scenes: LESSON_2_SCENES, title: LESSON_2_TITLE, objective: LESSON_2_OBJECTIVE },
  'wt-rich-1-3': { scenes: LESSON_3_SCENES, title: LESSON_3_TITLE, objective: LESSON_3_OBJECTIVE },
  'wt-rich-1-4': { scenes: LESSON_4_SCENES, title: LESSON_4_TITLE, objective: LESSON_4_OBJECTIVE },
  'wt-a2-rich-1-1': { scenes: LESSON_A2U1L1_SCENES, title: LESSON_A2U1L1_TITLE, objective: LESSON_A2U1L1_OBJECTIVE },
  'wt-a2-rich-1-2': { scenes: LESSON_A2U1L2_SCENES, title: LESSON_A2U1L2_TITLE, objective: LESSON_A2U1L2_OBJECTIVE },
  'wt-a2-rich-1-3': { scenes: LESSON_A2U1L3_SCENES, title: LESSON_A2U1L3_TITLE, objective: LESSON_A2U1L3_OBJECTIVE },
  'jungle-rich-2-1': { scenes: LESSON_A1U2L1_SCENES, title: LESSON_A1U2L1_TITLE, objective: LESSON_A1U2L1_OBJECTIVE },
  'castle-rich-9-1': { scenes: LESSON_A1U9L1_SCENES, title: LESSON_A1U9L1_TITLE, objective: LESSON_A1U9L1_OBJECTIVE },
  'castle-rich-9-2': { scenes: LESSON_A1U9L2_SCENES, title: LESSON_A1U9L2_TITLE, objective: LESSON_A1U9L2_OBJECTIVE, skin: 'quest' },
  'castle-rich-9-3': { scenes: LESSON_A1U9L3_SCENES, title: LESSON_A1U9L3_TITLE, objective: LESSON_A1U9L3_OBJECTIVE, skin: 'quest' },
};

export function getWelcomeTownLesson(
  contentFormat: string,
  unitNumber: number,
  lessonNumber: number,
): { scenes: Scene[]; title: string; objective: string; skin?: LessonSkin } | null {
  if (contentFormat === GAME_LESSON_FORMAT) return getGameClassroomLesson(lessonNumber);
  return WELCOME_TOWN_LESSON_REGISTRY[`${contentFormat}-${unitNumber}-${lessonNumber}`] ?? null;
}

/** Which registered Welcome Town / Magic Castle lesson owns this scene list
 *  (by identity — the players only receive `scenes`). Null for ad-hoc lists. */
export function identifyWelcomeTownLesson(scenes: unknown): { contentFormat: string; unitNumber: number; lessonNumber: number; title: string } | null {
  for (const [key, entry] of Object.entries(WELCOME_TOWN_LESSON_REGISTRY)) {
    if (entry.scenes !== scenes) continue;
    const m = key.match(/^(.*)-(\d+)-(\d+)$/);
    if (m) return { contentFormat: m[1], unitNumber: Number(m[2]), lessonNumber: Number(m[3]), title: entry.title };
  }
  return null;
}
