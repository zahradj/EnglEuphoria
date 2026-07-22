import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentLevel } from '@/hooks/useStudentLevel';

type Hub = 'playground' | 'academy' | 'professional';

interface StudentSkill {
  skill: string;
  skillLabel: string;
  current: number;
  target: number;
  cefrEquivalent: string;
  nextFocus: string | null;
}

export interface SkillPlanStep {
  skill: string;
  skillLabel: string;
  focus: string;
  gap: number;          // 0..10 — how far from target
  priority: number;     // 1 = most urgent
  rationale: string;
}

// Hub-specific skill profile + next-focus copy. Exported so the placement
// test (usePlacementTest.ts completeTest()) can write real per-skill
// scores using the exact same labels/keys this hook reads back — one source
// of truth instead of two copies drifting apart.
export const HUB_SKILL_PROFILE: Record<Hub, {
  labels: Record<string, string>;
  nextFocus: Record<string, string>;
  // Free-text aliases the placement test / strengths/gaps arrays may use,
  // mapped onto canonical skill keys for this hub.
  aliasMap: Record<string, string>;
}> = {
  playground: {
    labels: {
      vocabulary: 'Word Power',
      speaking: 'Speaking',
      listening: 'Listening',
      phonics: 'Sounds & Letters',
      reading: 'Reading',
    },
    nextFocus: {
      vocabulary: 'New Themed Word Sets',
      speaking: 'Say-it-Back Challenges',
      listening: 'Sound Spotting Games',
      phonics: 'Tricky Letter Blends',
      reading: 'Storybook Sight Words',
    },
    aliasMap: {
      words: 'vocabulary', wordpower: 'vocabulary', vocab: 'vocabulary',
      sounds: 'phonics', letters: 'phonics',
      talk: 'speaking', pronunciation: 'speaking',
      listen: 'listening', hearing: 'listening',
      read: 'reading', sightwords: 'reading',
    },
  },
  academy: {
    labels: {
      vocabulary: 'Vocabulary',
      speaking: 'Speaking & Fluency',
      listening: 'Listening',
      grammar: 'Grammar',
      writing: 'Writing',
      reading: 'Reading',
    },
    nextFocus: {
      vocabulary: 'Topic-Based Word Banks',
      speaking: 'Debate & Opinion Practice',
      listening: 'Authentic Media Clips',
      grammar: 'Tense Mastery',
      writing: 'Paragraph Structure',
      reading: 'Longer Passage Comprehension',
    },
    aliasMap: {
      vocab: 'vocabulary', words: 'vocabulary',
      fluency: 'speaking', talk: 'speaking', pronunciation: 'speaking',
      listen: 'listening',
      write: 'writing',
      tenses: 'grammar', syntax: 'grammar',
      read: 'reading', comprehension: 'reading',
    },
  },
  professional: {
    labels: {
      professional_vocabulary: 'Professional Vocabulary',
      fluency: 'Fluency',
      grammar_accuracy: 'Grammar Accuracy',
      business_writing: 'Business Writing',
      listening: 'Listening',
      reading: 'Reading',
    },
    nextFocus: {
      professional_vocabulary: 'Industry-Specific Terminology',
      fluency: 'Spontaneous Conversation Practice',
      grammar_accuracy: 'Complex Sentence Structures',
      business_writing: 'Email Etiquette',
      listening: 'Conference Call Comprehension',
      reading: 'Report & Memo Analysis',
    },
    aliasMap: {
      vocabulary: 'professional_vocabulary', vocab: 'professional_vocabulary',
      words: 'professional_vocabulary', terminology: 'professional_vocabulary',
      speaking: 'fluency', conversation: 'fluency', pronunciation: 'fluency',
      grammar: 'grammar_accuracy', accuracy: 'grammar_accuracy', tenses: 'grammar_accuracy',
      writing: 'business_writing', email: 'business_writing', report: 'business_writing',
      listen: 'listening', comprehension: 'listening',
      read: 'reading',
    },
  },
};

