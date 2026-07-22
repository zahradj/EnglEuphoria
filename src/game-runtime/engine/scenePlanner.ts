/**
 * Scene Execution Planner.
 *
 * Pure, deterministic transform: LessonJSON → ScenePlan grouped by Moment.
 * Output is JSON-only and engine-compatible.
 *
 * Hierarchy: ScenePlan → moments[] → scenes[]. Flat lists are forbidden in
 * runtime contracts; `planScenesFlat()` is exposed for tests only.
 */
import type {
  LessonJSON,
  LessonBlock,
  LessonMoment,
  MomentKind,
  IntroBlock,
  VocabBlock,
  PhonicsBlock,
  MultipleChoiceBlock,
  FillInBlankBlock,
  DragAndDropBlock,
  MatchBlock,
  StorybookBlock,
  LessonSummaryBlock,
} from './types';

export type PlannedSceneType =
  | 'IntroScene'
  | 'VocabScene'
  | 'QuizScene'
  | 'DragScene'
  | 'MatchScene'
  | 'StoryScene'
  | 'RewardScene';

export type Interaction =
  | 'tap-to-continue'
  | 'tap-to-hear'
  | 'tap-correct-answer'
  | 'type-answer'
  | 'drag-to-target'
  | 'pair-items'
  | 'tap-through-pages'
  | 'celebrate';

export type CompletionCondition =
  | 'tap_acknowledged'
  | 'audio_played'
  | 'correct_answer_selected'
  | 'answer_submitted'
  | 'all_items_placed'
  | 'all_pairs_matched'
  | 'last_page_reached'
  | 'reward_claimed';

export interface PlannedScene<TData = Record<string, unknown>> {
  sceneType: PlannedSceneType;
  data: TData & {
    interaction: Interaction;
    completion: CompletionCondition;
  };
}

export interface PlannedMoment {
  id: string;
  kind: MomentKind;
  scenes: PlannedScene[];
}

export interface ScenePlan {
  moments: PlannedMoment[];
}

// ── Per-block planners ──────────────────────────────────────────────────────

function planIntro(b: IntroBlock): PlannedScene {
  return { sceneType: 'IntroScene', data: { title: b.title, subtitle: b.subtitle, mascot: b.mascot, interaction: 'tap-to-continue', completion: 'tap_acknowledged' } };
}
function planVocab(b: VocabBlock | PhonicsBlock): PlannedScene {
  if (b.type === 'phonics_focus') {
    return { sceneType: 'VocabScene', data: { word: b.sound, examples: b.examples, audio: b.audio, interaction: 'tap-to-hear', completion: 'audio_played' } };
  }
  return { sceneType: 'VocabScene', data: { word: b.word, definition: b.definition, image: b.image, audio: b.audio, interaction: 'tap-to-hear', completion: 'audio_played' } };
}
function planQuiz(b: MultipleChoiceBlock | FillInBlankBlock): PlannedScene {
  if (b.type === 'fill_in_blank') {
    return { sceneType: 'QuizScene', data: { question: b.sentence, options: b.options, answer: b.answer, interaction: b.options.length > 1 ? 'tap-correct-answer' : 'type-answer', completion: b.options.length > 1 ? 'correct_answer_selected' : 'answer_submitted' } };
  }
  return { sceneType: 'QuizScene', data: { question: b.question, options: b.options, answerIndex: b.answerIndex, interaction: 'tap-correct-answer', completion: 'correct_answer_selected' } };
}
function planDrag(b: DragAndDropBlock): PlannedScene {
  return { sceneType: 'DragScene', data: { prompt: b.prompt, items: b.items, targets: b.targets, interaction: 'drag-to-target', completion: 'all_items_placed' } };
}
function planMatch(b: MatchBlock): PlannedScene {
  return { sceneType: 'MatchScene', data: { prompt: b.prompt, pairs: b.pairs, interaction: 'pair-items', completion: 'all_pairs_matched' } };
}
function planStory(b: StorybookBlock): PlannedScene {
  return { sceneType: 'StoryScene', data: { title: b.title, pages: b.pages, interaction: 'tap-through-pages', completion: 'last_page_reached' } };
}
function planReward(b: LessonSummaryBlock): PlannedScene {
  return { sceneType: 'RewardScene', data: { title: b.title, bullets: b.bullets, interaction: 'celebrate', completion: 'reward_claimed' } };
}

function planBlock(block: LessonBlock): PlannedScene {
  switch (block.type) {
    case 'intro':           return planIntro(block);
    case 'vocab_solo':
    case 'phonics_focus':   return planVocab(block);
    case 'multiple_choice':
    case 'fill_in_blank':   return planQuiz(block);
    case 'drag_and_drop':   return planDrag(block);
    case 'match':           return planMatch(block);
    case 'storybook':       return planStory(block);
    case 'lesson_summary':  return planReward(block);
  }
}

function planMoment(m: LessonMoment): PlannedMoment {
  return { id: m.id, kind: m.kind, scenes: m.blocks.map(planBlock) };
}

/** Convert a validated LessonJSON into a moment-grouped Scene Execution Plan. */
export function planScenes(lesson: LessonJSON): ScenePlan {
  return { moments: lesson.moments.map(planMoment) };
}

/** Test-only convenience: flatten scenes ignoring moment boundaries. */
export function planScenesFlat(lesson: LessonJSON): PlannedScene[] {
  return lesson.moments.flatMap((m) => m.blocks.map(planBlock));
}

export function planScenesJson(lesson: LessonJSON, pretty = false): string {
  return JSON.stringify(planScenes(lesson), null, pretty ? 2 : 0);
}
