/**
 * Cognitive Load Meter — estimates active vs passive time per page and per lesson.
 * Used by the Creator Hub editor to surface a visual gauge.
 *
 * Heuristics (NOT measurements). Calibrate against real telemetry later.
 */

export type SlideMode = 'passive' | 'active' | 'production';

export interface SlideLoadEstimate {
  slideId: string;
  mode: SlideMode;
  est_seconds: number;
  active_seconds: number;
  load_index: number; // 0–1 (1 = max cognitive demand)
}

export interface LessonLoadReport {
  lessonId: string;
  total_seconds: number;
  active_seconds: number;
  active_ratio: number;        // active / total
  production_ratio: number;    // speaking+writing / total
  peak_load: number;           // worst slide load_index
  band: 'underloaded' | 'balanced' | 'overloaded';
  perSlide: SlideLoadEstimate[];
}

const MODE_TABLE: Record<string, { mode: SlideMode; base: number; active: number; load: number }> = {
  // passive
  song:                 { mode: 'passive', base: 60, active: 5,  load: 0.2 },
  chant:                { mode: 'passive', base: 45, active: 10, load: 0.25 },
  story_beat:           { mode: 'passive', base: 35, active: 5,  load: 0.3 },
  scene_dialogue:       { mode: 'passive', base: 30, active: 5,  load: 0.3 },
  vocab_card:           { mode: 'passive', base: 20, active: 5,  load: 0.35 },
  audio:                { mode: 'passive', base: 25, active: 5,  load: 0.2 },
  // active recognition
  multiple_choice:      { mode: 'active', base: 30, active: 25, load: 0.5 },
  matching:             { mode: 'active', base: 40, active: 35, load: 0.55 },
  drag_drop:            { mode: 'active', base: 40, active: 35, load: 0.6 },
  memory_match:         { mode: 'active', base: 60, active: 55, load: 0.6 },
  fill_blank:           { mode: 'active', base: 45, active: 40, load: 0.7 },
  listen_and_match:     { mode: 'active', base: 40, active: 35, load: 0.6 },
  // production
  speaking_repeat:      { mode: 'production', base: 30, active: 25, load: 0.7 },
  cued_speaking:        { mode: 'production', base: 45, active: 40, load: 0.85 },
  free_speaking:        { mode: 'production', base: 60, active: 55, load: 0.95 },
  writing_response:     { mode: 'production', base: 90, active: 80, load: 0.9 },
};

const DEFAULT = { mode: 'active' as SlideMode, base: 30, active: 20, load: 0.5 };

function lookup(kind: string) {
  return MODE_TABLE[kind?.toLowerCase()] ?? DEFAULT;
}

export function estimateSlideLoad(slide: { id: string; type?: string; kind?: string; activity_type?: string }): SlideLoadEstimate {
  const kind = (slide.type ?? slide.kind ?? slide.activity_type ?? '').toLowerCase();
  const m = lookup(kind);
  return {
    slideId: slide.id,
    mode: m.mode,
    est_seconds: m.base,
    active_seconds: m.active,
    load_index: m.load,
  };
}

export function reportLessonLoad(lessonId: string, slides: Array<{ id: string; type?: string; kind?: string; activity_type?: string }>): LessonLoadReport {
  const perSlide = slides.map(estimateSlideLoad);
  const total = perSlide.reduce((s, x) => s + x.est_seconds, 0);
  const active = perSlide.reduce((s, x) => s + x.active_seconds, 0);
  const production = perSlide.filter((x) => x.mode === 'production').reduce((s, x) => s + x.est_seconds, 0);
  const peak = perSlide.reduce((m, x) => Math.max(m, x.load_index), 0);
  const activeRatio = total === 0 ? 0 : active / total;
  const prodRatio = total === 0 ? 0 : production / total;

  let band: LessonLoadReport['band'] = 'balanced';
  if (activeRatio < 0.35) band = 'underloaded';
  else if (activeRatio > 0.75 || peak > 0.9 && prodRatio > 0.4) band = 'overloaded';

  return {
    lessonId,
    total_seconds: total,
    active_seconds: active,
    active_ratio: Math.round(activeRatio * 100) / 100,
    production_ratio: Math.round(prodRatio * 100) / 100,
    peak_load: peak,
    band,
    perSlide,
  };
}
