// Tier 3 — programmatic guardrails. Run on any generated unit before it
// reaches the player. Returns a list of violations; empty = pass.

import {
  PlaygroundUnitConfig, REQUIRED_PHASE_ORDER, TOPIC_EMOJI_LOCK,
} from "./blueprintSchema";

const SIZE_WORDS = ["small", "big", "tiny", "huge", "little", "large"];
const COLOR_WORDS = [
  "red", "orange", "yellow", "green", "blue", "purple",
  "pink", "black", "white", "brown",
];

export interface BlueprintViolation { code: string; detail: string; }

export function validateBlueprint(
  unit: PlaygroundUnitConfig,
): BlueprintViolation[] {
  const v: BlueprintViolation[] = [];

  // Phase completeness + order
  if (unit.phases.length < 9 || unit.phases.length > 10) {
    v.push({ code: "PHASE_COUNT", detail: `expected 9–10, got ${unit.phases.length}` });
  }
  REQUIRED_PHASE_ORDER.forEach((kind, i) => {
    if (unit.phases[i]?.kind !== kind) {
      v.push({ code: "PHASE_ORDER", detail: `phase[${i}] must be ${kind}` });
    }
  });

  // Lesson 4 storybook opener
  if (unit.lesson_number === 4 && unit.phases[0]?.kind !== "SignedStory") {
    v.push({ code: "STORYBOOK_OPENER", detail: "Lesson 4 must open with SignedStory" });
  }

  // OSASCOMP — size before color in example frame
  const ex = unit.sentence_structures.example_correct.toLowerCase();
  const sizeIdx = SIZE_WORDS.map(w => ex.indexOf(w)).find(i => i >= 0) ?? -1;
  const colorIdx = COLOR_WORDS.map(w => ex.indexOf(w)).find(i => i >= 0) ?? -1;
  if (sizeIdx >= 0 && colorIdx >= 0 && sizeIdx > colorIdx) {
    v.push({ code: "OSASCOMP", detail: `size must precede color in "${ex}"` });
  }

  // Brain-break emoji topic lock
  const topic = unit.unit_topic.toLowerCase();
  const lock = Object.entries(TOPIC_EMOJI_LOCK).find(([k]) => topic.includes(k));
  if (lock) {
    const [topicKey, allowed] = lock;
    const bb = unit.phases.find(p => p.kind === "BrainBreak");
    const emojis = bb?.mapped_emojis ?? [];
    const bad = emojis.filter(e => !allowed.includes(e));
    if (bad.length) {
      v.push({
        code: "BRAIN_BREAK_EMOJI",
        detail: `topic "${topicKey}" forbids ${bad.join(" ")}; allowed: ${allowed.join(" ")}`,
      });
    }
  }

  // Phonics must point to bitmap assets
  const phonics = unit.phases.find(p => p.kind === "Phonics");
  if (phonics) {
    const imgs = phonics.bitmap_illustrations ?? [];
    if (!imgs.length || !imgs.every(p => /^src\/assets\/phonics\/.+\.png$/.test(p))) {
      v.push({ code: "PHONICS_ASSETS", detail: "phonics requires src/assets/phonics/<word>.png" });
    }
  }

  // Spelling scramble must not equal target word order — sanity check on frame
  const frame = unit.sentence_structures.frame;
  if (!/\[.+\]/.test(frame)) {
    v.push({ code: "FRAME_INVALID", detail: "sentence frame must contain [slots]" });
  }

  return v;
}
