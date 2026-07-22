import type { QAIssue, QADomain } from './types';
import { dedupeSuggestions, type DedupedIssue } from './repairs/dedupeSuggestions';

/**
 * Maps QA issue codes to the downstream repair pipelines that should
 * be invoked. The caller wires these targets to the actual repair
 * functions (e.g., src/activities/validation/activityRepair.ts,
 * src/pronunciation pipeline, narrative binder regeneration).
 */
export type RepairTarget =
  | 'activity_repair'
  | 'pronunciation_repair'
  | 'narrative_rebind'
  | 'grammar_rewrite'
  | 'cefr_simplify'
  | 'theme_replace'
  | 'vocab_card_rewrite'
  | 'vocab_resequence'
  | 'vocab_gamification_inject'
  | 'json_regenerate'
  | 'speaking_scaffold_rebuild'
  | 'phonics_intelligibility_swap'
  | 'engine_swap'
  | 'manual_review';

export interface RepairDispatch {
  target: RepairTarget;
  issue_codes: string[];
  locators: QAIssue['locator'][];
}

const ROUTING: Record<string, RepairTarget> = {
  ACADEMIC_LOW_COMMUNICATION: 'activity_repair',
  ACADEMIC_WORKSHEET_BIAS: 'activity_repair',
  ACADEMIC_NO_COMMUNICATION_OBJECTIVE: 'activity_repair',
  ACADEMIC_PURPOSE_MISSING: 'activity_repair',

  CEFR_SENTENCE_OVER_CAP: 'cefr_simplify',
  CEFR_SENTENCE_OVER_CAP_SOFT: 'cefr_simplify',
  CEFR_CLAUSE_DEPTH_OVER_CAP: 'cefr_simplify',
  CEFR_READING_GRADE_OVER_CAP: 'cefr_simplify',
  CEFR_FORBIDDEN_TENSE_KEYWORD: 'grammar_rewrite',

  AGE_HUB_THEME_BAN: 'theme_replace',
  AGE_HUB_THEME_BAN_SLIDE: 'theme_replace',

  SAFETY_UNSAFE_PHRASE: 'manual_review',
  SAFETY_SPEAKING_TASK_RED_FLAG: 'manual_review',

  LANG_AI_PHRASING: 'grammar_rewrite',
  LANG_PLACEHOLDER_LEAK: 'grammar_rewrite',
  LANG_MCQ_ANSWER_NOT_IN_OPTIONS: 'activity_repair',
  LANG_FILL_BLANK_NO_GAP: 'activity_repair',

  ACTIVITY_LOW_DIVERSITY: 'activity_repair',
  ACTIVITY_CONSECUTIVE_REPETITION: 'activity_repair',
  ACTIVITY_ADJACENT_SAME_MODALITY_PURPOSE: 'activity_repair',
  ACTIVITY_TYPE_OVER_CAP: 'activity_repair',

  NARRATIVE_CHARACTER_DRIFT: 'narrative_rebind',
  NARRATIVE_SETTING_DRIFT: 'narrative_rebind',
  STORY_CHARACTER_OMITTED: 'narrative_rebind',
  OFF_THEME_FILLER: 'theme_replace',

  HALLUC_FAIL: 'grammar_rewrite',
  HALLUC_CLAIM_INACCURATE: 'grammar_rewrite',
  HALLUC_INCONCLUSIVE: 'manual_review',

  DUPLICATE_ACTIVITY_FINGERPRINT: 'activity_repair',
  DUPLICATE_PROMPT_SIMILARITY: 'activity_repair',

  // New governance routes
  JSON_PLACEHOLDER_LEAK: 'json_regenerate',
  JSON_TRUNCATED_VALUE: 'json_regenerate',
  JSON_SLIDE_MISSING_KEYS: 'json_regenerate',
  JSON_ACTIVITY_MISSING_KEYS: 'json_regenerate',
  JSON_ACTIVITY_EMPTY_CONTENT: 'json_regenerate',
  JSON_ACTIVITY_GENERATION_FAILED: 'json_regenerate',

  VOCAB_CARD_INCOMPLETE: 'vocab_card_rewrite',
  VOCAB_CARDS_MISSING: 'vocab_card_rewrite',
  VOCAB_CARD_NO_HEADWORD: 'vocab_card_rewrite',
  VOCAB_EXAMPLE_MISSING_HEADWORD: 'vocab_card_rewrite',
  VOCAB_USED_BEFORE_INTRODUCTION: 'vocab_resequence',
  TARGET_VOCAB_OMITTED: 'activity_repair',

  READING_OFF_PASSAGE: 'activity_repair',
  FLOW_OUT_OF_ORDER: 'activity_repair',

  SPEAKING_SCAFFOLD_MISSING: 'speaking_scaffold_rebuild',

  PHONICS_EARLY_READER_GATE: 'phonics_intelligibility_swap',

  VOCAB_GAMIFICATION_IMAGE_MATCH_MISSING: 'vocab_gamification_inject',
  VOCAB_GAMIFICATION_RETRIEVAL_MISSING: 'vocab_gamification_inject',

  ENGINE_SLOT_CEFR_CEILING: 'engine_swap',
  ENGINE_SLOT_CEFR_CEILING_BLOCK: 'engine_swap',

  // Pre-A1 non-reader blueprint
  PREA1_FORBIDDEN_ACTIVITY: 'activity_repair',
  PREA1_SPEAKING_FLOOR_UNMET: 'activity_repair',
  PREA1_TPR_MIN_UNMET: 'activity_repair',
  PREA1_PRINTED_PROSE_LEAK: 'activity_repair',

};

