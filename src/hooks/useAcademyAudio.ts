import { useCallback, useEffect, useRef, useState } from 'react';
import { playElevenLabs, stopElevenLabs } from '@/lib/elevenLabsAudio';
import { supabase } from '@/integrations/supabase/client';

/**
 * useAcademyAudio — restrained, manual-trigger TTS for the Academy Engine.
 *
 * Unlike Playground, this hook NEVER auto-plays. Audio is reserved for
 * pronunciation, reading passages, and listening exercises only — invoked
 * explicitly by the student via a button.
 *
 * Voice: Sarah (EXAVITQu4vr4xnSDxMaL) — clear, mature, neutral. Good for
 * teen learners (12–17, A1–B1).
 */

const ACADEMY_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';
const cache = new Map<string, string>();

async function fetchAudioUrl(text: string, voiceId = ACADEMY_VOICE_ID): Promise<string | null> {
  const key = `${voiceId}::${text}`;
  if (cache.has(key)) return cache.get(key)!;
  try {
    const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
      body: { text, voiceId, speed: 1.0 },
    });
    if (error || !data) return null;
    const blob = data instanceof Blob ? data : new Blob([data], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    cache.set(key, url);
    return url;
  } catch {
    return null;
  }
}

export function useAcademyAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setIsPlaying(false);
  }, []);

  const playVoice = useCallback(async (text: string, voiceId?: string) => {
    if (!text?.trim()) return;
    stop();
    setIsLoading(true);
    const url = await fetchAudioUrl(text, voiceId);
    setIsLoading(false);
    if (!url) {
      void playElevenLabs(text);
      return;
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    audio.play().catch(() => setIsPlaying(false));
  }, [stop]);

  useEffect(() => () => stop(), [stop]);

  return { playVoice, stop, isPlaying, isLoading };
}
