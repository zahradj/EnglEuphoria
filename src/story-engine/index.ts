/**
 * Story Engine — Choose Your Adventure.
 *
 * Host usage:
 *   import { StoryEngineSlot } from '@/story-engine';
 *   <StoryEngineSlot hub={hub} cefr={cefr} graph={graph}
 *                    onEvent={observer.emit} onComplete={observer.storyComplete} />
 *
 * Generation site (edge fn / architect):
 *   const prompt = buildStoryEnginePrompt({ hub, cefr, target_skill, ... });
 *   const graph = JSON.parse(await ai(prompt));
 *   const report = validateStoryGraph(graph);   // repair on 'block'
 */
export { default as StoryEngineSlot } from './StoryEngineSlot';
export { validateStoryGraph } from './validator';
export { buildStoryEnginePrompt } from './promptInjector';
export { STORY_HUB_PROFILES } from './hubProfiles';
export type {
  Hub,
  Cefr,
  StoryChoice,
  StoryNode,
  StoryGraph,
  StoryEvent,
  StoryEngineSlotProps,
} from './types';
