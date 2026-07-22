// Educational Intelligence Layer — assembler.
// Reads from existing tables + engines and builds a unified LearnerIntelligence.

import { supabase } from '@/integrations/supabase/client';
import type { Hub, Cefr } from '@/governance/types';
import {
  INTELLIGENCE_VERSION,
  type LearnerIntelligence,
  type MasteryVector,
  type ErrorPattern,
  type SpeakingConfidence,
  type PronunciationState,
  type ReviewItem,
  type EngagementSignals,
  type CommunicationProgress,
  type AdaptiveSupport,
  type NarrativeState,
  type ErrorCategory,
} from './types';

export interface AssembleArgs {
  studentId: string;
  hub: Hub;
  cefr?: Cefr;
}

/**
 * Read student data from existing tables and assemble a LearnerIntelligence object.
 * Falls back to safe defaults when any read fails — never throws.
 */
export async function assembleLearnerIntelligence(
  args: AssembleArgs,
): Promise<LearnerIntelligence> {
  const { studentId, hub } = args;

  const [mastery, errors, speaking, attempts, review, narrative, quality, coherence, hwAttempts, learnerSignals] = await Promise.all([
    safeSelect('student_mastery', q => q.eq('user_id', studentId).eq('hub', hub).limit(500)),
    safeSelect('mistake_repository', q => q.eq('user_id', studentId).eq('resolved', false).limit(200)),
    safeSelect('student_speaking_profiles', q => q.eq('student_id', studentId).limit(1)),
    safeSelect('speech_attempts', q => q.eq('user_id', studentId).order('created_at', { ascending: false }).limit(50)),
    safeSelect('review_queue', q => q.eq('student_id', studentId).order('due_at', { ascending: true }).limit(50)),
    safeSelect('narrative_state', q => q.eq('student_id', studentId).eq('hub', hub).limit(1)),
    safeSelect('pedagogical_quality_reports', q => q.eq('student_id', studentId).order('created_at', { ascending: false }).limit(20)),
    safeSelect('coherence_signals', q => q.eq('student_id', studentId).eq('hub', hub).limit(1)),
    safeSelect('homework_attempts', q => q.eq('student_id', studentId).order('created_at', { ascending: false }).limit(30)),
    safeSelect('learner_signals', q => q.eq('student_id', studentId).gt('decay_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(20)),
  ]);

  const mastery_map = buildMasteryMap(mastery);
  const error_patterns = buildErrorPatterns(errors);
  const speaking_confidence = buildSpeakingConfidence(speaking?.[0], attempts);
  const pronunciation_state = buildPronunciationState(attempts);
  const review_priority = buildReviewPriority(review);
  const engagement_state = buildEngagementSignals(attempts);
  const communication_progress = buildCommunicationProgress(mastery_map);
  const adaptive_support = buildAdaptiveSupport(mastery_map, engagement_state);
  const narrative_state = buildNarrativeState(narrative?.[0]);
  const quality_history = (quality ?? []).map(q => ({
    lessonId: String(q.lesson_id ?? ''),
    score: Number(q.metrics?.score ?? 0),
    at: String(q.created_at ?? new Date().toISOString()),
  }));

  const cs = coherence?.[0];
  const weakKeys = Object.values(mastery_map)
    .filter(m => m.recall < 60)
    .sort((a, b) => a.recall - b.recall)
    .slice(0, 10)
    .map(m => m.skill);
  const reinforcement_state = {
    last_homework_completion: hwAttempts?.[0]?.created_at,
    homework_streak: 0,
    game_engagement: Number(cs?.game_engagement ?? 0),
    homework_completion_rate: Number(cs?.homework_completion_rate ?? 0),
    reinforcement_coverage: Number(cs?.reinforcement_coverage ?? 0),
    weak_target_keys: weakKeys,
  };

  const cefr: Cefr = (args.cefr ?? (speaking?.[0]?.current_cefr_level as Cefr) ?? 'A1') as Cefr;

  const learner_signals = (learnerSignals ?? []).map((s: any) => ({
    type: String(s.signal_type) as any,
    severity: Number(s.severity) || 0,
    evidence: Array.isArray(s.evidence) ? s.evidence : [],
    source_lesson_id: s.source_lesson_id ?? undefined,
    decay_at: s.decay_at ?? undefined,
  }));

  return {
    learner_profile: { studentId, hub, cefr },
    mastery_map,
    error_patterns,
    speaking_confidence,
    pronunciation_state,
    review_priority,
    engagement_state,
    communication_progress,
    adaptive_support,
    narrative_state,
    quality_history,
    reinforcement_state,
    learner_signals,
    meta: { assembledAt: new Date().toISOString(), version: INTELLIGENCE_VERSION, source: 'live' },
  };
}

async function safeSelect(
  table: string,
  build: (q: ReturnType<typeof supabase.from> extends infer T ? any : any) => any,
): Promise<any[]> {
  try {
    const { data, error } = await build((supabase as any).from(table).select('*'));
    if (error) return [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function buildMasteryMap(rows: any[]): Record<string, MasteryVector> {
  const out: Record<string, MasteryVector> = {};
  for (const r of rows ?? []) {
    const key = `${r.item_type}:${r.item_key}`;
    const score = clamp(Number(r.mastery_score ?? 0), 0, 100);
    const total = Number(r.times_correct ?? 0) + Number(r.times_incorrect ?? 0);
    out[key] = {
      skill: r.item_key,
      recognition: score,
      recall: Math.max(0, score - 8),
      guided_production: Math.max(0, score - 18),
      spontaneous_production: Math.max(0, score - 32),
      fluency_consistency: Math.max(0, score - 25),
      confidence: clamp(score - 10 + Math.min(15, total * 2), 0, 100),
      exposures: total,
      last_seen: r.last_tested ?? r.updated_at,
    };
  }
  return out;
}

function buildErrorPatterns(rows: any[]): ErrorPattern[] {
  return (rows ?? []).slice(0, 50).map(r => {
    const cat = mapMistakeCategory(r.mistake_type, r.pattern_category);
    const freq = Number(r.attempts_count ?? r.frequency_score ?? 1);
    const persistence = daysBetween(r.created_at, r.updated_at ?? r.created_at);
    return {
      id: String(r.id),
      category: cat,
      surface: String(r.attempted_content ?? ''),
      target: String(r.target_content ?? ''),
      frequency: freq,
      persistence_days: persistence,
      classification:
        freq <= 1 ? 'careless' : persistence > 7 ? 'mastery_gap' : 'developmental',
      last_seen: r.updated_at ?? r.created_at ?? new Date().toISOString(),
    };
  });
}

function mapMistakeCategory(type: string | null, pattern: string | null): ErrorCategory {
  const v = `${type ?? ''} ${pattern ?? ''}`.toLowerCase();
  if (v.includes('tense')) return 'tense';
  if (v.includes('article')) return 'article';
  if (v.includes('prep')) return 'preposition';
  if (v.includes('agree')) return 'agreement';
  if (v.includes('order')) return 'word_order';
  if (v.includes('pron')) return 'pronunciation';
  if (v.includes('vocab') || v.includes('word')) return 'vocab_choice';
  if (v.includes('spell')) return 'spelling';
  return 'other';
}

function buildSpeakingConfidence(profile: any, attempts: any[]): SpeakingConfidence {
  const a = attempts ?? [];
  const recent = a.slice(0, 20);
  const avgWords =
    recent.length > 0
      ? recent.reduce((s, x) => s + String(x.transcript ?? '').split(/\s+/).filter(Boolean).length, 0) /
        recent.length
      : 0;
  const avgScore =
    recent.length > 0
      ? recent.reduce((s, x) => s + Number(x.overall_score ?? 0), 0) / recent.length
      : 0;
  const tier =
    avgScore >= 85 ? 'fluent' : avgScore >= 70 ? 'confident' : avgScore >= 50 ? 'emerging' : 'shy';
  const trend =
    recent.length >= 6
      ? avgFirstHalf(recent) < avgScore
        ? 'up'
        : avgFirstHalf(recent) > avgScore
        ? 'down'
        : 'flat'
      : 'flat';
  return {
    tier,
    voluntary_attempts_7d: recent.length,
    retry_rate: clamp(recent.filter(r => r.tier === 'soft' || r.tier === 'revert').length / Math.max(1, recent.length), 0, 1),
    hesitation_avg_ms: 0,
    avg_sentence_words: Math.round(avgWords),
    silence_ratio: 0,
    growth_trend: trend,
  };
}

function avgFirstHalf(arr: any[]): number {
  const half = arr.slice(Math.floor(arr.length / 2));
  if (half.length === 0) return 0;
  return half.reduce((s, x) => s + Number(x.overall_score ?? 0), 0) / half.length;
}

function buildPronunciationState(attempts: any[]): PronunciationState {
  const per_phoneme: PronunciationState['per_phoneme'] = {};
  const lastScore = attempts?.[0]?.pronunciation_score ?? attempts?.[0]?.overall_score;
  for (const a of (attempts ?? []).slice(0, 30)) {
    const breakdown = (a.word_breakdown ?? []) as Array<{ phoneme?: string; score?: number }>;
    if (!Array.isArray(breakdown)) continue;
    for (const w of breakdown) {
      const ph = w.phoneme;
      if (!ph) continue;
      const prev = per_phoneme[ph]?.accuracy ?? 0;
      const next = (prev + Number(w.score ?? 0)) / 2;
      per_phoneme[ph] = { accuracy: clamp(next, 0, 100), trend: next > prev ? 'up' : next < prev ? 'down' : 'flat' };
    }
  }
  const focus_targets = Object.entries(per_phoneme)
    .filter(([, v]) => v.accuracy < 65)
    .sort((a, b) => a[1].accuracy - b[1].accuracy)
    .slice(0, 5)
    .map(([k]) => k);
  return { per_phoneme, focus_targets, last_score: lastScore != null ? Number(lastScore) : undefined };
}

function buildReviewPriority(rows: any[]): ReviewItem[] {
  return (rows ?? []).map(r => ({
    item_type: String(r.item_type ?? 'vocab'),
    item_key: String(r.item_key ?? ''),
    due_at: String(r.due_at ?? new Date().toISOString()),
    priority: Number(r.priority ?? 1),
  }));
}

function buildEngagementSignals(attempts: any[]): EngagementSignals {
  const recent = (attempts ?? []).slice(0, 10);
  const avg = recent.length ? recent.reduce((s, x) => s + Number(x.overall_score ?? 0), 0) / recent.length : 70;
  const momentum: EngagementSignals['momentum'] = avg >= 75 ? 'high' : avg >= 55 ? 'medium' : 'low';
  return {
    attention_score: clamp(avg, 0, 100),
    fatigue_score: 100 - clamp(avg, 0, 100),
    momentum,
    recent_idle_count: 0,
  };
}

function buildCommunicationProgress(mastery: Record<string, MasteryVector>): CommunicationProgress {
  const items = Object.values(mastery);
  const met = items.filter(m => m.spontaneous_production >= 70).length;
  return {
    outcomes_met: met,
    outcomes_total: Math.max(items.length, met),
    real_world_tasks_completed: 0,
  };
}

function buildAdaptiveSupport(
  mastery: Record<string, MasteryVector>,
  eng: EngagementSignals,
): AdaptiveSupport {
  const avg =
    Object.values(mastery).reduce((s, m) => s + m.recognition, 0) /
    Math.max(1, Object.values(mastery).length);
  const tier = clamp(Math.round(avg / 20), 1, 5);
  return {
    current_difficulty_tier: tier,
    scaffolding_boost: eng.momentum === 'low' ? 2 : eng.momentum === 'medium' ? 1 : 0,
    pacing_hint: eng.momentum === 'low' ? 'slow_down' : eng.momentum === 'high' ? 'accelerate' : 'maintain',
    vocab_repeat_boost: 0,
  };
}

function buildNarrativeState(row: any): NarrativeState {
  if (!row) return { active_characters: [], current_arc: undefined, last_beat: undefined };
  return {
    active_characters: Array.isArray(row.active_characters) ? row.active_characters : [],
    current_arc: row.current_arc && Object.keys(row.current_arc).length > 0 ? row.current_arc : undefined,
    last_beat: row.last_beat && Object.keys(row.last_beat).length > 0 ? row.last_beat : undefined,
  };
}

function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)); }
function daysBetween(a: string, b: string) {
  try {
    const d = (new Date(b).getTime() - new Date(a).getTime()) / 86400000;
    return Math.max(0, Math.round(d));
  } catch { return 0; }
}
