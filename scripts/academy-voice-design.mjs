#!/usr/bin/env node
/**
 * Academy cast voices — design teenage American voices with ElevenLabs Voice Design (owner, 2026-10-08).
 * Run locally; the key stays in your shell and is never printed or committed:
 *   ELEVENLABS_API_KEY=... node scripts/academy-voice-design.mjs preview            # 3 candidate previews per character -> ./tmp-academy-voices/
 *   ELEVENLABS_API_KEY=... node scripts/academy-voice-design.mjs save Vee <generated_voice_id>   # keep the one you liked
 * After saving, add the new voice id to APPROVED_VOICES in src/lib/speechPolicy.ts (and the byte-identical copy in
 * supabase/functions/_shared/) with accent 'american', then bake clips with the Academy voice map. Listen first; never guess.
 */
import { mkdirSync, writeFileSync } from 'node:fs';

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) { console.error('Set ELEVENLABS_API_KEY in your shell (do not paste it in chat).'); process.exit(1); }
const API = 'https://api.elevenlabs.io/v1';
const LOCK = 'Standard General American accent, no regional or foreign accent, clear and accurate pronunciation of every word, clean studio recording, no background noise.';

const CAST = {
  Vee: `A 17-year-old American teenager, ${'confident, upbeat, direct and friendly peer-mentor, medium pitch, relaxed natural pace. '}${LOCK}`,
  Ava: `A 14-year-old American girl, warm, curious and outgoing, bright pitch, natural lively pace. ${LOCK}`,
  Theo: `A 14-year-old American boy, easygoing and thoughtful, slightly lower youthful pitch, natural pace. ${LOCK}`,
  Mia: `A 15-year-old American girl, calm, kind and a little shy, softer clear tone, natural pace. ${LOCK}`,
};
const SAMPLE = {
  Vee: "Hello! Welcome to the Academy. I'm Vee. Mistakes are normal here, so let's try it together. Are you ready? Great. Let's go!",
  Ava: "Hi! I'm Ava. I have a question for you. What is your name, and where are you from? Tell me everything. I want to know!",
  Theo: "Hey, I'm Theo. I'm a student here too. This is my friend, and that is our teacher. It's a good group. Come and sit with us.",
  Mia: "Hello, I'm Mia. I'm new in this class. It is nice to meet you. Can you say your name for me? Take your time. It's okay.",
};

const call = async (path, body) => {
  const r = await fetch(`${API}${path}`, { method: 'POST', headers: { 'xi-api-key': KEY, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  return r.json();
};

const [cmd, who, id] = process.argv.slice(2);
if (cmd === 'preview') {
  mkdirSync('tmp-academy-voices', { recursive: true });
  for (const [name, desc] of Object.entries(CAST)) {
    const out = await call('/text-to-voice/design', { voice_description: desc, text: SAMPLE[name], auto_generate_text: false });
    out.previews.forEach((p, i) => {
      const f = `tmp-academy-voices/${name}-${i + 1}.mp3`;
      writeFileSync(f, Buffer.from(p.audio_base_64, 'base64'));
      console.log(`${f}  generated_voice_id=${p.generated_voice_id}`);
    });
  }
} else if (cmd === 'save' && who && id) {
  const v = await call('/text-to-voice', { voice_name: `Academy ${who}`, voice_description: CAST[who], generated_voice_id: id });
  console.log(`${who}: saved voice_id=${v.voice_id}`);
} else {
  console.error('usage: preview | save <Vee|Ava|Theo|Mia> <generated_voice_id>'); process.exit(1);
}
