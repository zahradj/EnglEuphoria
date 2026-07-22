// Illustration contract injected into every beat's illustration_prompt.

export const ILLUSTRATION_RULES = `
ILLUSTRATION RULES (every beat's illustration_prompt MUST satisfy):
  • Open with the BACKDROP world descriptor, then the per-beat setting_variation
    if present (same world — e.g. same village, different room/corner/time).
    Backdrops MAY evolve between beats to match the story (indoor↔outdoor,
    new location in the same world, time-of-day shifts) — but the WORLD,
    palette, and art style stay consistent.
  • Inject the CHARACTER LOOK BOOK lines verbatim for every character on stage
    so faces, fur, outfits and proportions never change between beats.
  • Render the BLOCKING explicitly: name each character's position
    (front-left / center / back-right…), pose, movement, and emotion exactly
    as listed in the beat's "blocking" array. Use action verbs.
  • INCLUDE comic-style speech bubbles with EXACTLY the dialogue lines, in
    clean kid-friendly handwritten English, correctly spelled, tails pointing
    to the speaker.
  • COLOR-CODE each bubble using the character's outline/fill from cast.bubble.
  • Text inside bubbles is dark charcoal for contrast.
  • Warm cinematic lighting, rich storybook depth, child-safe.
  • No on-image typography beyond the bubbles. No watermarks.
`.trim();

export const COVER_RULES = `
COVER / FRONT-PAGE RULES (cover.illustration_prompt MUST satisfy):
  • Hero composition introducing the lead cast in the backdrop world.
  • Cinematic, magazine-cover quality — high detail, warm lighting, depth.
  • Inject the CHARACTER LOOK BOOK verbatim for every character shown.
  • If cover.show_title_on_image is true, render the STORY TITLE as bold,
    child-friendly hand-lettered display type at the top of the image,
    perfectly spelled, no other text on the image.
  • No speech bubbles on the cover.
  • Convey the story's mood and theme at a glance.
`.trim();

export function castLookBookBlock(
  characters: Array<{ name: string; look_book?: string }>,
): string {
  const lines = characters
    .filter((c) => c.look_book)
    .map((c) => `- ${c.look_book}`);
  if (!lines.length) return "";
  return `CHARACTER LOOK BOOK (render EXACTLY as described, identical across every beat):\n${lines.join("\n")}`;
}