export const CEFR_ORDER = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
// CEFR → 0..10 baseline.
export const CEFR_TO_SCORE: Record<string, number> = {
  'Pre-A1': 1, 'A1': 2.5, 'A2': 4, 'B1': 5.5, 'B2': 7, 'C1': 8.5, 'C2': 10,
};

export const normalizeCefr = (raw: string | null | undefined): string => {
  const v = String(raw ?? '').trim().toUpperCase().replace(/\s+/g, '');
  if (v === 'PRE-A1' || v === 'PREA1') return 'Pre-A1';
  if (CEFR_ORDER.includes(v as any)) return v;
  return '';
};

export const scoreToCefr = (score: number): string => {
  if (score >= 9.5) return 'C2';
  if (score >= 8)   return 'C1';
  if (score >= 6.5) return 'B2';
  if (score >= 5)   return 'B1';
  if (score >= 3.5) return 'A2';
  if (score >= 2)   return 'A1';
  return 'Pre-A1';
};

// Top of each CEFR band on the 0..10 scale (just below the next band's floor).
// Used to clamp per-skill scores so no skill ever lands a band ABOVE the
// student's authoritative placement-test CEFR.
export const CEFR_BAND_CEILING: Record<string, number> = {
  'Pre-A1': 1.9, 'A1': 3.4, 'A2': 4.9, 'B1': 6.4, 'B2': 7.9, 'C1': 9.4, 'C2': 10,
};


export const nextCefr = (cefr: string): string => {
  const idx = CEFR_ORDER.indexOf(cefr);
  return idx >= 0 && idx < CEFR_ORDER.length - 1 ? CEFR_ORDER[idx + 1] : 'C2';
};

export const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// Map a free-text strength/gap token (e.g. "vocab", "speaking & fluency") onto
// a canonical skill key for this hub. Returns null if no match.
const aliasResolve = (
  token: string,
  skillNames: string[],
  aliasMap: Record<string, string>,
): string | null => {
  const clean = token.toLowerCase().replace(/[^a-z]+/g, '');
  if (!clean) return null;
  if (skillNames.includes(clean)) return clean;
  if (aliasMap[clean]) return aliasMap[clean];
  // partial match on skill name
  const hit = skillNames.find((n) => n.replace(/_/g, '').includes(clean) || clean.includes(n.replace(/_/g, '')));
  return hit ?? null;
};

