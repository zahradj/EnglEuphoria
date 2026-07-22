/**
 * LessonCriticPanel — Creator Hub surface for the LLM-as-judge critic.
 * Shows 5 subscores, overall, verdict, and rationale. Click "Run critic" to score.
 */
import { useEffect, useRef } from "react";
import { useLessonCritic } from "@/hooks/useLessonCritic";
import type { QALesson } from "@/qa/types";

interface Props {
  lesson: QALesson | null;
  className?: string;
  /** Auto-rescore when lesson changes (debounced). Default true. */
  autoRun?: boolean;
  /** Notified whenever a fresh verdict is available (or null on lesson change). */
  onVerdict?: (verdict: "publish" | "repair" | "block" | null, overall: number | null) => void;
}

const AXIS_LABEL: Record<string, string> = {
  pedagogical_flow: "Flow",
  vocab_recycling: "Vocab recycle",
  speaking_authenticity: "Speaking",
  character_coherence: "Cast",
  engagement_variety: "Variety",
};

const VERDICT_COLOR = {
  publish: "bg-emerald-100 text-emerald-900 border-emerald-300",
  repair: "bg-amber-100 text-amber-900 border-amber-300",
  block: "bg-rose-100 text-rose-900 border-rose-300",
} as const;

function scoreColor(n: number) {
  if (n >= 80) return "text-emerald-700";
  if (n >= 60) return "text-amber-700";
  return "text-rose-700";
}

export default function LessonCriticPanel({ lesson, className, autoRun = true, onVerdict }: Props) {
  const { loading, error, result, run } = useLessonCritic();

  // Debounced auto-run on lesson change (signature = id + slide count + kinds).
  const sig = lesson
    ? `${lesson.id}|${lesson.slides.length}|${lesson.slides
        .map((s) => `${s.kind}:${s.title ?? ""}:${(s.body_text ?? "").slice(0, 80)}:${(s.activities ?? []).map((a) => a.type).join("+")}`)
        .join(",")}`
    : "";
  const lastSigRef = useRef<string>("");
  useEffect(() => {
    if (!autoRun || !lesson || !sig || sig === lastSigRef.current || loading) return;
    // Invalidate stale verdict the moment the lesson changes.
    onVerdict?.(null, null);
    const t = setTimeout(() => {
      lastSigRef.current = sig;
      run(lesson);
    }, 1500);
    return () => clearTimeout(t);
  }, [sig, autoRun, lesson, loading, run, onVerdict]);

  // Push verdict upward whenever a new result arrives.
  useEffect(() => {
    if (result) onVerdict?.(result.verdict, result.overall);
  }, [result, onVerdict]);

  return (
    <div className={`flex flex-wrap items-center gap-2 text-[11px] font-bold ${className ?? ""}`}>
      <button
        type="button"
        disabled={!lesson || loading}
        onClick={() => lesson && run(lesson)}
        className="inline-flex items-center gap-1 rounded-full border border-orange-300 bg-white px-2 py-1 text-orange-900 hover:bg-orange-50 disabled:opacity-50"
        title="Run the LLM critic on this lesson"
      >
        {loading ? "🧪 Scoring…" : result ? "🧪 Re-run critic" : "🧪 Run critic"}
      </button>

      {error ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-50 px-2 py-1 text-rose-800">
          critic failed: {error}
        </span>
      ) : null}

      {result ? (
        <>
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 ${VERDICT_COLOR[result.verdict]}`}
            title={result.rationale || undefined}>
            🎯 {result.verdict.toUpperCase()} · {result.overall}/100
          </span>
          {Object.entries(result.scores).map(([axis, n]) => (
            <span
              key={axis}
              className={`inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 ${scoreColor(n)}`}
              title={result.weak_axes.includes(axis) ? "Weak axis — repair suggested" : undefined}
            >
              {AXIS_LABEL[axis] ?? axis}: {n}
              {result.weak_axes.includes(axis) ? " ⚠" : ""}
            </span>
          ))}
        </>
      ) : null}
    </div>
  );
}
