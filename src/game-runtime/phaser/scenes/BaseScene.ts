/**
 * BaseScene — shared HUD + completion plumbing for every game scene.
 * Scenes receive a SceneConfig.data payload via Phaser scene `init(data)`.
 */
import Phaser from 'phaser';
import type { SceneConfig, SceneData, SceneResult } from '../../engine/types';
import { attachReward, type RewardEngine } from '../reward';
import { SoundScape } from '../audio';
import { Announcer, reducedMotion } from '../a11y';
import { haptic, isTouchDevice, MIN_TAP_PX } from '../touch';

export interface BaseSceneInit {
  config: SceneConfig;
  onComplete: (result: SceneResult) => void;
  palette: ScenePalette;
}

export interface ScenePalette {
  bg: number;
  card: number;
  text: string;
  accent: number;
  accentText: string;
  ok: number;
  bad: number;
}

export const DEFAULT_PALETTE: ScenePalette = {
  bg: 0xfff8e1,
  card: 0xffffff,
  text: '#1a1a1a',
  accent: 0xf59e0b,
  accentText: '#1a1a1a',
  ok: 0x16a34a,
  bad: 0xdc2626,
};

export abstract class BaseScene extends Phaser.Scene {
  protected sceneConfig!: SceneConfig;
  protected onComplete!: (result: SceneResult) => void;
  protected palette: ScenePalette = DEFAULT_PALETTE;
  protected reward!: RewardEngine;

  init(data: BaseSceneInit) {
    this.sceneConfig = data.config;
    this.onComplete = data.onComplete;
    this.palette = data.palette ?? DEFAULT_PALETTE;
  }

  create() {
    const { width, height } = this.scale;
    // Transparent camera so the persistent WorldScene shows through.
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');
    this.reward = attachReward(this);
    // Subtle scene-enter whoosh ties transitions to the soundscape.
    SoundScape.whoosh();

    // Translucent stage card keeps content legible without hiding the world.
    const card = this.add.graphics();
    card.fillStyle(0xffffff, 0.82);
    card.fillRoundedRect(width * 0.04, 48, width * 0.92, height - 96, 28);
    card.lineStyle(2, 0xffffff, 0.9);
    card.strokeRoundedRect(width * 0.04, 48, width * 0.92, height - 96, 28);
    card.setDepth(-1);

    // Progress chip top-left
    const chip = this.add.text(
      24,
      18,
      `${this.sceneConfig.index + 1} / ${this.sceneConfig.total}`,
      { fontFamily: 'Inter, system-ui, sans-serif', fontSize: '18px', color: this.palette.text },
    );
    chip.setDepth(1000);

    // Announce the scene transition to assistive tech.
    Announcer.say(
      `Activity ${this.sceneConfig.index + 1} of ${this.sceneConfig.total}: ${this.sceneConfig.kind}.`,
    );

    // Scene-specific content lives below the HUD
    this.renderScene(width, height - 80, 0, 60);
  }

  /** True when the OS asks us to suppress non-essential motion. */
  protected prefersReducedMotion(): boolean {
    return reducedMotion();
  }

  /** Announce a status update (polite). */
  protected announce(text: string): void {
    Announcer.say(text);
  }

  protected abstract renderScene(width: number, height: number, x: number, y: number): void;

  /**
   * Render a primary action button at the bottom of the screen.
   */
  protected addPrimaryButton(label: string, onClick: () => void): Phaser.GameObjects.Container {
    const { width, height } = this.scale;
    const w = 240;
    const h = 56;
    const x = width / 2;
    const y = height - 48;
    const container = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, w, h, this.palette.accent, 1).setStrokeStyle(0);
    const txt = this.add.text(0, 0, label, {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '20px',
      color: this.palette.accentText,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    container.add([bg, txt]);
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => {
      bg.setFillStyle(this.palette.accent, 0.85);
      this.tweens.add({ targets: container, scale: 1.04, duration: 140, ease: 'Sine.Out' });
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(this.palette.accent, 1);
      this.tweens.add({ targets: container, scale: 1, duration: 140, ease: 'Sine.Out' });
    });
    bg.on('pointerdown', () => {
      this.tweens.add({ targets: container, scale: 0.96, duration: 80, yoyo: true });
      this.rippleAt(x, y, this.palette.accent);
      SoundScape.tap();
      haptic('tap');
      onClick();
    });
    return container;
  }

  /**
   * Compact viewport (phone-sized). Scenes use this to switch grid layouts
   * and shrink padding without forcing horizontal scroll.
   */
  protected isCompact(): boolean {
    return this.scale.width < 520;
  }

  /** True when the user's primary pointer is touch. */
  protected isTouch(): boolean {
    return isTouchDevice();
  }

  /** Fire a short vibration on touch devices. No-op elsewhere. */
  protected haptic(kind: 'tap' | 'success' | 'error' | 'celebrate' = 'tap'): void {
    haptic(kind);
  }

  /**
   * Ensure a rectangle's interactive hit area is at least 44×44 CSS px,
   * even when the visual is smaller. Call after `.setInteractive(...)`.
   */
  protected ensureTapTarget(rect: Phaser.GameObjects.Rectangle): void {
    const w = Math.max(rect.width, MIN_TAP_PX);
    const h = Math.max(rect.height, MIN_TAP_PX);
    rect.input?.hitArea?.setSize?.(w, h);
    // Also widen the hit area via setInteractive when smaller than min.
    if (rect.width < MIN_TAP_PX || rect.height < MIN_TAP_PX) {
      rect.setInteractive(
        new Phaser.Geom.Rectangle(-w / 2 + rect.width / 2, -h / 2 + rect.height / 2, w, h),
        Phaser.Geom.Rectangle.Contains,
      );
    }
  }

