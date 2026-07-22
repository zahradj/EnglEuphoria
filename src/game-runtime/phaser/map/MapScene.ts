/**
 * MapScene — a brief overworld interstitial between activity scenes.
 *
 * Renders a horizontal dotted path with a stamp for each scene in the lesson,
 * walks Pip from `fromIdx` to `toIdx`, then calls `onDone()`.
 *
 * On the final scene we play a longer "victory" version with confetti and
 * every spot revealed.
 */
import Phaser from 'phaser';
import pipMascotUrl from '@/assets/pip-mascot.png';
import type { SceneKind } from '../../engine/types';
import { spotFor, type SpotDef } from './spotRegistry';
import type { WorldDef } from '../world/worldRegistry';

export const MAP_SCENE_KEY = '__map__';

export interface MapSceneInit {
  world: WorldDef;
  scenes: SceneKind[];
  fromIdx: number;       // last completed scene index (-1 for opening)
  toIdx: number;         // index of the scene we're about to play
  isFinale?: boolean;    // end-of-lesson victory pass
  /** Outcome of the just-completed scene — drives Pip's reaction. */
  lastResult?: { correct?: boolean; score?: number };
  /** Current consecutive-correct streak — drives a stronger cheer at 3+. */
  streak?: number;
  /** Running XP total carried across the lesson. */
  totalXp?: number;
  /** XP just awarded by the previous scene (animates count-up). */
  xpAwarded?: number;
  /** Number of scenes completed so far (drives progress fill). */
  completedCount?: number;
  /** Total scenes in the lesson. */
  totalCount?: number;
  onDone: () => void;
}

type PipMood = 'neutral' | 'cheer' | 'encourage' | 'proud';

function moodFromResult(r?: MapSceneInit['lastResult'], streak = 0): PipMood {
  if (!r) return 'neutral';
  if (streak >= 3) return 'proud';
  if (r.correct === true) return 'cheer';
  if (r.correct === false) return 'encourage';
  if (typeof r.score === 'number') return r.score >= 0.7 ? 'cheer' : r.score < 0.4 ? 'encourage' : 'neutral';
  return 'neutral';
}

const MOOD_COPY: Record<PipMood, string[]> = {
  neutral:   ['Onward!', 'Let’s go!', 'Next stop…'],
  cheer:     ['Nice one!', 'You got it!', 'Brilliant!'],
  encourage: ['Try again!', 'Almost!', 'Keep going!'],
  proud:     ['On fire! 🔥', 'Three in a row!', 'Unstoppable!'],
};
const MOOD_COLOR: Record<PipMood, number> = {
  neutral:   0x5a3a18,
  cheer:     0x16a34a,
  encourage: 0xea580c,
  proud:     0xd97706,
};

const PIP_KEY = '__map_pip__';

export class MapScene extends Phaser.Scene {
  private cfg!: MapSceneInit;
  constructor() { super(MAP_SCENE_KEY); }

  init(data: MapSceneInit) { this.cfg = data; }
  preload() {
    if (!this.textures.exists(PIP_KEY)) this.load.image(PIP_KEY, pipMascotUrl);
  }

