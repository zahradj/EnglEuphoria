import type { Slide } from '@/pages/PlaygroundDemo';
import type { LessonJSON, LessonBlock } from '../engine/types';
import { slideToBlock } from './slideToBlock';
import { inferMoments } from '../engine/momentPlanner';

export interface BridgeMeta {
  id: string;
  title: string;
  cefr?: string;
  hub?: LessonJSON['hub'];
}

export interface BridgeOutput {
  lesson: LessonJSON;
  /** Slide types that couldn't be mapped to a block (skipped in runtime). */
  skipped: { index: number; type: string }[];
}

/**
 * Convert a Slide[] deck into a playable LessonJSON.
 *
 * - Unmappable slides are skipped (legacy Cards preview still renders them).
 * - The engine guarantees the lesson always opens with an intro and closes
 *   with a reward summary so moment pacing is preserved.
 * - The flat block list is then grouped into Moments deterministically.
 */
export function slidesToLesson(slides: Slide[], meta: BridgeMeta): BridgeOutput {
  const blocks: LessonBlock[] = [];
  const skipped: { index: number; type: string }[] = [];

  slides.forEach((s, i) => {
    const { block, skipReason } = slideToBlock(s);
    if (block) blocks.push(block);
    else skipped.push({ index: i, type: skipReason ?? 'unknown' });
  });

  if (!blocks.length || blocks[0].type !== 'intro') {
    blocks.unshift({ type: 'intro', title: meta.title || 'Lesson' });
  }
  if (blocks[blocks.length - 1].type !== 'lesson_summary') {
    blocks.push({ type: 'lesson_summary', title: 'Great work!', bullets: ['You finished the lesson.'] });
  }

  return {
    lesson: {
      id: meta.id,
      title: meta.title,
      cefr: (meta.cefr || 'A1').toUpperCase(),
      hub: meta.hub || 'playground',
      moments: inferMoments(blocks),
    },
    skipped,
  };
}
