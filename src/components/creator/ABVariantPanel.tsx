/**
 * ABVariantPanel — Lesson-1-only A/B variant generator.
 *
 * Variant A = the lesson currently in the editor.
 * Variant B = a regenerated version with the starring character rotated to the
 * next cast member, then re-derived via derivePages (rotation propagates through
 * every prompt and scene, so the two variants diverge meaningfully).
 *
 * Both are scored with the Lesson Critic; the user clicks "Keep this one" to
 * swap the winner into the editor.
 */
import { useCallback, useMemo, useState } from "react";
import { Sparkles, Loader2, Trophy } from "lucide-react";
import { derivePages, CAST_ROSTER } from "@/playground-blueprint/derivePages";
import type {
  PlaygroundLessonContent,
  PlaygroundPage,
} from "@/playground-blueprint/types";
import { useLessonCritic } from "@/hooks/useLessonCritic";
import type { LessonCriticResult } from "@/qa/judges/lessonCritic";
import type { QALesson } from "@/qa/types";

interface ABVariantPanelProps {
  lesson: PlaygroundLessonContent;
  unitTopic: string;
  cefr?: string;
  onApply: (pages: PlaygroundPage[], starring?: { name: string }) => void;
}

function toQALesson(
  pages: PlaygroundPage[],
  lessonNumber: number,
  cefr: string,
): QALesson {
  const summarize = (p: PlaygroundPage) => (p.blocks ?? [])
    .map((b: any) => {
      if (b.kind === "text") return b.value;
      if (b.kind === "audio") return b.text;
      if (b.kind === "image") return b.subject;
      if (b.kind === "activity") return `${b.label ?? b.type}: ${JSON.stringify(b.config ?? {})}`;
      if (b.kind === "music") return b.mood;
      if (b.kind === "video") return b.url || b.label;
      return "";
    })
    .filter(Boolean)
    .join("\n");
  return {
    id: `variant-${lessonNumber}`,
    hub: "Playground",
    cefr: cefr as any,
    title: `Lesson ${lessonNumber}`,
    slides: pages.map((p: any, i) => ({
      id: String(p.id ?? i),
      kind: String(p.type ?? p.phase_id ?? "slide"),
      title: p.title,
      body_text: summarize(p),
      text: summarize(p),
      body: summarize(p),
    })),
  } as QALesson;
}

function ScoreCard({
  label,
  result,
  loading,
  isWinner,
  onKeep,
}: {
  label: string;
  result: LessonCriticResult | null;
  loading: boolean;
  isWinner: boolean;
  onKeep: () => void;
}) {
  return (
    <div
      className={`flex-1 rounded-lg border p-3 ${
        isWinner
          ? "border-emerald-300 bg-emerald-50/70"
          : "border-orange-200 bg-white/60"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-900">
          {label}
          {isWinner ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-200 px-1.5 py-0.5 text-[10px] text-emerald-900">
              <Trophy className="h-2.5 w-2.5" /> Winner
            </span>
          ) : null}
        </div>
        <div className="text-xs font-bold text-orange-700">
          {loading ? "…" : result ? `${result.overall}/100` : "—"}
        </div>
      </div>
      {result ? (
        <ul className="space-y-0.5 text-[11px] text-orange-800/80">
          <li>Flow: {result.scores.pedagogical_flow}</li>
          <li>Vocab recycle: {result.scores.vocab_recycling}</li>
          <li>Speaking: {result.scores.speaking_authenticity}</li>
          <li>Cast: {result.scores.character_coherence}</li>
          <li>Variety: {result.scores.engagement_variety}</li>
        </ul>
      ) : (
        <div className="text-[11px] text-orange-700/60">
          {loading ? "Scoring…" : "Not scored yet"}
        </div>
      )}
      <button
        type="button"
        onClick={onKeep}
        disabled={!result}
        className="mt-2 w-full rounded-md bg-orange-600 px-2 py-1 text-xs font-semibold text-white hover:bg-orange-700 disabled:opacity-40"
      >
        Keep this one
      </button>
    </div>
  );
}

export default function ABVariantPanel({
  lesson,
  unitTopic: _unitTopic,
  cefr,
  onApply,
}: ABVariantPanelProps) {
  if (lesson.lesson_number !== 1) return null;

  const cefrSafe = cefr || "Pre-A1";
  const [busy, setBusy] = useState(false);
  const [variantBPages, setVariantBPages] = useState<PlaygroundPage[] | null>(
    null,
  );
  const [variantBStarring, setVariantBStarring] = useState<string | null>(null);

  const criticA = useLessonCritic();
  const criticB = useLessonCritic();

  const variantALesson = useMemo(
    () => toQALesson(lesson.pages ?? [], 1, cefrSafe),
    [lesson, cefrSafe],
  );
  const variantBLesson = useMemo(
    () =>
      variantBPages ? toQALesson(variantBPages, 1, cefrSafe) : null,
    [variantBPages, cefrSafe],
  );

  const generate = useCallback(async () => {
    setBusy(true);
    try {
      const currentName = (lesson as any)?.starring_character?.name ?? "Pip";
      const idx = CAST_ROSTER.findIndex(
        (c) => c.name.toLowerCase() === String(currentName).toLowerCase(),
      );
      const next = CAST_ROSTER[(idx + 1) % CAST_ROSTER.length];
      const variantLesson: PlaygroundLessonContent = {
        ...lesson,
        starring_character: { name: next.name } as any,
        pages: [],
      };
      const pages = derivePages(variantLesson);
      setVariantBPages(pages);
      setVariantBStarring(next.name);
      // Score both in parallel
      await Promise.all([
        criticA.run(variantALesson),
        criticB.run(toQALesson(pages, 1, cefrSafe)),
      ]);
    } finally {
      setBusy(false);
    }
  }, [lesson, variantALesson, cefrSafe, criticA, criticB]);

  const aScore = criticA.result?.overall ?? -1;
  const bScore = criticB.result?.overall ?? -1;
  const winner = aScore === -1 && bScore === -1 ? null : aScore >= bScore ? "A" : "B";

  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-orange-900">
          Lesson 1 · A/B Variant
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={busy}
          className="inline-flex items-center gap-1 rounded-md bg-orange-600 px-2 py-1 text-xs font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Sparkles className="h-3 w-3" />
          )}
          {variantBPages ? "Regenerate B" : "Generate 2 variants"}
        </button>
      </div>
      {variantBPages ? (
        <div className="flex gap-2">
          <ScoreCard
            label="A · current"
            result={criticA.result}
            loading={criticA.loading}
            isWinner={winner === "A"}
            onKeep={() => onApply(lesson.pages ?? [])}
          />
          <ScoreCard
            label={`B · starring ${variantBStarring ?? "—"}`}
            result={criticB.result}
            loading={criticB.loading}
            isWinner={winner === "B"}
            onKeep={() =>
              onApply(
                variantBPages,
                variantBStarring ? { name: variantBStarring } : undefined,
              )
            }
          />
        </div>
      ) : (
        <p className="text-[11px] text-orange-800/70">
          Generates an alternate Lesson 1 by rotating the starring character,
          scores both with the Lesson Critic, and lets you keep the winner.
        </p>
      )}
    </div>
  );
}
