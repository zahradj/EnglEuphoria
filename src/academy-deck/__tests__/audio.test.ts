// Academy recorded voices: silent when anything is missing, never the browser voice, one line at a time.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { audioBaseFor, hasClip, loadManifest, playLine, resetAudioForTests } from '../audio';

class FakeAudio {
  static made: FakeAudio[] = [];
  static blocked = false;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  paused = false;
  constructor(public src: string) { FakeAudio.made.push(this); }
  play() { return FakeAudio.blocked ? Promise.reject(new Error('NotAllowedError')) : Promise.resolve(); }
  pause() { this.paused = true; }
}

beforeEach(() => {
  resetAudioForTests();
  FakeAudio.made = [];
  FakeAudio.blocked = false;
  vi.stubGlobal('Audio', FakeAudio);
});
afterEach(() => vi.unstubAllGlobals());
const manifest = (m: Record<string, string> | null) => vi.stubGlobal('fetch', vi.fn(async () => (m ? { ok: true, json: async () => m } : { ok: false, json: async () => ({}) })));

describe('academy audio', () => {
  it('finds the clips folder beside the art folder', () => {
    expect(audioBaseFor('academy-art')).toBe('academy-audio');
    expect(audioBaseFor('/x/academy-art/')).toBe('/x/academy-audio');
    expect(audioBaseFor(undefined)).toBe('/academy-audio');
    expect(audioBaseFor('academy-art', '/clips/')).toBe('/clips');
  });

  it('stays silent when the manifest is missing or the clip is not in it', async () => {
    manifest(null);
    expect(await playLine('Vee', 'Hello', { base: 'm1' })).toBe(false);
    manifest({ 'Vee::Other': 'a.mp3' });
    expect(await playLine('Vee', 'Hello', { base: 'm2' })).toBe(false);
    expect(FakeAudio.made).toHaveLength(0);
    expect(hasClip('m2', 'Vee', 'Hello')).toBe(false);
  });

  it('plays the clip, reports start and end, and stops the previous line', async () => {
    manifest({ 'Vee::Hello': 'a.mp3', 'Ava::Hi': 'b.mp3' });
    const ev: string[] = [];
    const first = playLine('Vee', 'Hello', { base: 'm3', onStart: () => ev.push('s1'), onEnd: () => ev.push('e1') });
    await vi.waitFor(() => expect(FakeAudio.made).toHaveLength(1));
    expect(FakeAudio.made[0].src).toBe('m3/a.mp3');
    const second = playLine('Ava', 'Hi', { base: 'm3', onStart: () => ev.push('s2'), onEnd: () => ev.push('e2') });
    expect(await first).toBe(false);
    expect(FakeAudio.made[0].paused).toBe(true);
    await vi.waitFor(() => expect(FakeAudio.made).toHaveLength(2));
    FakeAudio.made[1].onended?.();
    expect(await second).toBe(true);
    expect(hasClip('m3', 'Vee', 'Hello')).toBe(true);
    expect(ev).toEqual(['s1', 'e1', 's2', 'e2']);
  });

  it('stays silent when autoplay is blocked', async () => {
    manifest({ 'Vee::Hello': 'a.mp3' });
    FakeAudio.blocked = true;
    expect(await playLine('Vee', 'Hello', { base: 'm4' })).toBe(false);
  });

  it('never touches the browser voice', async () => {
    const speak = vi.fn();
    vi.stubGlobal('speechSynthesis', { speak });
    manifest(null);
    await loadManifest('m5');
    await playLine('Vee', 'Hello', { base: 'm5' });
    expect(speak).not.toHaveBeenCalled();
  });
});
