// Hub component whitelist — the Cycle 5 "3-Brain" guardrail.
// Each hub may ONLY emit activities/slides whose `type` lives in its set.
// Any other `type` is treated as a hard violation and must be repaired
// before the lesson can be returned to the client.

export type HubId = "playground" | "academy" | "success";

export const HUB_WHITELIST: Record<HubId, ReadonlySet<string>> = {
  // Brain 1 — Pre-A1 "Here-and-Now" engine (9-type strict whitelist).
  playground: new Set([
    "intro",
    "phonics_focus",
    "phonics_card",
    "phoneme_isolation",
    "trace_letter",
    "trace_word",
    "blend_builder",
    "blending_animation",
    "sound_blend",
    "word_builder",
    "onset_rime_builder",
    "missing_sound",
    "drag",
    "drag_drop",
    "warmup",
    "poll",
    "listen_match",
    "matching",
    "matching_pairs",
    "vocab_match_board",
    "listen_and_match",
    "audio_to_image_match",
    "sound_discrimination",
    "sound_spotting",
    "echo_repetition",
    "listen_and_repeat",
    "audio_sequence",
    "dictation_builder",
    "pronunciation",
    "pronunciation_tap",
    "minimal_pairs",
    "article_picker",
    "visual_sentence_builder",
    "sentence_builder",
    "grammar_blocks",
    "sentence_transform",
    "fill_blank",
    "storybook",
    "lesson_summary",
    // Trail-style data-driven games (First English Adventure visual identity)
    "memory",
    "memory_match",
    "tap_order",
    "hotspot",
    "thumbs",
    "sort",
    "sound_hunt",
    "sound_sorting",
    "grammar_sort",
    "sequencing",
    "tap_the_grapheme",
    "grapheme_hunt",
    "minimal_pair_tap",
    "beginning_sound",
    "ending_sound",
    "speaking_mission",
    "roleplay",
    // Phonics word-work (Pre-A1 CVC + sound blending)
    "cvc_builder",
    "drag_the_letters",
    "decode_the_word",
    // Legacy / dynamic types kept for back-compat with generate-ppp-slides
    "multiple",
    "truefalse",
    "fill",
    "match",
    "draw",
    "vocab_solo",
  ]),

  // Per-hub violation policy. Playground sanitizes (strips banned blocks)
  // because a 4-year-old must never see a banned component even if the
  // model slips up. Academy / Success use bounded repair + 422.

  // Brain 2 — A1 → B1 (optional B2) Task-Based Language Teaching engine.
  academy: new Set([
    "intro",
    "vocab_card",
    "reading_passage",
    "comprehension_mcq",
    "fill_blank",
    "matching_pairs",
    "grammar_form_card",
    "controlled_drill",
    "roleplay_dialogue",
    "info_gap",
    "task_outcome",
    "homework_task",
    "celebration",
    "vocab",
    "vocab_deck",
    "vocab_image_match",
    "grammar_color_decode",
    "frequency_thermometer",
    "grammar_formula",
  ]),
  // Brain 3 — Upper B2 → C1 (C2 generates as C1+) academic / exam-prep engine.
  success: new Set([
    "intro",
    "lexical_chunk_card",
    "academic_reading",
    "audio_dictation",
    "advanced_tense_transform",
    "collocation_match",
    "register_shift_drill",
    "debate_prep",
    "essay_prompt",
    "model_answer_analysis",
    "exam_strategy",
    "celebration",
  ]),
};

export type HubViolationPolicy = "sanitize" | "repair_then_422";

export const HUB_VIOLATION_POLICY: Record<HubId, HubViolationPolicy> = {
  playground: "sanitize",
  academy: "repair_then_422",
  success: "repair_then_422",
};

/**
 * Recursively strip any object whose `type` is not in the hub's whitelist.
 * - Arrays: drop offending elements entirely.
 * - Objects: leave the parent in place but recurse into its children.
 * Returns a structurally-cloned, sanitized copy. Counts removals.
 */
export function sanitizeHubLesson(
  hub: HubId,
  lesson: unknown,
): { lesson: unknown; removed: number; removedTypes: string[] } {
  const allowed = HUB_WHITELIST[hub];
  const removedTypes = new Set<string>();
  let removed = 0;

  const clean = (node: unknown): unknown => {
    if (Array.isArray(node)) {
      const out: unknown[] = [];
      for (const child of node) {
        if (child && typeof child === "object" && !Array.isArray(child)) {
          const t = (child as Record<string, unknown>).type;
          if (typeof t === "string" && !allowed.has(t)) {
            removed += 1;
            removedTypes.add(t);
            continue;
          }
        }
        out.push(clean(child));
      }
      return out;
    }
    if (node && typeof node === "object") {
      const obj = node as Record<string, unknown>;
      const next: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(obj)) next[k] = clean(v);
      return next;
    }
    return node;
  };

  return { lesson: clean(lesson), removed, removedTypes: [...removedTypes] };
}

export interface WhitelistReport {
  ok: boolean;
  offending: string[]; // distinct illegal `type` values found
  locations: Array<{ path: string; type: string }>; // for repair prompts
}

/**
 * Walks a generated lesson payload and gathers every activity/slide `type`
 * that is NOT in the hub's whitelist. Recurses into common containers
 * (slides[], activities[], content.activities[]).
 */
export function validateHubWhitelist(
  hub: HubId,
  lesson: unknown,
): WhitelistReport {
  const allowed = HUB_WHITELIST[hub];
  const offending = new Set<string>();
  const locations: Array<{ path: string; type: string }> = [];

  const visit = (node: unknown, path: string) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach((child, i) => visit(child, `${path}[${i}]`));
      return;
    }
    const obj = node as Record<string, unknown>;
    const t = typeof obj.type === "string" ? (obj.type as string) : null;
    if (t && !allowed.has(t)) {
      offending.add(t);
      locations.push({ path: `${path}.type`, type: t });
    }
    for (const [k, v] of Object.entries(obj)) {
      if (k === "type") continue;
      visit(v, path ? `${path}.${k}` : k);
    }
  };

  visit(lesson, "$");
  return { ok: offending.size === 0, offending: [...offending], locations };
}
