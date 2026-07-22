/**
 * Language Engine Slot Injector
 *
 * Senior AI EdTech Architect + ESL Game Studio contract:
 * - every slot is bound to concrete lesson targets;
 * - generated payloads are deterministic and renderer-ready;
 * - one immersive engine is added per lesson/review/quiz to avoid clutter;
 * - the four engines rotate: Story → Escape → Detective → Hidden Object.
 */

import type { ReinforcementTarget } from '@/coherence/types';
import type { Cefr, Hub, VocabTarget } from '@/vocab-games';
import { STORY_HUB_PROFILES } from '@/story-engine/hubProfiles';
import { ESCAPE_HUB_PROFILES } from '@/escape-room/hubProfiles';
import { DETECTIVE_HUB_PROFILES } from '@/detective/hubProfiles';
import { getHiddenObjectProfile } from '@/hidden-object/hubProfiles';
import type { StoryGraph } from '@/story-engine';
import type { EscapeRoom, Puzzle, PuzzleKind } from '@/escape-room';
import type { DetectiveCase, QuestionKind, Suspect } from '@/detective';
import type { HiddenObjectScene } from '@/hidden-object';

type AnySlide = Record<string, any>;

export const LANGUAGE_ENGINE_SLOT_TYPES = [
  'story_engine_slot',
  'escape_room_slot',
  'detective_mystery_slot',
  'hidden_object_slot',
] as const;

export type LanguageEngineSlotType = (typeof LANGUAGE_ENGINE_SLOT_TYPES)[number];

export const LANGUAGE_ENGINE_SLOT_SOURCE = 'language_engine_studio' as const;

const ENGINE_ROTATION: LanguageEngineSlotType[] = [
  'story_engine_slot',
  'escape_room_slot',
  'detective_mystery_slot',
  'hidden_object_slot',
];

export interface BuildLanguageEngineSlotInput {
  hub: Hub;
  cefr: Cefr;
  targets: VocabTarget[];
  lessonNumber?: number;
  lessonId?: string;
  unitTitle?: string;
  mode?: 'lesson' | 'review' | 'quiz';
  engineType?: LanguageEngineSlotType;
  /** Recent 0..1 accuracy from student_engine_runs; <0.6 downshifts to easier engines. */
  recentAccuracy?: number;
}

