/**
 * useLessonTelemetryScore — pulls real student signals for a lesson and
 * computes the LessonQualityScore band. Disabled if lessonId is missing.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  computeLessonQualityScore,
  type LessonQualityScore,
} from "@/analytics/lessonQualityScore";

export function useLessonTelemetryScore(lessonId: string | null | undefined) {
  const [score, setScore] = useState<LessonQualityScore | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lessonId) {
      setScore(null);
      return;
    }
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const [eventsRes, signalsRes, speechRes] = await Promise.all([
          supabase
            .from("lesson_slide_events")
            .select("event_type, student_id, payload, dwell_ms")
            .eq("lesson_id", lessonId)
            .limit(1000),
          supabase
            .from("learner_signals")
            .select("signal_type")
            .eq("source_lesson_id", lessonId)
            .limit(1000),
          supabase
            .from("speech_attempts")
            .select("score")
            .eq("lesson_id", lessonId)
            .limit(1000),
        ]);

        if (cancelled) return;

        const events = eventsRes.data ?? [];
        const signals = signalsRes.data ?? [];
        const speech = speechRes.data ?? [];

        const sessions = new Set(events.map((e: any) => e.student_id)).size || 0;
        const completedSessions = events.filter(
          (e: any) => e.event_type === "lesson_complete",
        ).length;
        const replayEvents = events.filter(
          (e: any) => e.event_type === "slide_replay",
        ).length;
        const speakingSuccesses = speech.filter(
          (s: any) => (s.score ?? 0) >= 0.7,
        ).length;
        const frustration = signals.filter((s: any) =>
          ["frustration", "too_hard", "overload"].includes(s.signal_type),
        ).length;
        const boredom = signals.filter((s: any) =>
          ["boredom", "disengagement", "too_easy"].includes(s.signal_type),
        ).length;

        const result = computeLessonQualityScore({
          lessonId,
          totalSessions: sessions,
          completedSessions,
          avgReplayCount: sessions === 0 ? 0 : replayEvents / sessions,
          speakingAttempts: speech.length,
          speakingSuccesses,
          frustrationSignals: frustration,
          boredomSignals: boredom,
        });

        // Avoid noisy badge with effectively zero data.
        setScore(sessions === 0 && speech.length === 0 ? null : result);
      } catch {
        if (!cancelled) setScore(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  return { score, loading };
}
