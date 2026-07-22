// Pip mascot expression + environment registry (Phase 6).
// Pure data — no React. Used by the lesson generator to rotate mascot art
// across slides so the same pose+environment never appears twice in a row.

export type PipExpression =
  | 'happy'
  | 'thinking'
  | 'cheering'
  | 'surprised'
  | 'encouraging'
  | 'sleepy'
  | 'celebrating'
  | 'curious'
  | 'proud';

export type PipEnvironment =
  | 'classroom'
  | 'park'
  | 'kitchen'
  | 'space'
  | 'beach'
  | 'library'
  | 'forest'
  | 'bedroom';

export interface PipPose {
  expression: PipExpression;
  environment: PipEnvironment;
}

export const PIP_EXPRESSIONS: PipExpression[] = [
  'happy', 'thinking', 'cheering', 'surprised',
  'encouraging', 'sleepy', 'celebrating', 'curious', 'proud',
];

export const PIP_ENVIRONMENTS: PipEnvironment[] = [
  'classroom', 'park', 'kitchen', 'space', 'beach',
  'library', 'forest', 'bedroom',
];

/** Suggested pose for a given pedagogical context. */
export function suggestPipPose(ctx: {
  isCelebration?: boolean;
  isThinking?: boolean;
  isWarmup?: boolean;
  isCoolOff?: boolean;
}, prev?: PipPose): PipPose {
  let expression: PipExpression = 'encouraging';
  if (ctx.isCelebration) expression = 'celebrating';
  else if (ctx.isThinking) expression = 'thinking';
  else if (ctx.isWarmup) expression = 'cheering';
  else if (ctx.isCoolOff) expression = 'proud';

  // Avoid identical consecutive expression.
  if (prev?.expression === expression) {
    const alts = PIP_EXPRESSIONS.filter((e) => e !== expression);
    expression = alts[(prev ? PIP_EXPRESSIONS.indexOf(prev.expression) + 1 : 0) % alts.length];
  }

  // Rotate environment to keep visual variety.
  const envIdx = prev
    ? (PIP_ENVIRONMENTS.indexOf(prev.environment) + 1) % PIP_ENVIRONMENTS.length
    : 0;
  return { expression, environment: PIP_ENVIRONMENTS[envIdx] };
}
