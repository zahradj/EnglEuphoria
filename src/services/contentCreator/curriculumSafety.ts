// Curriculum Safety Rules
// -----------------------
// Centralized pre-flight checks that prevent the Unified Generator from
// emitting lessons that drift from the curriculum source of truth. Runs
// BEFORE the orchestrator is called.

import { supabase } from '@/integrations/supabase/client';
import {
  blueprintHash,
  validateBlueprintIntegrity,
  type LessonBlueprint,
} from './lessonBlueprint';

export type SafetySeverity = 'block' | 'warn';

export interface SafetyIssue {
  code:
    | 'cefr_out_of_hub_range'
    | 'vocab_overload'
    | 'empty_communication_goal'
    | 'empty_grammar_focus'
    | 'missing_relationship'
    | 'topic_drift'
    | 'lesson_duplication'
    | 'phonics_mismatch'
    | 'broken_progression'
    | 'disconnected_activities';
  severity: SafetySeverity;
  message: string;
}

export interface SafetyReport {
  ok: boolean; // false if any block
  issues: SafetyIssue[];
  hash: string;
}

/**
 * Server-aware duplication probe — checks curriculum_lessons for an already-
 * published row in the same slot with the same blueprint hash. Best-effort:
 * silent on DB errors (the publish gate still re-runs validation).
 */
async function isDuplicateAlreadyPublished(
  bp: LessonBlueprint,
  hash: string,
): Promise<boolean> {
  try {
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id;
    if (!uid) return false;

    const targetSystem =
      bp.hub === 'playground' ? 'kids' : bp.hub === 'academy' ? 'teen' : 'adult';

    const { data, error } = await supabase
      .from('curriculum_lessons')
      .select('id, ai_metadata, is_published')
      .eq('created_by', uid)
      .eq('target_system', targetSystem)
      .limit(50);
    if (error || !data) return false;

    return data.some((row: any) => {
      if (!row.is_published) return false;
      const meta = row.ai_metadata ?? {};
      if (Number(meta.unit_number) !== bp.unit_number) return false;
      if (Number(meta.lesson_number) !== bp.lesson_number) return false;
      const storedHash = meta.unified_output?.blueprint_hash;
      return storedHash && storedHash === hash;
    });
  } catch {
    return false;
  }
}

/**
 * Single entry every generator call should pass through before invoking the
 * orchestrator. Combines static integrity checks with server-aware ones.
 */
export async function assertCurriculumSafe(
  bp: LessonBlueprint,
): Promise<SafetyReport> {
  const issues: SafetyIssue[] = [];

  // 1. Static integrity (hub/CEFR matrix, vocab cap, etc.)
  const integrity = validateBlueprintIntegrity(bp);
  for (const i of integrity.issues) {
    issues.push({ code: i.code, severity: i.severity, message: i.message });
  }

  // 2. Topic drift — story theme should reference the unit theme.
  const theme = bp.story_state.theme?.toLowerCase().trim();
  if (theme && !theme.includes(bp.unit_title.split(' ')[0].toLowerCase())) {
    // Soft signal only — many themes are valid that don't echo the unit name.
  }

  // 3. Phonics vs hub matrix — Playground only supports standalone phonics.
  if (bp.phonics_focus.length > 0 && bp.hub !== 'playground') {
    issues.push({
      code: 'phonics_mismatch',
      severity: 'warn',
      message: 'Phonics focus is Playground-only; will be downgraded to a pronunciation booster.',
    });
  }

  // 4. Broken progression — first lesson of unit > 1 with no review_targets.
  if (bp.unit_number > 1 && bp.lesson_number === 1 && bp.review_targets.length === 0) {
    issues.push({
      code: 'broken_progression',
      severity: 'warn',
      message: 'New unit opener has no review targets — spiral progression may break.',
    });
  }

  // 5. Disconnected activities heuristic — communication goal mentions a skill
  //    that isn't in grammar_focus or vocabulary_focus.
  const goal = bp.communication_goal.toLowerCase();
  const hasAnchor =
    bp.grammar_focus.some((g) => goal.includes(g.toLowerCase().split(' ')[0])) ||
    bp.vocabulary_focus.some((v) => goal.includes(v.toLowerCase())) ||
    bp.grammar_focus.length === 0;
  if (!hasAnchor) {
    issues.push({
      code: 'disconnected_activities',
      severity: 'warn',
      message: 'Communication goal does not reference any grammar or vocabulary target.',
    });
  }

  // 6. Duplication probe.
  const hash = blueprintHash(bp);
  if (await isDuplicateAlreadyPublished(bp, hash)) {
    issues.push({
      code: 'lesson_duplication',
      severity: 'block',
      message: 'A lesson with this exact blueprint is already published in your library.',
    });
  }

  const ok = !issues.some((i) => i.severity === 'block');
  return { ok, issues, hash };
}
