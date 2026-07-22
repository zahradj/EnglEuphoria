// Orchestrates all 7 sub-engines and produces a single GovernanceReport.

import type { LessonState, GovernanceReport, GovernanceIssue, Slide } from './types';
import { validateGrammar } from './engines/grammarEngine';
import { validateVocab } from './engines/vocabEngine';
import { validateTheme } from './engines/themeEngine';
import { validateCEFR } from './engines/cefrEngine';
import { validateSequence } from './engines/sequenceEngine';
import { validateQuality, validateLessonQuality } from './engines/qualityEngine';

function hashState(state: LessonState): string {
  const s = `${state.hub}|${state.cefr}|${state.theme.theme}|${state.grammar.target_grammar.join(',')}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return `gov_${(h >>> 0).toString(16)}`;
}

export function runGovernance(slides: Slide[], state: LessonState): GovernanceReport {
  const all: GovernanceIssue[] = [];

  slides.forEach((slide, idx) => {
    all.push(...validateGrammar(slide, state.grammar, idx));
    all.push(...validateVocab(slide, state.vocab, idx));
    all.push(...validateTheme(slide, state, idx));
    all.push(...validateCEFR(slide, state, idx));
    all.push(...validateQuality(slide, idx));
  });

  all.push(...validateSequence(slides));
  all.push(...validateLessonQuality(slides));

  const errors = all.filter((i) => i.severity === 'error');
  const warnings = all.filter((i) => i.severity === 'warning');

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    ranAt: new Date().toISOString(),
    stateHash: hashState(state),
  };
}

/** Group issues by slide index for the report UI. */
export function groupIssuesBySlide(report: GovernanceReport): Map<number | 'lesson', GovernanceIssue[]> {
  const map = new Map<number | 'lesson', GovernanceIssue[]>();
  for (const i of [...report.errors, ...report.warnings]) {
    const k = i.slideIndex ?? 'lesson';
    (map.get(k) ?? map.set(k, []).get(k)!).push(i);
  }
  return map;
}
