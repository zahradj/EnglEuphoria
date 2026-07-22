import { useCallback } from 'react';

/**
 * Tiny browser-TTS wrapper used by Vocabulary Vault, Map of Sounds,
 * and the Grammar Journal so every word/sound the student met in lessons
 * has an instant playback button. No backend, no credits, no network.
 */
export function useSpeak() {
  return useCallback((text: string, opts?: { rate?: number; pitch?: number; lang?: string }) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = opts?.lang ?? 'en-US';
      u.rate = opts?.rate ?? 0.95;
      u.pitch = opts?.pitch ?? 1;
      window.speechSynthesis.speak(u);
    } catch {
      /* no-op */
    }
  }, []);
}
