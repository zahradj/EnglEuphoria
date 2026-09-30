/** Tiny procedural SFX helpers — ported 1:1 from the original player. */
import { relaySfx, registerSfxPlayer } from './audio';

let ctx: AudioContext | null = null;
/** Extra start delay while playing a relayed-to-the-other-screen sound, so
 *  both screens hear it together (see audio.ts relaySfx). */
let offsetSec = 0;
function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone(opts: { freq: number; toFreq?: number; duration: number; type?: OscillatorType; gain?: number; delay?: number }) {
  const a = ac();
  if (!a) return;
  const t0 = a.currentTime + (opts.delay ?? 0) + offsetSec;
  const t1 = t0 + opts.duration;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = opts.type ?? 'sine';
  osc.frequency.setValueAtTime(opts.freq, t0);
  if (opts.toFreq !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.toFreq), t1);
  const peak = opts.gain ?? 0.25;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t1);
  osc.connect(g).connect(a.destination);
  osc.start(t0);
  osc.stop(t1 + 0.02);
}

const BANK = {
  pop: () => {
    tone({ freq: 380, toFreq: 900, duration: 0.09, type: 'sine', gain: 0.25 });
    tone({ freq: 900, toFreq: 500, duration: 0.08, type: 'triangle', gain: 0.18, delay: 0.05 });
  },
  click: () => {
    tone({ freq: 700, toFreq: 500, duration: 0.05, type: 'square', gain: 0.12 });
  },
  match: () => {
    tone({ freq: 660, duration: 0.12, type: 'triangle', gain: 0.28 });
    tone({ freq: 990, duration: 0.18, type: 'triangle', gain: 0.28, delay: 0.09 });
    tone({ freq: 1320, duration: 0.22, type: 'sine', gain: 0.2, delay: 0.16 });
  },
  wrong: () => {
    tone({ freq: 300, toFreq: 160, duration: 0.28, type: 'sawtooth', gain: 0.18 });
  },
  reveal: () => {
    tone({ freq: 220, toFreq: 900, duration: 0.28, type: 'sine', gain: 0.22 });
    tone({ freq: 1600, duration: 0.15, type: 'triangle', gain: 0.14, delay: 0.18 });
  },
  gem: () => {
    const notes = [523, 659, 784, 1046];
    notes.forEach((f, i) => tone({ freq: f, duration: 0.18, type: 'triangle', gain: 0.25, delay: i * 0.07 }));
  },
  ring: () => {
    tone({ freq: 1760, duration: 0.09, type: 'triangle', gain: 0.22 });
    tone({ freq: 2637, duration: 0.14, type: 'sine', gain: 0.18, delay: 0.05 });
  },
  whoop: () => {
    tone({ freq: 300, toFreq: 1400, duration: 0.28, type: 'sine', gain: 0.28 });
    tone({ freq: 1400, toFreq: 900, duration: 0.14, type: 'triangle', gain: 0.18, delay: 0.26 });
  },
};

export type SfxName = keyof typeof BANK;

/** Play a sound; in a live class the driving side also sends it to the
 *  other screen (and holds its own start back by the network lead). */
function play(name: SfxName, fromRelay = false) {
  const lead = fromRelay ? 0 : relaySfx(name);
  if (lead < 0) return; // de-duplicated on the receiving side
  offsetSec = lead;
  try { BANK[name](); } finally { offsetSec = 0; }
}
registerSfxPlayer((name) => { if (name in BANK) play(name as SfxName, true); });

export function pop() { play('pop'); }
export function click() { play('click'); }
export function match() { play('match'); }
export function wrong() { play('wrong'); }
export function reveal() { play('reveal'); }
export function gem() { play('gem'); }
export function ring() { play('ring'); }
export function whoop() { play('whoop'); }
