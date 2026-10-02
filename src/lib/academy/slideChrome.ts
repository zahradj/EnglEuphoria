/**
 * Slide "chrome" rules for Academy lessons, mirroring PlayAcademyLesson.tsx
 * (the student player) so the LIVE CLASSROOM draws a slide the same way the
 * lesson was authored: full-bleed scene slides edge-to-edge over their own
 * art, everything else as a card. Without this the classroom put every slide
 * in a small light card with no background art (scene_dialogue, find_in_scene,
 * story_page, canvas_game, expedition... all looked broken).
 */

const OWN_IMAGE_TYPES = new Set([
  'scene_dialogue', 'conversation_fill', 'number_chart', 'number_quiz_game', 'story_page',
  'letter_sound_game', 'word_blend', 'picture_match_game', 'say_it_game',
  'sound_challenge_game', 'find_in_scene_game',
]);

const FULL_BLEED_TYPES = new Set([
  'scene_dialogue', 'conversation_fill', 'role_play', 'number_chart', 'number_quiz_game',
  'letter_sound_game', 'word_blend', 'picture_match_game', 'say_it_game',
  'sound_challenge_game', 'find_in_scene_game', 'story_page', 'escape_room_slot',
  'expedition_game', 'hidden_object_slot', 'detective_mystery_slot', 'story_engine_slot',
  'canvas_game', 'living_canvas', 'vocab', 'reading_passage', 'cluster', 'grammar_pattern',
  'intro',
]);

/** Slide types that draw no card of their own and need a readable "journal page" frame. */
const JOURNAL_FRAME_TYPES = new Set(['reading_passage', 'grammar_pattern', 'cluster', 'vocab']);

export function isAcademyFullBleed(slide: any): boolean {
  return FULL_BLEED_TYPES.has(String(slide?.type)) || !!slide?.image_url;
}

export function needsJournalFrame(slide: any): boolean {
  return JOURNAL_FRAME_TYPES.has(String(slide?.type)) && !slide?.image_url;
}

/** The art to paint behind a slide: its own scene image first, then the lesson's per-block image. */
export function academySlideBackground(slide: any): string | undefined {
  const type = String(slide?.type);
  const own = OWN_IMAGE_TYPES.has(type)
    ? slide?.bg_image_url
    : type === 'canvas_game' || type === 'living_canvas'
      ? slide?.background_image
      : undefined;
  return (own || slide?._blockImage || undefined) as string | undefined;
}
