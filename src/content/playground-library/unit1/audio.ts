// Deliberately NOT using supabase.functions.invoke() here — its response
// parsing mangles the raw audio/mpeg body into a corrupted string instead of
// a Blob (confirmed live: `data.constructor.name === 'String'`), which then
// fails to decode as audio and silently falls back to browser speech
// synthesis on every single line. A plain fetch() against the function URL
// returns the binary body intact.
import { supabaseUrl, supabaseAnonKey } from '@/integrations/supabase/client';

const FUNCTIONS_URL = `${supabaseUrl}/functions/v1`;
const ANON_KEY = supabaseAnonKey;

/**
 * Little Explorers Phonics — Unit 1 audio layer.
 *
 * Ported from the original "Forest of Hellos" player. That app called its own
 * TanStack Start `/api/tts` Node route; this project is a static Vite SPA, so
 * the same sequential-playback + IndexedDB-cache design now calls the
 * existing `elevenlabs-tts` Supabase Edge Function instead.
 *
 * Voice cast: standard ElevenLabs native-English premade voices, picked and
 * pitch-tuned for 5-6 year olds after several rounds of measuring real
 * generated clips (autocorrelation pitch detection on decoded audio, not
 * guesswork).
 *
 * Round 1 swapped the deepest voices (Charlie/Alice/Callum/Sarah) for
 * brighter ones and added a small +100/+200 cent lift — still reported as
 * "adult." Round 2 found why: Web Audio's `playbackRate` and `detune`
 * combine *multiplicatively*. Slowing playback for pre-k pacing is itself a
 * pitch drop (it's a literal tape-speed change), so a small detune lift on
 * top of it was being quietly cancelled out. Round 3 slowed SPEECH_SPEED
 * further (0.82 -> 0.68) and re-cast Pip to `kPtEHAvRnjUJFv7SK9WI`, the same
 * "Pip the Fox" voice already used for the placement test (see
 * `src/constants/characterVoices.ts` and the `placement-voiceover` /
 * `placement-content-asset` / `placement-audio-warm` edge functions) so the
 * character sounds identical across both experiences — but pushed
 * PITCH_CENTS aggressively high (targeting a ~1.48x net pitch multiplier)
 * to get a strong "cartoon" lift, which on Pip's already-designed-for-kids
 * voice was over-processing it into a synthetic, "recorded"/robotic
 * quality, and the pace was still reported as too fast. Round 4 pulled the
 * lift back to a modest target and slowed pacing further (0.68 -> 0.55),
 * with Pip set to just cancel SPEECH_SPEED's own pitch drop (net ~1.0x) —
 * but it *still* read as "recorded/through a microphone."
 *
 * Round 5 found the real cause of that: even a detune that nets back to
 * "original pitch" isn't a no-op. `playbackRate=0.55` first resamples the
 * signal down (a real pitch/formant shift), then `detune=+1035` resamples
 * it back up — two lossy operations stacked to *look* neutral on paper,
 * but the artifacts from both passes compound rather than cancel. That
 * double-processing is what sounded like a telephone/mic recording.
 * Characters that don't need a genuine pitch change (Pip, teacher/narrator)
 * now skip the Web Audio detune path entirely and use a plain
 * HTMLAudioElement with `preservesPitch` instead — the browser's own
 * single-pass, hardware-accelerated time-stretch (the same approach the
 * pre-recorded letter clips below have always used), not a hand-rolled
 * double resample. Only Mia/Bella/Willow/Leo, which still need a real pitch
 * lift off their adult base voices, go through the Web Audio detune engine.
 *
 * Round 6: still reported as unnatural/"recorded" even after Round 5's
 * fix, so the placement test's `kPtEHAvRnjUJFv7SK9WI` voice itself was
 * dropped rather than debugged further. Measured across several full clips
 * (windowed median F0, not a single noisy sample) it had a low median
 * (~160Hz, adult-male-leaning) and an oddly wide, erratic pitch swing
 * (81-706Hz) — likely a stylistic/recording-quality trait of that specific
 * voice rather than anything our pipeline was doing to it. Re-cast to Elli
 * (`MF3mGyEYCl7XYWbV9V6O`), which measured the brightest and most
 * consistent of every candidate tested (median ~242Hz, tight range). Since
 * Elli stays in NATURAL_PITCH_CHARACTERS, it plays completely unprocessed
 * pitch-wise — only the pre-k pacing slowdown is applied — so its own
 * natural tone now needs to carry the "young" quality on its own, which is
 * exactly why a naturally bright base voice matters more under this engine
 * than it did when detune was doing the work.
 *
 * Round 7: 0.68 was "still very fast," 0.55 (Round 4) turned out to be
 * *too slow* — not natural, not good for hearing/repeating. The workable
 * pace sits between those two, so SPEECH_SPEED landed on 0.63 (roughly the
 * midpoint). PITCH_CENTS for the Web Audio path was recomputed to hit the
 * same ~1.15x net lift target at this new rate — see that constant's
 * comment for the formula. This is very much a "keep nudging" dial: if it
 * still isn't right, adjust SPEECH_SPEED (and recompute PITCH_CENTS to
 * match) rather than picking a number from scratch.
 *
 * Round 8: Pip specifically was still reported as "dragging the words"
 * even after Round 7's pace correction. Root cause turned out to be
 * upstream of all the tuning above: fetchClipBlob() was sending
 * `speed: SPEECH_SPEED` in the request body to the elevenlabs-tts edge
 * function, which forwards it straight into ElevenLabs' own
 * `voice_settings.speed` — directly contradicting this doc's own claim
 * that the slowdown is "applied entirely client-side." Every clip was
 * being generated already-slowed (0.63x) by ElevenLabs, then slowed
 * *again* to 0.63x on playback via playbackRate — a ~0.40x compounded
 * rate. Mia/Bella/Willow/Leo's Web Audio resample path (playViaWebAudio)
 * mostly masked this, but Pip's browser preservesPitch time-stretch
 * (playViaHtmlAudio) audibly warps at that extreme a rate, which is what
 * read as "dragging." Fix: stop sending `speed` to the edge function at
 * all (clips now generate at ElevenLabs' natural 1.0x pace); the client
 * playbackRate=SPEECH_SPEED slowdown is now the only one applied, as the
 * design always intended.
 *
 * Round 9: Pip was *still* reported as dragging after Round 8's fix —
 * because nearly every earlier round's "0.63 sounds right" listening
 * test was itself done against the still-compounded ~0.40x rate (Round 8
 * was the first time single, uncompounded 0.63x was ever actually heard
 * on Pip's path), so 0.63x had never really been validated for Pip in
 * isolation. And it turns out it doesn't hold up: Pip/teacher/narrator's
 * `preservesPitch` browser time-stretch (playViaHtmlAudio) is a
 * different algorithm from Mia/Bella/Willow/Leo's raw Web Audio
 * `playbackRate` resample (playViaWebAudio), and empirically warps/drags
 * far more noticeably at a 37%-of-natural-speed slowdown — the same
 * numeric rate reads as fine on one engine and sluggish on the other.
 * Rather than keep nudging one shared dial and fighting that mismatch,
 * `applySlowPace` now takes an explicit rate, and the preservesPitch
 * path gets its own, less extreme constant (SPEECH_SPEED_NATURAL) so it
 * can be tuned independently of the Web Audio path going forward. Letter
 * phonic/name clips (playClip) intentionally stay on the slower
 * SPEECH_SPEED — those are meant to be a deliberate, drawn-out "listen to
 * the sound" moment, not conversational dialogue.
 *
 * Round 10 found the actual bug behind "Mia's voice sounds bad/corrupted":
 * `detune` and `playbackRate` on an AudioBufferSourceNode don't apply
 * independently — they combine into one resample ratio
 * (`computedPlaybackRate = playbackRate * 2^(detune/1200)`), which governs
 * BOTH pitch and duration at once, on a single-pass resample. Every round
 * above treated "net multiplier" as a pitch knob with pacing controlled
 * separately by SPEECH_SPEED, but they're the same number for this API.
 * Measured empirically (rendered a real clip through the exact pipeline
 * and compared output duration to input): Mia's lines were playing back
 * ~13-15% FASTER than natural, not slower — backwards from "slower and
 * more deliberate... time to hear, understand, and repeat." A genuine
 * independent speed-slowdown-plus-pitch-lift isn't possible with plain
 * playbackRate/detune resampling; it needs real time-stretching, which is
 * exactly what `preservesPitch` already gives Pip/teacher/narrator. Since
 * each of Mia/Bella/Willow/Leo's ElevenLabs voices is already a bright,
 * childlike pick on its own (see e.g. Lily's own catalog description in
 * characterVoices.ts — "bright, energetic, child-friendly," not the
 * "adult base voice" this file assumed), fixed by dropping the detune
 * pitch-lift entirely and moving all four onto the same
 * NATURAL_PITCH_CHARACTERS path: a real, uncompounded slowdown via
 * preservesPitch, trusting each voice's own timbre instead of forcing a
 * pitch correction it likely never needed. This also removes the "sounds
 * recorded/through a microphone" double-resample artifact Round 5 already
 * found and fixed for Pip — Mia/Bella/Willow/Leo had been left on that
 * same artifact-prone path the whole time. With every character now on
 * this path, the Web Audio detune engine (playViaWebAudio, PITCH_CENTS,
 * decodedCache, the shared AudioContext) is dead code and removed.
 */

