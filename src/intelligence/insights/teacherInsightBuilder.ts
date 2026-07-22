// Teacher Insight Layer — consolidates intelligence into teacher-facing surfaces.

import type { LearnerIntelligence } from '../types';

export interface MasteryHeatmapCell {
  skill: string;
  score: number;            // 0..100 (recognition)
  spontaneous: number;
  band: 'weak' | 'developing' | 'strong' | 'mastered';
}

export interface StruggleAlert {
  kind: 'recurring_error' | 'speaking_avoidance' | 'plateau' | 'regression';
  title: string;
  detail: string;
  severity: 'low' | 'medium' | 'high';
}

export interface TeacherInsight {
  studentId: string;
  hub: string;
  heatmap: MasteryHeatmapCell[];
  alerts: StruggleAlert[];
  speakingTrend: { tier: string; trend: string; attempts7d: number };
  pronunciationFocus: string[];
  engagement: { momentum: string; attention: number };
}

export function buildTeacherInsight(intel: LearnerIntelligence): TeacherInsight {
  const heatmap: MasteryHeatmapCell[] = Object.values(intel.mastery_map)
    .map<MasteryHeatmapCell>(m => ({
      skill: m.skill,
      score: m.recognition,
      spontaneous: m.spontaneous_production,
      band:
        m.spontaneous_production >= 85
          ? 'mastered'
          : m.recognition >= 75
          ? 'strong'
          : m.recognition >= 50
          ? 'developing'
          : 'weak',
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 40);

  const alerts: StruggleAlert[] = [];

  for (const e of intel.error_patterns.filter(x => x.frequency >= 3).slice(0, 3)) {
    alerts.push({
      kind: 'recurring_error',
      title: `Recurring ${e.category} error`,
      detail: `"${e.surface}" → "${e.target}" (${e.frequency}×, ${e.classification})`,
      severity: e.classification === 'mastery_gap' ? 'high' : 'medium',
    });
  }
  if (intel.speaking_confidence.tier === 'shy' || intel.speaking_confidence.growth_trend === 'down') {
    alerts.push({
      kind: 'speaking_avoidance',
      title: 'Low speaking confidence',
      detail: `${intel.speaking_confidence.tier}, trend ${intel.speaking_confidence.growth_trend}, ${intel.speaking_confidence.voluntary_attempts_7d} voluntary attempts in 7d`,
      severity: 'medium',
    });
  }
  const plateauing = heatmap.filter(c => c.band === 'developing' && c.spontaneous < 40).slice(0, 1);
  if (plateauing.length) {
    alerts.push({
      kind: 'plateau',
      title: `Plateau on ${plateauing[0].skill}`,
      detail: `Recognition strong but spontaneous production stalled at ${plateauing[0].spontaneous}%`,
      severity: 'low',
    });
  }

  return {
    studentId: intel.learner_profile.studentId,
    hub: intel.learner_profile.hub,
    heatmap,
    alerts,
    speakingTrend: {
      tier: intel.speaking_confidence.tier,
      trend: intel.speaking_confidence.growth_trend,
      attempts7d: intel.speaking_confidence.voluntary_attempts_7d,
    },
    pronunciationFocus: intel.pronunciation_state.focus_targets,
    engagement: {
      momentum: intel.engagement_state.momentum,
      attention: intel.engagement_state.attention_score,
    },
  };
}
