/**
 * PipCharacter — Phaser-side mascot controller.
 *
 * Public API (the CharacterEngine surface that scenes use):
 *   pip.enter(side)
 *   pip.say(text, opts?)
 *   pip.point(x, y)
 *   pip.celebrate()
 *   pip.encourage()
 *   pip.exit(side)
 *   pip.destroy()
 */
import Phaser from 'phaser';
import { SpeechBubble, type BubbleOptions } from './speechBubble';
import { sparkleBurst } from './sparkles';

export const PIP_TEXTURE_KEY = 'pip';

export type Side = 'left' | 'right';

export interface PipOptions {
  /** Display size in px (height). */
  size?: number;
  /** Initial side; pip.enter() will animate in from here. */
  side?: Side;
}

export class PipCharacter {
  private sprite: Phaser.GameObjects.Image;
  private bubble: SpeechBubble;
  private idleTween?: Phaser.Tweens.Tween;
  private size: number;
  private side: Side;

  constructor(private scene: Phaser.Scene, opts: PipOptions = {}) {
    this.size = opts.size ?? 160;
    this.side = opts.side ?? 'left';

    const { width, height } = scene.scale;
    const startX = this.side === 'left' ? -this.size : width + this.size;
    const groundY = height - this.size * 0.55;

    this.sprite = scene.add
      .image(startX, groundY, PIP_TEXTURE_KEY)
      .setDisplaySize(this.size, this.size)
      .setDepth(900)
      .setOrigin(0.5, 0.5);

    this.bubble = new SpeechBubble(scene);

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    scene.events.once(Phaser.Scenes.Events.DESTROY, () => this.destroy());
  }

  /** Animate Pip onto the stage. Resolves when settled. */
  enter(side: Side = this.side): Promise<void> {
    this.side = side;
    const { width, height } = this.scene.scale;
    const targetX = side === 'left' ? this.size * 0.55 + 12 : width - this.size * 0.55 - 12;
    const groundY = height - this.size * 0.55 - 8;
    this.sprite.x = side === 'left' ? -this.size : width + this.size;
    this.sprite.y = groundY;

    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.sprite,
        x: targetX,
        duration: 600,
        ease: 'Back.Out',
        onComplete: () => {
          this.startIdle();
          // tiny wave
          this.scene.tweens.add({
            targets: this.sprite,
            angle: { from: 0, to: 8 },
            yoyo: true,
            repeat: 2,
            duration: 180,
            onComplete: () => {
              this.sprite.setAngle(0);
              resolve();
            },
          });
        },
      });
    });
  }

  private startIdle() {
    this.stopIdle();
    this.idleTween = this.scene.tweens.add({
      targets: this.sprite,
      y: this.sprite.y - 6,
      duration: 1400,
      ease: 'Sine.InOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private stopIdle() {
    this.idleTween?.stop();
    this.idleTween = undefined;
  }

  say(text: string, opts?: BubbleOptions) {
    const headX = this.sprite.x;
    const headY = this.sprite.y - this.size * 0.4;
    this.bubble.say(text, headX, headY, opts);
  }

  /** Lean / tilt Pip toward (x, y). */
  point(x: number, _y: number) {
    const dir = x < this.sprite.x ? -1 : 1;
    this.scene.tweens.add({
      targets: this.sprite,
      angle: 12 * dir,
      duration: 220,
      yoyo: true,
      hold: 400,
      onComplete: () => this.sprite.setAngle(0),
    });
  }

  celebrate() {
    this.stopIdle();
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.sprite.y - 36,
      scale: { from: this.sprite.scale, to: this.sprite.scale * 1.08 },
      angle: { from: -8, to: 8 },
      yoyo: true,
      repeat: 1,
      duration: 240,
      ease: 'Sine.InOut',
      onComplete: () => {
        this.sprite.setAngle(0);
        this.startIdle();
      },
    });
    sparkleBurst(this.scene, this.sprite.x, this.sprite.y - this.size * 0.4);
  }

  encourage() {
    this.scene.tweens.add({
      targets: this.sprite,
      angle: { from: -4, to: 4 },
      yoyo: true,
      repeat: 2,
      duration: 140,
      onComplete: () => this.sprite.setAngle(0),
    });
  }

  exit(side: Side = this.side): Promise<void> {
    this.stopIdle();
    this.bubble.hide();
    const { width } = this.scene.scale;
    const targetX = side === 'left' ? -this.size : width + this.size;
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.sprite,
        x: targetX,
        duration: 380,
        ease: 'Back.In',
        onComplete: () => resolve(),
      });
    });
  }

  destroy() {
    this.stopIdle();
    this.bubble.destroy();
    this.sprite.destroy();
  }
}
