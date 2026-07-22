// Playground audio wrapper.
// ElevenLabs is the EXCLUSIVE source of spoken audio (per architecture lock
// in src/lib/elevenLabsAudio.ts). No browser SpeechSynthesis fallback —
// if ElevenLabs fails or is rate-limited, the line goes silent rather than
// letting the OS voice pretend to be a character.

import { playElevenLabs } from "@/playground-blueprint/external";

// Mascot / character voices available in the Playground.
export const PLAYGROUND_VOICES = {
  pip:     "kPtEHAvRnjUJFv7SK9WI", // Pip the Fox (matches placement test)
  bella:   "EXAVITQu4vr4xnSDxMaL", // Bella the Bunny — soft female cartoon
  charlie: "TX3LPaxmHKxFdv7VOQHJ", // Charlie the Chick — bright young boy
  daisy:   "XB0fDUnXU5powFXDhCwa", // Daisy — bright girl
  leo:     "JBFqnCBsd6RMkjVDRZzb", // Leo the Lion — warm, bold
  mia:     "pFZP5JQG7iQjIQuC4Bku", // Mia the Mouse — tiny, playful
  ollie:   "XrExE9yKIg1WjnnlVkGX", // Ollie the Owl — wise, storybook
} as const;

export type PlaygroundVoice = keyof typeof PLAYGROUND_VOICES;

export function speak(
  text: string,
  opts: { rate?: number; pitch?: number; voice?: PlaygroundVoice } = {}
) {
  if (!text?.trim()) return;
  const voiceId = PLAYGROUND_VOICES[opts.voice ?? "pip"];
  void playElevenLabs(text, {
    voiceId,
    speed: opts.rate ?? 0.95,
  }).catch(() => {
    // Intentional silent failure — never route Playground audio through the
    // browser TTS engine.
  });
}
