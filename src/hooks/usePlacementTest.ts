import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { evaluateStudentLevel, getStudentDashboardRoute, determineStudentLevel } from '@/hooks/useStudentLevel';
import {
  HUB_SKILL_PROFILE,
  CEFR_TO_SCORE,
  CEFR_BAND_CEILING,
  scoreToCefr,
  nextCefr,
  clamp,
} from '@/hooks/useStudentSkills';
import type { TestResult } from '@/components/placement/TestPhase';

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

const LEVEL_ORDER: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

/**
 * Legacy proportional band — kept as a fallback when results carry no
 * per-question `targetLevel` metadata. Tightened so C1 demands near-perfect.
 *  0–3   → A1   4–6 → A2   7–9 → B1   10–13 → B2   14–15 → C1
 */
export function calculateCefrLevel(correctCount: number, totalQuestions: number): CefrLevel {
  const scaled = totalQuestions === 15
    ? correctCount
    : Math.round((correctCount / Math.max(totalQuestions, 1)) * 15);

  if (scaled <= 3) return 'A1';
  if (scaled <= 6) return 'A2';
  if (scaled <= 9) return 'B1';
  if (scaled <= 13) return 'B2';
  return 'C1';
}

/**
 * Smart band-based CEFR placement. The student is placed at the **highest**
 * level L where they answered ≥60% of items targeting L correctly AND got at
 * least one item at L right. Prevents false C1 inflation from racking up
 * easy A1/A2/B1 correct answers — to be C1 you must actually solve C1 items.
 */
export function calculateCefrFromResults(results: TestResult[]): CefrLevel {
  const tagged = results.filter(r => r.targetLevel && LEVEL_ORDER.includes(r.targetLevel as CefrLevel));
  if (tagged.length === 0) {
    const correct = results.filter(r => r.isCorrect).length;
    return calculateCefrLevel(correct, results.length);
  }

  const stats: Record<CefrLevel, { total: number; correct: number }> = {
    A1: { total: 0, correct: 0 }, A2: { total: 0, correct: 0 },
    B1: { total: 0, correct: 0 }, B2: { total: 0, correct: 0 },
    C1: { total: 0, correct: 0 },
  };
  for (const r of tagged) {
    const lvl = r.targetLevel as CefrLevel;
    stats[lvl].total += 1;
    if (r.isCorrect) stats[lvl].correct += 1;
  }

  // Walk top → down, return the highest level with ≥60% accuracy and ≥1 correct.
  for (const lvl of [...LEVEL_ORDER].reverse()) {
    const s = stats[lvl];
    if (s.total === 0) continue;
    const acc = s.correct / s.total;
    if (acc >= 0.6 && s.correct >= 1) return lvl;
  }
  return 'A1';
}

/**
 * Derives a REAL per-skill score for each of the hub's 5 radar categories
 * from the student's actual answered questions (grouped by TestResult.skill),
 * instead of copying one overall score onto every category — which is what
 * made every skill on the Skills Radar show an identical value before this
 * fix. A category with zero answered items falls back to the overall band
 * (shouldn't happen once buildPlacementBank's coverage guarantee is in
 * place, but stays honest if it ever does).
 */
function computeSkillRowsFromResults(
  results: TestResult[],
  hub: 'academy' | 'professional',
  overallCefrLabel: string,
) {
  const skillNames = Object.keys(HUB_SKILL_PROFILE[hub].labels);
  const nextFocusMap = HUB_SKILL_PROFILE[hub].nextFocus;
  const baseScore = CEFR_TO_SCORE[overallCefrLabel] ?? 3;
  const bandCeiling = CEFR_BAND_CEILING[overallCefrLabel] ?? 10;

  return skillNames.map((skillName) => {
    const items = results.filter((r) => r.skill === skillName);

    let score: number;
    if (items.length === 0) {
      score = baseScore;
    } else {
      const avgItemScore = items.reduce(
        (s, r) => s + (CEFR_TO_SCORE[r.targetLevel ?? ''] ?? baseScore), 0,
      ) / items.length;
      const accuracy = items.filter((r) => r.isCorrect).length / items.length;
      // Nudge the item-level average toward how well they actually did on
      // those specific items (±1.5 at the extremes of accuracy).
      score = avgItemScore + (accuracy - 0.5) * 3;
    }

    // Hard ceiling: no skill may claim a band above the authoritative overall
    // placement result.
    score = clamp(Math.round(score * 10) / 10, 0, bandCeiling);
    const currentBand = scoreToCefr(score);
    const targetBand = nextCefr(currentBand);
    const targetScore = clamp(CEFR_TO_SCORE[targetBand] ?? score + 2, score + 0.5, 10);

    return {
      skill_name: skillName,
      current_score: score,
      target_score: Math.round(targetScore * 10) / 10,
      cefr_equivalent: currentBand,
      next_focus: nextFocusMap[skillName] ?? null,
    };
  });
}

export function cefrLevelLabel(cefr: CefrLevel): string {
  switch (cefr) {
    case 'A1': return 'A1 (Beginner)';
    case 'A2': return 'A2 (Elementary)';
    case 'B1': return 'B1 (Intermediate)';
    case 'B2': return 'B2 (Upper Intermediate)';
    case 'C1': return 'C1 (Advanced)';
  }
}

