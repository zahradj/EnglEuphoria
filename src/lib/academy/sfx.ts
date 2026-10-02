/**
 * Tiny synthesized sound effects for the Academy quest player (WebAudio — no files, no network, no speech).
 *
 * These are non-verbal blips only. Spoken words/sentences must still go through the recorded-voice pipeline
 * (see CLAUDE.md "Voice (hard rule)") — never `speechSynthesis`.
 *
 * Browsers only allow audio after a user gesture; every call is wrapped in try/catch and silently does
 * nothing when the context cannot start, so a blocked sound never breaks a lesson.
 */
const MUTE_KEY = 'academy-sfx-muted';

let ctx: AudioContext | null = null;

function context(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function isSfxMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setSfxMuted(muted: boolean) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    /* storage can be blocked — the toggle just won't persist */
  }
}

interface Tone { f: number; at: number; dur: number; type?: OscillatorType; gain?: number }

function play(tones: Tone[]) {
  if (isSfxMuted()) return;
  const c = context();
  if (!c) return;
  const t0 = c.currentTime;
  for (const tone of tones) {
    try {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = tone.type ?? 'sine';
      o.frequency.setValueAtTime(tone.f, t0 + tone.at);
      const peak = tone.gain ?? 0.07;
      g.gain.setValueAtTime(0.0001, t0 + tone.at);
      g.gain.exponentialRampToValueAtTime(peak, t0 + tone.at + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + tone.at + tone.dur);
      o.connect(g).connect(c.destination);
      o.start(t0 + tone.at);
      o.stop(t0 + tone.at + tone.dur + 0.03);
    } catch {
      /* ignore */
    }
  }
}

export const sfx = {
  /** Bright two-note "ding" for a correct answer. */
  correct: () => play([{ f: 659, at: 0, dur: 0.14, type: 'triangle' }, { f: 988, at: 0.09, dur: 0.22, type: 'triangle' }]),
  /** Soft, low, short — a nudge, never a punishment. */
  wrong: () => play([{ f: 220, at: 0, dur: 0.16, type: 'sine', gain: 0.05 }, { f: 185, at: 0.1, dur: 0.18, type: 'sine', gain: 0.04 }]),
  /** Level start: quick rising "go!" arpeggio. */
  go: () => play([523, 659, 784, 1047].map((f, i) => ({ f, at: i * 0.07, dur: 0.18, type: 'square' as OscillatorType, gain: 0.04 }))),
  /** Level cleared: celebratory fanfare. */
  levelUp: () => play([523, 659, 784, 1047, 784, 1047, 1319].map((f, i) => ({ f, at: i * 0.1, dur: 0.22, type: 'triangle' as OscillatorType, gain: 0.07 }))),
  /** Button / pick feedback. */
  tap: () => play([{ f: 440, at: 0, dur: 0.05, type: 'sine', gain: 0.04 }]),
};
