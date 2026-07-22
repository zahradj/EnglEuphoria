import { supabase } from "@/integrations/supabase/client";

/**
 * Persist a voice-scored attempt to `speech_attempts`.
 * Silent no-op when unauthenticated or on write failure — this is telemetry, never blocking.
 */
export async function persistVoiceScore(input: {
  transcript: string;
  expected?: string;
  matchRatio: number;   // 0..1
  fluency: number;      // 0..1
  engineType?: string;
  lessonId?: string;
  slideId?: string;
  hub?: string;
}): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const accuracy = Math.round((input.matchRatio ?? 0) * 100);
    const fluency = Math.round((input.fluency ?? 0) * 100);
    const overall = Math.round(accuracy * 0.6 + fluency * 0.4);
    const tier =
      overall >= 85 ? "gold" :
      overall >= 60 ? "soft" :
      "revert";

    await supabase.from("speech_attempts").insert({
      user_id: user.id,
      lesson_id: input.lessonId ?? null,
      slide_id: input.slideId ?? input.engineType ?? null,
      hub: input.hub ?? "playground",
      target_sentence: input.expected ?? null,
      transcript: input.transcript,
      overall_score: overall,
      accuracy_score: accuracy,
      fluency_score: fluency,
      pronunciation_score: accuracy,
      tier,
    });
  } catch {
    /* telemetry only — never surface */
  }
}
