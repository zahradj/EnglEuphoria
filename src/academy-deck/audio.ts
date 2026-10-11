// Academy recorded voices. Plays pre-baked clips from `<audioBase>/<hash>.mp3` listed in `<audioBase>/manifest.json` ("who::text" -> file).
// Academy rule (CLAUDE.md "Voice"): NEVER the browser's speech synthesis. A missing manifest, a missing clip or blocked autoplay means SILENCE, never another voice.
export type Manifest = Record<string, string>;
export const lineKey = (who: string, text: string) => `${who}::${text}`;

/** The clips folder sits beside the pictures folder: 'academy-art' -> 'academy-audio', '/x/academy-art/' -> '/x/academy-audio'. */
export function audioBaseFor(artBase?: string, audioBase?: string): string {
  if (audioBase) return audioBase.replace(/\/+$/, '');
  if (!artBase) return '/academy-audio';
  const t = artBase.replace(/\/+$/, '');
  const i = t.lastIndexOf('/');
  return `${i >= 0 ? t.slice(0, i + 1) : ''}academy-audio`;
}

const manifests = new Map<string, Promise<Manifest>>();
const loaded = new Map<string, Manifest>();

export function loadManifest(base: string): Promise<Manifest> {
  let p = manifests.get(base);
  if (!p) {
    p = (async () => {
      try {
        // sandboxed hosts (the preview artifact) block fetch(): they can inline the list as window.__ACADEMY_AUDIO_MANIFEST__
        const inline = typeof window !== 'undefined' ? (window as unknown as { __ACADEMY_AUDIO_MANIFEST__?: Manifest }).__ACADEMY_AUDIO_MANIFEST__ : undefined;
        if (inline && typeof inline === 'object') return inline;
        if (typeof fetch !== 'function') return {};
        const res = await fetch(`${base}/manifest.json`);
        if (!res.ok) return {};
        const json = (await res.json()) as unknown;
        return json && typeof json === 'object' ? (json as Manifest) : {};
      } catch {
        return {};
      }
    })().then((m) => {
      loaded.set(base, m);
      return m;
    });
    manifests.set(base, p);
  }
  return p;
}

/** True when the manifest is loaded and has a clip for this line (sync, for deciding whether the mouth animation is real). */
export const hasClip = (base: string, who: string, text: string): boolean => !!loaded.get(base)?.[lineKey(who, text)];

/** test helper */
export function resetAudioForTests() {
  manifests.clear();
  loaded.clear();
  stopLine();
}

let current: { audio: HTMLAudioElement; finish: (played: boolean) => void } | null = null;

/** Stop whatever is playing now. */
export function stopLine() {
  const c = current;
  current = null;
  if (!c) return;
  try {
    c.audio.pause();
  } catch { /* nothing to stop */ }
  c.finish(false);
}

export interface PlayOpts { base?: string; onStart?: () => void; onEnd?: () => void }

/** Play one line. Resolves true when it played to the end, false when it stayed silent or was stopped/replaced. Never throws. */
export async function playLine(who: string, text: string, opts: PlayOpts = {}): Promise<boolean> {
  const base = opts.base ?? '/academy-audio';
  stopLine();
  const manifest = await loadManifest(base);
  const file = manifest[lineKey(who, text)];
  if (!file || typeof Audio === 'undefined') return false;
  return new Promise<boolean>((resolve) => {
    let ended = false;
    let started = false;
    let audio: HTMLAudioElement;
    const finish = (played: boolean) => {
      if (ended) return;
      ended = true;
      if (current && current.audio === audio) current = null;
      if (started) opts.onEnd?.();
      resolve(played);
    };
    try {
      audio = new Audio(`${base}/${file}`);
    } catch {
      resolve(false);
      return;
    }
    // a newer call may have taken over while the manifest loaded
    stopLine();
    current = { audio, finish };
    audio.onended = () => finish(true);
    audio.onerror = () => finish(false);
    const begin = () => {
      if (ended || started) return;
      started = true;
      opts.onStart?.();
    };
    let p: Promise<void> | void;
    try {
      p = audio.play();
    } catch {
      finish(false);
      return;
    }
    if (p && typeof (p as Promise<void>).then === 'function') (p as Promise<void>).then(begin, () => finish(false)); // autoplay blocked: stay silent
    else begin();
  });
}
