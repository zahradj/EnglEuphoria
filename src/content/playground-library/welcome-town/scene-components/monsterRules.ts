/* Pure lines for the Monster Builder (MonsterBuilderScene) — shared with the voice bake script. */
export const BUILDER_WRONG = 'Hmm, not quite!';
const NUM = ['', 'one', 'two', 'three'];
export const builderHint = (part: 'eyes' | 'horns' | 'mouth', eyes: number, horns: string, mouth: string) =>
  part === 'eyes' ? `Listen: ${NUM[eyes]} ${eyes === 1 ? 'eye' : 'eyes'}!` : part === 'horns' ? `Listen: ${horns}!` : `Listen: ${mouth}!`;
