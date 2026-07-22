// Dedicated Playground Pedagogy Engine — public surface.
// Only activates when hub === 'playground' / 'Playground'.

export * from './types';
export { buildPlaygroundSystemPrompt } from './promptInjector';
export { validateDefinitionConcreteness } from './validators/definitionConcreteness';
export { validateLowTextDensity } from './validators/lowTextDensity';
export { validateSpeakingFloor } from './validators/speakingFloor';
export { validatePlaygroundActivityBalance } from './validators/activityBalance';
export { validateMascotVisualRepeat } from './validators/mascotVisualRepeat';
export * from './rewards';
export { scoreTrace } from './trace/svgTrace';
export type { TracePoint, TraceScoreResult, PathLike } from './trace/svgTrace';
export { TraceCanvas } from './trace/TraceCanvas';
export type { TraceCanvasProps } from './trace/TraceCanvas';

