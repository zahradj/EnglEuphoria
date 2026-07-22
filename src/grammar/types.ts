// Grammar Acquisition Engine — shared types.
// Pure TS. No React, no Supabase. Safe to import from edge functions.

import type { Cefr, Hub } from '@/governance/types';

export type HighlightRole =
  | 'aux'
  | 'ending'
  | 'base'
  | 'time'
  | 'contraction'
  | 'inversion'
  | 'subject'
  | 'object'
  // ── Phase 5 additions ──
  | 'negative'
  | 'question';

export interface HighlightToken {
  text: string;
  role: HighlightRole;
  start: number; // character offset in line
  end: number;
}

export interface ExampleLine {
  text: string;
  highlights: HighlightToken[];
  gloss?: string;
}

export interface FormCard {
  positive: ExampleLine[];
  negative: ExampleLine[];
  question: ExampleLine[];
  shortAnswers?: ExampleLine[];
  contractions?: ExampleLine[];
}

export type DrillType =
  | 'repetition'
  | 'transformation'
  | 'negative_conversion'
  | 'question_conversion'
  | 'substitution'
  | 'completion'
  | 'error_correction'
  | 'fast_recognition'
  | 'speaking'
  | 'pron_linked';

export interface DrillSpec {
  id: string;
  type: DrillType;
  stage: 'controlled' | 'semi_controlled' | 'free';
  prompt: string;
  items: Array<{
    cue: string;
    expected?: string;
    options?: string[];
    audioRequired?: boolean;
  }>;
  grammarTarget: string;
}

export type AcquisitionStage =
  | 'exposure'
  | 'noticing'
  | 'discovery'
  | 'form'
  | 'controlled_drill'
  | 'semi_controlled'
  | 'guided_production'
  | 'free_communication'
  | 'review';

export interface AcquisitionStep {
  stage: AcquisitionStage;
  title: string;
  description: string;
  slideKind: string; // mapped to renderer registry
  requires: string[]; // refs to formCard ids, drill ids, etc.
}

export interface GrammarTarget {
  id: string;
  label: string;             // e.g. "Past Simple — regular verbs"
  scopeTokens: string[];     // tense / auxiliary / structure markers used by validator
  appliesTo: 'tense' | 'modal' | 'structure' | 'function' | 'word_class';
}

export interface GrammarValidationIssue {
  code: string;
  severity: 'hard' | 'soft';
  message: string;
  where?: string;
}

export interface GrammarValidationReport {
  passed: boolean;
  verdict: 'pass' | 'repair' | 'block';
  issues: GrammarValidationIssue[];
  coverage: {
    formCardsComplete: boolean;
    drillTypeCount: number;
    speakingDrills: number;
    hasFreeProduction: boolean;
  };
}

export interface GrammarPackage {
  target: GrammarTarget;
  hub: Hub;
  cefr: Cefr;
  formCards: FormCard;
  highlights: HighlightToken[];          // canonical sample highlights
  acquisitionFlow: AcquisitionStep[];    // 9-stage flow
  drills: DrillSpec[];
  productionTasks: DrillSpec[];          // semi + free
  systemPrompt: string;                  // chained into pipeline
  validation: GrammarValidationReport;
  meta: {
    generatedAt: string;
    version: string;
  };
}

export interface RunGrammarInput {
  hub: Hub;
  cefr: Cefr;
  target: GrammarTarget;
  planObjective?: string;
}
