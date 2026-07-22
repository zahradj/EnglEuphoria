/**
 * Block → SceneConfig builders. Pure mappers. Zero Phaser imports.
 */
import {
  BLOCK_TO_SCENE,
  type LessonBlock,
  type LessonMoment,
  type SceneConfig,
} from './types';

export function buildSceneConfig(
  block: LessonBlock,
  index: number,
  total: number,
  moment: Pick<LessonMoment, 'id' | 'kind'>,
): SceneConfig {
  const kind = BLOCK_TO_SCENE[block.type];
  const { type: _drop, ...data } = block as LessonBlock & { type: string };
  return Object.freeze({
    kind,
    index,
    total,
    momentKind: moment.kind,
    momentId: moment.id,
    data,
  }) as SceneConfig;
}
