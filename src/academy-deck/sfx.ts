// Small synthesized sound bank for the Academy player (owner 2026-10-14: adapt the Playground game feel for teens). Subtle ticks and chimes made with WebAudio:
// no files, no speech (voices stay recorded clips only). Off in Calm mode and with the Sounds toggle; silent until the first tap unlocks audio.
type Kind = 'right' | 'wrong' | 'done' | 'combo' | 'key' | 'pin';
let ctx: AudioContext | null = null;
const audio = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = ctx ?? new AC();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
};
const tone = (c: AudioContext, freq: number, start: number, dur: number, gain: number, type: OscillatorType = 'sine') => {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, c.currentTime + start);
  g.gain.setValueAtTime(0.0001, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, c.currentTime + start + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  o.connect(g).connect(c.destination);
  o.start(c.currentTime + start);
  o.stop(c.currentTime + start + dur + 0.05);
};
/** The notes of each sound: a short bright tick for a right answer, a soft low note for a miss (never harsh), a rising chime when a slide is solved, a quick arpeggio on a combo. */
export const SFX_NOTES: Record<Kind, { f: number; t: number; d: number; g: number; w?: OscillatorType }[]> = {
  right: [{ f: 880, t: 0, d: 0.12, g: 0.05 }, { f: 1318, t: 0.06, d: 0.14, g: 0.04 }],
  wrong: [{ f: 220, t: 0, d: 0.18, g: 0.04, w: 'triangle' }],
  done: [{ f: 523, t: 0, d: 0.16, g: 0.045 }, { f: 659, t: 0.09, d: 0.16, g: 0.045 }, { f: 784, t: 0.18, d: 0.26, g: 0.045 }],
  /** a lock opens: a soft metallic click, then a bright rising chime */
  key: [{ f: 330, t: 0, d: 0.06, g: 0.05, w: 'square' }, { f: 659, t: 0.1, d: 0.14, g: 0.045 }, { f: 988, t: 0.2, d: 0.18, g: 0.045 }, { f: 1318, t: 0.3, d: 0.3, g: 0.04 }],
  /** a pin sets: one short tick */
  pin: [{ f: 440, t: 0, d: 0.05, g: 0.04, w: 'triangle' }, { f: 740, t: 0.05, d: 0.08, g: 0.035 }],
  combo: [{ f: 784, t: 0, d: 0.1, g: 0.04 }, { f: 988, t: 0.07, d: 0.1, g: 0.04 }, { f: 1175, t: 0.14, d: 0.1, g: 0.04 }, { f: 1568, t: 0.21, d: 0.22, g: 0.04 }],
};
export function playSfx(kind: Kind, on: boolean): void {
  if (!on) return;
  const c = audio();
  if (!c) return;
  SFX_NOTES[kind].forEach((n) => tone(c, n.f, n.t, n.d, n.g, n.w));
}
