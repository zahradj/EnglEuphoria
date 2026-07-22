/**
 * Detective Mystery Engine — question-driven inference.
 *
 * Host usage:
 *   import { DetectiveSlot } from '@/detective';
 *   <DetectiveSlot hub={hub} cefr={cefr} case={kase}
 *                  onEvent={observer.emit} onComplete={observer.caseComplete} />
 *
 * Generation:
 *   const prompt = buildDetectivePrompt({ hub, cefr, target_skill, ... });
 *   const kase = JSON.parse(await ai(prompt));
 *   const report = validateDetectiveCase(kase);   // repair on 'block'
 */
export { default as DetectiveSlot } from './DetectiveSlot';
export { validateDetectiveCase } from './validator';
export { buildDetectivePrompt } from './promptInjector';
export { DETECTIVE_HUB_PROFILES } from './hubProfiles';
export type {
  Hub,
  Cefr,
  QuestionKind,
  Suspect,
  DetectiveQuestion,
  DetectiveCase,
  DetectiveEvent,
  DetectiveSlotProps,
} from './types';
