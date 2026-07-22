// Builds the governance system-prompt block that MUST prepend every Gemini call
// involved in lesson/slide generation. Keep it concise — token budget matters.

import type { LessonState } from './types';
import { effectiveCaps, HUB_BANNED_REGISTERS } from './data/cefrCaps';
import { getVocabBudget } from './data/cefrVocab';
import { isPreA1, buildPreA1PromptAddendum } from '@/curriculum/preA1Profile';

export function buildGovernanceSystemPrompt(state: LessonState): string {
  const caps = effectiveCaps(state.cefr, state.hub);
  const lines: string[] = [];

  lines.push('## CURRICULUM GOVERNANCE CONTRACT (binding)');
  lines.push(`Hub: ${state.hub} · CEFR: ${state.cefr}`);
  lines.push(`Theme: ${state.theme.theme}`);
  lines.push(`Characters: ${(state.theme.characters || []).join(', ') || '(none)'}`);
  lines.push(`Setting: ${state.theme.setting}`);
  lines.push(`Tone: ${state.theme.tone}`);
  lines.push(`Communication goal: ${state.theme.communication_goal}`);
  lines.push('');
  lines.push('### Grammar scope');
  lines.push(`- TARGET (use): ${state.grammar.target_grammar.join(', ') || '(none)'}`);
  lines.push(`- REVIEW (light recycle): ${state.grammar.review_grammar.join(', ') || '(none)'}`);
  lines.push(`- EXPOSURE only (minimal, non-essential): ${state.grammar.exposure_grammar.join(', ') || '(none)'}`);
  lines.push(`- BLOCKED (never): ${state.grammar.blocked_grammar.join(', ') || '(none)'}`);
  lines.push('');
  lines.push('### Vocabulary scope');
  lines.push(`- TARGET (recycle across activities): ${state.vocab.target_vocab.join(', ')}`);
  lines.push(`- SUPPORT (allowed): ${state.vocab.support_vocab.join(', ')}`);
  lines.push(`- FORBIDDEN CATEGORIES (never): ${state.vocab.forbidden_vocab_categories.join(', ') || '(none)'}`);
  lines.push('');
  lines.push('### CEFR caps');
  lines.push(`- Max sentence words: ${caps.maxSentenceWords}`);
  lines.push(`- Max clauses per sentence: ${caps.maxClausesPerSentence}`);
  lines.push(`- Max syllables per word: ${caps.maxSyllablesPerWord}`);
  lines.push(`- Abstract concepts allowed: ${caps.allowAbstract ? 'yes' : 'no'}`);
  lines.push(`- Banned constructs at this level: ${caps.bannedConstructs.join(', ') || '(none)'}`);
  const vbudget = getVocabBudget(state.cefr, state.hub);
  lines.push(`- Vocabulary budget at ${state.cefr} (${state.hub}): ${vbudget.perLessonMin}–${vbudget.perLessonMax} NEW target words per lesson (unit cap ${vbudget.perUnitMax}).`);
  lines.push(`- FORBIDDEN: introducing vocabulary above ${state.cefr}. AVOID flooding the lesson with words >1 CEFR band below ${state.cefr} (reads babyish).`);
  lines.push('');
  lines.push('### Hub register');
  lines.push(`- Forbidden registers in ${state.hub}: ${HUB_BANNED_REGISTERS[state.hub].join(', ')}`);
  lines.push('');
  lines.push('### Hard rules');
  lines.push('1. NEVER use blocked grammar or above-level constructs.');
  lines.push('2. NEVER introduce vocabulary from forbidden categories.');
  lines.push('3. EVERY activity must stay inside the declared theme/characters/setting.');
  lines.push('4. NO placeholders ("lorem ipsum", "New sentence here.", "[insert ...]").');
  lines.push('5. Return complete, well-formed JSON only. No commentary outside the JSON.');
  lines.push('6. Alternate receptive (input) and productive (output) activities.');
  lines.push('');
  lines.push('## CAMBRIDGE PEDAGOGY CONTRACT (binding)');
  lines.push('### Topic locking');
  lines.push('- ALL activities must reinforce ONLY the TARGET grammar and TARGET vocabulary listed above.');
  lines.push('- DO NOT insert unrelated grammar, unrelated vocabulary, random generic comprehension questions, unrelated names, unrelated situations, or mixed tenses outside the lesson objective.');
  lines.push('### Reading consistency');
  lines.push('- ALL reading comprehension questions MUST reference characters, actions, events, or vocabulary from the lesson\'s actual reading passage.');
  lines.push('- NEVER generate generic textbook questions, unrelated people, or unrelated scenarios.');
  lines.push('### Vocabulary integrity');
  lines.push('- Every vocabulary item MUST contain: the target word, a correct definition, AND an example sentence containing the exact target word.');
  lines.push('- NEVER produce an example that omits its own target word.');
  lines.push('### Pedagogical flow');
  lines.push('- Maintain this order across the lesson: intro/hook → warm-up → vocab presentation → vocab practice → reading/story → reading comprehension → grammar noticing → grammar explanation → controlled practice → semi-controlled practice → interactive speaking → reflection → review/summary → homework.');
  lines.push('### Activity balancing');
  lines.push('- Maximum 2 MCQ sections per lesson. Maximum 2 fill-blank sections per lesson.');
  lines.push('- Vary across: matching, sentence builders, roleplay, speaking, listening, polls, debate, storytelling.');
  lines.push('### Story consistency');
  lines.push(`- Use the declared characters (${(state.theme.characters || []).join(', ') || 'consistent cast'}) and setting consistently across all activities. Do NOT switch characters or worlds.`);
  lines.push('### Output quality');
  lines.push('- Produce polished, classroom-ready, Cambridge-style content. Every activity must feel intentional, connected, and pedagogically progressive — NOT a random worksheet.');
  lines.push('');
  lines.push('## IMAGE & ANSWER SCHEMA CONTRACT (binding)');
  lines.push('- image_url MUST be null in every generated payload. Put visuals in image_prompt only.');
  lines.push('- Forbidden image_url values: "AI:...", "prompt:...", "generate:...", "{...", "[...", or empty strings when image_prompt is set.');
  lines.push('- Multi-answer fields MUST use "answers": string[]. NEVER use a comma-joined "answer" string.');
  lines.push('- In matching activities, every pair MUST have its own unique image_prompt — do NOT reuse the same subject across pairs.');
  lines.push(`- SETTING LOCK: every image_prompt MUST place its subject inside "${state.theme.setting}" (reuse the same world, props, and character wardrobe as the lesson). Generic classrooms/parks are rejected unless the setting IS "classroom" / "park".`);
  if (state.hub === 'playground') {
    lines.push('');
    lines.push('## PLAYGROUND EARLY-YEARS REGISTER (binding for this hub)');
    lines.push('- Definitions MUST be ultra short (≤6 words), concrete, spoken-language friendly, and visualizable.');
    lines.push('- Examples: "a soft thing you sleep on", "a fruit that is yellow".');
    lines.push('- FORBIDDEN abstract words in definitions: concept, represent, refers to, signifies, denotes, abstract, essentially, generally.');
    lines.push('- Prefer present tense, short sentences (≤8 words), and immediate sensory referents.');
  }
  lines.push('');
  lines.push('## PREMIUM EXPERIENCE CONTRACT (Phase 7 — binding)');
  lines.push('### Mandatory intro slide');
  lines.push('- The FIRST slide MUST be `{ "type": "intro", "kind": "intro", "block": "warmup", "title": ..., "subtitle": ..., "image_prompt": "<cinematic Disney/Netflix-grade opener of the theme + recurring characters>", "teacher_notes": ... }`.');
  lines.push('- The intro slide is visual storytelling only — NO quizzes, NO options, NO questions, NO tasks. Minimal text.');
  lines.push('- Only ONE intro slide per lesson; it must precede every other slide.');
  lines.push('### Vocabulary integrity (zero tolerance)');
  lines.push('- Every vocab card requires non-empty word, definition, AND example. Example MUST contain the headword. NO duplicate target words.');
  lines.push('- Every example MUST belong to the lesson story/world (use the declared characters/setting). NO generic filler.');
  lines.push('### Phonics & literacy (Playground + early CEFR)');
  lines.push('- For Pre-A1 / A1 lessons include at least one of: trace_letter, trace_word, phoneme_tap, blend_builder, cvc_builder, syllable_clap, onset_rime_builder, drag_the_letters, missing_sound, tap_the_grapheme, sound_sorting, beginning_sound, ending_sound, decode_the_word, phonics_bingo.');
  lines.push('### Multisensory & game feel');
  lines.push('- Every lesson MUST combine visuals + audio + speaking + interaction. Add tap/drag/sequence/hotspot moments. Frame sections as missions/challenges with XP-style celebrations after wins (the gamification engine emits the actual XP).');
  lines.push('### Visual grammar & true drilling');
  lines.push('- Grammar slides MUST use color-coded chunks via `<hl role="aux|ending|base|time|negative|question|contraction|inversion">` markup AND include a transformation set (positive / negative / question / short answer yes / short answer no).');
  lines.push('- Every grammar lesson MUST include at least one of: substitution_drill, rapid_fire_drill, tense_transform, chunk_builder — NOT only MCQs.');
  lines.push('### Listening-first floor');
  lines.push('- Every lesson MUST contain ≥1 listening activity AND ≥1 pronunciation/repeat-after activity (echo_repetition, pronunciation_tap, minimal_pairs, listen_and_match, listening_hunt, dictation_builder).');
  lines.push('### Activity diversity caps');
  lines.push('- Max 2 MCQ-style activities, max 2 fill_blank, max 1 sentence_builder, max 1 true/false. Replace excess with drag_drop, sequencing, evidence_hunt, dialogue_completion, story_reconstruction, hotspot, branching_choice, interactive_story.');
  lines.push('### Communicative speaking quality');
  lines.push('- Every speaking task MUST include `role`, `objective`, `emotion`, `grammar_target`, `vocab_target`. Generic prompts like "Talk about it" / "Discuss" are FORBIDDEN.');
  lines.push('### Story immersion');
  lines.push('- The declared characters MUST recur in ≥60% of task slides. Late slides MUST echo objects/scenes from the opening — the lesson is ONE connected story, not a worksheet bundle.');
  // Pre-A1 override — appended only when the learner cannot read.
  // A1+ prompts are byte-identical to before.
  if (isPreA1(state.cefr)) {
    lines.push(buildPreA1PromptAddendum((state as any)?.lesson_number));
  }
  lines.push('');
  return lines.join('\n');
}