export function usePlacementTest() {
  const { user } = useAuth();

  const completeTest = async (
    age: number,
    results: TestResult[],
    interests: string[] = [],
    learningReason: string = ''
  ): Promise<string> => {
    if (!user?.id) throw new Error('User not authenticated');

    const correctCount = results.filter(r => r.isCorrect).length;
    const total = results.length;
    const score = Math.round((correctCount / Math.max(total, 1)) * 100);
    const avgComplexity = results.reduce((acc, r) => acc + r.difficulty, 0) / Math.max(total, 1);

    const cefrLevel = calculateCefrFromResults(results);
    const { level, track } = evaluateStudentLevel(age, correctCount, total, avgComplexity);

    const completedAt = new Date().toISOString();
    const upsertData: Record<string, unknown> = {
      user_id: user.id,
      student_level: level,
      hub_type: level, // MyPathPage / dashboard router read hub_type
      cefr_level: cefrLevel,
      onboarding_completed: true,
      placement_test_score: score,
      placement_test_total: total,
      placement_test_completed_at: completedAt,
      age: age || null,
    };

    if (interests.length > 0) {
      upsertData.interests = interests;
    }
    // Map UI goal labels (e.g. "Work / Business", "School / Exams") to the
    // db CHECK constraint values: 'school' | 'career' | 'travel' | 'fun'.
    const reasonMap: Record<string, string> = {
      'travel': 'travel',
      'work / business': 'career',
      'work': 'career',
      'business': 'career',
      'career': 'career',
      'school / exams': 'school',
      'school': 'school',
      'exams': 'school',
      'fun / social': 'fun',
      'fun': 'fun',
      'social': 'fun',
    };
    const normalizedReason = learningReason
      ? reasonMap[learningReason.trim().toLowerCase()]
      : undefined;
    if (normalizedReason) {
      upsertData.learning_reason = normalizedReason;
    }

    // Use upsert so this works even if the signup row was never created
    // (prevents a silent no-op that re-triggers the placement gatekeeper loop).
    const { error } = await supabase
      .from('student_profiles')
      .upsert(upsertData as any, { onConflict: 'user_id' });

    if (error) {
      console.error('[usePlacementTest] Failed to persist placement result:', error, upsertData);
      throw new Error(error.message || 'Could not save your placement result.');
    }

    // Best-effort verify — but DO NOT throw on a stale replica read.
    // The upsert already succeeded above; throwing here was triggering a
    // false "popup again with error" loop on the playground placement test.
    try {
      const { data: verify } = await supabase
        .from('student_profiles')
        .select('placement_test_completed_at')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!verify?.placement_test_completed_at) {
        console.warn('[usePlacementTest] Verify read did not yet see completed_at (stale replica). Continuing.');
      }
    } catch (verifyErr) {
      console.warn('[usePlacementTest] Verify read failed (non-fatal):', verifyErr);
    }

    // Best-effort write to placement_results so the Success Skills Radar and
    // other consumers see the authoritative band immediately. Also mirror the
    // CEFR to the users row (source-of-truth for routing & profile display).
    try {
      const hub = level === 'professional' ? 'professional' : level === 'academy' ? 'academy' : 'playground';
      await supabase.from('placement_results').insert({
        student_id: user.id,
        method: 'ai_full',
        cefr_level: cefrLevel,
        hub,
        ability_theta: Math.max(-3, Math.min(3, (score - 50) / 25)),
        standard_error: 0.5,
        items_answered: total,
        trail: results as any,
        duration_seconds: 0,
      });
    } catch (e) {
      console.warn('[usePlacementTest] placement_results insert failed (non-fatal)', e);
    }
    try {
      await supabase.from('users').update({ cefr_level: cefrLevel }).eq('id', user.id);
    } catch (e) {
      console.warn('[usePlacementTest] users.cefr_level update failed (non-fatal)', e);
    }

    // Best-effort write of REAL per-skill scores derived from the student's
    // actual answered questions (grouped by TestResult.skill), so the Skills
    // Radar shows genuine measurement instead of one overall score copied
    // onto all 5 categories. Playground has no per-skill radar, so skip it.
    if (level === 'academy' || level === 'professional') {
      try {
        const rows = computeSkillRowsFromResults(results, level, cefrLevel).map((r) => ({
          student_id: user.id,
          ...r,
        }));
        const { error: skillsErr } = await supabase
          .from('student_skills')
          .upsert(rows, { onConflict: 'student_id,skill_name' });
        if (skillsErr) console.warn('[usePlacementTest] per-skill upsert failed (non-fatal)', skillsErr);
      } catch (e) {
        console.warn('[usePlacementTest] per-skill upsert threw (non-fatal)', e);
      }
    }

    // After placement, hand the student off to the My Path reveal page —
    // the dashboard router is no longer the immediate destination.
    return '/dashboard/my-path';
  };

  return { completeTest, determineStudentLevel, calculateCefrLevel, calculateCefrFromResults };
}
