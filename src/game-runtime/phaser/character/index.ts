/**
 * CharacterEngine — public facade.
 *
 * Scenes should:
 *   1. In preload(): call ensurePipTexture(this)
 *   2. In create():  const pip = attachPip(this); pip.enter('left');
 *
 * The controller auto-destroys on scene shutdown.
 */
import Phaser from 'phaser';
import pipMascotUrl from '@/assets/pip-mascot.png';
import { PipCharacter, PIP_TEXTURE_KEY, type PipOptions } from './PipCharacter';

export type PipController = PipCharacter;

export function ensurePipTexture(scene: Phaser.Scene) {
  if (scene.textures.exists(PIP_TEXTURE_KEY)) return;
  scene.load.image(PIP_TEXTURE_KEY, pipMascotUrl);
}

export function attachPip(scene: Phaser.Scene, opts?: PipOptions): PipController {
  return new PipCharacter(scene, opts);
}

export { PIP_TEXTURE_KEY };
