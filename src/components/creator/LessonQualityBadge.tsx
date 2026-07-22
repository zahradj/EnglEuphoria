/**
 * LessonQualityBadge — Creator Hub surface for the Cognitive Load Meter
 * and (optionally) the telemetry-driven LessonQualityScore.
 *
 * Pure presentational; pass slides + optional telemetry score in.
 */
import { useMemo } from "react";
import { reportLessonLoad, type LessonLoadReport } from "@/qa/util/cognitiveLoadMeter";
import type { LessonQualityScore } from "@/analytics/lessonQualityScore";

type SlideLike = { id: string; type?: string; kind?: string; activity_type?: string };

interface Props {
  lessonId: string;
  slides: SlideLike[];
  telemetry?: LessonQualityScore | null;
  className?: string;
}

const BAND_COLORS: Record<LessonLoadReport["band"], string> = {
  underloaded: "bg-amber-100 text-amber-900 border-amber-300",
  balanced:    "bg-emerald-100 text-emerald-900 border-emerald-300",
  overloaded:  "bg-rose-100 text-rose-900 border-rose-300",
};

const SCORE_COLORS: Record<NonNullable<LessonQualityScore["band"]>, string> = {
  excellent:   "bg-emerald-100 text-emerald-900 border-emerald-300",
  good:        "bg-sky-100 text-sky-900 border-sky-300",
  review:      "bg-amber-100 text-amber-900 border-amber-300",
  regenerate:  "bg-rose-100 text-rose-900 border-rose-300",
};

export default function LessonQualityBadge({ lessonId, slides, telemetry, className }: Props) {
  const load = useMemo(() => reportLessonLoad(lessonId, slides ?? []), [lessonId, slides]);
  const activePct = Math.round(load.active_ratio * 100);
  const prodPct = Math.round(load.production_ratio * 100);
  const minutes = Math.round(load.total_seconds / 60);

  return (
    <div className={`flex flex-wrap items-center gap-2 text-[11px] font-bold ${className ?? ""}`}>
      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 ${BAND_COLORS[load.band]}`}
        title={`Active ${activePct}% · Production ${prodPct}% · Peak ${(load.peak_load * 100).toFixed(0)}%`}>
        ⚡ Load: {load.band} · {activePct}% active · ~{minutes}min
      </span>

      {telemetry ? (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 ${SCORE_COLORS[telemetry.band]}`}
          title={`Completion ${(telemetry.signals.completion_rate * 100).toFixed(0)}% · Speaking ${(telemetry.signals.speaking_density * 100).toFixed(0)}% · Frustration ${(telemetry.signals.frustration_rate * 100).toFixed(0)}%`}>
          ⭐ Quality: {telemetry.score}/100 ({telemetry.band})
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-slate-500">
          ⭐ Quality: awaiting student telemetry
        </span>
      )}
    </div>
  );
}
