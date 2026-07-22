// Cycle 5 — 3-Brain hub-aware client router.
//
// The Admin Lesson Creator no longer picks an "AI persona"; the hub
// selection IS the persona. Each hub routes to its dedicated edge
// function which carries the hardcoded rulebook and component whitelist.

import { supabase } from "@/integrations/supabase/client";

export type HubId = "playground" | "academy" | "success";

export interface GenerateLessonByHubInput {
  hub_id: HubId;
  topic: string;
  cefr: string;
  lesson_kind?: string;
  unit_id?: string;
  lesson_id?: string;
  learner_profile?: unknown;
  target_lesson_number?: number;
}

export interface GenerateLessonByHubResult<T = unknown> {
  hub: HubId;
  lesson: T;
  whitelist: { ok: boolean; offending: string[] };
  repaired: boolean;
}

const HUB_TO_FN: Record<HubId, string> = {
  playground: "generate-playground",
  academy: "generate-academy",
  success: "generate-success",
};

function normalizeHubId(input: string | undefined | null): HubId {
  const v = (input ?? "").toString().toLowerCase().trim();
  if (v === "playground" || v === "kids" || v === "children") return "playground";
  if (v === "success" || v === "professional" || v === "adults" || v === "adult") return "success";
  return "academy";
}

export function resolveHubFunction(hub: HubId | string): string {
  return HUB_TO_FN[normalizeHubId(hub)];
}

/**
 * Hub-aware lesson generation entry point. The hub_id chosen by the admin
 * (or hardcoded by the Playground/Academy/Success Creator pages) drives
 * which of the three brain edge functions handles the request.
 *
 * Returns { lesson, hub, whitelist, repaired } on success. Throws on
 * 422 HUB_COMPONENT_NOT_ALLOWED so callers can surface a clear toast.
 */
export async function generateLessonByHub<T = unknown>(
  input: GenerateLessonByHubInput,
): Promise<GenerateLessonByHubResult<T>> {
  const hub = normalizeHubId(input.hub_id);
  const fn = HUB_TO_FN[hub];

  const { data, error } = await supabase.functions.invoke(fn, {
    body: {
      topic: input.topic,
      cefr: input.cefr,
      lesson_kind: input.lesson_kind,
      unit_id: input.unit_id,
      lesson_id: input.lesson_id,
      learner_profile: input.learner_profile,
      target_lesson_number: input.target_lesson_number,
    },
  });

  if (error) {
    const msg = (data as any)?.message || error.message || "Lesson generation failed";
    throw new Error(msg);
  }
  if ((data as any)?.error) {
    const err = data as any;
    if (err.error === "HUB_COMPONENT_NOT_ALLOWED") {
      throw new Error(
        `This lesson contained components not allowed for ${hub}. Auto-repair failed — please regenerate.`,
      );
    }
    throw new Error(err.message || err.error);
  }

  return data as GenerateLessonByHubResult<T>;
}
