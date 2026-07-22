// Architect 8-brain pipeline gate.
// Hard-blocks publish when the architect output attached to the lesson fails
// the Hall-of-Fame verdict, is missing emotional beats, has unsigned pipeline
// stages, or violates a Never-rule (single grammar focus, Playground vocab ≤4,
// story needs a problem, no repeated mechanics).

import type { QAIssue, QALesson } from '../types';
import type { ArchitectResult } from '@/architect/types';

const REQUIRED_BEATS = [
  'surprise',
  'funny',
  'challenge',
  'celebration',
  'reward',
  'emotional',
  'memorable',
] as const;

function getArchitect(lesson: QALesson): ArchitectResult | undefined {
  const anyLesson = lesson as any;
  return anyLesson.architect ?? anyLesson.meta?.architect;
}

export function validateArchitectPipeline(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];
  const arch = getArchitect(lesson);
  if (!arch) return issues; // architect not attached → skip (back-compat)

  // 1) Hall of Fame verdict
  if (arch.hall_of_fame) {
    if (arch.hall_of_fame.verdict !== 'hall_of_fame') {
      issues.push({
        code: 'ARCHITECT_HALL_OF_FAME_FAIL',
        domain: 'academic',
        severity: 'block',
        message: `Lesson did not reach Hall of Fame (verdict="${arch.hall_of_fame.verdict}", total=${arch.hall_of_fame.total}). Improve: ${arch.hall_of_fame.improve_target ?? 'n/a'}`,
        auto_repairable: true,
      });
    }
  } else {
    issues.push({
      code: 'ARCHITECT_HALL_OF_FAME_MISSING',
      domain: 'academic',
      severity: 'block',
      message: 'Architect pipeline did not emit a hall_of_fame verdict.',
      auto_repairable: true,
    });
  }

  // 2) Emotional beats — all 7 required
  const beats = arch.emotional_beats ?? {};
  for (const beat of REQUIRED_BEATS) {
    const entry = (beats as any)[beat];
    if (!entry || typeof entry.slide_index !== 'number' || !entry.description) {
      issues.push({
        code: 'ARCHITECT_EMOTIONAL_BEAT_MISSING',
        domain: 'narrative',
        severity: 'block',
        message: `Emotional beat "${beat}" is missing or malformed. Every lesson must include surprise, funny, challenge, celebration, reward, emotional, and memorable moments.`,
        auto_repairable: true,
      });
    }
  }

  // 3) Pipeline signatures — every stage must be signed
  const trace = arch.pipeline_trace ?? [];
  if (trace.length === 0) {
    issues.push({
      code: 'ARCHITECT_PIPELINE_MISSING',
      domain: 'structural',
      severity: 'block',
      message: 'Architect pipeline_trace is empty. All 8 brains must sign the lesson.',
      auto_repairable: true,
    });
  } else {
    for (const stage of trace) {
      if (!stage.signed_by || !stage.decision) {
        issues.push({
          code: 'ARCHITECT_PIPELINE_UNSIGNED',
          domain: 'structural',
          severity: 'block',
          message: `Pipeline stage "${stage.stage}" is unsigned or missing a decision.`,
          auto_repairable: true,
        });
      }
    }
  }

  // 4) Never-rules
  const grammarCount = arch.overrides?.grammar_focus?.length ?? 0;
  if (grammarCount > 1) {
    issues.push({
      code: 'ARCHITECT_NEVER_RULE_GRAMMAR',
      domain: 'academic',
      severity: 'block',
      message: `Never-rule violated: a lesson must teach exactly 1 grammar focus, got ${grammarCount}.`,
      auto_repairable: true,
    });
  }

  const vocabCount = arch.overrides?.target_vocab?.length ?? 0;
  if (lesson.hub === 'Playground' && vocabCount > 4) {
    issues.push({
      code: 'ARCHITECT_NEVER_RULE_PG_VOCAB',
      domain: 'academic',
      severity: 'block',
      message: `Never-rule violated: Playground lessons cap at 4 target vocab, got ${vocabCount}.`,
      auto_repairable: true,
    });
  }

  // Story kinds must have a "problem" declared in the design workflow.
  if (lesson.lesson_kind === 'storybook') {
    const dw: any = arch.design_workflow ?? {};
    const problem = dw.problem ?? dw.story_problem ?? dw?.story?.problem;
    if (!problem || (typeof problem === 'string' && problem.trim().length === 0)) {
      issues.push({
        code: 'ARCHITECT_NEVER_RULE_STORY_PROBLEM',
        domain: 'narrative',
        severity: 'block',
        message: 'Never-rule violated: storybook lessons must declare a "problem" in design_workflow.',
        auto_repairable: true,
      });
    }
  }

  // No repeated game/activity mechanics inside the design workflow.
  const dw: any = arch.design_workflow ?? {};
  const mechanics: string[] = Array.isArray(dw.mechanics)
    ? dw.mechanics.map(String)
    : Array.isArray(dw?.game?.mechanics)
      ? dw.game.mechanics.map(String)
      : [];
  if (mechanics.length > 0) {
    const seen = new Set<string>();
    for (const m of mechanics) {
      const key = m.trim().toLowerCase();
      if (!key) continue;
      if (seen.has(key)) {
        issues.push({
          code: 'ARCHITECT_NEVER_RULE_MECHANIC_REPEAT',
          domain: 'activity',
          severity: 'block',
          message: `Never-rule violated: mechanic "${m}" is repeated in design_workflow.`,
          auto_repairable: true,
        });
        break;
      }
      seen.add(key);
    }
  }

  // 5) Review checks — surface any explicit blocker
  if (arch.review && arch.review.pass === false) {
    issues.push({
      code: 'ARCHITECT_REVIEW_FAIL',
      domain: 'academic',
      severity: 'block',
      message: `Architect review failed: ${arch.review.blocker ?? 'unspecified blocker'}.`,
      auto_repairable: true,
    });
  }

  return issues;
}
