// Delayed-feedback protocol for Speaking Missions (TBLT / ESA Activate phase).
//
// During a speaking task, errors are NEVER surfaced to the student in real time.
// They are buffered here, then drained by the next Study/Language-Focus slide,
// which spawns targeted grammar_sort or sentence_builder activities.
//
// Persistence: best-effort write to mistake_repository with surface_at='study_phase'.
// Pure module. Safe to import from UI code.

import { supabase } from '@/integrations/supabase/client';

export type SpeakingErrorKind =
  | 'grammar'
  | 'pronunciation'
  | 'word_choice'
  | 'word_order'
  | 'tense'
  | 'plural'
  | 'article';

export interface BufferedSpeakingError {
  sessionId: string;
  studentId?: string;
  utterance: string;
  expected?: string;
  kind: SpeakingErrorKind;
  rule?: string;       // e.g. "third_person_s"
  vocabKey?: string;   // related target word
  ts: number;
}

const BUFFERS = new Map<string, BufferedSpeakingError[]>();

/** Buffer an error mid-mission. Does NOT interrupt the student. */
export function bufferError(err: BufferedSpeakingError): void {
  const list = BUFFERS.get(err.sessionId) ?? [];
  list.push(err);
  BUFFERS.set(err.sessionId, list);

  // Fire-and-forget persistence; ignore failures.
  if (err.studentId) {
    void supabase.from('mistake_repository').insert({
      student_id: err.studentId,
      session_id: err.sessionId,
      mistake_text: err.utterance,
      expected_text: err.expected ?? null,
      mistake_type: err.kind,
      rule_key: err.rule ?? null,
      vocab_key: err.vocabKey ?? null,
      surface_at: 'study_phase',
      created_at: new Date(err.ts).toISOString(),
    }).then(() => undefined, () => undefined);
  }
}

export interface DrainedErrors {
  byKind: Record<SpeakingErrorKind, BufferedSpeakingError[]>;
  byRule: Record<string, BufferedSpeakingError[]>;
  total: number;
}

/** Drain errors for the next Study phase. Clears the buffer for that session. */
export function drainErrorsForStudyPhase(sessionId: string): DrainedErrors {
  const list = BUFFERS.get(sessionId) ?? [];
  BUFFERS.delete(sessionId);

  const byKind = {} as DrainedErrors['byKind'];
  const byRule: Record<string, BufferedSpeakingError[]> = {};
  for (const e of list) {
    (byKind[e.kind] ||= []).push(e);
    if (e.rule) (byRule[e.rule] ||= []).push(e);
  }
  return { byKind, byRule, total: list.length };
}

/** Inspect without draining — for HUDs. */
export function peekErrors(sessionId: string): number {
  return BUFFERS.get(sessionId)?.length ?? 0;
}

/**
 * Translate drained errors into a recommended remediation activity type
 * for the next Study slide. Deterministic, no randomness.
 */
export function recommendRemediationActivity(
  drained: DrainedErrors,
): 'grammar_sort' | 'sentence_builder' | 'substitution_drill' | 'none' {
  if (drained.total === 0) return 'none';
  const tense = drained.byKind.tense?.length ?? 0;
  const order = drained.byKind.word_order?.length ?? 0;
  const grammar = drained.byKind.grammar?.length ?? 0;
  if (tense >= 2) return 'substitution_drill';
  if (order >= 2) return 'sentence_builder';
  if (grammar >= 1) return 'grammar_sort';
  return 'sentence_builder';
}