/** Pace for the pre-recorded letter clips (playClip) — a deliberate,
 *  drawn-out "listen to the sound" moment, not conversational dialogue.
 *  Applied via the browser's own `playbackRate` + `preservesPitch`
 *  (applySlowPace's default rate), not ElevenLabs' own `speed` param, so
 *  it isn't bound by the ~0.7 floor where their server-side model starts
 *  to distort. */
const SPEECH_SPEED = 0.63;

/** Playback rate for every character's conversational ElevenLabs lines
 *  (via playClipBlob) and the speechSynthesis fallback — deliberately less
 *  extreme than SPEECH_SPEED because the `preservesPitch` time-stretch
 *  algorithm audibly warps/drags at SPEECH_SPEED's rate. See "Round 9" in
 *  the module doc above before changing this. */
const SPEECH_SPEED_NATURAL = 0.78;

export type Character = 'pip' | 'mia' | 'bella' | 'willow' | 'leo' | 'teacher' | 'narrator';

const VOICE_ID: Record<Character, string> = {
  pip: 'MF3mGyEYCl7XYWbV9V6O', // Elli — brightest, most consistent of every candidate tested
  mia: 'pFZP5JQG7iQjIQuC4Bku', // Lily
  bella: 'XrExE9yKIg1WjnnlVkGX', // Matilda
  willow: 'piTKgcLEGmPE4e6mEKli', // Nicole
  leo: 'zrHiDhphv9ZnVXBqCLjz', // Mimi
  teacher: 'jsCqWAovK2LkecY7zXl4', // Freya
  narrator: 'jsCqWAovK2LkecY7zXl4', // Freya
};

