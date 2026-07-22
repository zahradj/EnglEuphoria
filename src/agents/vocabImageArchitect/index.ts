import { supabase } from "@/integrations/supabase/client";
import type { VocabImageInput, VocabImageResult } from "./contract";

export * from "./contract";

export async function runVocabImageArchitect(
  input: VocabImageInput,
): Promise<VocabImageResult> {
  const t0 = performance.now();
  const { data, error } = await supabase.functions.invoke("vocab-image-architect", {
    body: { input },
  });
  if (error) throw new Error(`vocab-image-architect failed: ${error.message}`);
  const plan = data?.plan;
  if (!plan) throw new Error("vocab-image-architect returned no plan.");
  return {
    plan,
    url: data?.url ?? null,
    cached: !!data?.cached,
    durationMs: Math.round(performance.now() - t0),
  };
}

export async function runVocabImageBatch(
  inputs: VocabImageInput[],
): Promise<VocabImageResult[]> {
  const out: VocabImageResult[] = [];
  // Sequential to respect Gemini rate limits; callers can parallelize externally.
  for (const i of inputs) {
    try {
      out.push(await runVocabImageArchitect(i));
    } catch (e) {
      out.push({
        plan: {
          word: i.word,
          pos: i.pos ?? "other",
          theme_backdrop: i.backdrop ?? i.theme ?? "neutral studio",
          composition: "fallback",
          image_prompt: `Kawaii illustration of "${i.word}"`,
          uses_cast: false,
          cast_names: [],
          style: i.style ?? "kawaii-chibi-mascot",
        },
        url: null,
        cached: false,
        durationMs: 0,
      });
    }
  }
  return out;
}
