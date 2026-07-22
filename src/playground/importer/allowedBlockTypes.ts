/**
 * Playground (Pre-A1) block whitelist — client-side mirror of the
 * server-side `PLAYGROUND_ALLOWED_TYPES` in
 * `supabase/functions/_shared/prompts/playground.ts`.
 *
 * Used by the PlaygroundJsonImporter to gate raw JSON before it can be
 * appended to the current draft lesson.
 */
export const PLAYGROUND_ALLOWED_BLOCK_TYPES = [
  'intro',
  'phonics_focus',
  'phonics_card',
  'phoneme_isolation',
  'trace_letter',
  'trace_word',
  'blend_builder',
  'blending_animation',
  'sound_blend',
  'word_builder',
  'onset_rime_builder',
  'missing_sound',
  'cvc_builder',
  'drag_the_letters',
  'decode_the_word',
  'tap_the_grapheme',
  'grapheme_hunt',
  'minimal_pair_tap',
  'drag',
  'drag_drop',
  'warmup',
  'poll',
  'listen_match',
  'matching',
  'matching_pairs',
  'vocab_match_board',
  'listen_and_match',
  'audio_to_image_match',
  'sound_discrimination',
  'sound_spotting',
  'echo_repetition',
  'listen_and_repeat',
  'audio_sequence',
  'dictation_builder',
  'pronunciation',
  'pronunciation_tap',
  'minimal_pairs',
  'article_picker',
  'visual_sentence_builder',
  'sentence_builder',
  'grammar_blocks',
  'sentence_transform',
  'fill_blank',
  'memory',
  'memory_match',
  'tap_order',
  'hotspot',
  'thumbs',
  'sort',
  'sound_hunt',
  'sound_sorting',
  'grammar_sort',
  'sequencing',
  'beginning_sound',
  'ending_sound',
  'speaking_mission',
  'roleplay',
  'storybook',
  'lesson_summary',
] as const;

export type PlaygroundAllowedBlockType = typeof PLAYGROUND_ALLOWED_BLOCK_TYPES[number];

const ALLOWED = new Set<string>(PLAYGROUND_ALLOWED_BLOCK_TYPES);

export type PlaygroundBlock = Record<string, unknown> & { type: string };

export type ValidationError = {
  index: number;
  type: string | null;
  reason: string;
};

export type ValidationResult =
  | { ok: true; blocks: PlaygroundBlock[]; errors: [] }
  | { ok: false; blocks?: PlaygroundBlock[]; errors: ValidationError[] };

/**
 * Normalize a parsed JSON payload into a flat array of blocks. Accepts:
 *  - bare array `[ {...}, ... ]`
 *  - `{ blocks: [...] }`
 *  - `{ slides: [...] }`
 *  - `{ lesson: { blocks: [...] } }` or `{ lesson: { slides: [...] } }`
 */
function extractArray(input: unknown): unknown[] | null {
  if (Array.isArray(input)) return input;
  if (input && typeof input === 'object') {
    const obj = input as Record<string, unknown>;
    if (Array.isArray(obj.blocks)) return obj.blocks;
    if (Array.isArray(obj.slides)) return obj.slides;
    if (obj.lesson && typeof obj.lesson === 'object') {
      const l = obj.lesson as Record<string, unknown>;
      if (Array.isArray(l.blocks)) return l.blocks;
      if (Array.isArray(l.slides)) return l.slides;
    }
  }
  return null;
}

/**
 * Validate a parsed JSON value against the Playground whitelist. Does not
 * mutate input. Returns `{ ok, blocks }` when every entry is allowed, or
 * `{ ok: false, errors }` describing each offending block by index.
 */
export function validatePlaygroundBlocks(input: unknown): ValidationResult {
  const arr = extractArray(input);
  if (!arr) {
    return {
      ok: false,
      errors: [{ index: -1, type: null, reason: 'Payload is not an array of blocks (expected `[...]` or `{ blocks: [...] }`).' }],
    };
  }
  if (arr.length === 0) {
    return { ok: false, errors: [{ index: -1, type: null, reason: 'Block array is empty.' }] };
  }

  const errors: ValidationError[] = [];
  const blocks: PlaygroundBlock[] = [];

  arr.forEach((raw, i) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      errors.push({ index: i, type: null, reason: 'Block is not an object.' });
      return;
    }
    const obj = raw as Record<string, unknown>;
    const type = typeof obj.type === 'string' ? obj.type : null;
    if (!type) {
      errors.push({ index: i, type: null, reason: 'Missing "type" field.' });
      return;
    }
    if (!ALLOWED.has(type)) {
      errors.push({
        index: i,
        type,
        reason: `"${type}" is not in the Playground Pre-A1 whitelist.`,
      });
      return;
    }
    blocks.push({ ...obj, type } as PlaygroundBlock);
  });

  if (errors.length > 0) return { ok: false, blocks, errors };
  return { ok: true, blocks, errors: [] };
}
