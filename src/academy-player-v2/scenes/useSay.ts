import { useEffect } from 'react';
import { sayLine, stopVoice } from '../services/voice';

/** Say one recorded line whenever `line` changes (silent if there is no clip). Stops the voice when the scene or line changes. */
export function useSay(who: string, text: string | undefined, artBase: string) {
  useEffect(() => {
    if (!text) return;
    void sayLine({ who, text }, artBase);
    return () => stopVoice();
  }, [who, text, artBase]);
}
