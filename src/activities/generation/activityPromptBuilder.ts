// Per-activity-type prompt builder. The full prompt chain is composed in activityGenerator.

import type { ActivityPurpose, ActivityType, GenerationContext } from '../types';
import type { SelectedSlot } from '../selection/activitySelector';
import { getAnnotation } from '../catalog/activityAnnotations';


const SCHEMA_HINTS: Record<ActivityType, string> = {
  warmup: '{ "type": "warmup", "title": string, "prompt": string, "voice"?: { "text": string } }',
  poll: '{ "type": "poll", "question": string, "options": string[] (2-4) }',
  opinion: '{ "type": "opinion", "prompt": string, "scaffolds"?: string[] }',
  matching: '{ "type": "matching", "instruction": string, "pairs": [{ "left": string, "right": string, "image_prompt": string, "image_url": null }] }',
  drag_drop: '{ "type": "drag_drop", "instruction": string, "categories": [{ "label": string, "items": string[] }] }',
  fill_blank: '{ "type": "fill_blank", "sentences": [{ "text": string (with ___), "answers": string[] }] }',
  sentence_builder: '{ "type": "sentence_builder", "items": [{ "tokens": string[], "answer": string }] }',
  pronunciation: '{ "type": "pronunciation", "items": [{ "text": string, "ipa"?: string, "tip"?: string }] }',
  reading: '{ "type": "reading", "passage": string, "questions": [{ "q": string, "options": string[], "answer": string }] }',
  listening: '{ "type": "listening", "transcript": string, "audio_prompt": string, "questions": [{ "q": string, "options": string[], "answer": string }] }',
  roleplay: '{ "type": "roleplay", "scene": string, "roles": [{ "name": string, "goal": string }], "starter_lines": string[] }',
  debate: '{ "type": "debate", "motion": string, "for_points": string[], "against_points": string[] }',
  speaking_mission: '{ "type": "speaking_mission", "mission": string, "success_criteria": string[] }',
  storytelling: '{ "type": "storytelling", "prompt": string, "story_anchors": string[] }',
  collaborative: '{ "type": "collaborative", "goal": string, "steps": string[] }',
  reflection: '{ "type": "reflection", "prompt": string }',
  retrieval: '{ "type": "retrieval", "items": [{ "cue": string, "answer": string }] }',
  review_challenge: '{ "type": "review_challenge", "challenge": string, "criteria": string[] }',
  // ── Phonics & trace ──
  trace_letter: '{ "type": "trace_letter", "letter": string, "case": "lower"|"upper", "phoneme": string, "example_word": string, "image_prompt": string, "image_url": null }',
  trace_word: '{ "type": "trace_word", "word": string, "graphemes": string[], "phonemes": string[], "image_prompt": string, "image_url": null }',
  phoneme_tap: '{ "type": "phoneme_tap", "word": string, "phonemes": string[], "audio_prompt": string }',
  blend_builder: '{ "type": "blend_builder", "target": string, "onset": string, "rime": string, "distractors": string[] }',
  rhyme_match: '{ "type": "rhyme_match", "anchor": string, "options": [{ "word": string, "image_prompt": string, "image_url": null, "rhymes": boolean }] }',
  cvc_builder: '{ "type": "cvc_builder", "target": string, "tiles": string[], "image_prompt": string, "image_url": null }',
  sound_hunt: '{ "type": "sound_hunt", "target_phoneme": string, "items": [{ "word": string, "image_prompt": string, "image_url": null, "contains": boolean }] }',
  decode_the_word: '{ "type": "decode_the_word", "word": string, "graphemes": string[], "ipa": string, "image_prompt": string, "image_url": null }',
  // ── Listening-first ──
  listen_and_match: '{ "type": "listen_and_match", "items": [{ "audio_prompt": string, "answers": string[], "options": string[] }] }',
  audio_to_image_match: '{ "type": "audio_to_image_match", "audio_prompt": string, "answers": string[], "options": [{ "id": string, "image_prompt": string, "image_url": null }] }',
  sound_discrimination: '{ "type": "sound_discrimination", "pair": [string, string], "items": [{ "audio_prompt": string, "answers": string[] }] }',
  echo_repetition: '{ "type": "echo_repetition", "items": [{ "text": string, "audio_prompt": string, "ipa"?: string }] }',
  listening_hunt: '{ "type": "listening_hunt", "target": string, "items": [{ "audio_prompt": string, "contains": boolean }] }',
  audio_sequence: '{ "type": "audio_sequence", "items": [{ "id": string, "audio_prompt": string }], "answers": string[] }',
  dictation_builder: '{ "type": "dictation_builder", "audio_prompt": string, "tiles": string[], "answers": string[] }',
  pronunciation_tap: '{ "type": "pronunciation_tap", "word": string, "syllables": string[], "stressed_index": number, "audio_prompt": string }',
  minimal_pairs: '{ "type": "minimal_pairs", "pair": [string, string], "items": [{ "audio_prompt": string, "answers": string[] }] }',
  // ── Phase 5 visual grammar + drills ──
  grammar_color_builder: '{ "type": "grammar_color_builder", "sentence": string, "tokens": [{ "text": string, "role": "aux|ending|base|time|negative|question|subject|object|contraction|inversion" }] }',
  timeline_drag: '{ "type": "timeline_drag", "axes": ["past","present","future"], "items": [{ "sentence": string, "answers": string[] }] }',
  tense_transform: '{ "type": "tense_transform", "seed": string, "grammar_target": string, "answers": { "negative": string, "question": string, "short_answer_yes": string, "short_answer_no": string } }',
  substitution_drill: '{ "type": "substitution_drill", "frame": string, "slot": string, "swaps": string[], "examples": string[] }',
  rapid_fire_drill: '{ "type": "rapid_fire_drill", "grammar_target": string, "items": [{ "cue": string, "answers": string[] }], "seconds_per_item": number }',
  grammar_sort: '{ "type": "grammar_sort", "buckets": string[], "items": [{ "text": string, "answers": string[] }] }',
  sentence_expansion: '{ "type": "sentence_expansion", "core": string, "steps": [{ "add": "who|when|where|why|how", "example": string }] }',
  chunk_builder: '{ "type": "chunk_builder", "target_utterance": string, "chunks": string[], "distractors": string[] }',
  // ── Phase 7 premium expansion ──
  syllable_clap: '{ "type": "syllable_clap", "items": [{ "word": string, "syllables": string[], "audio_prompt": string }] }',
  onset_rime_builder: '{ "type": "onset_rime_builder", "target": string, "onset": string, "rime": string, "onset_options": string[], "rime_options": string[], "image_prompt": string, "image_url": null }',
  drag_the_letters: '{ "type": "drag_the_letters", "target": string, "letters": string[], "distractors": string[], "image_prompt": string, "image_url": null }',
  missing_sound: '{ "type": "missing_sound", "word": string, "audio_prompt": string, "missing_position": "initial|medial|final", "options": string[], "answers": string[] }',
  phonics_bingo: '{ "type": "phonics_bingo", "grid": string[][], "calls": [{ "audio_prompt": string, "answers": string[] }] }',
  tap_the_grapheme: '{ "type": "tap_the_grapheme", "audio_prompt": string, "phoneme": string, "tiles": string[], "answers": string[] }',
  sound_sorting: '{ "type": "sound_sorting", "criterion": "initial|medial|final", "buckets": string[], "items": [{ "word": string, "audio_prompt": string, "answers": string[], "image_prompt": string, "image_url": null }] }',
  beginning_sound: '{ "type": "beginning_sound", "items": [{ "audio_prompt": string, "options": string[], "answers": string[] }] }',
  ending_sound: '{ "type": "ending_sound", "items": [{ "audio_prompt": string, "options": string[], "answers": string[] }] }',
  sequencing: '{ "type": "sequencing", "instruction": string, "items": [{ "id": string, "text": string }], "answers": string[] }',
  evidence_hunt: '{ "type": "evidence_hunt", "passage_ref": string, "claims": [{ "claim": string, "evidence": string }] }',
  dialogue_completion: '{ "type": "dialogue_completion", "scene": string, "turns": [{ "speaker": string, "text": string | null, "answers"?: string[] }] }',
  story_reconstruction: '{ "type": "story_reconstruction", "cues": string[], "target_vocab": string[], "target_grammar": string[], "model_retelling": string }',
  hotspot: '{ "type": "hotspot", "image_prompt": string, "image_url": null, "hotspots": [{ "x": number, "y": number, "label": string, "reveal": string, "audio_prompt"?: string }] }',
  branching_choice: '{ "type": "branching_choice", "scene": string, "nodes": [{ "id": string, "text": string, "choices": [{ "label": string, "next": string, "target_language": string }] }] }',
  interactive_story: '{ "type": "interactive_story", "title": string, "image_prompt": string, "image_url": null, "beats": [{ "narration": string, "audio_prompt": string, "interaction"?: { "kind": "tap|repeat|choose", "prompt": string, "answers"?: string[] } }] }',
  vocab_match_board: '{ "type": "vocab_match_board", "mode": "word_image" | "audio_image" | "audio_word", "instruction": string, "pairs": [{ "id": string, "word": string, "definition"?: string, "image_prompt": string, "image_url": null, "audio_prompt": string }] /* 4-10 pairs; ALL lesson target vocab on one board; for word_image mode each pair shows word↔image; for audio_image each pair plays audio_prompt and learner taps image; for audio_word each pair plays audio and learner taps word tile. NO partial coverage of vocab — include every target word. */ }',

  // ── Unified Phonics System (Hear → See → Say → Do, hub-skinned at render time) ──
  phonics_card: '{ "type": "phonics_card", "grapheme": string /* e.g. "sh", "ai", "silent-e" */, "phoneme": string /* IPA */, "mouth_hint": string /* one short sentence — Playground: tongue/lip cue; Academy: identity cue; Success: articulation note */, "phoneme_audio_url": null, "examples": [{ "word": string, "highlight": [number, number] /* start,end indices of grapheme inside word */, "image_prompt": string, "image_url": null, "audio_prompt": string }] /* exactly 3 examples */, "do_step": { "kind": "phoneme_isolation" | "blending_animation" | "minimal_pair_tap" | "grapheme_hunt" | "decoding_probe" /* + kind-specific fields */ }, "progression": { "unit_label": string, "phase_label": "Sounds" | "CVC" | "Digraphs" | "Blends" | "Advanced" } }',
  phoneme_isolation: '{ "type": "phoneme_isolation", "target_phoneme": string, "instruction": string /* ≤6 words for early readers */, "pictures": [{ "word": string, "image_prompt": string, "image_url": null, "starts_with_target": boolean }] /* 3-4 pictures, exactly 1 correct */ }',
  blending_animation: '{ "type": "blending_animation", "letters": string[] /* 2-5 graphemes */, "word": string /* blended result */, "word_audio_url": null, "instruction": string /* ≤6 words */ }',
  minimal_pair_tap: '{ "type": "minimal_pair_tap", "pair": [string, string] /* e.g. ["ship","sheep"] */, "correct": string, "audio_url": null, "context_hint"?: string }',
  grapheme_hunt: '{ "type": "grapheme_hunt", "target_grapheme": string, "sentence": string /* 1 short sentence with 2-4 occurrences */, "instruction": string }',
  decoding_probe: '{ "type": "decoding_probe", "target_pattern_key": string /* must match a key in phonicsPseudowords.ts */, "items": [{ "word": string, "is_pseudoword": boolean }] /* 3-5 items mixing real + pseudowords */ }',
};

