// Content Quality Scoring — aggregates QA + Stabilization + Grammar + Speaking density
// into a single 0..100 score per lesson.

import type { OrchestrationResult } from '@/orchestrator/types';

export interface QualityScore {
  total: number;                // 0..100
  breakdown: {
    qa: number;
    stabilization: number;
    grammar: number;
    speakingDensity: number;
  };
  verdict: 'publish' | 'repair' | 'block';
  notes: string[];
}

export function aggregateQualityScore(result: OrchestrationResult): QualityScore {
  const qa = qaToScore((result as any).context?.qa);
  const stab = stabToScore((result as any).context?.qa?.stabilization);
  const grammar = grammarToScore(result.grammarPackage);
  const speakingDensity = speakingDensityScore((result as any).context?.activities ?? []);

  const total = Math.round(qa * 0.5 + stab * 0.25 + grammar * 0.15 + speakingDensity * 0.10);

  const verdict: QualityScore['verdict'] =
    total < 40 || result.verdict === 'block'
      ? 'block'
      : total < 60 || result.verdict === 'repair'
      ? 'repair'
      : 'publish';

  return {
    total,
    breakdown: { qa, stabilization: stab, grammar, speakingDensity },
    verdict,
    notes: [
      qa < 70 ? `QA low (${qa})` : '',
      stab < 70 ? `Stabilization low (${stab})` : '',
      grammar < 70 ? `Grammar weak (${grammar})` : '',
      speakingDensity < 50 ? `Few speaking opportunities (${speakingDensity})` : '',
    ].filter(Boolean),
  };
}

function qaToScore(qa: any): number {
  if (!qa) return 70;
  if (typeof qa.score === 'number') return clamp(qa.score, 0, 100);
  if (qa.verdict === 'publish') return 90;
  if (qa.verdict === 'repair') return 60;
  return 35;
}

function stabToScore(stab: any): number {
  if (!stab) return 75;
  if (typeof stab.score === 'number') return clamp(stab.score, 0, 100);
  if (stab.verdict === 'publish') return 88;
  if (stab.verdict === 'repair') return 62;
  return 40;
}

function grammarToScore(pkg: any): number {
  if (!pkg) return 75;
  const r = pkg.validation_report ?? pkg.report;
  if (!r) return 80;
  if (typeof r.score === 'number') return clamp(r.score, 0, 100);
  if (r.passed === true) return 88;
  if (r.passed === false) return 50;
  return 75;
}

function speakingDensityScore(activities: any[]): number {
  if (!activities?.length) return 0;
  const speakingTypes = ['speaking', 'shadowing', 'role_play', 'free_production', 'free_speech', 'dialogue'];
  const n = activities.filter(a =>
    speakingTypes.some(s => String(a?.type ?? '').toLowerCase().includes(s)),
  ).length;
  const ratio = n / activities.length;
  // 40% speaking (Playground hub floor) = 100. Below that scales linearly.
  return clamp(Math.round(ratio * 250), 0, 100);
}

function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)); }