// Browser speechSynthesis fallback (used only if ElevenLabs and the local
// clip both fail) — paced to match SPEECH_SPEED above for pre-k listeners,
// pitch raised to stay consistent with the childlike ElevenLabs cast.
// SpeechSynthesisUtterance.pitch is clamped to [0, 2] by the Web Speech API
// spec, so 2.0 (mia) is the ceiling this path can reach.
const FALLBACK_VOICE: Record<Character, { rate: number; pitch: number }> = {
  pip: { rate: 0.78, pitch: 1.5 },
  mia: { rate: 0.63, pitch: 2.0 },
  bella: { rate: 0.63, pitch: 1.7 },
  willow: { rate: 0.63, pitch: 1.6 },
  leo: { rate: 0.58, pitch: 1.4 },
  teacher: { rate: 0.78, pitch: 1.3 },
  narrator: { rate: 0.78, pitch: 1.3 },
};

// Raw fetched clips are cached as Blobs, playable directly via HTMLAudioElement.
const blobCache = new Map<string, Blob>();
const inFlight = new Map<string, Promise<Blob | null>>();

const IDB_NAME = 'lep1-tts';
const IDB_STORE = 'clips';
let idbPromise: Promise<IDBDatabase | null> | null = null;

function openIdb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return Promise.resolve(null);
  if (idbPromise) return idbPromise;
  idbPromise = new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return idbPromise;
}

