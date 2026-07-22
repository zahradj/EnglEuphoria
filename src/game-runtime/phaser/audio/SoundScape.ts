/**
 * SoundScape — singleton Web Audio engine for the Playground runtime.
 *
 * Per-world ambient bed (drone pad + nature-flavored noise layer), reactive
 * musical hits in a fixed pentatonic key, and a small UI sound vocabulary
 * (tap / pick / drop / whoosh) plus a finale fanfare. Pure Web Audio — no
 * assets, no network. Must be unlocked from a user gesture (call `unlock()`).
 */

import type { WorldId } from '../world/worldRegistry';

const SCALE_HZ = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99]; // C D E G A C5 D5 E5 G5

interface WorldVoice {
  /** Two pad fundamentals (Hz). */
  pad: [number, number];
  /** Pad oscillator type. */
  type: OscillatorType;
  /** Filter cutoff for the noise bed (Hz). 0 disables the noise layer. */
  noiseCutoff: number;
  /** Noise bed gain (0..1). */
  noiseGain: number;
  /** LP/HP for the noise — birds & wind get HP, water & bubbles get LP. */
  noiseFilter: BiquadFilterType;
  /** Small reactive "blip" tint color for that world (Hz offset cents). */
  tapDetuneCents: number;
}

const WORLD_VOICES: Record<WorldId, WorldVoice> = {
  meadow: { pad: [130.81, 196.0], type: 'sine',     noiseCutoff: 4200, noiseGain: 0.04, noiseFilter: 'highpass', tapDetuneCents: 0 },
  sky:    { pad: [146.83, 220.0], type: 'sine',     noiseCutoff: 800,  noiseGain: 0.05, noiseFilter: 'lowpass',  tapDetuneCents: 200 },
  ocean:  { pad: [110.00, 164.81], type: 'sine',    noiseCutoff: 600,  noiseGain: 0.08, noiseFilter: 'lowpass',  tapDetuneCents: -100 },
  forest: { pad: [123.47, 185.00], type: 'triangle',noiseCutoff: 3000, noiseGain: 0.05, noiseFilter: 'highpass', tapDetuneCents: 100 },
  town:   { pad: [146.83, 220.0], type: 'triangle', noiseCutoff: 0,    noiseGain: 0,    noiseFilter: 'lowpass',  tapDetuneCents: 0 },
  desert: { pad: [116.54, 174.61], type: 'sine',    noiseCutoff: 1500, noiseGain: 0.03, noiseFilter: 'lowpass',  tapDetuneCents: -200 },
};

class SoundScapeImpl {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private padGain: GainNode | null = null;
  private noiseGain: GainNode | null = null;
  private padNodes: { osc: OscillatorNode; gain: GainNode; lfo: OscillatorNode }[] = [];
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;
  private currentWorld: WorldId = 'meadow';
  private streak = 0;
  private unlocked = false;
  private muted = false;

  unlock() {
    if (this.unlocked) return;
    try {
      const Ctor: typeof AudioContext =
        (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      this.ctx = new Ctor();
      const master = this.ctx.createGain();
      master.gain.value = 0.55;
      master.connect(this.ctx.destination);
      this.master = master;
      this.unlocked = true;
      this.startAmbient(this.currentWorld);
    } catch {
      this.unlocked = false;
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (!this.ctx || !this.master) return;
    this.master.gain.setTargetAtTime(muted ? 0 : 0.55, this.ctx.currentTime, 0.1);
  }

  /** Switch ambient soundscape to a new world (crossfade). */
  setWorld(world: WorldId) {
    if (world === this.currentWorld && this.padNodes.length) return;
    this.currentWorld = world;
    if (!this.unlocked || !this.ctx) return;
    this.stopAmbient();
    this.startAmbient(world);
  }

  private startAmbient(world: WorldId) {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const voice = WORLD_VOICES[world];

    // Pad
    const padGain = ctx.createGain();
    padGain.gain.value = 0;
    padGain.connect(this.master);
    this.padGain = padGain;

    voice.pad.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = voice.type;
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = 0.5;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05 + i * 0.03;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 2;
      lfo.connect(lfoGain).connect(osc.frequency);
      osc.connect(g).connect(padGain);
      osc.start();
      lfo.start();
      this.padNodes.push({ osc, gain: g, lfo });
    });
    padGain.gain.setTargetAtTime(0.18, ctx.currentTime, 1.2);

    // Noise bed (wind/water/birds flavor)
    if (voice.noiseGain > 0) {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = voice.noiseFilter;
      filter.frequency.value = voice.noiseCutoff;
      const ng = ctx.createGain();
      ng.gain.value = 0;
      src.connect(filter).connect(ng).connect(this.master);
      src.start();
      ng.gain.setTargetAtTime(voice.noiseGain, ctx.currentTime, 2.0);
      this.noiseNode = src;
      this.noiseFilter = filter;
      this.noiseGain = ng;
    }
  }

