// Activity Variety Directive — closes the gap between what generate-playground
// produces on its own and the anti-repetition discipline used when hand-crafting
// Pre-A1 lessons this project already ships (see the activity-pattern-library
// skill's Hard Variety Rule). That skill's own catalog of `kind`s doesn't apply
// here directly -- generate-playground emits a different, older activity-type
// vocabulary (see HUB_WHITELIST.playground in hubWhitelist.ts: phonics_focus,
// trace_letter, matching_pairs, cvc_builder, etc.), not the Scene[] `kind`s used
// by src/content/playground-library. What DOES transfer is the underlying rule
// itself, restated against whatever type list is actually in play.
//
// Without this, a generated unit can (and has) repeated the same activity type
// back-to-back across most of a lesson -- the exact failure mode the Hard
// Variety Rule was written to catch in hand-built lessons.

export function buildActivityVarietyDirective(): string {
  return [
    `=== ACTIVITY VARIETY RULE (BINDING) ===`,
    `Before finalizing each lesson, list the "type" value of every activity/slide you generated, in order.`,
    `HARD RULE: no more than 2 consecutive entries may share the identical "type" value. If you find a run of 3+, replace the 3rd-or-later entry with a different allowed type that still serves the same phase's purpose.`,
    `A lesson should draw from at least 3-4 different activity types, not one type repeated with different vocabulary -- cosmetic variation (same mechanic, different words/images) does NOT count as variety.`,
    `This check applies within each lesson's own phase sequence (e.g. within L2's warm-up -> vocab refresher -> modeling -> phonics -> sentence -> practice -> listening -> spelling chain) -- do not solve it by using the same type across different phases either.`,
    `=== END ACTIVITY VARIETY RULE ===`,
  ].join("\n");
}