function cleanTargets(targets: VocabTarget[]): VocabTarget[] {
  const seen = new Set<string>();
  return (targets || [])
    .filter((t) => typeof t?.word === 'string' && t.word.trim())
    .map((t) => ({ ...t, word: t.word.trim() }))
    .filter((t) => {
      const key = t.word.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function wordAt(targets: VocabTarget[], index: number, fallback = 'English'): string {
  return targets[index % Math.max(1, targets.length)]?.word || fallback;
}

function labelFor(target: VocabTarget | undefined, fallback: string): string {
  return target?.definition?.trim() || `Use “${target?.word || fallback}” correctly.`;
}

function targetIds(targets: VocabTarget[]): string[] {
  return targets.map((t, i) => `target-${i}-${t.word.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
}

function blockFor(hub: Hub, mode: 'lesson' | 'review' | 'quiz'): string {
  if (hub === 'academy') return mode === 'lesson' ? 'interactive' : 'practice';
  if (hub === 'success') return mode === 'lesson' ? 'simulation' : 'practice';
  return mode === 'quiz' ? 'quiz' : mode === 'review' ? 'review' : 'practice';
}

// Difficulty ladder (easy → hard) used when auto-tuning for struggling learners.
const ENGINE_DIFFICULTY: LanguageEngineSlotType[] = [
  'hidden_object_slot',
  'story_engine_slot',
  'escape_room_slot',
  'detective_mystery_slot',
];

function engineFor(input: BuildLanguageEngineSlotInput): LanguageEngineSlotType {
  if (input.engineType) return input.engineType;
  const acc = typeof input.recentAccuracy === 'number' ? input.recentAccuracy : null;
  // Struggling (<60%): pick the easiest engine. Coasting (>90%): step up one rung.
  if (acc !== null && acc < 0.6) return ENGINE_DIFFICULTY[0];
  const lessonNumber = Math.max(1, Number(input.lessonNumber || 1));
  const base = ENGINE_ROTATION[(lessonNumber - 1) % ENGINE_ROTATION.length];
  if (acc !== null && acc > 0.9) {
    const idx = ENGINE_DIFFICULTY.indexOf(base);
    return ENGINE_DIFFICULTY[Math.min(ENGINE_DIFFICULTY.length - 1, idx + 1)];
  }
  return base;
}

function objectiveFor(type: LanguageEngineSlotType, mode: 'lesson' | 'review' | 'quiz'): string {
  const prefix = mode === 'quiz' ? 'Assessment objective' : mode === 'review' ? 'Review objective' : 'Lesson objective';
  switch (type) {
    case 'story_engine_slot':
      return `${prefix}: choose the best language option to move the story forward.`;
    case 'escape_room_slot':
      return `${prefix}: solve short language puzzles to unlock each door.`;
    case 'detective_mystery_slot':
      return `${prefix}: ask useful questions, read clues, and make an evidence-based choice.`;
    case 'hidden_object_slot':
      return `${prefix}: connect prompts to visual meaning by finding the target items.`;
  }
}

function buildStoryGraph(hub: Hub, cefr: Cefr, targets: VocabTarget[], unitTitle?: string): StoryGraph {
  const profile = STORY_HUB_PROFILES[hub];
  const ids = targetIds(targets);
  const nodeCount = Math.min(profile.max_nodes, hub === 'playground' ? 3 : 4);
  const nodes: StoryGraph['nodes'] = {};
  for (let i = 0; i < nodeCount; i++) {
    const word = wordAt(targets, i, 'friend');
    const next = i === nodeCount - 1 ? 'end_success' : `node-${i + 2}`;
    const choices = Array.from({ length: profile.choices_per_node }, (_, c) => {
      const correct = c === 0;
      const target = targets[(i + c) % targets.length];
      return {
        id: `choice-${i + 1}-${c + 1}`,
        label: correct ? `Use: ${word}` : `Try: ${target?.word || 'not yet'}`,
        target_ref: ids[(i + c) % ids.length],
        next: correct ? next : 'end_retry',
        correct,
        feedback: correct
          ? `Yes — “${word}” fits the scene.`
          : `Good try. Look for the word that matches the story clue.`,
      };
    });
    nodes[`node-${i + 1}`] = {
      id: `node-${i + 1}`,
      narration:
        hub === 'success'
          ? `A workplace challenge appears in ${unitTitle || 'today’s lesson'}. Choose the phrase that keeps the task clear and professional.`
          : `A new scene opens in ${unitTitle || 'today’s adventure'}. The clue points to “${word}”. What should we choose?`,
      character: hub === 'playground' ? (i % 2 === 0 ? 'Pip' : 'Bella') : undefined,
      image_prompt: `Editorial learning scene for ${hub}, target word ${word}, no text in image, clear visual clue, classroom-safe illustration.`,
      image_url: null,
      choices,
    };
  }
  return {
    hub,
    cefr,
    title: hub === 'success' ? 'Decision Path' : 'Story Quest',
    target_skill: 'vocab_retrieval',
    target_ref_ids: ids,
    start_node: 'node-1',
    nodes,
  };
}

function scrambled(word: string): string {
  if (word.length <= 3) return word.split('').reverse().join('');
  return `${word.slice(1)}${word[0]}`;
}

function puzzleKindFor(hub: Hub, index: number): PuzzleKind {
  const allowed = ESCAPE_HUB_PROFILES[hub].allowed_kinds;
  return allowed[index % allowed.length];
}

function buildPuzzle(hub: Hub, targets: VocabTarget[], ids: string[], index: number): Puzzle {
  const kind = puzzleKindFor(hub, index);
  const target = targets[index % targets.length];
  const answer = target.word;
  const base = {
    id: `door-${index + 1}`,
    kind,
    target_ref: ids[index % ids.length],
    door_label: `Door ${index + 1}`,
    door_narration: `Unlock this door with “${answer}”.`,
    hint: `Look for the clue about ${labelFor(target, answer)}`,
    solve_feedback: `Unlocked — “${answer}” is correct.`,
    image_prompt: `Simple ${hub} escape-room door scene for the target ${answer}, no text in image.`,
    image_url: null,
  } as const;
  if (kind === 'unscramble') return { ...base, kind, scrambled: scrambled(answer), answer };
  if (kind === 'cloze') {
    const options = Array.from(new Set([answer, wordAt(targets, index + 1), wordAt(targets, index + 2)])).slice(0, 4);
    return { ...base, kind, sentence: `Choose ___ now.`, blank_index: 1, options, answer };
  }
  if (kind === 'order') {
    const tokens = hub === 'success' ? ['Could', 'you', 'use', answer] : ['I', 'can', 'use', answer];
    return { ...base, kind, tokens, answer: tokens };
  }
  if (kind === 'odd_one_out') {
    const items = Array.from(new Set([answer, wordAt(targets, index + 1), wordAt(targets, index + 2), 'banana'])).slice(0, 4);
    return { ...base, kind, items, answer: 'banana', reason: 'It is the distractor, not today’s target.' };
  }
  const options = Array.from(new Set([answer, wordAt(targets, index + 1), wordAt(targets, index + 2)])).slice(0, 4);
  return { ...base, kind, clues: [`Means ${labelFor(target, answer)}`, 'Pick the target.'], options, answer };
}

function buildEscapeRoom(hub: Hub, cefr: Cefr, targets: VocabTarget[]): EscapeRoom {
  const profile = ESCAPE_HUB_PROFILES[hub];
  const ids = targetIds(targets);
  return {
    hub,
    cefr,
    title: hub === 'success' ? 'Professional Escape Challenge' : 'Language Escape Room',
    target_skill: 'vocab_and_sentence_retrieval',
    target_ref_ids: ids,
    doors: Array.from({ length: profile.doors }, (_, i) => buildPuzzle(hub, targets, ids, i)),
    final_reward: {
      message: hub === 'success' ? 'Challenge complete — language unlocked.' : 'You unlocked every door!',
      image_prompt: `Reward scene for ${hub} language escape room, celebratory, no text in image.`,
      image_url: null,
    },
  };
}

function questionKindFor(hub: Hub, index: number): QuestionKind {
  const allowed = DETECTIVE_HUB_PROFILES[hub].allowed_kinds;
  return allowed[index % allowed.length];
}

function questionText(kind: QuestionKind, word: string, suspectName: string): string {
  if (kind === 'yes_no') return `Did ${suspectName} see ${word}?`;
  if (kind === 'wh') return `Where did ${suspectName} use ${word}?`;
  if (kind === 'past_simple') return `What did ${suspectName} do with ${word}?`;
  return `What might ${suspectName} have done with ${word}?`;
}

function buildDetectiveCase(hub: Hub, cefr: Cefr, targets: VocabTarget[]): DetectiveCase {
  const profile = DETECTIVE_HUB_PROFILES[hub];
  const ids = targetIds(targets);
  const suspectNames = hub === 'playground'
    ? ['Pip', 'Bella', 'Leo', 'Mia']
    : hub === 'academy'
      ? ['Alex', 'Mina', 'Sam', 'Jordan', 'Nora']
      : ['Morgan', 'Priya', 'Daniel', 'Sara', 'Kenji', 'Elena'];
  const suspects: Suspect[] = Array.from({ length: profile.suspects }, (_, i) => ({
    id: `suspect-${i + 1}`,
    name: suspectNames[i],
    role: hub === 'success' ? ['manager', 'analyst', 'client', 'designer', 'assistant'][i] : ['helper', 'student', 'friend', 'captain'][i] || 'helper',
    alibi: `${suspectNames[i]} says the clue was about “${wordAt(targets, i)}”.`,
    image_prompt: `Portrait of ${suspectNames[i]} for a ${hub} detective language activity, no text in image.`,
    image_url: null,
    is_culprit: i === 1,
  }));
  return {
    hub,
    cefr,
    title: hub === 'success' ? 'The Missing Brief' : 'The Missing Word Mystery',
    target_skill: 'question_forms_and_clue_reading',
    target_ref_ids: ids,
    briefing: hub === 'success'
      ? 'A key phrase is missing from the team brief. Ask precise questions and identify who has the best evidence.'
      : 'A lesson word is missing. Ask questions, collect clues, and choose the best suspect.',
    setting_image_prompt: `Detective learning scene for ${hub}, clear setting, no text in image.`,
    setting_image_url: null,
    suspects,
    question_pool: Array.from({ length: profile.question_pool_size }, (_, i) => {
      const suspect = suspects[i % suspects.length];
      const word = wordAt(targets, i);
      const kind = questionKindFor(hub, i);
      return {
        id: `q-${i + 1}`,
        kind,
        text: questionText(kind, word, suspect.name),
        suspect_id: suspect.id,
        reveals: `The clue points to “${word}” in the lesson context.`,
        target_ref: ids[i % ids.length],
      };
    }),
    question_budget: profile.question_budget,
    epilogue: {
      win: 'You used the clues well and solved the language mystery.',
      lose: 'Good investigation. Review the clues and try again.',
    },
  };
}

function toHiddenCefr(cefr: Cefr): HiddenObjectScene['cefr'] {
  return cefr === 'Pre-A1' ? 'PreA1' : (cefr as HiddenObjectScene['cefr']);
}

function buildReinforcementTarget(hub: Hub, cefr: Cefr, target: VocabTarget, index: number): ReinforcementTarget {
  return {
    id: `hidden-target-${index + 1}`,
    source: 'lesson_target',
    skill_kind: 'vocab',
    skill_key: target.word.toLowerCase(),
    label: target.word,
    priority: 0.7,
    cefr_ceiling: cefr,
  };
}

function buildHiddenObjectScene(hub: Hub, cefr: Cefr, targets: VocabTarget[], unitTitle?: string): HiddenObjectScene {
  const profile = getHiddenObjectProfile(hub);
  const count = Math.min(profile.maxTargets, Math.max(profile.minTargets, targets.length));
  const coords = [
    [0.18, 0.28], [0.46, 0.22], [0.74, 0.31], [0.28, 0.58],
    [0.62, 0.61], [0.84, 0.70], [0.40, 0.78], [0.12, 0.76],
  ];
  return {
    id: `hidden-${hub}-${unitTitle || 'lesson'}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    hub,
    cefr: toHiddenCefr(cefr),
    theme: unitTitle || (hub === 'success' ? 'workplace' : 'learning adventure'),
    image_prompt: `Wide ${hub} scene with clear separate objects from today’s lesson, no labels, no letters, no speech bubbles, classroom-safe illustration.`,
    image_url: null,
    intro: hub === 'success' ? 'Scan the scene and locate the professional vocabulary targets.' : 'Look carefully and find each target.',
    outro: hub === 'success' ? 'Scene complete — excellent noticing.' : 'You found everything!',
    targets: Array.from({ length: count }, (_, i) => {
      const target = targets[i % targets.length];
      const [x, y] = coords[i % coords.length];
      return {
        label: target.word,
        prompt: `Find ${target.word}`,
        x,
        y,
        radius: 0.055,
        reinforces: buildReinforcementTarget(hub, cefr, target, i),
        definition: profile.requireDefinition ? labelFor(target, target.word) : target.definition,
        preposition: profile.requirePreposition ? 'in the scene' : undefined,
      };
    }),
  };
}

export function buildLanguageEngineSlotSlide(input: BuildLanguageEngineSlotInput): AnySlide | null {
  const targets = cleanTargets(input.targets);
  if (targets.length < 2) return null;
  const mode = input.mode ?? 'lesson';
  const engineType = engineFor(input);
  const base = {
    id: `engine-${input.lessonId || input.lessonNumber || 'lesson'}-${engineType}`,
    type: engineType,
    kind: engineType,
    block: blockFor(input.hub, mode),
    hub: input.hub,
    cefr: input.cefr,
    mode,
    lessonId: input.lessonId,
    lessonNumber: input.lessonNumber,
    source: LANGUAGE_ENGINE_SLOT_SOURCE,
    title:
      engineType === 'story_engine_slot' ? 'Story Quest'
      : engineType === 'escape_room_slot' ? 'Escape Room'
      : engineType === 'detective_mystery_slot' ? 'Detective Mystery'
      : 'Hidden Object Hunt',
    objective: objectiveFor(engineType, mode),
    targets,
    target_words: targets.map((t) => t.word),
  };
  if (engineType === 'story_engine_slot') return { ...base, graph: buildStoryGraph(input.hub, input.cefr, targets, input.unitTitle) };
  if (engineType === 'escape_room_slot') return { ...base, room: buildEscapeRoom(input.hub, input.cefr, targets) };
  if (engineType === 'detective_mystery_slot') return { ...base, case: buildDetectiveCase(input.hub, input.cefr, targets) };
  return { ...base, scene: buildHiddenObjectScene(input.hub, input.cefr, targets, input.unitTitle) };
}

export function isLanguageEngineSlot(slide: unknown): boolean {
  return !!slide && typeof slide === 'object' && LANGUAGE_ENGINE_SLOT_TYPES.includes((slide as AnySlide).type || (slide as AnySlide).kind);
}

function alreadyHasLanguageEngine(slides: AnySlide[], engineType?: LanguageEngineSlotType): boolean {
  return slides.some((s) => {
    if (!isLanguageEngineSlot(s)) return false;
    return engineType ? (s.type || s.kind) === engineType : true;
  });
}

export function applyLanguageEngineForLesson(
  slides: AnySlide[],
  input: BuildLanguageEngineSlotInput,
): { slides: AnySlide[]; injected: number; engineType: LanguageEngineSlotType } {
  if (!Array.isArray(slides)) return { slides, injected: 0, engineType: engineFor(input) };
  const engineType = engineFor(input);
  if (alreadyHasLanguageEngine(slides, engineType)) return { slides, injected: 0, engineType };
  const slide = buildLanguageEngineSlotSlide({ ...input, engineType });
  if (!slide) return { slides, injected: 0, engineType };
  return { slides: [...slides, slide], injected: 1, engineType };
}
