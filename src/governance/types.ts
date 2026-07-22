// Curriculum Governance — shared types.
// Pure TS. No React, no Supabase. Safe to import from edge functions if needed.

export type Cefr = 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export type Hub = 'playground' | 'academy' | 'success';

export interface GrammarPolicy {
  target_grammar: string[];
  review_grammar: string[];
  blocked_grammar: string[];
  exposure_grammar: string[];
}

export interface VocabPolicy {
  theme: string;
  target_vocab: string[];
  support_vocab: string[];
  recycled_vocab: string[];
  forbidden_vocab_categories: string[];
}

export interface ThemePolicy {
  theme: string;
  characters: string[];
  tone: string;
  communication_goal: string;
  setting: string;
}

export interface LessonState {
  hub: Hub;
  cefr: Cefr;
  grammar: GrammarPolicy;
  vocab: VocabPolicy;
  theme: ThemePolicy;
  sequence_template?: string[]; // e.g. ['hook','context','input','discovery','controlled','communicative','reflection']
}

export type GovernanceSeverity = 'error' | 'warning';
export type GovernanceEngine =
  | 'grammar'
  | 'vocab'
  | 'theme'
  | 'cefr'
  | 'sequence'
  | 'quality';

export interface GovernanceIssue {
  engine: GovernanceEngine;
  severity: GovernanceSeverity;
  code: string;          // machine-readable, e.g. 'BLOCKED_GRAMMAR'
  message: string;       // human-readable, surfaced in the report panel
  slideIndex?: number;   // when applicable
  detail?: unknown;      // optional extra debug payload
}

export interface GovernanceReport {
  passed: boolean;       // false if any 'error' issues
  errors: GovernanceIssue[];
  warnings: GovernanceIssue[];
  ranAt: string;         // ISO timestamp
  stateHash?: string;    // for cache invalidation in repair pipeline
}

export interface Slide {
  // Loose shape — engines defensively probe common fields.
  slide_type?: string;
  type?: string;
  title?: string;
  text?: string;
  prompt?: string;
  content?: any;
  activity?: any;
  // Anything else.
  [k: string]: any;
}