async function idbGet(k: string): Promise<Blob | null> {
  const db = await openIdb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(k);
      req.onsuccess = () => resolve(req.result instanceof Blob ? req.result : null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbPut(k: string, blob: Blob): Promise<void> {
  const db = await openIdb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(blob, k);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}

let playChain: Promise<void> = Promise.resolve();
let sessionId = 0;
let queueDepth = 0;

function key(character: Character, text: string) {
  // v2 bumped every cached clip to regenerate at SPEECH_SPEED. v3 bumped
  // again for the supabase.functions.invoke() binary-corruption fix. v4
  // moved playback to the Web Audio pitch-shift engine with a first-pass
  // (too-small) pitch lift. v5 fixed the detune/playbackRate math and
  // re-cast pip/leo to brighter base voices. v6 slowed pacing (0.82 -> 0.68)
  // and re-cast pip to the placement test's "Pip the Fox" voice, but pushed
  // PITCH_CENTS too far. v7 pulled the lift back and slowed pacing further
  // (0.68 -> 0.55), but Pip's "cancel the rate drop" detune still ran the
  // clip through two lossy resamples and kept sounding processed/recorded.
  // v8 bumps again: Pip/teacher/narrator now skip the Web Audio detune path
  // entirely (see module doc), so every clip cached under the old pipeline
  // needs regenerating against the new one. v9 bumps again: Pip re-cast off
  // the placement test's voice to Elli (see module doc, round 6). v10 bumps
  // again: pace corrected 0.55 -> 0.63 after 0.55 was reported as too slow
  // (see module doc, round 7); PITCH_CENTS recomputed to match. v11 bumps
  // again: stopped also sending `speed: SPEECH_SPEED` to the ElevenLabs
  // edge function (round 8, below) — every clip was being generated
  // server-side at 0.63x AND slowed client-side to 0.63x again, a ~0.40x
  // compounded rate that read as Pip "dragging the words." Round 10's fix
  // (dropping the Web Audio detune path) only changes local playback
  // processing, not clip generation, so it doesn't need a version bump —
  // already-cached clips are still valid.
  return `${character}::v11::${text}`;
}

async function fetchClipBlob(k: string, text: string, character: Character): Promise<Blob | null> {
  const cached = blobCache.get(k);
  if (cached) return cached;
  const existing = inFlight.get(k);
  if (existing) return existing;

  const job = (async () => {
    try {
      const stored = await idbGet(k);
      if (stored && stored.size) {
        blobCache.set(k, stored);
        return stored;
      }
      // Retry a couple of times before giving up — a transient network blip
      // or edge-function cold start shouldn't drop straight to the browser's
      // (often wrong-language) fallback voice.
      const ATTEMPTS = 3;
      let lastErr: unknown = null;
      for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
        try {
          if (attempt > 0) await new Promise((r) => setTimeout(r, 350 * attempt));
          const res = await fetch(`${FUNCTIONS_URL}/elevenlabs-tts`, {
            method: 'POST',
            headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, 'Content-Type': 'application/json' },
            // Generate at ElevenLabs' natural pace (no `speed` field — the
            // edge function defaults to 1.0) and apply 100% of the pre-k
            // slowdown client-side via playbackRate, per the module doc
            // above. This used to also send `speed: SPEECH_SPEED` here,
            // which the elevenlabs-tts function forwards straight into
            // ElevenLabs' own voice_settings.speed — so every clip was
            // being slowed down TWICE (once server-side by ElevenLabs,
            // again client-side by playbackRate), compounding to a ~0.40x
            // net rate. Pip runs that double-slowed clip through the
            // browser's preservesPitch time-stretch (playViaHtmlAudio),
            // whose algorithm audibly warps/drags at that extreme a rate;
            // Mia/Bella/Willow/Leo take the Web Audio resample path
            // instead, which masks the same double-slowdown better. This
            // was the actual root cause of "Pip's voice is dragging."
            body: JSON.stringify({ text, voiceId: VOICE_ID[character] }),
          });
          if (!res.ok) throw new Error(`tts ${res.status}`);
          const blob = await res.blob();
          if (!blob.size || !blob.type.startsWith('audio/')) throw new Error(`bad audio response (type=${blob.type}, size=${blob.size})`);
          void idbPut(k, blob);
          blobCache.set(k, blob);
          return blob;
        } catch (err) {
          lastErr = err;
        }
      }
      throw lastErr;
    } catch (err) {
      console.warn('[lep1 voice] TTS fetch failed after retries, using browser fallback:', err);
      return null;
    } finally {
      inFlight.delete(k);
    }
  })();

  inFlight.set(k, job);
  return job;
}

let currentAudioEl: HTMLAudioElement | null = null;

function stopCurrent() {
  if (currentAudioEl) {
    try {
      currentAudioEl.pause();
      currentAudioEl.src = '';
    } catch {
      /* noop */
    }
    currentAudioEl = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* noop */
    }
  }
}

