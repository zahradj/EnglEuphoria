// Deliberately NOT using supabase.functions.invoke() here — its response
// parsing mangles the raw audio/mpeg body into a corrupted string instead of
// a Blob (confirmed live: `data.constructor.name === 'String'`), which then
// fails to decode as audio and silently falls back to browser speech
// synthesis on every single line. A plain fetch() against the function URL
// returns the binary body intact.
const FUNCTIONS_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co/functions/v1';
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjb3hweXpvcWp2bXV1eWd2bG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTcxMzMsImV4cCI6MjA2NTUzMzEzM30.qWD7MJ3O7xrH2KBzIfPqGvVXigVaamR6DMVOW3rnO7s';

/**
 * Little Explorers Phonics — Unit 1 audio layer.
 *
 * Ported from the original "Forest of Hellos" player. That app called its own
 * TanStack Start `/api/tts` Node route; this project is a static Vite SPA, so
 * the same sequential-playback + IndexedDB-cache design now calls the
 * existing `elevenlabs-tts` Supabase Edge Function instead.
 *
 * Voice cast: standard ElevenLabs native-English premade voices, chosen and
 * pitch-tuned for 5-6 year olds after the original adult-timbre cast (Charlie,
 * Alice, Callum, Sarah) read as grown-up/elderly rather than child-like.
 * Fundamental frequency (F0) was measured directly off real generated clips
 * (autocorrelation pitch detection) to pick objectively brighter voices —
 * Pip=Josh (~240Hz, was Charlie ~133Hz), Mia=Lily (~265Hz), Bella=Matilda
 * (~273Hz), Willow=Nicole (~242Hz, was Alice ~151Hz), Leo=Harry (~207Hz, was
 * the gravelly adult Callum ~102Hz), Teacher/narrator=Freya (~229Hz, was
 * Sarah ~105Hz) — then every line gets an additional cents-based pitch lift
 * (PITCH_CENTS below) on top of that, landing everyone in a consistent
 * ~230-290Hz cartoon-kid range. Paced slower (SPEECH_SPEED below) throughout
 * for Pre-A1 / pre-k listeners, independent of the pitch lift (see the
 * Web Audio playback engine further down — pitch and rate are controlled
 * separately via `detune` and `playbackRate` so slowing speech down for
 * clarity never drags the pitch back down into "old person" territory).
 */

/** ElevenLabs speed multiplier for every generated line — slower and more
 *  deliberate than natural adult conversational pace, without dropping so
 *  low that the model starts to sound distorted (ElevenLabs' usable floor
 *  is around 0.7). */
const SPEECH_SPEED = 0.82;

export type Character = 'pip' | 'mia' | 'bella' | 'willow' | 'leo' | 'teacher' | 'narrator';

const VOICE_ID: Record<Character, string> = {
  pip: 'TxGEqnHWrfWFTfGW9XjX', // Josh
  mia: 'pFZP5JQG7iQjIQuC4Bku', // Lily
  bella: 'XrExE9yKIg1WjnnlVkGX', // Matilda
  willow: 'piTKgcLEGmPE4e6mEKli', // Nicole
  leo: 'SOYHLrjzK2X1ezoPC6cr', // Harry
  teacher: 'jsCqWAovK2LkecY7zXl4', // Freya
  narrator: 'jsCqWAovK2LkecY7zXl4', // Freya
};

/** Extra pitch lift applied on top of each voice's natural pitch, in cents
 *  (100 cents = 1 semitone), via Web Audio's `detune` — independent of
 *  playback speed. Kid characters get a bigger lift; the teacher/narrator
 *  voice gets a smaller one since it still reads as a grown-up in the story. */
const PITCH_CENTS: Record<Character, number> = {
  pip: 200,
  mia: 100,
  bella: 100,
  willow: 200,
  leo: 200,
  teacher: 100,
  narrator: 100,
};

// Browser speechSynthesis fallback (used only if ElevenLabs and the local
// clip both fail) — paced to match SPEECH_SPEED above for pre-k listeners,
// pitch raised to stay consistent with the childlike ElevenLabs cast.
const FALLBACK_VOICE: Record<Character, { rate: number; pitch: number }> = {
  pip: { rate: 0.78, pitch: 1.7 },
  mia: { rate: 0.8, pitch: 2.0 },
  bella: { rate: 0.78, pitch: 1.7 },
  willow: { rate: 0.8, pitch: 1.6 },
  leo: { rate: 0.75, pitch: 1.3 },
  teacher: { rate: 0.8, pitch: 1.3 },
  narrator: { rate: 0.8, pitch: 1.3 },
};

const bufferCache = new Map<string, AudioBuffer>();
const inFlight = new Map<string, Promise<AudioBuffer | null>>();

/** Shared Web Audio context for the ElevenLabs voice pipeline — lets us
 *  control pitch (`detune`) and speed (`playbackRate`) independently, which
 *  a plain HTMLAudioElement can't do (its preservesPitch flag only supports
 *  "change speed, keep original pitch," not "change both differently"). */
let sharedCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedCtx) sharedCtx = new Ctor();
  return sharedCtx;
}

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

let currentSource: AudioBufferSourceNode | null = null;
let playChain: Promise<void> = Promise.resolve();
let sessionId = 0;
let queueDepth = 0;

function key(character: Character, text: string) {
  // v2 bumped every cached clip to regenerate at SPEECH_SPEED. v3 bumped
  // again for the supabase.functions.invoke() binary-corruption fix. v4
  // bumps again: the voice cast itself changed (brighter, more childlike
  // voice IDs for pip/willow/leo/teacher) and playback moved from
  // HTMLAudioElement to the Web Audio pitch-shift engine below, so every
  // older cached clip is either the wrong voice or the wrong format.
  return `${character}::v4::${text}`;
}

async function fetchAudioBuffer(k: string, text: string, character: Character): Promise<AudioBuffer | null> {
  const cached = bufferCache.get(k);
  if (cached) return cached;
  const existing = inFlight.get(k);
  if (existing) return existing;

  const job = (async () => {
    const ctx = getAudioCtx();
    if (!ctx) return null;
    try {
      const stored = await idbGet(k);
      if (stored && stored.size) {
        const buf = await ctx.decodeAudioData(await stored.arrayBuffer());
        bufferCache.set(k, buf);
        return buf;
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
            body: JSON.stringify({ text, voiceId: VOICE_ID[character], speed: SPEECH_SPEED }),
          });
          if (!res.ok) throw new Error(`tts ${res.status}`);
          const blob = await res.blob();
          if (!blob.size || !blob.type.startsWith('audio/')) throw new Error(`bad audio response (type=${blob.type}, size=${blob.size})`);
          void idbPut(k, blob);
          const buf = await ctx.decodeAudioData(await blob.arrayBuffer());
          bufferCache.set(k, buf);
          return buf;
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

function stopCurrent() {
  if (currentSource) {
    try {
      currentSource.stop();
    } catch {
      /* noop */
    }
    currentSource = null;
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
 *  pitch by default on rate change) — used only for the pre-recorded letter
 *  clips below, which are real human recordings and don't go through the
 *  pitch-shift engine. */
function applySlowPace(audio: HTMLAudioElement) {
  audio.playbackRate = SPEECH_SPEED;
  const withPitch = audio as HTMLAudioElement & {
    preservesPitch?: boolean;
    mozPreservesPitch?: boolean;
    webkitPreservesPitch?: boolean;
  };
  withPitch.preservesPitch = true;
  withPitch.mozPreservesPitch = true;
  withPitch.webkitPreservesPitch = true;
}

/** Plays a decoded ElevenLabs clip through Web Audio with speed and pitch
 *  controlled independently: `playbackRate` paces it for pre-k listeners,
 *  `detune` lifts the pitch into a childlike register (see PITCH_CENTS) —
 *  something a plain HTMLAudioElement can't do (it can only preserve the
 *  original pitch while changing speed, not shift pitch on its own).
 *  Resolves true once playback finishes, false if it couldn't start at all
 *  (e.g. no AudioContext available) — the caller falls back to speech
 *  synthesis in that case. */
function playBuffer(buffer: AudioBuffer, character: Character): Promise<boolean> {
  const ctx = getAudioCtx();
  if (!ctx) return Promise.resolve(false);
  return new Promise((resolve) => {
    try {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = SPEECH_SPEED;
      source.detune.value = PITCH_CENTS[character] ?? 0;
      source.connect(ctx.destination);
      currentSource = source;
      const finish = (ok: boolean) => {
        if (currentSource === source) currentSource = null;
        resolve(ok);
      };
      source.onended = () => finish(true);
      source.start(0);
    } catch {
      resolve(false);
    }
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
    const ctx = getAudioCtx();
    if (ctx && ctx.state === 'suspended') void ctx.resume();
  } catch { /* noop */ }
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

/** Speak `text` as `character`. Utterances are sequenced. */
export function speak(text: string, character: Character = 'teacher'): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  const trimmed = text.trim();
  if (!trimmed) return Promise.resolve();

  const mySession = sessionId;
  queueDepth++;
  const job = playChain.then(async () => {
    if (mySession !== sessionId) return;
    const k = key(character, trimmed);
    const buffer = await fetchAudioBuffer(k, trimmed, character);
    if (mySession !== sessionId) return;
    const played = buffer ? await playBuffer(buffer, character) : false;
    if (!played) await playFallback(trimmed, character);
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

/** Warm the MP3 cache without playing. */
export async function prefetch(text: string, character: Character = 'teacher') {
  const trimmed = text.trim();
  if (!trimmed) return;
  await fetchAudioBuffer(key(character, trimmed), trimmed, character);
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
