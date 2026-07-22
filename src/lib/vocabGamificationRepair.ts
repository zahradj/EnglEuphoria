/**
 * Vocab-Gamification Auto-Repair (senior-ai-edtech-architect)
 *
 * Bridges QA repair codes (VOCAB_GAMIFICATION_IMAGE_MATCH_MISSING /
 * VOCAB_GAMIFICATION_RETRIEVAL_MISSING → `vocab_gamification_inject` in
 * `src/qa/repairDispatcher.ts`) back into the hub-specific injectors
 * without regenerating the whole lesson.
 *
 * Idempotent: injectors are no-ops when the arc is already present.
 */

import type { Hub } from '@/governance/types';
import { injectAcademyVocabGamification } from './academyVocabGamification';
import { injectSuccessVocabGamification } from './successVocabGamification';

export const VOCAB_GAMIFICATION_REPAIR_CODES = [
  'VOCAB_GAMIFICATION_IMAGE_MATCH_MISSING',
  'VOCAB_GAMIFICATION_RETRIEVAL_MISSING',
] as const;

export type VocabGamificationRepairCode =
  (typeof VOCAB_GAMIFICATION_REPAIR_CODES)[number];

export function hasVocabGamificationRepair(codes: readonly string[]): boolean {
  return codes.some((c) =>
    (VOCAB_GAMIFICATION_REPAIR_CODES as readonly string[]).includes(c),
  );
}

export interface VocabGamificationRepairResult {
  slides: any[];
  injected: number;
  reason?: string;
}

/**
 * Apply the correct injector for the hub. Playground normally ships the arc
 * via `playgroundUnitTemplates`, but imported / legacy / user-authored lessons
 * may be missing it — in that case we reuse the Academy injector and remap the
 * telemetry `source` to `playground_vocab_gamification` so the Lift KPI stays
 * hub-attributed.
 */
export function applyVocabGamificationRepair(
  slides: any[],
  targetWords: string[],
  hub: Hub,
  cefr: string | null | undefined,
): VocabGamificationRepairResult {
  if (hub === 'academy') {
    return injectAcademyVocabGamification(slides, targetWords, cefr);
  }
  if (hub === 'success') {
    return injectSuccessVocabGamification(slides, targetWords, cefr);
  }
  if (hub === 'playground') {
    const res = injectAcademyVocabGamification(slides, targetWords, cefr);
    if (res.injected > 0) {
      const patched = (res.slides as any[]).map((s) => {
        if (!s || typeof s !== 'object') return s;
        if (s.source === 'academy_vocab_gamification') {
          return { ...s, source: 'playground_vocab_gamification' };
        }
        return s;
      });
      return { ...res, slides: patched };
    }
    return res;
  }
  return { slides, injected: 0, reason: `unknown_hub:${hub}` };
}

/**
 * Extract vocab target words from slides (vocab / vocab_deck) so the auto-heal
 * path can run without needing the original generation payload.
 */
export function extractTargetWordsFromSlides(slides: any[]): string[] {
  const words: string[] = [];
  const seen = new Set<string>();
  const push = (w: unknown) => {
    if (typeof w !== 'string') return;
    const k = w.trim();
    if (!k) return;
    const key = k.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    words.push(k);
  };
  for (const s of slides || []) {
    if (!s || typeof s !== 'object') continue;
    if (s.type === 'vocab') push(s.word);
    if (s.type === 'vocab_deck' && Array.isArray(s.cards)) {
      for (const c of s.cards) push(c?.word);
    }
  }
  return words;
}

/**
 * Verdict-driven auto-heal. Idempotent. Returns the (possibly patched) slides
 * plus a count of injected slides. Callers should replace state and re-run
 * QA / publish only when `injected > 0`.
 */
export function autoHealVocabGamificationFromVerdict(
  slides: any[],
  repairCodes: readonly string[],
  hub: Hub,
  cefr: string | null | undefined,
  opts?: { lessonId?: string },
): VocabGamificationRepairResult {
  if (!hasVocabGamificationRepair(repairCodes)) {
    return { slides, injected: 0, reason: 'no_matching_code' };
  }
  // A/B: ~10% of lessons stay in the control arm (no injection) so we can
  // measure recall lift downstream. Deterministic per lessonId.
  if (opts?.lessonId) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { vocabArcArm, logVocabArcArm } = require('./vocabArcExperiment');
      const arm = vocabArcArm(opts.lessonId);
      logVocabArcArm(opts.lessonId, hub, arm);
      if (arm === 'control') {
        return { slides, injected: 0, reason: 'ab_control_arm' };
      }
    } catch { /* experiment optional */ }
  }
  const words = extractTargetWordsFromSlides(slides);
  if (words.length < 3) {
    return { slides, injected: 0, reason: 'insufficient_target_vocab' };
  }
  return applyVocabGamificationRepair(slides, words, hub, cefr);
}

