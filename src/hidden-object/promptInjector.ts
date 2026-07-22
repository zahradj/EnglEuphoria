import { getHiddenObjectProfile } from "./hubProfiles";
import type { HubId, CefrLevel } from "./types";
import type { ReinforcementTarget } from "@/coherence/types";

export interface BuildHiddenObjectPromptInput {
  hub: HubId;
  cefr: CefrLevel;
  theme: string;
  targets: ReinforcementTarget[];
}

/**
 * Contract prompt: forces the AI to emit a HiddenObjectScene JSON that satisfies
 * validateHiddenObjectScene() — hub-gated target count, normalised coords, and
 * every target bound to a ReinforcementTarget.
 */
export function buildHiddenObjectPrompt(
  input: BuildHiddenObjectPromptInput,
): string {
  const p = getHiddenObjectProfile(input.hub);
  const targetsList = input.targets
    .map((t, i) => `  ${i + 1}. id="${t.id}" skill_kind="${t.skill_kind}" skill_key="${t.skill_key}" label="${t.label}"`)
    .join("\n");

  return [
    `# HIDDEN OBJECT SCENE CONTRACT — ${input.hub.toUpperCase()} · ${input.cefr}`,
    "",
    `You are generating a Hidden Object mini-game scene for the ${input.hub} hub.`,
    `Theme: ${input.theme}`,
    "",
    "## Reinforcement targets (each must map to exactly one hidden object)",
    targetsList,
    "",
    "## Hub rules (HARD)",
    `- Emit ${p.minTargets}-${p.maxTargets} targets total.`,
    `- Each prompt line ≤ ${p.maxPromptWords} words, CEFR ${input.cefr} appropriate.`,
    `- image_url MUST be null. Put ALL visual guidance in image_prompt.`,
    `- Coordinates x, y ∈ [0,1]; radius ∈ [0.03, 0.20]; hitboxes must NOT overlap.`,
    `- Every target MUST include a "reinforces" object with the id from the list above.`,
    p.requirePreposition
      ? "- Every target MUST include a preposition (in / on / under / behind / next to …)."
      : "- Prepositions optional.",
    p.requireDefinition
      ? `- Every target MUST include a CEFR-${input.cefr} definition ≤ 12 words.`
      : "- Definitions optional.",
    "- No text/labels/speech bubbles in the scene image (image_prompt must forbid text).",
    "",
    "## Output JSON shape",
    "```json",
    "{",
    '  "id": "ho_<slug>",',
    `  "hub": "${input.hub}",`,
    `  "cefr": "${input.cefr}",`,
    `  "theme": "${input.theme}",`,
    '  "image_prompt": "<single-scene descriptive prompt, no text overlays>",',
    '  "image_url": null,',
    '  "intro": "<one short sentence to frame the scene>",',
    '  "outro": "<one short congratulatory sentence>",',
    '  "targets": [',
    "    {",
    '      "label": "<object name>",',
    '      "prompt": "Find the <object> …",',
    '      "x": 0.42, "y": 0.61, "radius": 0.07,',
    '      "preposition": "under",',
    '      "definition": "<short definition>",',
    '      "reinforces": { "id": "<target-id-from-list>", "skill_kind": "vocab", "skill_key": "<word>", "label": "<word>" }',
    "    }",
    "  ]",
    "}",
    "```",
    "",
    "Return ONLY the JSON object. No prose, no code fences.",
  ].join("\n");
}