export const useStudentSkills = () => {
  const { user } = useAuth();
  const { studentLevel } = useStudentLevel();
  const hub: Hub = (studentLevel as Hub) || 'professional';
  const profile = HUB_SKILL_PROFILE[hub];
  const SKILL_LABELS = profile.labels;
  const NEXT_FOCUS_MAP = profile.nextFocus;
  const ALIAS_MAP = profile.aliasMap;
  const SKILL_NAMES = useMemo(() => Object.keys(SKILL_LABELS), [SKILL_LABELS]);

  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [overallCefr, setOverallCefr] = useState<string>('');
  const [percentToNext, setPercentToNext] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchAndSync = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    try {
      // 1. Pull placement + profile in parallel.
      const [placementRes, profileRes, skillsRes] = await Promise.all([
        supabase
          .from('placement_results')
          .select('cefr_level, ability_theta, created_at, hub')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('student_profiles')
          .select('final_cefr_level, cefr_level, strengths, gaps, placement_test_score, placement_test_total, placement_test_completed_at')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('student_skills')
          .select('*')
          .eq('student_id', user.id)
          .in('skill_name', SKILL_NAMES),
      ]);

      const placement = (placementRes as any)?.data ?? null;
      const profileRow = (profileRes as any)?.data ?? null;
      const existingSkills = ((skillsRes as any)?.data ?? []) as any[];

      // 2. Resolve overall CEFR — priority: placement_results > final_cefr_level > cefr_level > test ratio.
      let resolvedCefr = normalizeCefr(placement?.cefr_level)
        || normalizeCefr(profileRow?.final_cefr_level)
        || normalizeCefr(profileRow?.cefr_level);

      if (!resolvedCefr && profileRow?.placement_test_score && profileRow?.placement_test_total) {
        const ratio = profileRow.placement_test_score / profileRow.placement_test_total;
        resolvedCefr = scoreToCefr(ratio * 10);
      }
      if (!resolvedCefr) resolvedCefr = 'A1';

      const baseScore = CEFR_TO_SCORE[resolvedCefr] ?? 3;

      // 3. Decide whether to re-sync from placement.
      const placementAt = placement?.created_at ? new Date(placement.created_at).getTime() : 0;
      const newestSkillAt = existingSkills.reduce(
        (acc: number, r: any) => Math.max(acc, r?.updated_at ? new Date(r.updated_at).getTime() : 0),
        0,
      );
      const hasAllSkills = existingSkills.length === SKILL_NAMES.length;
      const placementIsNewer = placementAt > newestSkillAt;
      // NOTE: this used to also force a re-sync whenever any stored skill's
      // CEFR band sat ABOVE the resolved overall level, on the assumption
      // that could only mean stale/legacy fabricated data. That assumption
      // broke once the placement test started writing REAL per-skill scores
      // (see usePlacementTest.ts computeSkillRowsFromResults): a student can
      // genuinely score higher on, say, business_writing than the
      // conservative overall CEFR walk-down suggests, and that divergence is
      // exactly the point of a per-skill radar — it must not be silently
      // overwritten with a fabricated uniform score. Freshness (below) is
      // the correct signal for staleness, not divergence from the overall band.
      const needsSync = !hasAllSkills || placementIsNewer;

      // 4. Build smart per-skill scores when syncing.
      let nextSkills: StudentSkill[];

      if (needsSync) {
        // Resolve strengths/gaps onto canonical skill keys.
        const strengthSkills = new Set<string>();
        const gapSkills = new Set<string>();
        for (const s of (profileRow?.strengths ?? []) as string[]) {
          const m = aliasResolve(s, SKILL_NAMES, ALIAS_MAP);
          if (m) strengthSkills.add(m);
        }
        for (const g of (profileRow?.gaps ?? []) as string[]) {
          const m = aliasResolve(g, SKILL_NAMES, ALIAS_MAP);
          if (m) gapSkills.add(m);
        }

        // Per-skill ability bias from IRT theta (-3..+3 → roughly -1..+1).
        const theta = Number(placement?.ability_theta ?? 0);
        const thetaBias = clamp(theta / 3, -1, 1);

        // Hard ceiling: no per-skill score may cross into a CEFR band ABOVE
        // the authoritative placement-test level. Strengths can sit at the
        // top of the resolved band, gaps drop into lower bands, but the
        // radar can never claim the student is C1 when the profile says B2.
        const bandCeiling = CEFR_BAND_CEILING[resolvedCefr] ?? 10;

        const rows = SKILL_NAMES.map((name) => {
          let score = baseScore + thetaBias;
          if (strengthSkills.has(name)) score += 1.2;
          if (gapSkills.has(name)) score -= 1.2;
          score = clamp(Math.round(score * 10) / 10, 0, bandCeiling);


          // Target = next CEFR band ceiling, capped at 10.
          const currentBand = scoreToCefr(score);
          const targetBand = nextCefr(currentBand);
          const targetScore = clamp((CEFR_TO_SCORE[targetBand] ?? score + 2), score + 0.5, 10);

          return {
            student_id: user.id,
            skill_name: name,
            current_score: score,
            target_score: Math.round(targetScore * 10) / 10,
            cefr_equivalent: currentBand,
            next_focus: NEXT_FOCUS_MAP[name] || null,
          };
        });

        // Upsert all 5 skills so re-taking the placement test re-syncs the radar.
        await supabase
          .from('student_skills')
          .upsert(rows, { onConflict: 'student_id,skill_name' });

        nextSkills = rows.map((r) => ({
          skill: r.skill_name,
          skillLabel: SKILL_LABELS[r.skill_name] || r.skill_name,
          current: r.current_score,
          target: r.target_score,
          cefrEquivalent: r.cefr_equivalent,
          nextFocus: r.next_focus,
        }));
      } else {
        nextSkills = existingSkills
          .map((row: any) => ({
            skill: row.skill_name,
            skillLabel: SKILL_LABELS[row.skill_name] || row.skill_name,
            current: Number(row.current_score),
            target: Number(row.target_score),
            cefrEquivalent: row.cefr_equivalent || scoreToCefr(Number(row.current_score)),
            nextFocus: row.next_focus,
          }))
          .sort((a, b) => SKILL_NAMES.indexOf(a.skill) - SKILL_NAMES.indexOf(b.skill));
      }

      // 5. Overall CEFR badge = AUTHORITATIVE level from placement_results /
      // profile (resolvedCefr). Never recompute from the per-skill average —
      // a small theta bias can otherwise push the badge a whole band above
      // what the student sees in their Profile tab (e.g. profile B2 → radar C1).
      // % to next band is derived from how far the skill average sits within
      // the resolved band's range.
      const avg = nextSkills.length
        ? nextSkills.reduce((s, x) => s + x.current, 0) / nextSkills.length
        : baseScore;
      const overall = resolvedCefr;
      const overallNext = nextCefr(overall);
      const lo = CEFR_TO_SCORE[overall] ?? 0;
      const hi = CEFR_TO_SCORE[overallNext] ?? 10;
      const pct = hi > lo ? clamp(Math.round(((avg - lo) / (hi - lo)) * 100), 0, 100) : 0;

      setSkills(nextSkills);
      setOverallCefr(overall);
      setPercentToNext(pct);
    } catch (err) {
      console.error('useStudentSkills error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, hub, SKILL_NAMES, SKILL_LABELS, NEXT_FOCUS_MAP, ALIAS_MAP]);

  useEffect(() => { fetchAndSync(); }, [fetchAndSync]);

  // 6. Strategic plan: rank skills by gap (target - current), weakest first.
  const plan: SkillPlanStep[] = useMemo(() => {
    return [...skills]
      .map((s) => ({
        skill: s.skill,
        skillLabel: s.skillLabel,
        focus: s.nextFocus || NEXT_FOCUS_MAP[s.skill] || 'Practice & review',
        gap: Math.max(0, Math.round((s.target - s.current) * 10) / 10),
        current: s.current,
      }))
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 3)
      .map((row, i) => ({
        skill: row.skill,
        skillLabel: row.skillLabel,
        focus: row.focus,
        gap: row.gap,
        priority: i + 1,
        rationale:
          row.gap >= 3 ? 'Largest gap to your target — start here.'
          : row.gap >= 1.5 ? 'Closing this lifts your overall level fastest.'
          : 'Polish to hit your next CEFR band.',
      }));
  }, [skills, NEXT_FOCUS_MAP]);

  const incrementSkill = useCallback(async (skillName: string, amount: number) => {
    if (!user?.id) return;
    const existing = skills.find((s) => s.skill === skillName);
    const newScore = Math.min(10, (existing?.current || 0) + amount);

    await supabase
      .from('student_skills')
      .upsert({
        student_id: user.id,
        skill_name: skillName,
        current_score: newScore,
        target_score: Math.min(10, newScore + 2),
        cefr_equivalent: scoreToCefr(newScore),
        next_focus: NEXT_FOCUS_MAP[skillName] || null,
      }, { onConflict: 'student_id,skill_name' });
  }, [user?.id, skills, NEXT_FOCUS_MAP]);

  return {
    skills,
    loading,
    hub,
    overallCefr,
    percentToNext,
    plan,
    refresh: fetchAndSync,
    scoreToCefr,
    nextCefr,
    incrementSkill,
  };
};
