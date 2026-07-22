/**
 * Scaffold Fading Engine
 * 
 * Reads student_mastery data and returns scaffold configuration
 * that controls difficulty/hint visibility in the Academy Hub.
 * Teacher overrides always take priority over auto-calculation.
 */

import { supabase } from '@/integrations/supabase/client';

export type ScaffoldLevel = 'heavy' | 'medium' | 'light' | 'independent';

export interface ScaffoldConfig {
  level: ScaffoldLevel;
  isTeacherOverride: boolean;
  overrideNotes?: string;

  // Phonics layer
  showPhoneticWaveform: boolean;
  showMouthAnimation: boolean;
  wizardLeadsPhonics: boolean;

  // Vocabulary layer
  showLabeledImages: boolean;    // true = full labels, false = Ghost Vectors
  ghostVectorFrequency: number;  // 0-1, how often silhouettes appear
  showWordHints: boolean;

  // Grammar layer
  grammarSlotCount: 'single' | 'multi' | 'full';
  showGrammarFormula: boolean;
  showArticleHints: boolean;

  // Four-skill weights
  skillWeights: {
    listening: number;
    speaking: number;
    reading: number;
    writing: number;
  };

  // Scores for display
  scores: {
    phonics: number;
    vocab: number;
    grammar: number;
    listening: number;
    speaking: number;
    reading: number;
    writing: number;
  };
}

const DEFAULT_CONFIG: ScaffoldConfig = {
  level: 'heavy',
  isTeacherOverride: false,
  showPhoneticWaveform: true,
  showMouthAnimation: true,
  wizardLeadsPhonics: true,
  showLabeledImages: true,
  ghostVectorFrequency: 0,
  showWordHints: true,
  grammarSlotCount: 'single',
  showGrammarFormula: true,
  showArticleHints: true,
  skillWeights: { listening: 0.4, speaking: 0.4, reading: 0.1, writing: 0.1 },
  scores: { phonics: 0, vocab: 0, grammar: 0, listening: 0, speaking: 0, reading: 0, writing: 0 },
};

/**
 * Fetches the scaffold configuration for a student in a given unit.
 * Returns default "heavy" scaffold if no mastery data exists.
 */
export async function getScaffoldConfig(
  studentId: string,
  unitId: string
): Promise<ScaffoldConfig> {
  const { data, error } = await supabase
    .from('student_mastery')
    .select('*')
    .eq('student_id', studentId)
    .eq('unit_id', unitId)
    .maybeSingle();

  if (error || !data) {
    return { ...DEFAULT_CONFIG };
  }

  const scores = {
    phonics: Number(data.phonics_score) || 0,
    vocab: Number(data.vocab_score) || 0,
    grammar: Number(data.grammar_score) || 0,
    listening: Number(data.listening_score) || 0,
    speaking: Number(data.speaking_score) || 0,
    reading: Number(data.reading_score) || 0,
    writing: Number(data.writing_score) || 0,
  };

  const level = (data.teacher_override_scaffold || data.scaffold_level || 'heavy') as ScaffoldLevel;

  return buildConfigFromLevel(level, scores, {
    isTeacherOverride: !!data.teacher_override_scaffold,
    overrideNotes: data.teacher_override_notes || undefined,
  });
}

/**
 * Builds the full scaffold config from a level and scores.
 */
