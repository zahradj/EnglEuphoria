/**
 * useAceLesson — one-click "Ace Lesson" generator.
 *
 * Calls the `generate-ace-lesson` edge function which wraps the Playground
 * brain + GamePack/HomeworkPack/ChatQuest enrichment + publish-gate.
 *
 * Returns the same shape as the manual "AI Unit / AI Lesson" flow so the
 * caller can reuse the existing buildPlaygroundUnit + saveUnitLessons path.
 */

import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AcePhase =
  | "plan"
  | "vocab"
  | "grammar"
  | "reading"
  | "speaking"
  | "game"
  | "homework"
  | "validate";

export interface AcePhaseReport {
  phase: AcePhase;
  ok: boolean;
  detail?: string;
}

export interface AceLessonResult {
  unit: any;
  enrichment: {
    game_pack: { rounds: any[]; total_xp: number };
    homework_pack: { tasks: any[]; minutes: number };
    chat_quest_seed: any;
    interactive_count: number;
  };
  phases: AcePhaseReport[];
}

export interface AceLessonInput {
  hub?: "playground" | "academy" | "success";
  scope?: "lesson" | "unit";
  cefr: string;
  topic: string;
  /** Backdrop / world the unit is set in (kitchen, forest, space…). Optional. */
  unit_theme?: string;
  /** Human-readable scene phrase derived from the theme (e.g. "cozy living room…"). */
  scene_phrase?: string;
  target_lesson_number?: number;
  review_targets?: string[];
  cast?: { id: string; name: string; role?: string }[];
}

export const ACE_PHASES: AcePhase[] = [
  "plan", "vocab", "grammar", "reading", "speaking", "game", "homework", "validate",
];

function completeFailedPhases(prev: AcePhaseReport[], message: string): AcePhaseReport[] {
  const next = prev.map((p) =>
    /working/i.test(p.detail ?? "")
      ? { ...p, ok: false, detail: "stopped before completion" }
      : p,
  );
  const seen = new Set(next.map((p) => p.phase));
  for (const phase of ACE_PHASES) {
    if (!seen.has(phase)) {
      next.push({ phase, ok: false, detail: phase === "validate" ? message : "not completed" });
    }
  }
  if (!seen.has("validate")) return next;
  return next.map((p) => (p.phase === "validate" ? { ...p, ok: false, detail: message } : p));
}

export function useAceLesson() {
  const [isRunning, setIsRunning] = useState(false);
  const [phases, setPhases] = useState<AcePhaseReport[]>([]);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (input: AceLessonInput): Promise<AceLessonResult | null> => {
    setIsRunning(true);
    setPhases([]);
    setError(null);

    // Optimistic phase ticks so the modal feels live while the brain works.
    const optimistic: AcePhase[] = ["plan", "vocab", "grammar", "reading", "speaking"];
    let tickIdx = 0;
    const ticker = setInterval(() => {
      if (tickIdx >= optimistic.length) return;
      const p = optimistic[tickIdx++];
      setPhases((prev) => [...prev, { phase: p, ok: true, detail: "working…" }]);
    }, 1200);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-ace-lesson", {
        body: input,
      });
      clearInterval(ticker);

      if (fnError) throw new Error(fnError.message || "edge function failed");
      const payload = data as any;
      if (!payload?.ok) {
        if (Array.isArray(payload?.phases) && payload.phases.length) {
          setPhases(completeFailedPhases(payload.phases as AcePhaseReport[], payload?.error || "ace lesson generation failed"));
        }
        throw new Error(payload?.error || "ace lesson generation failed");
      }

      // Replace optimistic phases with the authoritative report.
      setPhases(payload.phases as AcePhaseReport[]);
      return {
        unit: payload.unit,
        enrichment: payload.enrichment,
        phases: payload.phases as AcePhaseReport[],
      };
    } catch (e: any) {
      clearInterval(ticker);
      const msg = e?.message ?? "unknown error";
      setError(msg);
      setPhases((prev) => completeFailedPhases(prev, msg));
      return null;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const reset = useCallback(() => {
    setPhases([]);
    setError(null);
  }, []);

  return { run, reset, isRunning, phases, error };
}
