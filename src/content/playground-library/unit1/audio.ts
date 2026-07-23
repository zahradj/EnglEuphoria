import { supabase } from '@/integrations/supabase/client';

/**
 * Little Explorers Phonics — Lesson 1 audio layer.
 *
 * Ported from the original "Forest of Hellos" player. That app called its own
 * TanStack Start `/api/tts` Node route; this project is a static Vite SPA, so
 * the same sequential-playback + IndexedDB-cache design now calls the
 * existing `elevenlabs-tts` Supabase Edge Function instead. Locked voice
 * cast per the source spec: Pip=Charlie, Mia=Lily, Bella=Matilda,
 * Willow=Alice, Leo=Callum, Teacher/narrator=Sarah.
 */

export type Character = 'pip' | 'mia' | 'bella' | 'willow' | 'leo' | 'teacher' | 'narrator';

const VOICE_ID: Record<Character, string> = {
  pip: 'IKne3meq5aSn9XLyUdCD', // Charlie
  mia: 'pFZP5JQG7iQjIQuC4Bku', // Lily
  bella: 'XrExE9yKIg1WjnnlVkGX', // Matilda
  willow: 'Xb7hH8MSUJpSbSDYk0k2', // Alice
  leo: 'N2lVS1w4EtoT3dr4eOWO', // Callum
  teacher: 'EXAVITQu4vr4xnSDxMaL', // Sarah
  narrator: 'EXAVITQu4vr4xnSDxMaL', // Sarah
};

const FALLBACK_VOICE: Record<Character, { rate: number; pitch: number }> = {
  pip: { rate: 0.85, pitch: 1.6 },
  mia: { rate: 0.9, pitch: 2.0 },
  bella: { rate: 0.85, pitch: 1.7 },
  willow: { rate: 0.9, pitch: 1.3 },
  leo: { rate: 0.8, pitch: 0.8 },
  teacher: { rate: 0.9, pitch: 1.2 },
  narrator: { rate: 0.9, pitch: 1.2 },
};

const mp3Cache = new Map<string, string>();
const inFlight = new Map<string, Promise<string | null>>();

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

let currentAudio: HTMLAudioElement | null = null;
let playChain: Promise<void> = Promise.resolve();
let sessionId = 0;
let queueDepth = 0;

function key(character: Character, text: string) {
  return `${character}::${text}`;
}

async function fetchMp3(k: string, text: string, character: Character): Promise<string | null> {
  const cached = mp3Cache.get(k);
  if (cached) return cached;
  const existing = inFlight.get(k);
  if (existing) return existing;

  const job = (async () => {
    try {
      const stored = await idbGet(k);
      if (stored && stored.size) {
        const url = URL.createObjectURL(stored);
        mp3Cache.set(k, url);
        return url;
      }
      const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
        body: { text, voiceId: VOICE_ID[character] },
      });
      if (error) throw error;
      const blob: Blob = data instanceof Blob ? data : new Blob([data as BlobPart], { type: 'audio/mpeg' });
      if (!blob.size) throw new Error('empty audio');
      void idbPut(k, blob);
      const url = URL.createObjectURL(blob);
      mp3Cache.set(k, url);
      return url;
    } catch (err) {
      console.warn('[lep1 voice] TTS fetch failed, using browser fallback:', err);
      return null;
    } finally {
      inFlight.delete(k);
    }
  })();

  inFlight.set(k, job);
  return job;
}

function stopCurrent() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.src = '';
    } catch {
      /* noop */
    }
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* noop */
    }
  }
}

function playFallback(text: string, character: Character): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    const f = FALLBACK_VOICE[character];
    u.rate = f.rate;
    u.pitch = f.pitch;
    u.lang = 'en-US';
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

function playUrl(url: string): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    audio.preload = 'auto';
    currentAudio = audio;
    const done = () => {
      if (currentAudio === audio) currentAudio = null;
      resolve();
    };
    audio.addEventListener('ended', done, { once: true });
    audio.addEventListener('error', done, { once: true });
    audio.play().catch(done);
  });
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
    const url = await fetchMp3(k, trimmed, character);
    if (mySession !== sessionId) return;
    if (url) {
      await playUrl(url);
    } else {
      await playFallback(trimmed, character);
    }
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
  await fetchMp3(key(character, trimmed), trimmed, character);
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
 * for H and M (Lesson 1's target sounds) were sourced from the user's own
 * phonics-master (phoneme) and Alphabet-with-sounds (letter name) archives
 * and copied into public/lep1/audio/letters/. Any other letter — or a
 * playback failure — falls back to the ElevenLabs voice pipeline above so
 * the tap-to-hear contract never goes silent.
 * -------------------------------------------------------------------------- */

const PHONIC_CLIP: Record<string, string> = {
  h: '/lep1/audio/letters/phon-h.ogg',
  m: '/lep1/audio/letters/phon-m.ogg',
};
const NAME_CLIP: Record<string, string> = {
  h: '/lep1/audio/letters/name-h.m4a',
  m: '/lep1/audio/letters/name-m.m4a',
};

const PHONEME_SOUND: Record<string, string> = {
  h: 'huh, huh',
  m: 'mmm, mmm',
  a: 'ah, ah',
  s: 'sss, sss',
  n: 'nnn, nnn',
  w: 'wuh, wuh',
};

function playClip(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
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
