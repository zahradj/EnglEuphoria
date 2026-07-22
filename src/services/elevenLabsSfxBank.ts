/**
 * elevenLabsSfxBank
 *
 * Client-side cache + player for ElevenLabs-generated reward sound effects.
 *
 * Hard-won lessons baked in:
 *  1. Browser autoplay policy blocks `Audio.play()` until a user gesture. We
 *     install a one-time `pointerdown`/`keydown` listener that "unlocks" audio
 *     and triggers the cache warm-up so the first reward stinger feels instant.
 *  2. ElevenLabs free/starter tiers cap at 4 concurrent requests. We process
 *     generations through a single-worker queue so we never trigger 429s.
 *  3. `supabase.functions.invoke` parses unknown content-types as JSON which
 *     corrupts MP3 bytes. We fetch the edge function URL directly with the
 *     anon key + the user's session token and read `.blob()` for clean audio.
 *  4. Each clip is cached in localStorage as a data URL so subsequent plays
 *     are instant, work offline, and survive page reloads.
 */
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

export type SfxKey =
  | "click"
  | "star"
  | "badge"
  | "dice"
  | "timer_warning"
  | "timer_done"
  | "reward_small"
  | "reward_medium"
  | "reward_big"
  | "celebration"
  | "success"
  | "error"
  | "emoji_clap"
  | "emoji_laugh"
  | "emoji_party"
  | "emoji_thumbsup"
  | "emoji_heart";

interface SfxSpec {
  prompt: string;
  duration: number;
  influence?: number;
  volume?: number;
}

const SFX_PROMPTS: Record<SfxKey, SfxSpec> = {
  click: {
    prompt: "Snappy high-energy UI tap, punchy short click with a tiny bright zip, modern game UI, no reverb",
    duration: 0.4, influence: 0.75, volume: 0.7,
  },
  star: {
    prompt: "Sparkling magical star pickup, fast bright glittery upward chime with shimmer, energetic arcade reward",
    duration: 1.0, influence: 0.65, volume: 1.0,
  },
  badge: {
    prompt: "Triumphant badge unlock fanfare, punchy ascending bells with shimmer and a confident hit, short and energetic, AAA game achievement",
    duration: 1.6, influence: 0.65, volume: 1.0,
  },
  dice: {
    prompt: "Energetic wooden dice shake and quick tumble across a table, crisp tactile clatter ending with a snap",
    duration: 1.2, influence: 0.75, volume: 0.95,
  },
  timer_warning: {
    prompt: "Urgent yet friendly two-tone timer warning beep, bright and punchy, short",
    duration: 0.8, influence: 0.75, volume: 0.85,
  },
  timer_done: {
    prompt: "Bright energetic timer completion chime, three quick ascending bells, victorious and short",
    duration: 1.2, influence: 0.65, volume: 0.95,
  },
  reward_small: {
    prompt: "Bright bouncy coin pickup with a tiny sparkle tail, snappy positive arcade reward",
    duration: 0.8, influence: 0.65, volume: 0.95,
  },
  reward_medium: {
    prompt: "Energetic ascending reward jingle with bells and a happy zip, kids game level up, short and bright",
    duration: 1.4, influence: 0.65, volume: 1.0,
  },
  reward_big: {
    prompt: "Big celebratory reward fanfare, brassy hit with sparkles, bells and a triumphant boom, short and powerful",
    duration: 2.0, influence: 0.6, volume: 1.0,
  },
  celebration: {
    prompt: "Explosive joyful kids celebration: confetti pop, party horn, sparkles and cheerful chimes, energetic and bright",
    duration: 2.5, influence: 0.6, volume: 1.0,
  },
  success: {
    prompt: "Bright energetic success confirmation, three fast ascending notes with a sparkle, modern app UI",
    duration: 0.9, influence: 0.7, volume: 0.95,
  },
  error: {
    prompt: "Soft polite error blip, short low gentle two-tone, not harsh, modern UI feedback",
    duration: 0.6, influence: 0.75, volume: 0.7,
  },
  emoji_clap: {
    prompt: "Energetic burst of enthusiastic audience applause, lots of clapping hands, bright and lively, no cheering, no music",
    duration: 1.8, influence: 0.8, volume: 1.0,
  },
  emoji_laugh: {
    prompt: "Joyful group of kids laughing out loud together, hearty contagious giggles, warm and energetic, no music",
    duration: 1.8, influence: 0.8, volume: 1.0,
  },
  emoji_party: {
    prompt: "Big festive party celebration: loud confetti pop, party horn blast, crowd cheers and bells, energetic carnival burst",
    duration: 2.2, influence: 0.7, volume: 1.0,
  },
  emoji_thumbsup: {
    prompt: "Snappy high-energy cartoon pop, single bright bouncy bubble pop with a tiny sparkle, punchy and crisp",
    duration: 0.45, influence: 0.85, volume: 1.0,
  },
  emoji_heart: {
    prompt: "Energetic juicy bubble pop with a sweet sparkle tail, bright punchy cartoon heart pop, lively and crisp",
    duration: 0.6, influence: 0.85, volume: 1.0,
  },
};

