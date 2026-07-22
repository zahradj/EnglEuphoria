/**
 * P1 #8 — Coherence → Playground homework bridge.
 *
 * Maps a generic `CoherenceDecision.homework` (HomeworkPack) into the
 * Playground-shaped `PlaygroundHomework` (5 task types, per-lesson).
 *
 * Pure, deterministic, no AI. Caller passes the lesson_number to bind to.
 */
import type { HomeworkPack, HomeworkTask, HomeworkTaskType } from '@/playground-blueprint/external';
import type {
  PlaygroundHomework,
  PlaygroundHomeworkTask,
  PlaygroundHomeworkTaskType,
} from './types';
import type { PlaygroundLessonNumber } from './unitTemplate';

const TYPE_MAP: Record<HomeworkTaskType, PlaygroundHomeworkTaskType> = {
  vocab_recall:    'vocab_match',
  sentence_build:  'mini_quiz',
  mini_recording:  'listen_and_say',
  listening_recap: 'listen_and_say',
  micro_reading:   'story_recall',
  micro_writing:   'mini_quiz',
  parent_script:   'listen_and_say', // PG-native
  peer_message:    'mini_quiz',
  email_draft:     'mini_quiz',
};

function mapTask(t: HomeworkTask): PlaygroundHomeworkTask {
  return {
    id: t.id,
    type: TYPE_MAP[t.type] ?? 'mini_quiz',
    prompt: t.prompt,
    minutes: Math.max(1, Math.round(t.estimated_minutes)),
    payload: {
      reinforcement_target_id: t.reinforcement_target_id,
      template_key: t.template_key,
      modality: t.modality,
      educational_value: t.educational_value,
    },
  };
}

export interface BridgeArgs {
  pack: HomeworkPack;
  lesson_number: PlaygroundLessonNumber;
  title?: string;
}

export function coherenceToPlaygroundHomework({
  pack,
  lesson_number,
  title,
}: BridgeArgs): PlaygroundHomework {
  const tasks = (pack.tasks ?? []).map(mapTask);
  return {
    lesson_number,
    title: title ?? `Lesson ${lesson_number} — Home Mission`,
    tasks,
    total_minutes: tasks.reduce((s, t) => s + t.minutes, 0),
  };
}