  private stopAmbient() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    if (this.padGain) {
      this.padGain.gain.setTargetAtTime(0, t, 0.6);
    }
    if (this.noiseGain) {
      this.noiseGain.gain.setTargetAtTime(0, t, 0.6);
    }
    const padNodes = this.padNodes;
    const noiseNode = this.noiseNode;
    setTimeout(() => {
      padNodes.forEach(({ osc, lfo }) => { try { osc.stop(); lfo.stop(); } catch { /* noop */ } });
      try { noiseNode?.stop(); } catch { /* noop */ }
    }, 1400);
    this.padNodes = [];
    this.noiseNode = null;
    this.noiseFilter = null;
    this.noiseGain = null;
    this.padGain = null;
  }

  private playTone(freq: number, opts: { duration?: number; gain?: number; type?: OscillatorType; attack?: number } = {}) {
    if (!this.ctx || !this.master || this.muted) return;
    const ctx = this.ctx;
    const dur = opts.duration ?? 0.42;
    const peak = opts.gain ?? 0.22;
    const attack = opts.attack ?? 0.01;
    const osc = ctx.createOscillator();
    osc.type = opts.type ?? 'triangle';
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(peak, ctx.currentTime + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(g).connect(this.master);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.02);
  }

  correctHit() {
    if (!this.unlocked) return;
    const idx = Math.min(this.streak, SCALE_HZ.length - 1);
    const freq = SCALE_HZ[idx];
    this.playTone(freq, { duration: 0.5, gain: 0.28, type: 'triangle' });
    this.playTone(freq * 2, { duration: 0.35, gain: 0.12, type: 'sine', attack: 0.02 });
    this.streak += 1;
  }

  wrongHit() {
    if (!this.unlocked) return;
    this.streak = 0;
    this.playTone(220, { duration: 0.18, gain: 0.18, type: 'sine' });
    setTimeout(() => this.playTone(261.63, { duration: 0.32, gain: 0.16, type: 'sine' }), 140);
  }

  /** Light UI tap (button press, card hover-click). */
  tap() {
    if (!this.unlocked) return;
    const detune = WORLD_VOICES[this.currentWorld].tapDetuneCents;
    const freq = 880 * Math.pow(2, detune / 1200);
    this.playTone(freq, { duration: 0.08, gain: 0.08, type: 'sine', attack: 0.001 });
  }

  /** Drag pickup. */
  pick() {
    if (!this.unlocked) return;
    this.playTone(660, { duration: 0.09, gain: 0.07, type: 'sine', attack: 0.001 });
  }

  /** Drag drop / snap into place. */
  drop() {
    if (!this.unlocked) return;
    this.playTone(523.25, { duration: 0.12, gain: 0.1, type: 'triangle', attack: 0.001 });
    setTimeout(() => this.playTone(784, { duration: 0.1, gain: 0.06, type: 'sine' }), 60);
  }

  /** Page-turn / scene transition whoosh (filtered noise sweep). */
  whoosh() {
    if (!this.unlocked || !this.ctx || !this.master || this.muted) return;
    const ctx = this.ctx;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 0.8;
    filter.frequency.setValueAtTime(2400, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.35);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.18, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.38);
    src.connect(filter).connect(g).connect(this.master);
    src.start();
    src.stop(ctx.currentTime + 0.4);
  }

  /** Triumphant finale fanfare for lesson completion. */
  fanfare() {
    if (!this.unlocked) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((n, i) => {
      setTimeout(() => {
        this.playTone(n, { duration: 0.45, gain: 0.26, type: 'triangle' });
        this.playTone(n * 0.5, { duration: 0.55, gain: 0.14, type: 'sine' });
      }, i * 140);
    });
    setTimeout(() => {
      // Final chord
      [523.25, 659.25, 783.99, 1046.5].forEach((n) =>
        this.playTone(n, { duration: 1.2, gain: 0.18, type: 'triangle', attack: 0.05 })
      );
    }, notes.length * 140 + 50);
  }

  resetStreak() { this.streak = 0; }
  getStreak() { return this.streak; }
}

export const SoundScape = new SoundScapeImpl();
