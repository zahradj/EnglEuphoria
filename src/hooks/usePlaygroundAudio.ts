import { useCallback, useEffect, useRef, useState } from 'react';
import { playElevenLabs, stopElevenLabs, isTtsDisabled } from '@/lib/elevenLabsAudio';
import { supabase } from '@/integrations/supabase/client';

/**
 * usePlaygroundAudio — universal audio hook for the Playground Engine.
 *
 * Wraps the `elevenlabs-tts` Edge Function. Includes a session-wide circuit
 * breaker: once the API returns quota/auth errors, all subsequent calls
 * become silent no-ops so the UI stays responsive and the console clean.
 *
 * Cheerful child-friendly voice: Lily (pFZP5JQG7iQjIQuC4Bku) by default.
 */

const PLAYGROUND_VOICE_ID = 'pFZP5JQG7iQjIQuC4Bku'; // Lily — warm, kid-friendly
const cache = new Map<string, string>(); // text → blob URL

let localDisabled = false;
let warned = false;

function shouldTrip(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : JSON.stringify(err ?? '')).toLowerCase();
  const status = (err as any)?.context?.status ?? (err as any)?.status;
  return status === 401 || status === 402 || msg.includes('quota') || msg.includes('credits') || msg.includes('non-2xx');
}

async function fetchAudioUrl(text: string, voiceId = PLAYGROUND_VOICE_ID): Promise<string | null> {
  if (localDisabled || isTtsDisabled()) return null;
  const key = `${voiceId}::${text}`;
  if (cache.has(key)) return cache.get(key)!;
  try {
    const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
      body: { text, voiceId, speed: 0.95 },
    });
    if (error) {
      if (shouldTrip(error)) {
        localDisabled = true;
        if (!warned) {
          warned = true;
          // eslint-disable-next-line no-console
          console.warn('[PlaygroundAudio] TTS disabled this session (quota/auth). Silencing further calls.');
        }
      }
      return null;
    }
    if (!data) return null;
    const blob = data instanceof Blob ? data : new Blob([data], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    cache.set(key, url);
    return url;
  } catch (e) {
    if (shouldTrip(e)) localDisabled = true;
    return null;
  }
}

export function usePlaygroundAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setIsPlaying(false);
  }, []);

  const playVoice = useCallback(async (text: string, voiceId?: string) => {
    if (!text?.trim()) return;
    stop();
    const url = await fetchAudioUrl(text, voiceId);
    if (!url) {
      // No remote URL — generate fresh ElevenLabs audio (no native fallback)
      void playElevenLabs(text, { speed: 0.95 });
      return;
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    audio.play().catch(() => setIsPlaying(false));
  }, [stop]);

  const playCorrect = useCallback((custom?: string) => {
    return playVoice(custom || 'Great job! Well done!');
  }, [playVoice]);

  const playWrong = useCallback((custom?: string) => {
    return playVoice(custom || 'Try again! You can do it!');
  }, [playVoice]);

  useEffect(() => () => stop(), [stop]);

  return { playVoice, playCorrect, playWrong, stop, isPlaying };
}