export function buildActivityPrompt(
  slot: SelectedSlot,
  ctx: GenerationContext,
  vocabDirectives: string,
  grammarDirectives: string,
): string {
  const schema = SCHEMA_HINTS[slot.type];
  const ann = getAnnotation(slot.type);
  const classGuidance =
    ann.cognitive_class === 'input_based'
      ? `Honor the silent period: learner demonstrates comprehension non-verbally (tap, drag, point). Do NOT force speech.`
      : ann.cognitive_class === 'guided_output'
      ? `Use a tight scaffold (substitution table / chunk frame). Production must be near-impossible to get word-order wrong.`
      : ann.cognitive_class === 'analytical'
      ? `Assume metalinguistic awareness (≥A2). Make the rule explicit; require conscious manipulation of form.`
      : `Free or semi-free production. Provide a clear communicative goal; reward bravery, not just accuracy.`;
  const bp = ctx.plan.blueprint;
  const topic = (bp as any).topic ?? bp.lesson_title ?? '';
  const targetVocab = (bp.target_vocab ?? []).join(', ');
  const characters = (bp as any).characters?.join?.(', ') ?? '';
  const usedTypes = ctx.previous.map((a) => a.type).join(', ') || '(none yet)';
  return [
    `## ACTIVITY REQUEST`,
    `Generate ONE activity.`,
    `- type: ${slot.type}`,
    `- pedagogical purpose: ${slot.purpose}`,
    `- stage: ${slot.stage}`,
    `- expected modalities: ${slot.stageSpec.modalities.join(', ')}`,
    ``,
    `## LESSON TOPIC BINDING (hard)`,
    `- lesson topic: ${topic}`,
    `- target vocab (use ≥1 verbatim): ${targetVocab || '(none)'}`,
    characters ? `- lesson characters (prefer these over generic names): ${characters}` : '',
    `- already-used activity types in this lesson: ${usedTypes}`,
    `→ Content MUST reference the topic and use ≥1 target word verbatim.`,
    `→ Do NOT copy the shape/wording of any already-used activity.`,
    `→ Do NOT use generic filler like "cat/dog/pig" unless they are the lesson topic.`,
    ``,
    `## ACTIVITY METADATA (Cycle 4 — binding)`,
    `- cognitive_class: ${ann.cognitive_class}`,
    `- esa_phases: ${ann.esa_phases.join(', ')}`,
    `- target_skills: ${ann.target_skills.join(', ')}`,
    `- pedagogy_rule: ${ann.pedagogy_rule}`,
    ann.ai_triggers?.length ? `- ai_triggers: ${ann.ai_triggers.join(', ')}` : '',
    classGuidance,
    ``,
    vocabDirectives,
    ``,
    grammarDirectives,
    ``,
    `Return STRICT JSON only matching this shape (no commentary, no truncation, no markdown fences):`,
    schema,
    ``,
    `JSON HARD RULES:`,
    `- Every string field MUST be non-empty and meaningful — no placeholders ("lorem", "TODO", "[insert ...]", "example here").`,
    `- Output MUST be a single complete JSON value with balanced braces/brackets.`,
    `- Do NOT emit partial fragments like "[\\n{a"; if you cannot complete, return an empty {} instead.`,
    ``,
    `If this activity is a vocabulary card or contains vocab items, EACH item MUST include:`,
    `  - word: the target headword`,
    `  - definition: a learner-grade definition`,
    `  - example: a sentence that contains the exact headword`,
    `  - image_prompt: a short visual description for image generation`,
    `  - pronunciation (optional but recommended): IPA or simple respelling`,
    ``,
    `IMAGE FIELD RULES (hard):`,
    `  - NEVER place a prompt inside image_url. image_url MUST be null at generation time (the renderer fills it later).`,
    `  - Put the visual description ONLY in image_prompt.`,
    `  - FORBIDDEN values for image_url: anything starting with "AI:", "prompt:", "generate:", "{", "[", or empty strings with a prompt set.`,
    ``,
    `MULTI-ANSWER RULES (hard):`,
    `  - For fill_blank / matching / sound_discrimination / drag_drop / dictation, ALL acceptable answers MUST be in "answers": string[].`,
    `  - NEVER emit "answer": "a,b" as a comma-joined string.`,
    ``,
    `MATCHING UNIQUENESS (hard):`,
    `  - In matching activities, every pair MUST have its OWN unique image_prompt describing a visually distinct subject.`,
    `  - Do NOT reuse the same subject (e.g. "a fox") across multiple pairs.`,
    ``,
    `Also include alongside the type-specific fields:`,
    `  "target_vocab_used": string[]  // target words actually used`,
    `  "grammar_targets_used": string[] // target structures actually used`,
    `  "narrative_anchor": { "characters": string[], "setting": string, "scene": string }`,
  ].join('\n');
}

export function purposeForStage(stage: SelectedSlot['stage']): ActivityPurpose {
  switch (stage) {
    case 'hook': return 'hook';
    case 'context':
    case 'input': return 'input';
    case 'discovery': return 'discovery';
    case 'controlled': return 'controlled';
    case 'communicative': return 'communicative';
    case 'production': return 'production';
    case 'reflection': return 'reflection';
  }
}
