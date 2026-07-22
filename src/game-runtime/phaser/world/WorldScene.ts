/**
 * WorldScene — persistent parallax background that sits behind every
 * activity scene. Pure vector shapes drawn into Phaser graphics (no assets).
 *
 * Day/night + weather cycle:
 *   setProgress(0..1) shifts a tint overlay through dawn → noon → dusk →
 *   twilight, dims the sun, and spawns fireflies at twilight. Drifting
 *   clouds run continuously above the hills.
 */
import Phaser from 'phaser';
import type { WorldDef } from './worldRegistry';

export const WORLD_SCENE_KEY = '__world__';

type Phase = 'dawn' | 'noon' | 'dusk' | 'twilight';

interface PhaseLook {
  tint: number;
  alpha: number;
  sunAlpha: number;
  motesBoost: number;
}

const PHASE_LOOKS: Record<Phase, PhaseLook> = {
  dawn:     { tint: 0xff9966, alpha: 0.18, sunAlpha: 0.95, motesBoost: 1 },
  noon:     { tint: 0xffffff, alpha: 0.00, sunAlpha: 1.00, motesBoost: 1 },
  dusk:     { tint: 0xff6a3d, alpha: 0.22, sunAlpha: 0.85, motesBoost: 1 },
  twilight: { tint: 0x1a1f4a, alpha: 0.42, sunAlpha: 0.55, motesBoost: 2 },
};

function phaseFor(p: number): Phase {
  if (p < 0.2) return 'dawn';
  if (p < 0.6) return 'noon';
  if (p < 0.85) return 'dusk';
  return 'twilight';
}

export class WorldScene extends Phaser.Scene {
  private world!: WorldDef;
  private sun?: Phaser.GameObjects.Arc;
  private tintOverlay?: Phaser.GameObjects.Rectangle;
  private clouds: Phaser.GameObjects.Graphics[] = [];
  private fireflies: Phaser.GameObjects.Arc[] = [];
  private currentPhase: Phase = 'noon';

  constructor() { super({ key: WORLD_SCENE_KEY, active: false }); }

  init(data: { world: WorldDef }) {
    this.world = data.world;
  }

  create() {
    const { width, height } = this.scale;
    const p = this.world.palette;

    // Sky gradient
    const sky = this.add.graphics();
    sky.fillStyle(p.skyTop, 1);
    sky.fillRect(0, 0, width, height * 0.55);
    sky.fillStyle(p.skyBottom, 1);
    sky.fillRect(0, height * 0.55, width, height * 0.45);
    sky.setDepth(0);

    // Sun / moon
    const sunR = Math.min(width, height) * 0.08;
    this.sun = this.add.circle(width * 0.78, height * 0.22, sunR, p.sunOrMoon, 0.9).setDepth(1);
    this.tweens.add({ targets: this.sun, scale: { from: 1, to: 1.05 }, duration: 4000, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    // Drifting clouds (continuous weather)
    this.spawnClouds(width, height);

    // Far / mid hills
    const far = this.makeHillsLayer(width, height, height * 0.62, 0.08, p.hillsFar, 4);
    far.setDepth(2);
    const mid = this.makeHillsLayer(width, height, height * 0.72, 0.14, p.hillsMid, 5);
    mid.setDepth(3);

    // Ground
    const ground = this.add.graphics();
    ground.fillStyle(p.ground, 1);
    ground.fillRect(0, height * 0.82, width, height * 0.18);
    ground.lineStyle(3, p.groundLine, 1);
    ground.lineBetween(0, height * 0.82, width, height * 0.82);
    ground.setDepth(4);

    // Floating motes
    for (let i = 0; i < 14; i += 1) this.spawnMote();

    // Parallax drift
    this.tweens.add({ targets: far, x: { from: 0, to: -width * 0.15 }, duration: 60000, ease: 'Linear', yoyo: true, repeat: -1 });
    this.tweens.add({ targets: mid, x: { from: 0, to: -width * 0.25 }, duration: 40000, ease: 'Linear', yoyo: true, repeat: -1 });

    // Time-of-day tint overlay — sits above everything in the world but
    // below stage cards / activity content (which live on their own scenes).
    this.tintOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0xffffff, 0).setDepth(20);

    this.scale.on('resize', () => this.scene.restart({ world: this.world }));
  }

  /** Drive day → night based on lesson progress (0..1). */
  setProgress(progress: number) {
    const next = phaseFor(Math.max(0, Math.min(1, progress)));
    if (next === this.currentPhase) return;
    this.currentPhase = next;
    const look = PHASE_LOOKS[next];
    if (this.tintOverlay) {
      this.tweens.add({
        targets: this.tintOverlay,
        fillAlpha: look.alpha,
        duration: 2400,
        ease: 'Sine.InOut',
        onStart: () => this.tintOverlay?.setFillStyle(look.tint, this.tintOverlay.fillAlpha),
      });
    }
    if (this.sun) {
      this.tweens.add({ targets: this.sun, alpha: look.sunAlpha, duration: 2400, ease: 'Sine.InOut' });
    }
    if (next === 'twilight') this.spawnFireflies(12);
    else this.clearFireflies();
  }

  private spawnClouds(width: number, height: number) {
    for (let i = 0; i < 4; i += 1) {
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 0.55);
      g.fillCircle(0, 0, 22);
      g.fillCircle(22, -6, 18);
      g.fillCircle(-22, -4, 18);
      g.fillCircle(10, 8, 16);
      g.setDepth(1);
      const y = height * (0.12 + Math.random() * 0.22);
      const startX = Math.random() * width;
      g.x = startX;
      g.y = y;
      // Tap-to-sparkle: clouds are gently interactive.
      g.setInteractive(new Phaser.Geom.Circle(0, 0, 36), Phaser.Geom.Circle.Contains);
      g.on('pointerdown', () => this.sparkleAt(g.x, g.y, 0xffffff));
      this.clouds.push(g);
      this.tweens.add({
        targets: g,
        x: startX + width + 200,
        duration: 50000 + Math.random() * 30000,
        repeat: -1,
        onRepeat: () => { g.x = -100; },
        ease: 'Linear',
      });
    }
  }

