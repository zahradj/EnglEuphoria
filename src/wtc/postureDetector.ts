// Lightweight posture/gesture detector.
// Heuristic: frame-to-frame motion in the upper body region.
// High motion in side regions = gestures; very low overall motion = closed/stiff posture.

import type { PostureBand } from './types';

const WINDOW_MS = 8000;
const FRAME_SAMPLE = 64; // downscaled width for diffing

interface MotionSample {
  t: number;
  total: number;
  sides: number;
}

export class PostureDetector {
  private canvas: HTMLCanvasElement | null = null;
  private prev: ImageData | null = null;
  private samples: MotionSample[] = [];

  sample(video: HTMLVideoElement, now = Date.now()) {
    if (typeof document === 'undefined' || video.readyState < 2) return;
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = FRAME_SAMPLE;
      this.canvas.height = Math.round(FRAME_SAMPLE * 0.75);
    }
    const ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
    const cur = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    if (this.prev) {
      let total = 0;
      let sides = 0;
      const w = cur.width;
      for (let i = 0; i < cur.data.length; i += 4) {
        const dr = Math.abs(cur.data[i] - this.prev.data[i]);
        const dg = Math.abs(cur.data[i + 1] - this.prev.data[i + 1]);
        const db = Math.abs(cur.data[i + 2] - this.prev.data[i + 2]);
        const d = (dr + dg + db) / 3;
        if (d > 18) {
          total += 1;
          const px = (i / 4) % w;
          if (px < w * 0.25 || px > w * 0.75) sides += 1;
        }
      }
      this.samples.push({ t: now, total, sides });
      const cutoff = now - WINDOW_MS;
      while (this.samples.length && this.samples[0].t < cutoff) this.samples.shift();
    }
    this.prev = cur;
  }

  posture(): PostureBand {
    if (!this.samples.length) return 'neutral';
    const avg = this.samples.reduce((a, s) => a + s.total, 0) / this.samples.length;
    if (avg < 30) return 'closed';
    if (avg < 120) return 'neutral';
    return 'open';
  }

  /** Gestures per 10s, normalized 0..1 (saturates at 8 side-motion events / 10s). */
  gestureRate(): number {
    if (!this.samples.length) return 0;
    const sideTotal = this.samples.reduce((a, s) => a + s.sides, 0);
    const per10s = (sideTotal / Math.max(1, this.samples.length)) * (10000 / 500);
    return Math.min(1, per10s / 80);
  }
}
