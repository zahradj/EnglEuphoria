import { useCallback, useEffect, useState } from 'react';

/**
 * Per-session speaking intent.
 * - 'bravery'      → student opted in to speak; speaking slides auto-focus mic.
 * - 'listen_only'  → low-pressure shadow-and-whisper mode; no scoring shown.
 *
 * Persisted in sessionStorage keyed per lesson so a single intent choice carries
 * across slide navigation. Resets when the tab closes.
 */
export type SpeakingIntent = 'bravery' | 'listen_only';

const KEY = (lessonId: string) => `speaking_intent:${lessonId}`;

export function useSpeakingIntent(lessonId: string | undefined) {
  const [intent, setIntentState] = useState<SpeakingIntent | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!lessonId) return;
    try {
      const raw = sessionStorage.getItem(KEY(lessonId));
      if (raw === 'bravery' || raw === 'listen_only') setIntentState(raw);
    } catch {}
    setHydrated(true);
  }, [lessonId]);

  const setIntent = useCallback(
    (next: SpeakingIntent) => {
      if (!lessonId) return;
      try {
        sessionStorage.setItem(KEY(lessonId), next);
      } catch {}
      setIntentState(next);
    },
    [lessonId],
  );

  return { intent, setIntent, hydrated };
}