  create() {
    const { width, height } = this.scale;
    const p = this.cfg.world.palette;

    // Translucent parchment band so the world still breathes underneath
    const band = this.add.graphics();
    band.fillStyle(0xfff8e8, 0.92);
    band.fillRoundedRect(width * 0.05, height * 0.32, width * 0.9, height * 0.36, 24);
    band.lineStyle(3, p.groundLine, 0.6);
    band.strokeRoundedRect(width * 0.05, height * 0.32, width * 0.9, height * 0.36, 24);

    const title = this.add.text(width / 2, height * 0.24,
      this.cfg.isFinale ? 'Journey Complete' : 'Onward…',
      { fontFamily: 'Poppins, Inter, sans-serif', fontSize: '24px', color: '#5a3a18', fontStyle: 'bold' },
    ).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: title, alpha: 1, duration: 240 });

    // Top-right XP totalizer pill (animated count-up if xpAwarded > 0).
    this.renderXpHud(width);

    // Progress bar tucked under the path band.
    this.renderProgressBar(width, height);

    // Lay out spots along a sinuous path
    const n = this.cfg.scenes.length;
    const padX = width * 0.12;
    const innerW = width - padX * 2;
    const pathY = height * 0.5;
    const xFor = (i: number) => padX + (innerW * i) / Math.max(1, n - 1);
    const yFor = (i: number) => pathY + Math.sin(i * 0.9) * 18;

    // Dotted path
    const path = this.add.graphics();
    path.lineStyle(3, p.groundLine, 0.5);
    for (let i = 0; i < n - 1; i += 1) {
      const x1 = xFor(i), y1 = yFor(i), x2 = xFor(i + 1), y2 = yFor(i + 1);
      const segs = 14;
      for (let s = 0; s < segs; s += 1) {
        if (s % 2 === 1) continue;
        const t1 = s / segs, t2 = (s + 1) / segs;
        path.lineBetween(
          x1 + (x2 - x1) * t1, y1 + (y2 - y1) * t1,
          x1 + (x2 - x1) * t2, y1 + (y2 - y1) * t2,
        );
      }
    }

    // Spot stamps
    const spots: { x: number; y: number; def: SpotDef }[] = [];
    for (let i = 0; i < n; i += 1) {
      const x = xFor(i), y = yFor(i);
      const def = spotFor(this.cfg.scenes[i]);
      const visited = i <= this.cfg.fromIdx;
      const isTarget = i === this.cfg.toIdx;
      const fill = visited ? p.hillsMid : (isTarget ? p.accent : 0xe8d5b8);
      const ring = this.add.circle(x, y, 18, fill, 1).setStrokeStyle(3, p.groundLine, 0.9);
      this.drawSpotIcon(x, y, def.kind, visited || isTarget);
      if (isTarget) {
        this.tweens.add({ targets: ring, scale: { from: 1, to: 1.25 }, duration: 700, yoyo: true, repeat: -1 });
      }
      if (visited && !isTarget) {
        this.add.text(x + 12, y - 14, '✓', { fontFamily: 'Inter', fontSize: '16px', color: '#16a34a', fontStyle: 'bold' });
      }
      spots.push({ x, y, def });

      // Spot label below
      this.add.text(x, y + 34, def.label, {
        fontFamily: 'Inter', fontSize: '11px', color: '#5a3a18',
      }).setOrigin(0.5).setAlpha(visited || isTarget ? 1 : 0.5);
    }

    // Pip walks from prev → target (or appears at target on opening)
    const start = this.cfg.fromIdx >= 0 ? spots[this.cfg.fromIdx] : { x: padX - 40, y: pathY };
    const end = spots[this.cfg.toIdx];
    const pip = this.add.image(start.x, start.y - 26, PIP_KEY).setDisplaySize(56, 56).setDepth(50);

    // Weather/time reaction: cool Pip's tint as the journey heads into dusk/twilight.
    const progress = this.cfg.toIdx / Math.max(1, this.cfg.scenes.length - 1);
    if (progress > 0.85) pip.setTint(0xb8c5ff);       // twilight
    else if (progress > 0.6) pip.setTint(0xffd6a8);   // dusk warmth

    const dwell = this.cfg.isFinale ? 1800 : 1400;
    const mood: PipMood = this.currentMood;

    // Footprint trail — drop a fading dot under Pip every ~180ms during walk.
    const footstepTimer = this.time.addEvent({
      delay: 180,
      repeat: Math.floor(dwell / 180),
      callback: () => {
        const fp = this.add.circle(pip.x, pip.y + 22, 4, p.groundLine, 0.55).setDepth(45);
        this.tweens.add({ targets: fp, alpha: 0, duration: 1200, onComplete: () => fp.destroy() });
      },
    });

    this.tweens.add({
      targets: pip,
      x: end.x,
      y: end.y - 26,
      duration: dwell,
      ease: 'Sine.InOut',
      onUpdate: () => { pip.setFlipX(end.x < start.x); },
      onComplete: () => {
        footstepTimer.remove();
        // tiny bounce on arrival
        this.tweens.add({
          targets: pip, y: end.y - 40, duration: 180, yoyo: true,
          onComplete: () => {
            this.playMoodEmote(pip, mood);
            if (this.cfg.isFinale) {
              this.victoryConfetti();
              this.time.delayedCall(1400, () => this.exit());
            } else {
              this.time.delayedCall(560, () => this.exit());
            }
          },
        });
      },
    });

    // Idle "breath" — gentle scale loop the whole time on the map.
    this.tweens.add({
      targets: pip, scaleY: 1.05, duration: 220, yoyo: true, repeat: Math.floor(dwell / 220),
    });

    // Blink every 2–4s: a thin dark line briefly across the eye area.
    this.startBlinking(pip);

    // Show emote bubble immediately on the opening (no walk-in reaction yet).
    if (this.cfg.fromIdx < 0) this.playMoodEmote(pip, 'neutral');
  }

  /** Compute Pip's current mood for this map pass. */
  private get currentMood(): PipMood {
    return moodFromResult(this.cfg.lastResult, this.cfg.streak ?? 0);
  }

  /** Spawn a small speech bubble above Pip with mood-appropriate copy. */
  private playMoodEmote(pip: Phaser.GameObjects.Image, mood: PipMood) {
    const copy = MOOD_COPY[mood];
    const text = copy[Math.floor(Math.random() * copy.length)];
    const color = MOOD_COLOR[mood];
    const label = this.add.text(pip.x, pip.y - 56, text, {
      fontFamily: 'Poppins, Inter, sans-serif', fontSize: '14px',
      color: `#${color.toString(16).padStart(6, '0')}`, fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0).setDepth(60);
    const padX = 10, padY = 5;
    const bw = label.width + padX * 2;
    const bh = label.height + padY * 2;
    const bubble = this.add.graphics().setDepth(59);
    bubble.fillStyle(0xffffff, 0.96);
    bubble.lineStyle(2, color, 0.85);
    bubble.fillRoundedRect(pip.x - bw / 2, pip.y - 56 - bh / 2, bw, bh, 10);
    bubble.strokeRoundedRect(pip.x - bw / 2, pip.y - 56 - bh / 2, bw, bh, 10);
    // tail
    bubble.fillTriangle(pip.x - 4, pip.y - 56 + bh / 2, pip.x + 4, pip.y - 56 + bh / 2, pip.x, pip.y - 56 + bh / 2 + 6);
    bubble.setAlpha(0);
    this.tweens.add({ targets: [label, bubble], alpha: 1, duration: 200, ease: 'Sine.Out' });
    // Mood-specific body language
    if (mood === 'cheer' || mood === 'proud') {
      this.tweens.add({ targets: pip, y: pip.y - 12, duration: 160, yoyo: true, repeat: 1, ease: 'Sine.InOut' });
      if (mood === 'proud') this.sparkleBurst(pip.x, pip.y - 30);
    } else if (mood === 'encourage') {
      this.tweens.add({ targets: pip, angle: { from: -6, to: 6 }, duration: 120, yoyo: true, repeat: 3, ease: 'Sine.InOut',
        onComplete: () => pip.setAngle(0) });
    }
    this.time.delayedCall(900, () => {
      this.tweens.add({ targets: [label, bubble], alpha: 0, duration: 220,
        onComplete: () => { label.destroy(); bubble.destroy(); } });
    });
  }

  /** Tiny sparkle ring used for "proud" mood. */
  private sparkleBurst(x: number, y: number) {
    for (let i = 0; i < 8; i += 1) {
      const a = (Math.PI * 2 * i) / 8;
      const s = this.add.circle(x, y, 2.5, 0xfde68a, 1).setDepth(61);
      this.tweens.add({
        targets: s, x: x + Math.cos(a) * 26, y: y + Math.sin(a) * 26,
        alpha: 0, duration: 700, ease: 'Cubic.Out',
        onComplete: () => s.destroy(),
      });
    }
  }

  /** Periodic eye-blink rectangle across Pip's eye band. */
  private startBlinking(pip: Phaser.GameObjects.Image) {
    const blink = () => {
      const eyeW = pip.displayWidth * 0.42;
      const lid = this.add.rectangle(pip.x, pip.y - pip.displayHeight * 0.08, eyeW, 2, 0x3a2410, 0.85).setDepth(51);
      this.tweens.add({
        targets: lid, scaleY: { from: 0.5, to: 4 }, alpha: { from: 0.9, to: 0 },
        duration: 140, ease: 'Sine.InOut',
        onComplete: () => lid.destroy(),
      });
    };
    // First blink soon, then every 2–4s.
    this.time.delayedCall(700, blink);
    this.time.addEvent({ delay: 2400, loop: true, callback: () => {
      if (Math.random() < 0.7) blink();
    }});
  }

  private exit() {
    this.tweens.add({
      targets: this.cameras.main, alpha: 0, duration: 220,
      onComplete: () => { this.cfg.onDone(); },
    });
  }

  private drawSpotIcon(x: number, y: number, kind: SpotDef['kind'], active: boolean) {
    const alpha = active ? 1 : 0.55;
    const g = this.add.graphics();
    g.fillStyle(0xffffff, alpha);
    g.lineStyle(2, 0x5a3a18, alpha);
    switch (kind) {
      case 'cave':   g.fillCircle(x, y - 2, 8); g.strokeCircle(x, y - 2, 8); break;
      case 'bridge': g.fillRect(x - 9, y - 2, 18, 4); g.strokeRect(x - 9, y - 2, 18, 4); break;
      case 'meadow': g.fillCircle(x - 4, y, 4); g.fillCircle(x + 4, y, 4); break;
      case 'garden': g.fillCircle(x, y - 4, 3); g.fillCircle(x - 4, y + 2, 3); g.fillCircle(x + 4, y + 2, 3); break;
      case 'tent':   g.fillTriangle(x - 8, y + 6, x + 8, y + 6, x, y - 8); g.strokeTriangle(x - 8, y + 6, x + 8, y + 6, x, y - 8); break;
      case 'tower':  g.fillRect(x - 4, y - 8, 8, 14); g.strokeRect(x - 4, y - 8, 8, 14); break;
      case 'castle': g.fillRect(x - 9, y - 4, 18, 10); g.fillRect(x - 9, y - 8, 4, 4); g.fillRect(x - 2, y - 8, 4, 4); g.fillRect(x + 5, y - 8, 4, 4); break;
      case 'pond':   g.fillEllipse(x, y + 2, 18, 8); g.strokeEllipse(x, y + 2, 18, 8); break;
    }
  }

  /** Top-right XP pill that animates from (totalXp - xpAwarded) → totalXp. */
  private renderXpHud(width: number) {
    const total = this.cfg.totalXp ?? 0;
    const awarded = this.cfg.xpAwarded ?? 0;
    const startVal = Math.max(0, total - awarded);
    const x = width - 92, y = 30;
    const pill = this.add.graphics().setDepth(80);
    const label = this.add.text(x, y, `★ ${startVal} XP`, {
      fontFamily: 'Poppins, Inter, sans-serif', fontSize: '15px',
      color: '#5a3a18', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(81);
    const drawPill = (highlight = false) => {
      pill.clear();
      const w = Math.max(96, label.width + 28);
      const h = 30;
      pill.fillStyle(highlight ? 0xfde68a : 0xfff8e1, 0.96);
      pill.lineStyle(2, highlight ? 0xf59e0b : 0xc9a04c, 0.9);
      pill.fillRoundedRect(x - w / 2, y - h / 2, w, h, h / 2);
      pill.strokeRoundedRect(x - w / 2, y - h / 2, w, h, h / 2);
    };
    drawPill(false);
    if (awarded > 0) {
      // Spawn a flying XP coin from screen center → pill, then count-up.
      const { height } = this.scale;
      const coin = this.add.circle(width / 2, height * 0.5, 12, 0xfacc15, 1)
        .setStrokeStyle(2, 0xfb923c, 1).setDepth(82);
      const coinTxt = this.add.text(coin.x, coin.y, `+${awarded}`, {
        fontFamily: 'Poppins', fontSize: '14px', color: '#5a3a18', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(83);
      this.tweens.add({
        targets: [coin, coinTxt], x, y, duration: 700, ease: 'Cubic.In',
        onComplete: () => {
          coin.destroy(); coinTxt.destroy();
          drawPill(true);
          this.tweens.add({ targets: pill, scale: 1.15, duration: 140, yoyo: true });
          // Count-up animation
          const counter = { v: startVal };
          this.tweens.add({
            targets: counter, v: total, duration: 600, ease: 'Sine.Out',
            onUpdate: () => { label.setText(`★ ${Math.round(counter.v)} XP`); drawPill(true); },
            onComplete: () => { this.time.delayedCall(400, () => drawPill(false)); },
          });
        },
      });
    }
  }

  /** Thin filling progress bar above the path showing lesson completion. */
  private renderProgressBar(width: number, height: number) {
    const completed = this.cfg.completedCount ?? 0;
    const total = Math.max(1, this.cfg.totalCount ?? this.cfg.scenes.length);
    const ratio = Math.max(0, Math.min(1, completed / total));
    const x = width * 0.12, y = height * 0.28;
    const w = width * 0.76, h = 8;
    const p = this.cfg.world.palette;
    const bg = this.add.graphics().setDepth(20);
    bg.fillStyle(0x000000, 0.08);
    bg.fillRoundedRect(x, y, w, h, h / 2);
    bg.lineStyle(1, p.groundLine, 0.45);
    bg.strokeRoundedRect(x, y, w, h, h / 2);
    const fill = this.add.graphics().setDepth(21);
    const draw = (r: number) => {
      fill.clear();
      const fw = Math.max(0, w * r);
      if (fw <= 0) return;
      fill.fillStyle(p.accent, 0.95);
      fill.fillRoundedRect(x, y, fw, h, h / 2);
      // Sheen
      fill.fillStyle(0xffffff, 0.35);
      fill.fillRoundedRect(x + 2, y + 1, Math.max(0, fw - 4), h * 0.4, h * 0.2);
    };
    // Animate from previous ratio (completed-1) to current
    const prev = Math.max(0, (completed - 1) / total);
    const state = { r: prev };
    draw(prev);
    this.tweens.add({
      targets: state, r: ratio, duration: 700, ease: 'Sine.Out',
      onUpdate: () => draw(state.r),
    });
    // Step counter under the bar
    this.add.text(x + w, y + h + 12, `${completed} / ${total}`, {
      fontFamily: 'Inter', fontSize: '11px', color: '#5a3a18',
    }).setOrigin(1, 0).setDepth(22);
  }

  /** Burst of radial sparks at (x, y) — used for finale fireworks. */
  private fireworkBurst(x: number, y: number, color: number) {
    for (let i = 0; i < 18; i += 1) {
      const a = (Math.PI * 2 * i) / 18;
      const dist = 60 + Math.random() * 40;
      const spark = this.add.circle(x, y, 3, color, 1).setDepth(110);
      this.tweens.add({
        targets: spark,
        x: x + Math.cos(a) * dist,
        y: y + Math.sin(a) * dist,
        alpha: 0, scale: 0.4,
        duration: 800 + Math.random() * 300, ease: 'Cubic.Out',
        onComplete: () => spark.destroy(),
      });
    }
    // Flash core
    const core = this.add.circle(x, y, 14, 0xffffff, 0.9).setDepth(111);
    this.tweens.add({ targets: core, alpha: 0, radius: 32, duration: 360,
      onComplete: () => core.destroy() });
  }

  private victoryConfetti() {
    const { width, height } = this.scale;
    if (!this.textures.exists('__map_conf__')) {
      const gg = this.add.graphics();
      gg.fillStyle(0xffffff, 1).fillRect(0, 0, 10, 6);
      gg.generateTexture('__map_conf__', 10, 6);
      gg.destroy();
    }
    const colors = [0xfacc15, 0xfb923c, 0xf472b6, 0x60a5fa, 0x34d399];
    const em = this.add.particles(width / 2, -10, '__map_conf__', {
      x: { min: 0, max: width },
      y: -10,
      lifespan: 2200, speedY: { min: 200, max: 400 }, speedX: { min: -120, max: 120 },
      angle: { min: 0, max: 360 }, rotate: { min: -180, max: 180 },
      scale: { min: 0.8, max: 1.4 }, alpha: { start: 1, end: 0 },
      tint: colors, quantity: 5, frequency: 25,
    }).setDepth(100);
    this.time.delayedCall(1100, () => em.stop());
    this.time.delayedCall(2400, () => em.destroy());

    // Layered fireworks bursts across the upper sky.
    const burstColors = [0xfacc15, 0xf472b6, 0x60a5fa, 0x34d399, 0xfb923c];
    for (let i = 0; i < 6; i += 1) {
      this.time.delayedCall(180 * i, () => {
        const bx = width * (0.15 + Math.random() * 0.7);
        const by = height * (0.18 + Math.random() * 0.22);
        this.fireworkBurst(bx, by, burstColors[i % burstColors.length]);
      });
    }
  }
}
