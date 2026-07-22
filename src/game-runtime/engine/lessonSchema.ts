/**
 * Zod schemas for lesson JSON. Pure validation, no Phaser.
 *
 * Canonical shape is { moments: LessonMoment[] }. Legacy `{ blocks: [...] }`
 * payloads are auto-wrapped into a single inferred moment list so older
 * lessons still validate and play.
 */
import { z } from 'zod';
import { inferMoments } from './momentPlanner';
import type { LessonBlock } from './types';

const intro = z.object({
  type: z.literal('intro'),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  mascot: z.string().optional(),
});

const phonics = z.object({
  type: z.literal('phonics_focus'),
  sound: z.string().min(1),
  examples: z.array(z.string().min(1)).min(1),
  audio: z.string().optional(),
});

const vocab = z.object({
  type: z.literal('vocab_solo'),
  word: z.string().min(1),
  definition: z.string().min(1),
  image: z.string().optional(),
  audio: z.string().optional(),
});

const multipleChoice = z.object({
  type: z.literal('multiple_choice'),
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2).max(6),
  answerIndex: z.number().int().nonnegative(),
}).refine((b) => b.answerIndex < b.options.length, {
  message: 'answerIndex out of range',
  path: ['answerIndex'],
});

const dragAndDrop = z.object({
  type: z.literal('drag_and_drop'),
  prompt: z.string().min(1),
  items: z.array(z.object({ id: z.string().min(1), label: z.string().min(1) })).min(1),
  targets: z.array(
    z.object({ id: z.string().min(1), label: z.string().min(1), accepts: z.string().min(1) }),
  ).min(1),
});

const match = z.object({
  type: z.literal('match'),
  prompt: z.string().min(1),
  pairs: z.array(z.object({ left: z.string().min(1), right: z.string().min(1) })).min(2),
});

const fillInBlank = z.object({
  type: z.literal('fill_in_blank'),
  sentence: z.string().includes('___'),
  options: z.array(z.string().min(1)).min(2),
  answer: z.string().min(1),
}).refine((b) => b.options.includes(b.answer), {
  message: 'answer must be in options',
  path: ['answer'],
});

const storybook = z.object({
  type: z.literal('storybook'),
  title: z.string().min(1),
  pages: z.array(z.object({ text: z.string().min(1), image: z.string().optional() })).min(1),
});

const lessonSummary = z.object({
  type: z.literal('lesson_summary'),
  title: z.string().min(1),
  bullets: z.array(z.string().min(1)).min(1),
});

export const blockSchema = z.union([
  intro,
  phonics,
  vocab,
  multipleChoice,
  dragAndDrop,
  match,
  fillInBlank,
  storybook,
  lessonSummary,
]);

const momentSchema = z.object({
  id: z.string().min(1),
  kind: z.enum([
    'intro_moment',
    'discovery_moment',
    'practice_moment',
    'story_moment',
    'challenge_moment',
    'reward_moment',
  ]),
  title: z.string().optional(),
  blocks: z.array(blockSchema).min(1),
});

const lessonShape = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  cefr: z.string().min(1),
  hub: z.enum(['playground', 'academy', 'success']),
  moments: z.array(momentSchema).min(1).optional(),
  blocks: z.array(blockSchema).min(1).optional(),
});

import type { LessonJSON, LessonMoment } from './types';

export const lessonSchema = lessonShape
  .superRefine((l, ctx) => {
    if (!l.moments?.length && !l.blocks?.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'lesson requires moments or blocks' });
    }
  })
  .transform((l): Pick<LessonJSON, 'id' | 'title' | 'cefr' | 'hub' | 'moments'> => {
    const moments: LessonMoment[] = (l.moments?.length
      ? l.moments
      : inferMoments((l.blocks ?? []) as LessonBlock[])) as LessonMoment[];
    return { id: l.id, title: l.title, cefr: l.cefr, hub: l.hub, moments };
  });

export type LessonSchema = z.infer<typeof lessonSchema>;
