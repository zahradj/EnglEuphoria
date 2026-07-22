/**
 * Vocab Games Engine — public entrypoint.
 *
 * Import site (host):
 *   import { VocabGamesSlot } from '@/vocab-games';
 *
 * Injection site (Academy/Success gamification):
 *   Emit a slide of shape:
 *     { type: 'vocab_games_slot', block: 'vocab',
 *       hub, cefr, targets: [{word, definition, example}], source }
 *   The player then does:
 *     <VocabGamesSlot hub={slide.hub} cefr={slide.cefr}
 *                     lessonId={lesson.id} targets={slide.targets}
 *                     onEvent={observer.emit}
 *                     onComplete={observer.vocabArcComplete} />
 */

export { default as VocabGamesSlot } from './VocabGamesSlot';
export { selectGames, hubCap } from './selector';
export { HUB_THEMES, themeStyle } from './theme';
export type {
  Cefr,
  Hub,
  VocabGameEvent,
  VocabGameId,
  VocabGameSpec,
  VocabGamesMode,
  VocabGamesSlotProps,
  VocabTarget,
} from './types';
