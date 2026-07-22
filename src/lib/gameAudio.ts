// Tiny WebAudio-based sound effects for games. No assets, no network.
let _ctx: AudioContext | null = null;
function ctx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!_ctx) {
    try {
      _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return _ctx;
}

function tone(freq: number, duration = 0.18, type: OscillatorType = 'sine', gain = 0.12) {
  const ac = ctx();
  if (!ac) return;
  try {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    osc.connect(g);
    g.connect(ac.destination);
    const now = ac.currentTime;
    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.start(now);
    osc.stop(now + duration);
  } catch {}
}

export function playDing() {
  tone(880, 0.12, 'sine', 0.14);
  setTimeout(() => tone(1320, 0.18, 'sine', 0.12), 90);
}

export function playBuzz() {
  tone(180, 0.22, 'sawtooth', 0.08);
}

export function playClick() {
  tone(620, 0.05, 'square', 0.06);
}
