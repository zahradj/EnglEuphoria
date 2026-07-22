/**
 * Language Engine Slot validator.
 *
 * Ensures immersive engine slots (Story / Escape / Detective / Hidden Object)
 * that pass through the deterministic publish gate are:
 *   1. Bound to concrete vocabulary targets (≥2, ≤8).
 *   2. Within their supported CEFR ceiling per engine type.
 *   3. Compact enough for PG typing constraints (short prompts / choices).
 *
 * Violations are reported as `warn` severity — engine slots are additive
 * reinforcement, not the primary vocab arc, so they should surface issues
 * without blocking publish.
 */

import type { QAIssue, QALesson } from '../types';

const ENGINE_KINDS = new Set([
  'story_engine_slot',
  'escape_room_slot',
  'detective_mystery_slot',
  'hidden_object_slot',
]);

// Engines cap out at these CEFRs. Above them, the engine is advisory-only.
const CEFR_CEILING: Record<string, string> = {
  story_engine_slot: 'C2',
  escape_room_slot: 'C1',
  detective_mystery_slot: 'C2',
  hidden_object_slot: 'B1', // heavily visual; keeps text light
};

const CEFR_ORDER = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function cefrIndex(v?: string | null): number {
  if (!v) return -1;
  const norm = String(v).replace(/\s+/g, '').toLowerCase();
  return CEFR_ORDER.findIndex((c) => c.replace(/\s+/g, '').toLowerCase() === norm);
}

function collectEngineSlots(lesson: QALesson): Array<Record<string, unknown>> {
  const out: Array<Record<string, unknown>> = [];
  const slides = ((lesson as any)?.slides ?? []) as unknown[];
  for (const s of slides) {
    if (!s || typeof s !== 'object') continue;
    const kind = String((s as any).type || (s as any).kind || '');
    if (ENGINE_KINDS.has(kind)) out.push(s as Record<string, unknown>);
  }
  const pages = ((lesson as any)?.pages ?? []) as any[];
  for (const p of pages) {
    for (const b of p?.blocks ?? []) {
      if (b?.kind === 'language_engine_slot') out.push(b as Record<string, unknown>);
    }
  }
  return out;
}

export function validateEngineSlot(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];
  const slots = collectEngineSlots(lesson);
  if (slots.length === 0) return issues;

  const lessonCefr = String((lesson as any)?.cefr ?? '').trim();
  const lessonCefrIdx = cefrIndex(lessonCefr);

  slots.forEach((slot, i) => {
    const engineType = String(slot.type || slot.kind || slot.engineType || '');
    const targets = Array.isArray(slot.targets) ? (slot.targets as any[]) : [];
    const words = Array.isArray(slot.target_words)
      ? (slot.target_words as string[])
      : targets.map((t) => String(t?.word || '')).filter(Boolean);

    if (words.length < 2) {
      issues.push({
        domain: 'activity',
        code: 'ENGINE_SLOT_TARGET_TOO_FEW',
        severity: 'warn',
        auto_repairable: false,
        message: `${engineType} #${i + 1} has ${words.length} target(s); needs ≥2 vocabulary items to be pedagogically useful.`,
      });
    }
    if (words.length > 8) {
      issues.push({
        domain: 'activity',
        code: 'ENGINE_SLOT_TARGET_TOO_MANY',
        severity: 'warn',
        auto_repairable: false,
        message: `${engineType} #${i + 1} carries ${words.length} targets; cap at 8 to protect pacing.`,
      });
    }

    const ceiling = CEFR_CEILING[engineType];
    if (ceiling && lessonCefrIdx >= 0) {
      const ceilingIdx = cefrIndex(ceiling);
      if (ceilingIdx >= 0 && lessonCefrIdx > ceilingIdx) {
        // C1/C2 breaches are hard blocks — the engine's UX can't scaffold that level.
        // Lower breaches remain advisory warnings.
        const hardBreach = lessonCefrIdx >= cefrIndex('C1');
        issues.push({
          domain: 'cefr',
          code: hardBreach ? 'ENGINE_SLOT_CEFR_CEILING_BLOCK' : 'ENGINE_SLOT_CEFR_CEILING',
          severity: hardBreach ? 'block' : 'warn',
          auto_repairable: true,
          message: `${engineType} tops out at CEFR ${ceiling}; lesson is ${lessonCefr}.${hardBreach ? ' Blocking publish — rotate to a supported engine.' : ' Consider rotating to another engine or lowering scaffolding.'} Suggested repair: swap for story_engine_slot or detective_mystery_slot (both support up to C2).`,
        });
      }
    }

    // PG typing cap: title and objective should stay short.
    const title = String(slot.title || '');
    const objective = String(slot.objective || '');
    if (title.length > 60) {
      issues.push({
        domain: 'activity',
        code: 'ENGINE_SLOT_TITLE_TOO_LONG',
        severity: 'warn',
        auto_repairable: false,
        message: `${engineType} title is ${title.length} chars; keep ≤ 60 for PG typing.`,
      });
    }
    if (objective.length > 140) {
      issues.push({
        domain: 'activity',
        code: 'ENGINE_SLOT_OBJECTIVE_TOO_LONG',
        severity: 'warn',
        auto_repairable: false,
        message: `${engineType} objective is ${objective.length} chars; keep ≤ 140 for PG typing.`,
      });
    }
  });

  return issues;
}
