import { HOMEWORK_QUESTS } from '@/content/homework-quests/registry';
import type { HomeworkQuest } from '@/content/homework-quests/types';
import { playgroundLessonKey, playgroundLessonPath } from '@/content/playground-library/lessonRoutes';

/** The slice of a Playground lesson (usePlaygroundLessons) the homework views need. */
export interface QuestLessonLike {
  id: string;
  status: 'completed' | 'current' | 'locked';
  contentFormat?: string;
  unitNumber?: number;
  lessonNumber?: number;
}

export interface QuestCard {
  quest: HomeworkQuest;
  lesson: QuestLessonLike | null;
  /** Where the lesson plays (to unlock the quest), when it exists. */
  lessonPath: string | null;
  /** The student finished the lesson, so the quest is open. */
  ready: boolean;
}

const keyOf = (l: QuestLessonLike) =>
  playgroundLessonKey({ contentFormat: l.contentFormat, unit_number: l.unitNumber, lesson_number: l.lessonNumber });

/**
 * Every Homework Quest the Playground student can see, linked to the lesson that unlocks it.
 * Shared by the Homework tab and the adventure map's Homework panel, so both always agree.
 * Ready quests first, then by title.
 */
export function buildQuestCards(lessons: QuestLessonLike[]): QuestCard[] {
  const byKey = new Map<string, QuestLessonLike>();
  for (const l of lessons) {
    const k = keyOf(l);
    if (k) byKey.set(k, l);
  }
  return Object.values(HOMEWORK_QUESTS)
    .filter((q) => q.level === 'Pre-A1' || q.level === 'A1' || q.level === 'A2')
    .map((quest) => {
      const lesson = byKey.get(quest.lessonKey) ?? null;
      const lessonPath = lesson
        ? playgroundLessonPath(lesson.id, { contentFormat: lesson.contentFormat, unit_number: lesson.unitNumber, lesson_number: lesson.lessonNumber })
        : null;
      return { quest, lesson, lessonPath, ready: lesson?.status === 'completed' };
    })
    .sort((a, b) => Number(b.ready) - Number(a.ready) || a.quest.title.localeCompare(b.quest.title));
}

/** The quest a finished lesson unlocks (for the little badge on its map node). */
export function readyQuestForLesson(lesson: QuestLessonLike): HomeworkQuest | null {
  if (lesson.status !== 'completed') return null;
  const k = keyOf(lesson);
  return k ? Object.values(HOMEWORK_QUESTS).find((q) => q.lessonKey === k) ?? null : null;
}
