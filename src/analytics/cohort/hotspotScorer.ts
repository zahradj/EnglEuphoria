// Hotspot scorer — flags lessons with completion/drop-off/quality issues.

import type { LessonHotspot, LearnerSignalType } from '../types';
import type { Hub, Cefr } from '@/governance/types';

export interface HotspotInput {
  lesson_id: string;
  hub: Hub;
  cefr?: Cefr;
  unit?: string;
  completion_values: number[];      // 0..1 per attempt
  drop_off_slides: number[];
  signals: LearnerSignalType[];     // all detected signals across cohort
}

export function scoreHotspot(i: HotspotInput): LessonHotspot {
  const sample = i.completion_values.length;
  const p50 = sample
    ? [...i.completion_values].sort((a, b) => a - b)[Math.floor(sample / 2)]
    : 0;

  let topSlide: number | undefined;
  let topConcentration = 0;
  if (i.drop_off_slides.length) {
    const counts = new Map<number, number>();
    for (const s of i.drop_off_slides) counts.set(s, (counts.get(s) ?? 0) + 1);
    let best = 0;
    for (const [slide, count] of counts) {
      if (count > best) {
        best = count;
        topSlide = slide;
      }
    }
    topConcentration = best / i.drop_off_slides.length;
  }

  const sigCounts = new Map<LearnerSignalType, number>();
  for (const s of i.signals) sigCounts.set(s, (sigCounts.get(s) ?? 0) + 1);
  const topSignals = [...sigCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k);

  let flag: 'healthy' | 'watch' | 'critical' = 'healthy';
  if (p50 < 0.6 || topConcentration > 0.4) flag = 'critical';
  else if (p50 < 0.75 || topConcentration > 0.25) flag = 'watch';

  return {
    lesson_id: i.lesson_id,
    scope: { hub: i.hub, cefr: i.cefr, unit: i.unit },
    completion_p50: p50,
    drop_off_slide_top: topSlide,
    drop_off_concentration: topConcentration,
    top_signals: topSignals,
    flag,
    sample_size: sample,
  };
}
