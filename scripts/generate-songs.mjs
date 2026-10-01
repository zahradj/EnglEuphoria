#!/usr/bin/env node
/**
 * Generates candidate takes of the shared lesson songs through the
 * `elevenlabs-music` edge function, singing the EXACT on-screen lyrics.
 *
 * The three shared song files (each reused by many scenes, so one recording must
 * match one lyric set — see songs.json) are:
 *   - lep1/audio/hello-song.mp3          (Pre-A1 hello song)
 *   - lep1/audio/goodbye-song.mp3        (Pre-A1 goodbye song)
 *   - welcome-town/audio/goodbye-song.mp3 (A1 + A2 goodbye song)
 *
 * Usage:
 *   node scripts/generate-songs.mjs --out=<dir> [--only=hello,goodbye,wt-goodbye] [--takes=3]
 *
 * Takes land in <dir>/<key>-take<N>.mp3. They are NOT shipped automatically:
 * run scripts/verify-song.py on them (transcribes with Whisper, scores the sung
 * words against the lyrics, measures per-line cue times) and copy the best take
 * into public/. Duration control from ElevenLabs is unreliable, so always trust
 * the measured length, never the requested one.
 */
import fs from 'node:fs';
import path from 'node:path';

const SUPABASE_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co';
// Public anon key (same one hardcoded in src/integrations/supabase/client.ts).
const ANON_KEY = fs
  .readFileSync(new URL('../src/integrations/supabase/client.ts', import.meta.url), 'utf8')
  .match(/eyJ[\w-]+\.[\w-]+\.[\w-]+/)[0];

const DIRECT_KEY = process.env.ELEVENLABS_API_KEY;
// Alternative: a token-gated proxy edge function that holds the ElevenLabs key as a Supabase secret.
const PROXY = process.env.SONG_PROXY_URL, PROXY_TOKEN = process.env.SONG_PROXY_TOKEN;
const SONGS = JSON.parse(fs.readFileSync(new URL('./songs.json', import.meta.url), 'utf8'));

const arg = (name, dflt) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : dflt;
};
const outDir = arg('out');
if (!outDir) { console.error('--out=<dir> is required'); process.exit(1); }
const only = arg('only', '').split(',').filter(Boolean);
const takes = Number(arg('takes', '3'));
fs.mkdirSync(outDir, { recursive: true });

for (const [key, song] of Object.entries(SONGS)) {
  if (only.length && !only.includes(key)) continue;
  for (let t = 1; t <= takes; t++) {
    const dest = path.join(outDir, `${key}-take${t}.mp3`);
    const body = {
      prompt: song.style,
      duration: song.durationSec,
      force_instrumental: false,
      composition_plan: {
        positive_global_styles: song.positiveStyles,
        negative_global_styles: song.negativeStyles,
        // ONE section carrying every line. Per-line sections inflate the length
        // 5-8x (see memory: feedback_songs_use_elevenlabs).
        sections: [{
          section_name: 'Sing-along',
          positive_local_styles: ['clear diction', 'children singing every word of the lyrics'],
          negative_local_styles: ['mumbling', 'adding extra words', 'improvised lyrics', 'instrumental only'],
          duration_ms: song.durationSec * 1000,
          lines: song.lines,
        }],
      },
    };
    // Direct ElevenLabs call when ELEVENLABS_API_KEY is set (preferred: the DEPLOYED
    // elevenlabs-music edge function is an old version that ignores composition_plan,
    // so it invents its own lyrics). The API wants EITHER prompt OR composition_plan.
    const res = PROXY
      ? await fetch(PROXY, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-song-token': PROXY_TOKEN },
          body: JSON.stringify({ composition_plan: body.composition_plan }),
        })
      : DIRECT_KEY
      ? await fetch('https://api.elevenlabs.io/v1/music', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'xi-api-key': DIRECT_KEY },
          body: JSON.stringify({ composition_plan: body.composition_plan, model_id: 'music_v1' }),
        })
      : await fetch(`${SUPABASE_URL}/functions/v1/elevenlabs-music`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
          body: JSON.stringify(body),
        });
    const type = res.headers.get('content-type') || '';
    if (!res.ok || !type.startsWith('audio/')) {
      console.error(`${key} take ${t}: FAILED ${res.status} ${(await res.text()).slice(0, 300)}`);
      continue;
    }
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    console.log(`${key} take ${t}: ${dest} (${(fs.statSync(dest).size / 1024).toFixed(0)} KB)`);
  }
}
