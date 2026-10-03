import { questLines, type HomeworkQuest, type QuestVoice } from './types';
import { QUEST_MAGIC_CASTLE_U9L1 } from './magic-castle-u9l1';
import { QUEST_MAGIC_CASTLE_U9L2 } from './magic-castle-u9l2';
import { QUEST_MAGIC_CASTLE_U9L3 } from './magic-castle-u9l3';
import { QUEST_COLOR_CARNIVAL_U2L1 } from './color-carnival-u2l1';
import { QUEST_WELCOME_TOWN_U1L1 } from './welcome-town-u1l1';
import { QUEST_RAINBOW_MEADOW_U2L2 } from './rainbow-meadow-u2l2';
import { QUEST_SHAPE_TOWN_U2L3 } from './shape-town-u2l3';

/** Every Homework Quest, by id (also the URL /homework-quest/<id>). */
export const HOMEWORK_QUESTS: Record<string, HomeworkQuest> = Object.fromEntries(
  [QUEST_MAGIC_CASTLE_U9L1, QUEST_MAGIC_CASTLE_U9L2, QUEST_MAGIC_CASTLE_U9L3, QUEST_COLOR_CARNIVAL_U2L1, QUEST_WELCOME_TOWN_U1L1, QUEST_RAINBOW_MEADOW_U2L2, QUEST_SHAPE_TOWN_U2L3].map((q) => [q.id, q]),
);

export const getHomeworkQuest = (id: string): HomeworkQuest | null => HOMEWORK_QUESTS[id] ?? null;

/** The quest that practises a scene lesson (registry key, e.g. 'castle-rich-9-1'). */
export const questForLesson = (lessonKey: string): HomeworkQuest | null =>
  Object.values(HOMEWORK_QUESTS).find((q) => q.lessonKey === lessonKey) ?? null;

/** Every line every quest can say — recorded by scripts/generate-voice-cache.mjs. */
export function allQuestLines(): [QuestVoice, string][] {
  return Object.values(HOMEWORK_QUESTS).flatMap(questLines);
}