export function dispatchRepairs(issues: QAIssue[]): RepairDispatch[] {
  const deduped = dedupeSuggestions(issues);
  const buckets = new Map<RepairTarget, RepairDispatch>();
  for (const issue of deduped) {
    if (issue.severity === 'info') continue;
    const codes = issue.merged_codes.length ? issue.merged_codes : [issue.code];
    const target = codes.map((c) => ROUTING[c]).find(Boolean) ?? 'manual_review';
    const existing = buckets.get(target);
    if (existing) {
      existing.issue_codes.push(...codes);
      existing.locators.push(issue.locator);
    } else {
      buckets.set(target, {
        target,
        issue_codes: [...codes],
        locators: [issue.locator],
      });
    }
  }
  return [...buckets.values()];
}

/**
 * Build a compact, deduped list of repair-hint strings suitable for
 * forwarding as `repair_hints` to the generator. Collapses overlapping
 * validator suggestions so the prompt stays token-efficient and
 * non-conflicting.
 */
export function buildRepairHints(issues: QAIssue[], max = 8): string[] {
  const deduped = dedupeSuggestions(issues).filter((i) => i.severity !== 'info' && i.suggestion);
  deduped.sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
  return deduped.slice(0, max).map(formatHint);
}

function severityRank(s: QAIssue['severity']): number {
  return s === 'block' ? 2 : s === 'warn' ? 1 : 0;
}

function formatHint(i: DedupedIssue): string {
  const codes = i.merged_codes.join('/');
  const loc = i.locator?.slideId || i.locator?.activityId || i.locator?.path;
  const locTag = loc ? ` @${loc}` : '';
  return `[${codes}${locTag}] ${i.suggestion}`;
}

export function domainFromCode(code: string): QADomain | undefined {
  if (code.startsWith('ACADEMIC_')) return 'academic';
  if (code.startsWith('CEFR_')) return 'cefr';
  if (code.startsWith('AGE_')) return 'age';
  if (code.startsWith('SAFETY_')) return 'safety';
  if (code.startsWith('LANG_')) return 'language';
  if (code.startsWith('ACTIVITY_')) return 'activity';
  if (code.startsWith('NARRATIVE_')) return 'narrative';
  if (code.startsWith('STRUCT_')) return 'structural';
  if (code.startsWith('HALLUC_')) return 'hallucination';
  if (code.startsWith('DUPLICATE_')) return 'duplicate';
  if (code.startsWith('PREA1_')) return 'age';
  return undefined;
}
