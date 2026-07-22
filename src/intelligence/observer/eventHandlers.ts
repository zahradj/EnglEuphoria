// Observer event handlers — route lesson-player events into the right table.
// Used by both the in-app player (direct supabase writes) and the
// `intelligence-observer` edge function (service-role writes).

import { supabase } from '@/integrations/supabase/client';
import type { ObservationEvent } from '../types';

export async function handleObservationEvent(ev: ObservationEvent): Promise<void> {
  switch (ev.type) {
    case 'activity_complete':
      return handleActivityComplete(ev);
    case 'speaking_attempt':
      return handleSpeakingAttempt(ev);
    case 'mistake':
      return handleMistake(ev);
    case 'voluntary_speak':
      return handleVoluntarySpeak(ev);
    case 'lesson_complete':
      return handleLessonComplete(ev);
    case 'idle':
      // soft signal — no-op at table level, used by engagement scorer
      return;
  }
}

async function handleActivityComplete(ev: ObservationEvent) {
  const { skill, accuracy, item_type = 'grammar', hub } = ev.payload as any;
  if (!skill || accuracy == null) return;
  try {
    const acc = Number(accuracy);
    const correct = acc >= 70 ? 1 : 0;
    const { data: existing } = await (supabase as any)
      .from('student_mastery')
      .select('*')
      .eq('user_id', ev.studentId)
      .eq('item_key', skill)
      .eq('item_type', item_type)
      .maybeSingle();
    if (existing) {
      const tc = Number(existing.times_correct ?? 0) + correct;
      const ti = Number(existing.times_incorrect ?? 0) + (1 - correct);
      const newScore = Math.round((tc / Math.max(1, tc + ti)) * 100);
      await (supabase as any).from('student_mastery').update({
        mastery_score: newScore,
        times_correct: tc,
        times_incorrect: ti,
        last_tested: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', existing.id);
    } else {
      await (supabase as any).from('student_mastery').insert({
        user_id: ev.studentId,
        item_key: skill,
        item_type,
        hub: hub ?? ev.hub,
        mastery_score: acc,
        times_correct: correct,
        times_incorrect: 1 - correct,
        last_tested: new Date().toISOString(),
      });
    }
  } catch { /* best-effort */ }
}

async function handleSpeakingAttempt(ev: ObservationEvent) {
  const p = ev.payload as any;
  try {
    await (supabase as any).from('speech_attempts').insert({
      user_id: ev.studentId,
      lesson_id: ev.lessonId ?? null,
      slide_id: ev.slideId ?? null,
      hub: ev.hub,
      target_sentence: p.target ?? '',
      transcript: p.transcript ?? '',
      overall_score: Number(p.score ?? 0),
      accuracy_score: Number(p.accuracy ?? p.score ?? 0),
      fluency_score: Number(p.fluency ?? 0),
      pronunciation_score: Number(p.pronunciation ?? 0),
      tier: p.tier ?? (Number(p.score ?? 0) >= 85 ? 'gold' : Number(p.score ?? 0) >= 50 ? 'soft' : 'revert'),
      feedback: p.feedback ?? null,
      word_breakdown: p.word_breakdown ?? [],
    });
  } catch { /* best-effort */ }
}

async function handleMistake(ev: ObservationEvent) {
  const p = ev.payload as any;
  try {
    await (supabase as any).from('mistake_repository').insert({
      user_id: ev.studentId,
      mistake_type: p.type ?? 'other',
      target_content: p.target ?? '',
      attempted_content: p.surface ?? '',
      context: p.context ?? null,
      severity: p.severity ?? 'medium',
      source_lesson_id: ev.lessonId ?? null,
      source_slide_id: ev.slideId ?? null,
      resolved: false,
      attempts_count: 1,
      pattern_category: p.category ?? null,
      frequency_score: 1,
    });
  } catch { /* best-effort */ }
}

async function handleVoluntarySpeak(ev: ObservationEvent) {
  // Mark a bravery signal on the speaking profile (soft update).
  try {
    const { data: existing } = await (supabase as any)
      .from('student_speaking_profiles')
      .select('*')
      .eq('student_id', ev.studentId)
      .maybeSingle();
    if (!existing) {
      await (supabase as any).from('student_speaking_profiles').insert({
        student_id: ev.studentId,
        confidence_level: 'building',
      });
    } else {
      await (supabase as any).from('student_speaking_profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('student_id', ev.studentId);
    }
  } catch { /* best-effort */ }
}

async function handleLessonComplete(ev: ObservationEvent) {
  // No-op; quality aggregator writes to pedagogical_quality_reports during generation.
  return;
}