/** Waits briefly for the browser's voice list to finish loading (it loads
 *  asynchronously on some browsers) and returns whatever is available. */
function getVoicesReady(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const v = window.speechSynthesis.getVoices();
    if (v.length) { resolve(v); return; }
    const timer = window.setTimeout(() => resolve(window.speechSynthesis.getVoices()), 500);
    window.speechSynthesis.onvoiceschanged = () => {
      window.clearTimeout(timer);
      resolve(window.speechSynthesis.getVoices());
    };
  });
}

async function playFallback(text: string, character: Character): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  // This fallback only exists for the rare case the real character-voice
  // fetch fails outright. If the device has no English voice installed at
  // all, the browser will substitute whatever its default system voice is
  // (observed in the wild: a French voice) regardless of the `lang` we ask
  // for — that's worse than staying silent for a beat, since the teacher is
  // narrating live anyway. So refuse to speak rather than guess wrong.
  const voices = await getVoicesReady();
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
  if (!english.length) {
    console.warn('[lep1 voice] no English system voice installed — skipping fallback speech for:', text);
    return;
  }
  const voice =
    english.find((v) => /en-US/i.test(v.lang)) ??
    english.find((v) => /female/i.test(v.name)) ??
    english[0];

  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    const f = FALLBACK_VOICE[character];
    u.rate = f.rate;
    u.pitch = f.pitch;
    u.lang = voice.lang;
    u.voice = voice;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

/** Slows down playback without pitch-shifting (modern browsers preserve
 *  pitch by default on rate change) — used for the pre-recorded letter clips
 *  below and for every character's ElevenLabs clips via playClipBlob.
 *  Defaults to SPEECH_SPEED (the letter-clip rate); playClipBlob passes
 *  SPEECH_SPEED_NATURAL explicitly since conversational lines need a
 *  different rate. */
function applySlowPace(audio: HTMLAudioElement, rate: number = SPEECH_SPEED) {
  audio.playbackRate = rate;
  const withPitch = audio as HTMLAudioElement & {
    preservesPitch?: boolean;
    mozPreservesPitch?: boolean;
    webkitPreservesPitch?: boolean;
  };
  withPitch.preservesPitch = true;
  withPitch.mozPreservesPitch = true;
  withPitch.webkitPreservesPitch = true;
}

/** Plays an ElevenLabs clip through a plain HTMLAudioElement with
 *  `preservesPitch` — a single-pass, browser-native time-stretch that slows
 *  the pace for pre-k listeners without touching pitch. Every character
 *  uses this path (see "Round 10" in the module doc above for why the
 *  Web Audio detune alternative was removed). Resolves true once playback
 *  finishes, false on error or an autoplay-policy rejection — the caller
 *  falls back to speech synthesis in that case. */
function playClipBlob(blob: Blob): Promise<boolean> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.preload = 'auto';
    applySlowPace(audio, SPEECH_SPEED_NATURAL);
    currentAudioEl = audio;
    const finish = (ok: boolean) => {
      if (currentAudioEl === audio) currentAudioEl = null;
      URL.revokeObjectURL(url);
      resolve(ok);
    };
    audio.addEventListener('ended', () => finish(true), { once: true });
    audio.addEventListener('error', () => finish(false), { once: true });
    audio.play().catch(() => finish(false));
  });
}

/**
 * Browsers block audio autoplay until the page has seen a real user gesture.
 * Scene voice lines mostly fire from a `useEffect` on mount (not a direct
 * click), so without this the very first line of every scene can be
 * silently dropped. Call this once, synchronously, inside a real click
 * handler (e.g. the lesson's "Start Lesson" button) to unlock playback for
 * the rest of the tab.
 */
let unlocked = false;
export function unlockAudio() {
  if (unlocked || typeof window === 'undefined') return;
  unlocked = true;
  try {
    const a = new Audio(
      'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQxAADB8AhSmxhIIEVCSiJrDCQBTcu3UrAIwUdkRgQbFAZC1CQEwTJ9mjRvBAQBAEAwNihEFw+CAIAgc47vBAEAwXf/lwQBAEAxjvOCAIAgGAYLv/y7unBAF3fUIAgLu/y7oIAu7/LugAAAAAAAAP/7UsQNg8AAAaQAAAAgAAA0gAAABExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ=='
    );
    a.volume = 0.01;
    void a.play().then(() => { a.pause(); a.currentTime = 0; }).catch(() => {});
  } catch { /* noop */ }
  try {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    }
  } catch { /* noop */ }
}

