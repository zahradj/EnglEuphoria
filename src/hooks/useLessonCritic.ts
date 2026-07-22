/**
 * useLessonCritic — on-demand Lesson Critic runner for the Creator Hub.
 * Calls the `lesson-critic` edge function with a prompt built client-side.
 */
import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  buildCriticPrompt,
  computeOverall,
  type LessonCriticResult,
} from "@/qa/judges/lessonCritic";
import type { QALesson } from "@/qa/types";

export interface UseLessonCriticState {
  loading: boolean;
  error: string | null;
  result: LessonCriticResult | null;
  run: (lesson: QALesson) => Promise<LessonCriticResult | null>;
  reset: () => void;
}

export function useLessonCritic(): UseLessonCriticState {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LessonCriticResult | null>(null);

  const run = useCallback(async (lesson: QALesson) => {
    setLoading(true);
    setError(null);
    try {
      const prompt = buildCriticPrompt(lesson);
      const { data, error: invokeErr } = await supabase.functions.invoke("lesson-critic", {
        body: { prompt },
      });
      if (invokeErr) throw new Error(invokeErr.message);
      const parsed = (data?.result ?? null) as Partial<LessonCriticResult> | null;
      if (!parsed?.scores) throw new Error("Critic returned no scores");

      const scores = parsed.scores as LessonCriticResult["scores"];
      const overall = computeOverall(scores);
      const verdict: LessonCriticResult["verdict"] =
        parsed.verdict ?? (overall < 60 ? "block" : overall < 70 ? "repair" : "publish");
      const final: LessonCriticResult = {
        scores,
        overall,
        verdict,
        rationale: parsed.rationale ?? "",
        weak_axes: Array.isArray(parsed.weak_axes) ? parsed.weak_axes : [],
        raw: parsed,
      };
      setResult(final);
      return final;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setResult(null);
  }, []);

  return { loading, error, result, run, reset };
}