function buildConfigFromLevel(
  level: ScaffoldLevel,
  scores: ScaffoldConfig['scores'],
  meta: { isTeacherOverride: boolean; overrideNotes?: string }
): ScaffoldConfig {
  switch (level) {
    case 'heavy':
      return {
        level,
        ...meta,
        showPhoneticWaveform: true,
        showMouthAnimation: true,
        wizardLeadsPhonics: true,
        showLabeledImages: true,
        ghostVectorFrequency: 0,
        showWordHints: true,
        grammarSlotCount: 'single',
        showGrammarFormula: true,
        showArticleHints: true,
        skillWeights: { listening: 0.4, speaking: 0.4, reading: 0.1, writing: 0.1 },
        scores,
      };

    case 'medium':
      return {
        level,
        ...meta,
        showPhoneticWaveform: true,
        showMouthAnimation: scores.phonics < 70,
        wizardLeadsPhonics: false,
        showLabeledImages: scores.vocab < 60,
        ghostVectorFrequency: 0.3,
        showWordHints: scores.vocab < 70,
        grammarSlotCount: 'multi',
        showGrammarFormula: true,
        showArticleHints: scores.grammar < 70,
        skillWeights: { listening: 0.3, speaking: 0.3, reading: 0.2, writing: 0.2 },
        scores,
      };

    case 'light':
      return {
        level,
        ...meta,
        showPhoneticWaveform: scores.phonics < 90,
        showMouthAnimation: false,
        wizardLeadsPhonics: false,
        showLabeledImages: false,
        ghostVectorFrequency: 0.6,
        showWordHints: false,
        grammarSlotCount: 'full',
        showGrammarFormula: scores.grammar < 80,
        showArticleHints: false,
        skillWeights: { listening: 0.2, speaking: 0.2, reading: 0.3, writing: 0.3 },
        scores,
      };

    case 'independent':
      return {
        level,
        ...meta,
        showPhoneticWaveform: false,
        showMouthAnimation: false,
        wizardLeadsPhonics: false,
        showLabeledImages: false,
        ghostVectorFrequency: 0.8,
        showWordHints: false,
        grammarSlotCount: 'full',
        showGrammarFormula: false,
        showArticleHints: false,
        skillWeights: { listening: 0.15, speaking: 0.15, reading: 0.35, writing: 0.35 },
        scores,
      };
  }
}

/**
 * Updates a student's mastery scores for a specific unit.
 */
export async function updateMasteryScores(
  studentId: string,
  unitId: string,
  scores: Partial<ScaffoldConfig['scores']>
): Promise<boolean> {
  const updateData: Record<string, number> = {};
  if (scores.phonics !== undefined) updateData.phonics_score = scores.phonics;
  if (scores.vocab !== undefined) updateData.vocab_score = scores.vocab;
  if (scores.grammar !== undefined) updateData.grammar_score = scores.grammar;
  if (scores.listening !== undefined) updateData.listening_score = scores.listening;
  if (scores.speaking !== undefined) updateData.speaking_score = scores.speaking;
  if (scores.reading !== undefined) updateData.reading_score = scores.reading;
  if (scores.writing !== undefined) updateData.writing_score = scores.writing;

  const { error } = await supabase
    .from('student_mastery')
    .upsert(
      { student_id: studentId, unit_id: unitId, ...updateData },
      { onConflict: 'student_id,unit_id' }
    );

  return !error;
}

/**
 * Teacher sets a manual scaffold override for a student.
 */
export async function setTeacherOverride(
  studentId: string,
  unitId: string,
  scaffoldLevel: ScaffoldLevel | null,
  notes?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('student_mastery')
    .upsert(
      {
        student_id: studentId,
        unit_id: unitId,
        teacher_override_scaffold: scaffoldLevel,
        teacher_override_notes: notes || null,
      },
      { onConflict: 'student_id,unit_id' }
    );

  return !error;
}

/**
 * Detects systematic gaps (e.g., high listening but low writing).
 */
export function detectSystematicGaps(scores: ScaffoldConfig['scores']): Array<{
  gap: string;
  highSkill: string;
  lowSkill: string;
  recommendation: string;
}> {
  const gaps: Array<{ gap: string; highSkill: string; lowSkill: string; recommendation: string }> = [];
  const threshold = 25; // minimum difference to flag as gap

  if (scores.listening - scores.writing > threshold) {
    gaps.push({
      gap: 'Listening-Writing',
      highSkill: 'Listening',
      lowSkill: 'Writing',
      recommendation: 'Student recognizes sounds but cannot write them. Schedule more Tactile Tracing activities.',
    });
  }

  if (scores.speaking - scores.reading > threshold) {
    gaps.push({
      gap: 'Speaking-Reading',
      highSkill: 'Speaking',
      lowSkill: 'Reading',
      recommendation: 'Student can pronounce but struggles with grapheme recognition. Add more Slot Decoding exercises.',
    });
  }

  if (scores.phonics - scores.grammar > threshold) {
    gaps.push({
      gap: 'Phonics-Grammar',
      highSkill: 'Phonics',
      lowSkill: 'Grammar',
      recommendation: 'Advance Phonics, repeat Grammar. Focus on multi-slot Building Block activities.',
    });
  }

  if (scores.vocab - scores.speaking > threshold) {
    gaps.push({
      gap: 'Vocabulary-Speaking',
      highSkill: 'Vocabulary',
      lowSkill: 'Speaking',
      recommendation: 'Student knows words passively but cannot produce them. Increase Phonetic Mirroring time.',
    });
  }

  return gaps;
}
