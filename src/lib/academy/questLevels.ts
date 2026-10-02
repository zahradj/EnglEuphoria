import type { Block } from '@/pages/AcademyDemo';

/**
 * Quest framing for the Academy player: every pedagogical block is a "level" with a name, an emoji badge and a
 * one-line goal, so the lesson reads as a quest with a visible mission instead of a slide deck.
 *
 * A lesson can override any level via `content.levels[block] = { title, goal, emoji }` (e.g. a jungle-themed
 * lesson names its boss level "The Labyrinth"). Missing entries fall back to these defaults.
 */
export interface QuestLevel {
  emoji: string;
  title: string;
  goal: string;
  /** Optional can-do statement shown on the level intro: "I can …". */
  ican?: string;
}

export const DEFAULT_QUEST_LEVELS: Record<Block, QuestLevel> = {
  warmup: { emoji: '🏕️', title: 'Basecamp', goal: 'Meet the team and spot what is going on.' },
  vocab: { emoji: '🎒', title: 'Word Hunt', goal: 'Collect the new words and make them yours.' },
  reading: { emoji: '🗺️', title: 'Story Trail', goal: 'Read and listen to find the clues.' },
  grammar: { emoji: '🔓', title: 'Code Breaker', goal: 'Crack the pattern behind the language.' },
  practice: { emoji: '⚔️', title: 'Training Ground', goal: 'Drag, match and build to power up.' },
  interactive: { emoji: '🗝️', title: 'Boss Challenge', goal: 'Solve the puzzles and talk your way through.' },
  speaking: { emoji: '🏆', title: 'Final Mission', goal: 'Show everything you can do — out loud.' },
};

export type QuestLevelOverrides = Partial<Record<Block, Partial<QuestLevel>>>;

export function resolveQuestLevel(block: Block, overrides?: QuestLevelOverrides | null): QuestLevel {
  return { ...DEFAULT_QUEST_LEVELS[block], ...(overrides?.[block] ?? {}) };
}