/** Stop everything currently playing and invalidate the queue. */
export function stopSpeaking() {
  sessionId++;
  stopCurrent();
  playChain = Promise.resolve();
  queueDepth = 0;
}

/** True while an utterance is playing OR queued. */
export function isSpeaking(): boolean {
  return queueDepth > 0;
}

/** A few English words are spelled identically but pronounced differently
 *  depending on tense/part of speech ("read" the present-tense verb, rhymes
 *  with "reed," vs. "read" the past tense, rhymes with "red"). ElevenLabs
 *  guesses from the surrounding sentence and gets this wrong often enough
 *  on short, standalone lines — e.g. "I read a book" (present tense, the
 *  daily-routine grammar point Welcome Town A2 actually teaches) came back
 *  pronounced as the past tense. This curriculum only ever uses the present/
 *  base form of these words in spoken content, so it's safe to always
 *  rewrite them to an unambiguous phonetic spelling before they reach
 *  ElevenLabs — this only changes what gets SPOKEN, never the on-screen
 *  caption text, which is rendered straight from the scene data elsewhere. */
function ttsSafe(text: string): string {
  return text.replace(/\bread\b/g, (m) => (m === m.toUpperCase() ? 'REED' : m[0] === m[0].toUpperCase() ? 'Reed' : 'reed'));
}

/** Speak `text` as `character`. Utterances are sequenced. */
export function speak(text: string, character: Character = 'teacher'): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  const trimmed = text.trim();
  if (!trimmed) return Promise.resolve();
  const spoken = ttsSafe(trimmed);

  const mySession = sessionId;
  queueDepth++;
  const job = playChain.then(async () => {
    if (mySession !== sessionId) return;
    const k = key(character, spoken);
    const blob = await fetchClipBlob(k, spoken, character);
    if (mySession !== sessionId) return;
    const played = blob ? await playClipBlob(blob) : false;
    // A clip that was deliberately interrupted mid-playback (stopSpeaking()
    // called while playClipBlob's audio element was still playing — e.g. the
    // student tapped past a scene before its line finished) also resolves
    // `played` false, via the audio element's own `error` event firing after
    // stopCurrent() clears its src. Without this guard that read the same as
    // a genuine playback failure and fell through to the robotic browser
    // speechSynthesis fallback, so the interrupted line appeared to "play
    // twice" — the clean ElevenLabs clip, cut short, then the same text
    // again in the low-quality fallback voice a beat later. Only a real
    // failure (session still valid) should trigger the fallback.
    if (!played && mySession === sessionId) await playFallback(spoken, character);
  });

  playChain = job.catch(() => undefined).finally(() => {
    queueDepth = Math.max(0, queueDepth - 1);
  });
  return job;
}

/** Speak only if nothing is currently playing/queued. */
export function speakOnce(text: string, character: Character = 'teacher'): Promise<void> {
  if (queueDepth > 0) return Promise.resolve();
  return speak(text, character);
}

/** Warm the clip cache without playing. */
export async function prefetch(text: string, character: Character = 'teacher') {
  const trimmed = text.trim();
  if (!trimmed) return;
  const spoken = ttsSafe(trimmed);
  await fetchClipBlob(key(character, spoken), spoken, character);
}

export async function safeSpeak(text: string, who: Character) {
  try {
    await speak(text, who);
  } catch (error) {
    console.warn('Voice playback skipped', error);
  }
}

export function cueSpeak(text: string, who: Character) {
  void safeSpeak(text, who);
}

export function cueSpeakOnce(text: string, who: Character) {
  if (isSpeaking()) return;
  void speakOnce(text, who).catch((error) => console.warn('Voice playback skipped', error));
}

/* --------------------------------------------------------------------------
 * Letter sounds — the original shipped pre-recorded phon_*.mp3 / name_*.m4a
 * clips from a private CDN this export didn't include. Real recorded clips
 * for the full A-Z alphabet were sourced from the user's own phonics-master
 * (phoneme, one native-recorded .ogg per letter) and Alphabet-with-sounds
 * (letter name, one .m4a per letter) archives and copied into
 * public/lep1/audio/letters/. A playback failure falls back to the
 * ElevenLabs voice pipeline above so the tap-to-hear contract never goes
 * silent even if a specific clip is missing or corrupt.
 * -------------------------------------------------------------------------- */

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');
const PHONIC_CLIP: Record<string, string> = Object.fromEntries(
  ALPHABET.map((l) => [l, `/lep1/audio/letters/phon-${l}.ogg`]),
);
const NAME_CLIP: Record<string, string> = Object.fromEntries(
  ALPHABET.map((l) => [l, `/lep1/audio/letters/name-${l}.m4a`]),
);

