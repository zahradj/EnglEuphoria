import { cacheFileName } from '@/content/playground-library/unit1/audio';
import { spokenText } from '@/content/playground-library/unit1/spokenText';
import type { PlacementVoice } from './placementLines';

/**
 * Placement-test audio is PLAYED FROM SAVED FILES ONLY. The clips are made once by the bake script
 * (`npx tsx scripts/generate-voice-cache.mjs --lesson=PLACEMENT`) and live in public/audio-cache/, served
 * like any other file. Nothing here ever calls a speech service, so a student never waits for (or pays for)
 * a live generation, and a speech-service outage can't break a test.
 *
 * Returns the clip's URL, or null if it hasn't been baked / can't be fetched. Callers must stay silent in
 * that case (project voice rule) and never fall back to another voice.
 */
export async function placementClipUrl(text: string, voice: PlacementVoice): Promise<string | null> {
  try {
    const url = `/audio-cache/${cacheFileName(voice, spokenText(text))}.mp3`;
    const res = await fetch(url);
    // The site falls back to index.html (200, text/html) for a missing path, so check the content type too.
    if (!res.ok || !(res.headers.get('content-type') ?? '').startsWith('audio/')) return null;
    const blob = await res.blob();
    return blob.size > 0 ? url : null;
  } catch {
    return null;
  }
}
