/**
 * Moment Planner — deterministic grouper.
 *
 * Pure function: a flat LessonBlock[] → LessonMoment[].
 * Used by the schema (legacy `blocks` migration) and by the Slide→Lesson bridge.
 *
 * Rule table (in order):
 *   - `intro`                                        → intro_moment
 *   - run of `vocab_solo` / `phonics_focus`          → discovery_moment
 *   - run of `drag_and_drop` / `match` / `fill_in_blank`
 *                                                    → practice_moment
 *   - `storybook`                                    → story_moment
 *   - run of `multiple_choice`                       → challenge_moment
 *   - trailing `lesson_summary`                      → reward_moment
 *
 * Adjacent blocks of the same kind collapse into one moment.
 */
import type { LessonBlock, LessonMoment, MomentKind, BlockType } from './types';

const BLOCK_TO_MOMENT: Record<BlockType, MomentKind> = {
  intro: 'intro_moment',
  vocab_solo: 'discovery_moment',
  phonics_focus: 'discovery_moment',
  drag_and_drop: 'practice_moment',
  match: 'practice_moment',
  fill_in_blank: 'practice_moment',
  multiple_choice: 'challenge_moment',
  storybook: 'story_moment',
  lesson_summary: 'reward_moment',
};

let _seq = 0;
function nextId(kind: MomentKind): string {
  _seq = (_seq + 1) % Number.MAX_SAFE_INTEGER;
  return `${kind}-${_seq}`;
}

export function inferMoments(blocks: LessonBlock[]): LessonMoment[] {
  const moments: LessonMoment[] = [];
  for (const b of blocks) {
    const kind = BLOCK_TO_MOMENT[b.type];
    const tail = moments[moments.length - 1];
    if (tail && tail.kind === kind) {
      tail.blocks.push(b);
    } else {
      moments.push({ id: nextId(kind), kind, blocks: [b] });
    }
  }
  return moments;
}
