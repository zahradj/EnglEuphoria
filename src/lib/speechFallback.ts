// Browser SpeechSynthesis fallback used when cached ElevenLabs audio is
// missing or fails to play. Picks a kid-friendly higher-pitch voice for the
// Playground hub and a standard voice for Academy/Success.

export type SpeechHub = 'playground' | 'academy' | 'success';

function pickVoice(hub: SpeechHub): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const en = voices.filter((v) => v.lang?.toLowerCase().startsWith('en'));
  const pool = en.length ? en : voices;
  if (hub === 'playground') {
    const kid = pool.find((v) => /child|kid|girl|boy|junior/i.test(v.name));
    if (kid) return kid;
    const female = pool.find((v) => /female|samantha|victoria|karen|tessa|zira/i.test(v.name));
    return female ?? pool[0];
  }
  return pool[0];
}

/**
 * Speaks `text` using the native Speech Synthesis API. Returns true if
 * playback started, false if unsupported.
 */
export function speakFallback(text: string, hub: SpeechHub = 'academy'): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voice = pickVoice(hub);
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? 'en-US';
    u.rate = hub === 'playground' ? 0.95 : 1.0;
    u.pitch = hub === 'playground' ? 1.4 : 1.0;
    u.volume = 1.0;
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}

export function cancelSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch { /* noop */ }
  }
}
