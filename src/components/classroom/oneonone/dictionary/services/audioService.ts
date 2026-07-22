// Audio service for pronunciation — ElevenLabs only, no native TTS.
import { playAudioUrlOrTts } from '@/lib/elevenLabsAudio';

export function playWordAudio(word: string, audioUrl?: string): void {
  void playAudioUrlOrTts(audioUrl, word);
}
