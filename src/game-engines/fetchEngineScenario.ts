/**
 * Client helper for the generate-engine-scenario edge function.
 * Loads a scenario JSON for a Language Engine slot on demand.
 */
import { supabase } from "@/integrations/supabase/client";

export type EngineScenarioType =
  | "story_engine_slot"
  | "escape_room_slot"
  | "detective_mystery_slot"
  | "hidden_object_slot";

export interface EngineScenarioRequest {
  engine: EngineScenarioType;
  hub: "playground" | "academy" | "success";
  cefr?: string;
  topic?: string;
  targetWords: string[];
  cast?: { name: string; role?: string }[];
  /** Pass to personalize the scenario against the student's unresolved mistakes. */
  studentId?: string;
  /** Optional pre-computed weak-word overrides (skips mistake_repository lookup). */
  weakWords?: string[];
}

export async function fetchEngineScenario(req: EngineScenarioRequest) {
  const { data, error } = await supabase.functions.invoke(
    "generate-engine-scenario",
    { body: req },
  );
  if (error) throw error;
  return data as {
    scenario: unknown;
    engine: EngineScenarioType;
    cached?: boolean;
    personalized?: boolean;
    weakWords?: string[];
  };
}
