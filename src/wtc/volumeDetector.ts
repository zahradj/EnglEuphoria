// Classifies an audio level (0..100, from useAudioMonitoring) into a VolumeBand
// using a rolling 5-second median to avoid noise spikes.

import type { VolumeBand } from './types';

const WINDOW_MS = 5000;

export class VolumeDetector {
  private samples: Array<{ t: number; v: number }> = [];

  push(level: number, now = Date.now()) {
    this.samples.push({ t: now, v: level });
    const cutoff = now - WINDOW_MS;
    while (this.samples.length && this.samples[0].t < cutoff) this.samples.shift();
  }

  band(): VolumeBand {
    if (!this.samples.length) return 'inaudible';
    const sorted = this.samples.map((s) => s.v).sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    if (median < 4) return 'inaudible';
    if (median < 12) return 'soft';
    if (median < 35) return 'normal';
    return 'strong';
  }
}
