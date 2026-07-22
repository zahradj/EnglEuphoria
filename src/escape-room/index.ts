/**
 * Escape Room Engine — sequential language puzzles.
 *
 * Host usage:
 *   import { EscapeRoomSlot } from '@/escape-room';
 *   <EscapeRoomSlot hub={hub} cefr={cefr} room={room}
 *                   onEvent={observer.emit} onComplete={observer.escapeComplete} />
 *
 * Generation:
 *   const prompt = buildEscapeRoomPrompt({ hub, cefr, target_skill, ... });
 *   const room = JSON.parse(await ai(prompt));
 *   const report = validateEscapeRoom(room);   // repair on 'block'
 */
export { default as EscapeRoomSlot } from './EscapeRoomSlot';
export { validateEscapeRoom } from './validator';
export { buildEscapeRoomPrompt } from './promptInjector';
export { ESCAPE_HUB_PROFILES } from './hubProfiles';
export type {
  Hub,
  Cefr,
  PuzzleKind,
  Puzzle,
  UnscramblePuzzle,
  ClozePuzzle,
  OrderPuzzle,
  OddOneOutPuzzle,
  RiddlePuzzle,
  EscapeRoom,
  EscapeEvent,
  EscapeRoomSlotProps,
} from './types';
