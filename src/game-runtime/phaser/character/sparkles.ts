/**
 * Lightweight sparkle burst — no external asset required.
 * Generates a tiny white square texture once per scene and emits a brief
 * Phaser particle burst at (x, y).
 */
import Phaser from 'phaser';

const TEX_KEY = '__pip_spark__';

function ensureTexture(scene: Phaser.Scene) {
  if (scene.textures.exists(TEX_KEY)) return;
  const g = scene.add.graphics({ x: 0, y: 0 });
  g.fillStyle(0xffffff, 1);
  g.fillCircle(4, 4, 4);
  g.generateTexture(TEX_KEY, 8, 8);
  g.destroy();
}

export function sparkleBurst(scene: Phaser.Scene, x: number, y: number, tint = 0xfacc15) {
  ensureTexture(scene);
  const emitter = scene.add.particles(x, y, TEX_KEY, {
    speed: { min: 80, max: 220 },
    angle: { min: 0, max: 360 },
    lifespan: 700,
    quantity: 18,
    scale: { start: 1.1, end: 0 },
    alpha: { start: 1, end: 0 },
    tint: [tint, 0xffffff, 0xfb923c],
    gravityY: 120,
    blendMode: 'ADD',
  });
  emitter.setDepth(980);
  emitter.explode(22, x, y);
  scene.time.delayedCall(900, () => emitter.destroy());
}
