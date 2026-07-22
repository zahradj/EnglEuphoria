// Activity Architect — single entry point for lesson-grounded activity configs.
//
// runActivityArchitect({ activity_type, vocab, context, ... }) -> { config }
//
// Delegates to the `playground-activity-ai` edge function (Gemini direct).
// The edge function already enforces: vocab-only word pool, sentence-frame
// binding, phonic binding, CEFR ceiling, and 3-6 items max.

import { supabase } from "@/integrations/supabase/client";
import type {
  ActivityArchitectInput,
  ActivityArchitectResult,
} from "./contract";

export * from "./contract";

export async function runActivityArchitect(
  input: ActivityArchitectInput,
): Promise<ActivityArchitectResult> {
  const t0 = performance.now();

  if (!input.activity_type) {
    throw new Error("Activity Architect requires activity_type.");
  }
  if (!input.vocab?.length) {
    throw new Error("Activity Architect requires a non-empty vocab list.");
  }

  const { data, error } = await supabase.functions.invoke(
    "playground-activity-ai",
    { body: input },
  );

  if (error) throw new Error(`activity-architect failed: ${error.message}`);

  const config = (data?.config ?? data ?? null) as Record<string, unknown> | null;
  if (!config) throw new Error("activity-architect returned no config.");

  return { config, durationMs: Math.round(performance.now() - t0) };
}
