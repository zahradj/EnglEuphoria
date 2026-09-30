import { speak, stopSpeaking } from '@/content/playground-library/unit1/audio';

/**
 * RULE: the app never uses the browser's built-in text-to-speech voice.
 *
 * Device voices speak with whatever accent and language the device happens
 * to have, which was reported in class as unacceptable. Older pages still
 * call `window.speechSynthesis.speak(...)` directly (27 files when this was
 * added), so instead of trusting each of them this guard, installed once at
 * startup, reroutes every utterance to the platform's recorded character
 * voice pipeline (unit1/audio.ts: pre-made clips first, then the
 * server-cached ElevenLabs line). The utterance's own start/end/error events
 * still fire, so code waiting on `onend` keeps working.
 *
 * New code must call `speak()` from unit1/audio.ts (or a voice hook built on
 * it), never `speechSynthesis` — see CLAUDE.md "Voice".
 */
let installed = false;

function fire(u: SpeechSynthesisUtterance, type: 'start' | 'end' | 'error') {
  let ev: Event;
  try {
    ev = type === 'error'
      ? new SpeechSynthesisErrorEvent('error', { utterance: u, error: 'synthesis-failed' })
      : new SpeechSynthesisEvent(type, { utterance: u });
  } catch {
    ev = new Event(type);
  }
  try { u.dispatchEvent(ev); } catch { /* noop */ }
}

export function installNoBrowserVoice() {
  if (installed || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  installed = true;
  const synth = window.speechSynthesis;
  let pending = 0;
  const redirected = {
    speak(u: SpeechSynthesisUtterance) {
      const text = (u?.text ?? '').trim();
      // Silent warm-up utterances (volume 0 / blank) just complete.
      if (!text || u.volume === 0) { window.setTimeout(() => fire(u, 'end'), 0); return; }
      pending++;
      window.setTimeout(() => fire(u, 'start'), 0);
      speak(text, 'teacher')
        .then(() => fire(u, 'end'))
        .catch(() => fire(u, 'error'))
        .finally(() => { pending = Math.max(0, pending - 1); });
    },
    cancel() { if (pending > 0) { pending = 0; stopSpeaking(); } },
    pause() { /* recorded clips don't pause mid-line */ },
    resume() { /* noop */ },
  };
  for (const [k, fn] of Object.entries(redirected)) {
    try { Object.defineProperty(synth, k, { value: fn, configurable: true, writable: true }); } catch { /* noop */ }
  }
  try { Object.defineProperty(synth, 'speaking', { get: () => pending > 0, configurable: true }); } catch { /* noop */ }
}