const STORAGE_PREFIX = "ee_sfx_v3::"; // bumped: re-energized prompts + emoji_heart
const audioPool = new Map<SfxKey, HTMLAudioElement>();
const inflight = new Map<SfxKey, Promise<string | null>>();

// ------------------------ User-gesture audio unlock ------------------------

let unlocked = false;
const pendingPlays: SfxKey[] = [];

function unlock() {
  if (unlocked) return;
  unlocked = true;
  // Resume any AudioContext singletons that may exist.
  try {
    // Touch the global so the WebAudio fallback also unlocks.
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (AC && !(window as any).__lovable_unlock_ctx) {
      const ctx = new AC();
      (window as any).__lovable_unlock_ctx = ctx;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      g.gain.value = 0; // silent
      osc.connect(g).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.01);
    }
  } catch (err) {
    logger.debug("Audio unlock noop failed", err);
  }
  // Warm cache and replay anything that was queued before unlock.
  elevenLabsSfxBank.prefetch(["click", "star", "badge", "reward_medium", "success"]);
  while (pendingPlays.length) {
    const k = pendingPlays.shift()!;
    elevenLabsSfxBank.play(k);
  }
}

if (typeof window !== "undefined") {
  const events: Array<keyof WindowEventMap> = [
    "pointerdown", "keydown", "touchstart",
  ];
  const handler = () => {
    unlock();
    events.forEach((e) => window.removeEventListener(e, handler));
  };
  events.forEach((e) =>
    window.addEventListener(e, handler, { once: false, passive: true })
  );
}

// ------------------------ Cache helpers ------------------------

function readCachedDataUrl(key: SfxKey): string | null {
  try { return localStorage.getItem(STORAGE_PREFIX + key); } catch { return null; }
}

function writeCachedDataUrl(key: SfxKey, dataUrl: string) {
  try { localStorage.setItem(STORAGE_PREFIX + key, dataUrl); }
  catch (err) { logger.debug("SFX cache write failed", err); }
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// ------------------------ Single-worker queue (avoids 429) ------------------------

let queueChain: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const next = queueChain.then(() => task(), () => task());
  // Don't let one rejection break the chain.
  queueChain = next.catch(() => undefined);
  return next;
}

// ------------------------ Edge-function fetch (clean binary) ------------------------

const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  "https://dcoxpyzoqjvmuuygvlme.supabase.co";
const SUPABASE_ANON =
  (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || "";

async function fetchSfxBlob(spec: SfxSpec): Promise<Blob> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token || SUPABASE_ANON;

  const res = await fetch(`${SUPABASE_URL}/functions/v1/elevenlabs-sfx`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      prompt: spec.prompt,
      durationSeconds: spec.duration,
      promptInfluence: spec.influence ?? 0.5,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`SFX HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return await res.blob();
}

async function fetchAndCache(key: SfxKey): Promise<string | null> {
  const cached = readCachedDataUrl(key);
  if (cached) return cached;
  if (inflight.has(key)) return inflight.get(key)!;

  const promise = enqueue(async () => {
    const cachedAgain = readCachedDataUrl(key);
    if (cachedAgain) return cachedAgain;
    try {
      const blob = await fetchSfxBlob(SFX_PROMPTS[key]);
      const dataUrl = await blobToDataUrl(blob);
      writeCachedDataUrl(key, dataUrl);
      return dataUrl;
    } catch (err) {
      logger.warn(`Failed to generate SFX "${key}"`, err);
      return null;
    }
  }).finally(() => inflight.delete(key));

  inflight.set(key, promise);
  return promise;
}

function getOrCreateAudio(key: SfxKey, src: string): HTMLAudioElement {
  let el = audioPool.get(key);
  if (!el) {
    el = new Audio(src);
    el.preload = "auto";
    el.volume = SFX_PROMPTS[key].volume ?? 1.0;
    audioPool.set(key, el);
  } else if (el.src !== src) {
    el.src = src;
  }
  return el;
}

// ------------------------ Public API ------------------------

export const elevenLabsSfxBank = {
  /** Pre-warm cache for a few common stingers. Fire-and-forget. */
  prefetch(keys: SfxKey[] = ["click", "star", "badge", "reward_medium"]) {
    keys.forEach((k) => {
      fetchAndCache(k).then((url) => {
        if (url) getOrCreateAudio(k, url);
      });
    });
  },

  /** Play a cached or freshly-generated SFX. Resolves true if playback started. */
  async play(key: SfxKey): Promise<boolean> {
    if (!unlocked) {
      // No user gesture yet — queue and return; will play right after unlock.
      pendingPlays.push(key);
      return false;
    }
    const src = await fetchAndCache(key);
    if (!src) return false;
    try {
      const el = getOrCreateAudio(key, src);
      el.currentTime = 0;
      await el.play();
      return true;
    } catch (err) {
      logger.debug(`SFX "${key}" play failed`, err);
      return false;
    }
  },

  isUnlocked: () => unlocked,

  clearCache() {
    Object.keys(SFX_PROMPTS).forEach((k) => {
      try { localStorage.removeItem(STORAGE_PREFIX + k); } catch { /* noop */ }
    });
    audioPool.clear();
  },
};
