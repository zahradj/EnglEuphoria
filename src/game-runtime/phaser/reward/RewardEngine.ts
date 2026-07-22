/**
 * RewardEngine — confetti rain + XP burst + (optional) mascot cheer.
 *
 * Usage in any BaseScene subclass:
 *   const reward = attachReward(this);
 *   reward.correct({ at: { x, y }, xp: 10, pip });
 *   reward.wrong({ at: { x, y }, pip });
 *
 * Auto-destroys on scene shutdown.
 */
import Phaser from 'phaser';
import type { PipController } from '../character';
import { SoundScape } from '../audio';

const CONFETTI_TEX = '__reward_confetti__';

const CONFETTI_COLORS = [0xfacc15, 0xfb923c, 0xf472b6, 0x60a5fa, 0x34d399, 0xa78bfa];

function ensureConfettiTexture(scene: Phaser.Scene) {
  if (scene.textures.exists(CONFETTI_TEX)) return;
  const g = scene.add.graphics({ x: 0, y: 0 });
  g.fillStyle(0xffffff, 1);
  g.fillRect(0, 0, 10, 6);
  g.generateTexture(CONFETTI_TEX, 10, 6);
  g.destroy();
}

export interface RewardSignal {
  at?: { x: number; y: number };
  xp?: number;
  pip?: PipController;
}

export class RewardEngine {
  constructor(private scene: Phaser.Scene) {
    ensureConfettiTexture(scene);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
  }

  /** Big celebration on a correct answer. */
  correct(opts: RewardSignal = {}) {
    const { width } = this.scene.scale;
    const at = opts.at ?? { x: width / 2, y: 120 };
    SoundScape.correctHit();
    this.confettiRain();
    this.xpBurst(at.x, at.y, opts.xp ?? 10);
    opts.pip?.celebrate();
  }

  /** Gentle feedback on a wrong answer — no confetti, no XP. */
  wrong(opts: Omit<RewardSignal, 'xp'> = {}) {
    const { width } = this.scene.scale;
    const at = opts.at ?? { x: width / 2, y: 120 };
    SoundScape.wrongHit();
    this.thumpBurst(at.x, at.y);
    opts.pip?.encourage();
  }

  private confettiRain() {
    const { width } = this.scene.scale;
    const emitter = this.scene.add.particles(width / 2, -10, CONFETTI_TEX, {
      x: { min: 0, max: width },
      y: -10,
      lifespan: 2200,
      speedY: { min: 220, max: 420 },
      speedX: { min: -120, max: 120 },
      angle: { min: 0, max: 360 },
      rotate: { min: -180, max: 180 },
      scale: { min: 0.8, max: 1.4 },
      alpha: { start: 1, end: 0 },
      tint: CONFETTI_COLORS,
      quantity: 4,
      frequency: 30,
    });
    emitter.setDepth(970);
    this.scene.time.delayedCall(900, () => emitter.stop());
    this.scene.time.delayedCall(3200, () => emitter.destroy());
  }

  private xpBurst(x: number, y: number, xp: number) {
    const container = this.scene.add.container(x, y).setDepth(985);
    const pill = this.scene.add.graphics();
    const label = `+${xp} XP`;
    const txt = this.scene.add.text(0, 0, label, {
      fontFamily: 'Poppins, Inter, sans-serif',
      fontSize: '28px',
      color: '#1a1a1a',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    const w = txt.width + 32;
    const h = txt.height + 16;
    pill.fillStyle(0xfacc15, 1);
    pill.lineStyle(3, 0xfb923c, 1);
    pill.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2);
    pill.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2);
    container.add([pill, txt]);
    container.setScale(0.4).setAlpha(0);

    this.scene.tweens.add({
      targets: container,
      scale: 1,
      alpha: 1,
      duration: 220,
      ease: 'Back.Out',
    });
    this.scene.tweens.add({
      targets: container,
      y: y - 80,
      duration: 1200,
      ease: 'Sine.Out',
      delay: 200,
    });
    this.scene.tweens.add({
      targets: container,
      alpha: 0,
      duration: 400,
      delay: 1000,
      onComplete: () => container.destroy(),
    });
  }

  private thumpBurst(x: number, y: number) {
    const ring = this.scene.add.circle(x, y, 12, 0xef4444, 0.5).setDepth(960);
    this.scene.tweens.add({
      targets: ring,
      radius: 60,
      alpha: 0,
      duration: 350,
      onComplete: () => ring.destroy(),
    });
  }

  destroy() {
    // Particles/tweens auto-clean on scene shutdown; nothing held externally.
  }
}

export function attachReward(scene: Phaser.Scene): RewardEngine {
  return new RewardEngine(scene);
}
