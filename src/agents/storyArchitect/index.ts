// Hub Story Architect — single entry point for narrative + dialogue + illustration + audio.
//
// runStoryArchitect({ hub, cefr, lesson, cast }) -> StoryPlan
//
// Internally calls the `story-architect` edge function (Gemini direct via aiFetch)
// and persists the returned plan onto curriculum_lessons.story_plan when a
// lesson id is supplied.

import { supabase } from "@/integrations/supabase/client";
import type { StoryArchitectInput, StoryPlan } from "./contract";
import { validateStoryPlan, hasErrors, type ValidationIssue } from "./validator";

export * from "./contract";
export { validateStoryPlan, hasErrors } from "./validator";
export type { ValidationIssue } from "./validator";

export interface StoryArchitectResult {
  plan: StoryPlan;
  issues: ValidationIssue[];
  persisted: boolean;
  durationMs: number;
}

export async function runStoryArchitect(
  input: StoryArchitectInput,
): Promise<StoryArchitectResult> {
  const t0 = performance.now();

  if (!input.cast?.length) {
    throw new Error("Story Architect requires at least one cast member.");
  }
  if (!input.lesson?.vocab?.length && !input.lesson?.review_targets?.length) {
    throw new Error("Story Architect needs at least one vocabulary target.");
  }

  // One retry with backoff — story-architect runs through the AI Gateway
  // which sporadically 5xxs under load.
  let data: any = null;
  let lastErr: any = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await supabase.functions.invoke("story-architect", { body: { input } });
    if (!res.error && (res.data as any)?.plan) { data = res.data; lastErr = null; break; }
    lastErr = res.error ?? res.data;
    if (attempt === 0) await new Promise((r) => setTimeout(r, 1200));
  }
  if (!data?.plan) {
    const detail =
      (lastErr as any)?.context?.detail ??
      (lastErr as any)?.message ??
      (typeof lastErr === "string" ? lastErr : JSON.stringify(lastErr ?? {}));
    throw new Error(`story-architect failed: ${detail}`);
  }
  const plan = data.plan as StoryPlan;

  const issues = validateStoryPlan(plan, input);
  if (hasErrors(issues)) {
    // Surface but do NOT block — caller decides whether to retry/repair.
    console.warn("[StoryArchitect] validation errors:", issues);
  }

  let persisted = false;
  if (input.lesson?.id) {
    const { error: upErr } = await supabase
      .from("curriculum_lessons")
      .update({ story_plan: plan as any })
      .eq("id", input.lesson.id);
    if (!upErr) persisted = true;
  }

  return { plan, issues, persisted, durationMs: Math.round(performance.now() - t0) };
}
