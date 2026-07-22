import { useState, useCallback, useRef } from 'react';

interface TTSOptions {
  voiceId?: string;
  speed?: number;
}

export function useTextToSpeech() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const speak = useCallback(async (text: string, options?: TTSOptions) => {
    if (!text || text.trim().length === 0) {
      setError("No text provided");
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text,
            voiceId: options?.voiceId,
            speed: options?.speed,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `TTS request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        setError("Failed to play audio");
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error("TTS error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate speech");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const speakWord = useCallback((word: string, ipa?: string) => {
    const textToSpeak = ipa ? `${word}. ${word}.` : word;
    return speak(textToSpeak, { speed: 0.9 });
  }, [speak]);

  const speakSlow = useCallback((text: string) => {
    return speak(text, { speed: 0.7 });
  }, [speak]);

  const speakNormal = useCallback((text: string) => {
    return speak(text, { speed: 1.0 });
  }, [speak]);

  return {
    speak,
    speakWord,
    speakSlow,
    speakNormal,
    stop,
    isLoading,
    isPlaying,
    error,
  };
}