// Digraph/blend sounds from the same phonics-master recordings — not used by any
// lesson yet (every letter taught so far is a single straight-line letter), but
// wired up so a future digraph lesson (SH/TH/CH/WH/AR/AU/ER/ING/OU) can call
// playLetterPhonic('sh') exactly like a single letter, no separate API needed.
for (const pair of ['sh', 'th', 'ch', 'wh', 'ar', 'au', 'er', 'ing', 'ou']) {
  PHONIC_CLIP[pair] = `/lep1/audio/letters/phon-${pair}.ogg`;
}

// Long-vowel variants (phonics-master's double-underscore recordings), kept under
// a distinct key since e.g. 'a' is already the SHORT /æ/ sound above.
const LONG_VOWEL_CLIP: Record<string, string> = Object.fromEntries(
  ['a', 'e', 'i', 'o', 'u', 'oo'].map((v) => [v, `/lep1/audio/letters/phon-${v}-long.ogg`]),
);

// Real recorded encouragement/instruction phrases from the same phonics-master
// archive, for scenes that currently rely on TTS or sfx-only feedback.
const PHRASE_CLIP: Record<string, string> = {
  'cat-blend': '/lep1/audio/phrases/cat-blend.ogg',
  'nice-work': '/lep1/audio/phrases/nice-work.ogg',
  'try-again': '/lep1/audio/phrases/try-again.ogg',
  'spell-the-word': '/lep1/audio/phrases/spell-the-word.ogg',
  'you-spelled': '/lep1/audio/phrases/you-spelled.ogg',
};

// Spoken-out phoneme fallback text, used only if a letter's recorded clip
// is missing AND the ElevenLabs call also fails.
const PHONEME_SOUND: Record<string, string> = {
  a: 'ah, ah', b: 'buh, buh', c: 'kuh, kuh', d: 'duh, duh', e: 'eh, eh',
  f: 'fff, fff', g: 'guh, guh', h: 'huh, huh', i: 'ih, ih', j: 'juh, juh',
  k: 'kuh, kuh', l: 'lll, lll', m: 'mmm, mmm', n: 'nnn, nnn', o: 'ah, ah',
  p: 'puh, puh', q: 'kwuh, kwuh', r: 'rrr, rrr', s: 'sss, sss', t: 'tuh, tuh',
  u: 'uh, uh', v: 'vvv, vvv', w: 'wuh, wuh', x: 'ks, ks', y: 'yuh, yuh', z: 'zzz, zzz',
};

function playClip(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    applySlowPace(audio);
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error('clip failed'));
    audio.play().catch(reject);
  });
}

export async function playLetterPhonic(letter: string): Promise<void> {
  const l = letter.toLowerCase();
  const clip = PHONIC_CLIP[l];
  if (clip) {
    try {
      await playClip(clip);
      return;
    } catch {
      /* fall through to TTS */
    }
  }
  await safeSpeak(PHONEME_SOUND[l] ?? `${letter}, ${letter}`, 'pip');
}

export async function playLetterName(letter: string): Promise<void> {
  const l = letter.toLowerCase();
  const clip = NAME_CLIP[l];
  if (clip) {
    try {
      await playClip(clip);
      return;
    } catch {
      /* fall through to TTS */
    }
  }
  await safeSpeak(letter.toUpperCase(), 'teacher');
}

export async function playLongVowelPhonic(vowel: string): Promise<void> {
  const v = vowel.toLowerCase();
  const clip = LONG_VOWEL_CLIP[v];
  if (clip) {
    try {
      await playClip(clip);
      return;
    } catch {
      /* fall through to TTS */
    }
  }
  await safeSpeak(`${vowel}, ${vowel}`, 'pip');
}

export async function playPhonicsPhrase(key: keyof typeof PHRASE_CLIP, fallbackText: string): Promise<void> {
  const clip = PHRASE_CLIP[key];
  if (clip) {
    try {
      await playClip(clip);
      return;
    } catch {
      /* fall through to TTS */
    }
  }
  await safeSpeak(fallbackText, 'pip');
}
