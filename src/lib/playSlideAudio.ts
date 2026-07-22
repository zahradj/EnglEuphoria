/**
 * Resilient audio player for slides.
 *
 * Per the audio architecture lock: ElevenLabs is the EXCLUSIVE engine.
 *   1. If a pre-generated audio URL is provided, play it.
 *   2. On any failure (network, decode, autoplay block, missing URL),
 *      generate fresh audio via the `generate-elevenlabs-audio` edge function.
 *   No native browser TTS fallback.
 */
import { playElevenLabs, stopElevenLabs } from './elevenLabsAudio';

export interface PlaySlideAudioOptions {
  audioUrl?: string | null;
  text?: string | null;
  /** Reserved for future per-locale voice routing. */
  lang?: string;
  voiceId?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

export function playSlideAudio(opts: PlaySlideAudioOptions): () => void {
  const { audioUrl, text, voiceId, onStart, onEnd, onError } = opts;
  let audio: HTMLAudioElement | null = null;
  let cancelled = false;

  const generateFresh = async () => {
    if (cancelled || !text) {
      onError?.(new Error('No audio URL and no text to synthesize'));
      return;
    }
    await playElevenLabs(text, { voiceId, onStart, onEnd, onError });
  };

  if (audioUrl) {
    try {
      audio = new Audio(audioUrl);
      audio.preload = 'auto';
      audio.onplay = () => onStart?.();
      audio.onended = () => onEnd?.();
      audio.onerror = () => { void generateFresh(); };
      audio.play().catch(() => { void generateFresh(); });
    } catch {
      void generateFresh();
    }
  } else {
    void generateFresh();
  }

  return () => {
    cancelled = true;
    try {
      audio?.pause();
      if (audio) audio.src = '';
    } catch { /* noop */ }
    stopElevenLabs();
  };
}
