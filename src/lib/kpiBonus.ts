// Payroll bonus tie-in: derives an eligible KPI bonus from a teacher's
// performance breakdown. Applied on top of the last 30 days of teacher
// earnings. Non-punitive — bonus floors at 0.
//
// Base tier from overall KPI:
//   ≥95  → 15%
//   ≥85  → 10%
//   ≥70  →  6%
//   ≥55  →  3%
//   <55  →  0%
//
// Sub-score kickers: +1% for each of the 6 sub-scores that clears 90,
// capped at +5% total. Sub-score kickers require overall ≥ 55 (no bonus
// for at-risk teachers even with one strong axis).

export interface KpiBreakdown {
  overall_kpi_score: number;
  attendance_rate: number;
  lesson_quality_score: number;
  student_progress_impact: number;
  response_time_score: number;
  feedback_completion_rate: number;
  curriculum_coverage: number;
}

export interface BonusCalc {
  eligible: boolean;
  baseTier: string;
  basePct: number;
  kickerPct: number;
  totalPct: number;
  kickers: string[];
  bonusAmount: number;
  earningsBase: number;
}

const SUB_SCORE_FIELDS: Array<[keyof KpiBreakdown, string]> = [
  ["attendance_rate", "Attendance"],
  ["lesson_quality_score", "Quality"],
  ["student_progress_impact", "Progress Impact"],
  ["response_time_score", "Response Time"],
  ["feedback_completion_rate", "Feedback"],
  ["curriculum_coverage", "Curriculum"],
];

export interface BonusPolicyInput {
  tier_elite_threshold: number; tier_elite_pct: number;
  tier_excellent_threshold: number; tier_excellent_pct: number;
  tier_strong_threshold: number; tier_strong_pct: number;
  tier_ontrack_threshold: number; tier_ontrack_pct: number;
  kicker_threshold: number; kicker_pct_each: number; kicker_max_pct: number;
}

const DEFAULT_POLICY: BonusPolicyInput = {
  tier_elite_threshold: 95, tier_elite_pct: 15,
  tier_excellent_threshold: 85, tier_excellent_pct: 10,
  tier_strong_threshold: 70, tier_strong_pct: 6,
  tier_ontrack_threshold: 55, tier_ontrack_pct: 3,
  kicker_threshold: 90, kicker_pct_each: 1, kicker_max_pct: 5,
};

function basePctFor(score: number, p: BonusPolicyInput): { pct: number; tier: string } {
  if (score >= p.tier_elite_threshold) return { pct: p.tier_elite_pct, tier: "Elite" };
  if (score >= p.tier_excellent_threshold) return { pct: p.tier_excellent_pct, tier: "Excellent" };
  if (score >= p.tier_strong_threshold) return { pct: p.tier_strong_pct, tier: "Strong" };
  if (score >= p.tier_ontrack_threshold) return { pct: p.tier_ontrack_pct, tier: "On Track" };
  return { pct: 0, tier: "At Risk" };
}

export function calculateKpiBonus(
  kpi: KpiBreakdown,
  earningsBase: number,
  policy: BonusPolicyInput = DEFAULT_POLICY,
): BonusCalc {
  const { pct: basePct, tier: baseTier } = basePctFor(kpi.overall_kpi_score, policy);
  const eligible = basePct > 0 && earningsBase > 0;

  let kickerPct = 0;
  const kickers: string[] = [];
  if (eligible) {
    for (const [field, label] of SUB_SCORE_FIELDS) {
      if (Number(kpi[field]) >= policy.kicker_threshold) {
        kickers.push(label);
        kickerPct += policy.kicker_pct_each;
      }
    }
    kickerPct = Math.min(kickerPct, policy.kicker_max_pct);
  }

  const totalPct = eligible ? basePct + kickerPct : 0;
  const bonusAmount = Math.round((earningsBase * totalPct) / 100 * 100) / 100;

  return {
    eligible,
    baseTier,
    basePct,
    kickerPct,
    totalPct,
    kickers,
    bonusAmount,
    earningsBase,
  };
}

export function formatBonusNote(calc: BonusCalc, periodLabel: string): string {
  return `KPI bonus ${periodLabel}: ${calc.baseTier} base ${calc.basePct}%${
    calc.kickerPct > 0 ? ` + ${calc.kickerPct}% kickers (${calc.kickers.join(", ")})` : ""
  } = ${calc.totalPct}% × ${calc.earningsBase.toFixed(2)} earnings`;
}
