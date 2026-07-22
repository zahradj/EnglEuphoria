/**
 * Voice-driven Language Engines — thin browser-native wrapper around
 * SpeechSynthesis (TTS) and SpeechRecognition (input). Zero cost, works
 * offline, respects user's device voices. Engines opt-in via `useEngineVoice`.
 */
import { useCallback, useEffect, useRef, useState } from "react";

export interface EngineVoiceOptions {
  lang?: string; // e.g. "en-US"
  rate?: number;
  pitch?: number;
}

export function useEngineVoice(opts: EngineVoiceOptions = {}) {
  const { lang = "en-US", rate = 1, pitch = 1 } = opts;
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recRef = useRef<any>(null);

  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const recognitionSupported =
    typeof window !== "undefined" &&
    // @ts-ignore
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !text) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = rate;
      u.pitch = pitch;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    },
    [supported, lang, rate, pitch],
  );

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const listen = useCallback(
    (onResult: (text: string) => void) => {
      if (!recognitionSupported) return;
      // @ts-ignore
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SR();
      rec.lang = lang;
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript as string;
        setTranscript(text);
        onResult(text);
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);
      recRef.current = rec;
      setListening(true);
      rec.start();
    },
    [recognitionSupported, lang],
  );

  const stopListening = useCallback(() => {
    try { recRef.current?.stop(); } catch { /* ignore */ }
    setListening(false);
  }, []);

  useEffect(() => () => { stop(); stopListening(); }, [stop, stopListening]);

  return {
    supported,
    recognitionSupported: Boolean(recognitionSupported),
    speaking,
    listening,
    transcript,
    speak,
    stop,
    listen,
    stopListening,
  };
}