  /**
   * Expanding-ring ripple feedback at a screen position.
   * Reduced-motion: render a single static flash instead of an animated ring.
   */
  protected rippleAt(x: number, y: number, color: number = this.palette.accent): void {
    if (this.prefersReducedMotion()) {
      const flash = this.add.circle(x, y, 28, color, 0.3).setDepth(900);
      this.time.delayedCall(180, () => flash.destroy());
      return;
    }
    const ring = this.add.circle(x, y, 12, color, 0).setStrokeStyle(3, color, 0.9).setDepth(900);
    this.tweens.add({
      targets: ring,
      radius: 64,
      alpha: 0,
      duration: 420,
      ease: 'Cubic.Out',
      onUpdate: () => ring.setStrokeStyle(3, color, ring.alpha),
      onComplete: () => ring.destroy(),
    });
  }

  /**
   * Lateral shake for wrong-answer feedback. Works on any GameObject with x.
   * Reduced-motion: skip the shake (the color change already conveys state).
   */
  protected nudgeShake(
    target: Phaser.GameObjects.Components.Transform & Phaser.GameObjects.GameObject,
  ): void {
    // Haptic fires even when motion is reduced — wrong-answer signal
    // does not depend on animation.
    haptic('error');
    if (this.prefersReducedMotion()) return;
    const baseX = (target as unknown as { x: number }).x;
    this.tweens.add({
      targets: target,
      x: { from: baseX - 8, to: baseX },
      duration: 70,
      ease: 'Sine.InOut',
      repeat: 3,
      yoyo: true,
      onComplete: () => { (target as unknown as { x: number }).x = baseX; },
    });
  }

  /**
   * Quick success pulse: scale up and settle.
   * Reduced-motion: no-op.
   */
  protected pulseScale(
    target: Phaser.GameObjects.Components.Transform & Phaser.GameObjects.GameObject,
    peak = 1.12,
  ): void {
    haptic('success');
    if (this.prefersReducedMotion()) return;
    this.tweens.add({
      targets: target,
      scale: peak,
      duration: 140,
      ease: 'Back.Out',
      yoyo: true,
    });
  }

  /**
   * Subtle hover-lift for interactive cards (rectangles).
   * Reduced-motion: just toggles the stroke color, no scale tween.
   */
  protected attachHoverLift(rect: Phaser.GameObjects.Rectangle, color = 0xe5e7eb): void {
    const reduce = this.prefersReducedMotion();
    rect.on('pointerover', () => {
      rect.setStrokeStyle(3, this.palette.accent, 1);
      if (!reduce) {
        this.tweens.add({ targets: rect, scaleX: 1.03, scaleY: 1.03, duration: 140, ease: 'Sine.Out' });
      }
    });
    rect.on('pointerout', () => {
      rect.setStrokeStyle(2, color, 1);
      if (!reduce) {
        this.tweens.add({ targets: rect, scaleX: 1, scaleY: 1, duration: 140, ease: 'Sine.Out' });
      }
    });
  }

  /**
   * Wire a set of choice cards for keyboard navigation.
   *  - Arrow keys move a focus ring between cards.
   *  - Enter / Space activate the focused card.
   *  - Number keys (1..9) jump straight to the matching card.
   * Returns a destroy fn the scene can call when answered.
   */
  protected attachChoiceKeyboard(
    cards: Array<{ rect: Phaser.GameObjects.Rectangle; activate: () => void }>,
    initial = 0,
  ): () => void {
    if (cards.length === 0) return () => {};
    let focus = Math.max(0, Math.min(initial, cards.length - 1));

    const ring = this.add.graphics().setDepth(950);
    const drawRing = () => {
      ring.clear();
      const r = cards[focus].rect;
      const w = r.width * r.scaleX + 14;
      const h = r.height * r.scaleY + 14;
      ring.lineStyle(3, this.palette.accent, 1);
      ring.strokeRoundedRect(r.x - w / 2, r.y - h / 2, w, h, 12);
    };
    drawRing();

    const move = (delta: number) => {
      focus = (focus + delta + cards.length) % cards.length;
      drawRing();
    };

    const handler = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          move(1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          move(-1);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          cards[focus].activate();
          break;
        default: {
          const num = Number(event.key);
          if (!Number.isNaN(num) && num >= 1 && num <= cards.length) {
            event.preventDefault();
            focus = num - 1;
            drawRing();
            cards[focus].activate();
          }
        }
      }
    };

    const target = this.game.canvas?.parentElement ?? window;
    target.addEventListener('keydown', handler as EventListener);

    const cleanup = () => {
      target.removeEventListener('keydown', handler as EventListener);
      ring.destroy();
    };
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    return cleanup;
  }

  protected complete(result: Partial<SceneResult> = {}) {
    const payload: SceneResult = {
      index: this.sceneConfig.index,
      kind: this.sceneConfig.kind,
      ...result,
    };
    this.onComplete(payload);
  }
}
