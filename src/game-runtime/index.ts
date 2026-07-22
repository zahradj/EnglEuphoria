export { LessonEngine } from './engine/LessonEngine';
export { EngineEvents } from './engine/events';
export { planScenes, planScenesJson, planScenesFlat } from './engine/scenePlanner';
export { inferMoments } from './engine/momentPlanner';
export type {
  PlannedScene,
  PlannedSceneType,
  PlannedMoment,
  ScenePlan,
  Interaction,
  CompletionCondition,
} from './engine/scenePlanner';
export type {
  BlockType,
  CompiledLesson,
  CompiledMoment,
  LessonBlock,
  LessonJSON,
  LessonMoment,
  MomentKind,
  SceneConfig,
  SceneData,
  SceneKind,
  SceneResult,
} from './engine/types';
export { MOMENT_LABELS, MOMENT_ORDER } from './engine/types';
export { loadSampleLesson } from './examples/loadSampleLesson';
export { bootGame, type BootHooks, type BootHandle } from './phaser/bootGame';