  /** Tiny burst of sparkles + soft scale pop at a world point. */
  private sparkleAt(x: number, y: number, color: number) {
    const n = 6;
    for (let i = 0; i < n; i += 1) {
      const angle = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      const dist = 18 + Math.random() * 14;
      const s = this.add.circle(x, y, 2.5, color, 1).setDepth(22);
      this.tweens.add({
        targets: s,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.4,
        duration: 650,
        ease: 'Cubic.Out',
        onComplete: () => s.destroy(),
      });
    }
  }

  private spawnFireflies(n: number) {
    if (this.fireflies.length) return;
    const { width, height } = this.scale;
    for (let i = 0; i < n; i += 1) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(Math.floor(height * 0.4), Math.floor(height * 0.78));
      const f = this.add.circle(x, y, 3, 0xfff3a0, 0.95).setDepth(21);
      f.setInteractive({ useHandCursor: true });
      f.on('pointerdown', () => this.sparkleAt(f.x, f.y, 0xfff3a0));
      this.fireflies.push(f);
      this.tweens.add({
        targets: f,
        x: x + Phaser.Math.Between(-80, 80),
        y: y + Phaser.Math.Between(-40, 40),
        alpha: { from: 0.95, to: 0.2 },
        duration: Phaser.Math.Between(1800, 3200),
        ease: 'Sine.InOut',
        yoyo: true, repeat: -1,
      });
    }
  }

  private clearFireflies() {
    this.fireflies.forEach((f) => f.destroy());
    this.fireflies = [];
  }

  private makeHillsLayer(width: number, height: number, baseY: number, amp: number, color: number, count: number) {
    const c = this.add.container(0, 0);
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    const step = width / count;
    g.beginPath();
    g.moveTo(-50, height);
    for (let i = 0; i <= count; i += 1) {
      const x = i * step;
      const peakY = baseY - height * amp * (0.6 + (i % 2) * 0.4);
      g.lineTo(x, peakY);
    }
    g.lineTo(width + 50, height);
    g.closePath();
    g.fillPath();
    c.add(g);
    return c;
  }

  private spawnMote() {
    const { width, height } = this.scale;
    const r = Phaser.Math.Between(3, 6);
    const x = Phaser.Math.Between(0, width);
    const y = Phaser.Math.Between(Math.floor(height * 0.2), Math.floor(height * 0.7));
    const mote = this.add.circle(x, y, r, this.world.palette.mote, 0.7).setDepth(2);
    mote.setInteractive({ useHandCursor: true });
    mote.on('pointerdown', () => this.sparkleAt(mote.x, mote.y, this.world.palette.mote));
    this.tweens.add({
      targets: mote,
      x: x + Phaser.Math.Between(-80, 80),
      y: y + Phaser.Math.Between(-40, 40),
      alpha: { from: 0.7, to: 0.2 },
      duration: Phaser.Math.Between(5000, 9000),
      ease: 'Sine.InOut',
      yoyo: true, repeat: -1,
    });
  }
}
