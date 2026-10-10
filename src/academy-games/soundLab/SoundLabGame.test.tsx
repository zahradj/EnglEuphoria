import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

vi.mock('@/content/playground-library/unit1/audio', () => ({ safeSpeak: vi.fn().mockResolvedValue(undefined) }));

import { SoundLabGame, SOUND_LAB_ID } from './SoundLabGame';
import { CONTRASTS, SOUND_LAB_VOICES, sideOf } from './soundLabData';
import { recordStageResult } from '@/content/playground-library/gameProgress';

const speak = vi.fn().mockResolvedValue(undefined);
const open = (n: string) => fireEvent.click(screen.getByRole('button', { name: new RegExp(n) }));
const calls = () => speak.mock.calls as [string, string][];

beforeEach(() => { window.localStorage.clear(); speak.mockClear(); });
afterEach(() => { vi.unstubAllGlobals(); });

/** Plays the two scored steps perfectly (the spoken words tell the truth) and stops at "Say it". */
async function playScoredSteps() {
  fireEvent.click(await screen.findByRole('button', { name: /I can hear it/ }));
  const c = CONTRASTS[0];
  for (let n = 0; n < 8; n++) {
    await waitFor(() => expect(screen.getByText(new RegExp(`\(${n + 1}/8\)`))).toBeTruthy(), { timeout: 5000 });
    await waitFor(() => expect(calls().length).toBeGreaterThan(0));
    const target = calls()[calls().length - 1][0]; // the word just said
    fireEvent.click(screen.getByRole('button', { name: target }));
    if (n < 7) await waitFor(() => expect(screen.getByText(new RegExp(`\(${n + 2}/8\)`))).toBeTruthy(), { timeout: 5000 });
  }
  for (let n = 0; n < 6; n++) {
    await waitFor(() => expect(screen.getByText(new RegExp(`\(${n + 1}/6\)`))).toBeTruthy(), { timeout: 5000 });
    await waitFor(() => expect(calls().length).toBeGreaterThanOrEqual(2));
    await act(async () => { await new Promise((r) => setTimeout(r, 700)); });
    const [w1, w2] = calls().slice(-2).map((x) => x[0]);
    expect(c.pairs.some((p) => p.includes(w1)) && c.pairs.some((p) => p.includes(w2))).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: w1 === w2 ? 'Same' : 'Different' }));
    if (n < 5) await waitFor(() => expect(screen.getByText(new RegExp(`\(${n + 2}/6\)`))).toBeTruthy(), { timeout: 5000 });
  }
  await waitFor(() => expect(screen.getByText(/Now say it/)).toBeTruthy(), { timeout: 5000 });
}

describe('Sound Lab', () => {
  it('opens on the map: four locks (only the first open), the steps, and no scores', () => {
    render(<SoundLabGame seed={4} speak={speak} />);
    expect(screen.getByText('Sound Lab')).toBeTruthy();
    for (const c of CONTRASTS) expect(screen.getByRole('button', { name: new RegExp(c.name) })).toBeTruthy();
    expect((screen.getByRole('button', { name: /Short or long i/ }) as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByRole('button', { name: /P or B/ }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByLabelText('How a lock works').textContent).toMatch(/Listen.*Pick.*Same.*Say it/s);
    expect(screen.getByText(/Nothing here is scored by a machine/)).toBeTruthy();
  });

  it('Listen: hear a word in three different voices', async () => {
    render(<SoundLabGame seed={4} speak={speak} />);
    open('Short or long i');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Hear ship (voice 1)' })).toBeTruthy());
    for (const [k, v] of SOUND_LAB_VOICES.entries()) {
      fireEvent.click(screen.getByRole('button', { name: `Hear ship (voice ${k + 1})` }));
      await waitFor(() => expect(speak).toHaveBeenCalledWith('ship', v));
    }
    expect(screen.getByText(/Listen for:/)).toBeTruthy();
  });

  it('Pick the pin: says one word, a wrong pin gives the listen-for tip and plays both words, the right pin moves on', async () => {
    render(<SoundLabGame seed={4} speak={speak} />);
    open('Short or long i');
    fireEvent.click(await screen.findByRole('button', { name: /I can hear it/ }));
    await waitFor(() => expect(screen.getByText(/Which word did you hear/)).toBeTruthy());
    await waitFor(() => expect(calls().length).toBeGreaterThan(0));
    const target = calls()[calls().length - 1][0];
    const c = CONTRASTS[0];
    const side = sideOf(c, target);
    const other = c.pairs.find((p) => p.includes(target))![side === 0 ? 1 : 0];

    fireEvent.click(screen.getByRole('button', { name: other }));
    await waitFor(() => expect(screen.getByText(new RegExp(`You heard "${target}"`))).toBeTruthy());
    expect(screen.getByText(/You heard/).textContent).not.toMatch(/%/);
    expect((screen.getByRole('button', { name: other }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: target }));
    await waitFor(() => expect(screen.getByText(/\(2\/8\)/)).toBeTruthy(), { timeout: 5000 });
  }, 20000);

  it('a whole lock: listen, pick 8, same-or-different 6, then say it (skippable) earns stars and opens the next lock', async () => {
    render(<SoundLabGame seed={9} speak={speak} />);
    open('Short or long i');
    await playScoredSteps();
    // no MediaRecorder in this browser: the step says so and can be skipped
    expect(screen.getByText(/cannot record here/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Skip and finish this lock/ }));
    await waitFor(() => expect(screen.getByText(/Lock 1 open!/)).toBeTruthy());
    expect(screen.getByLabelText('3 of 3 stars')).toBeTruthy();
    expect(JSON.parse(window.localStorage.getItem('eg.playgroundGames.v2')!)[SOUND_LAB_ID].unlocked).toBe(1);
  }, 60000);

  it('Say it is private: the recording is played from the browser and never sent anywhere', async () => {
    recordStageResult(SOUND_LAB_ID, 0, 3, 4);
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const created: string[] = [];
    const revoked: string[] = [];
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: () => { const u = `blob:test-${created.length}`; created.push(u); return u; }, revokeObjectURL: (u: string) => { revoked.push(u); } }));
    class FakeRecorder {
      static isTypeSupported() { return true; }
      state: 'inactive' | 'recording' = 'inactive';
      mimeType = 'audio/webm';
      ondataavailable: ((e: { data: Blob }) => void) | null = null;
      onstop: (() => void) | null = null;
      start() { this.state = 'recording'; }
      stop() { this.state = 'inactive'; this.ondataavailable?.({ data: new Blob(['x'], { type: 'audio/webm' }) }); this.onstop?.(); }
    }
    vi.stubGlobal('MediaRecorder', FakeRecorder);
    const track = { stop: vi.fn() };
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [track] }) } });

    const { unmount } = render(<SoundLabGame seed={9} speak={speak} />);
    open('Short or long i');
    await playScoredSteps();
    expect(screen.getByText(/never uploaded/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Record yourself/ }));
    await waitFor(() => expect(screen.getByRole('button', { name: /Stop/ })).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: /Stop/ }));
    await waitFor(() => expect(screen.getByLabelText('Your recording')).toBeTruthy());
    expect(screen.getByText(/One thing to change/)).toBeTruthy();
    expect(created).toHaveLength(1);
    expect(track.stop).toHaveBeenCalled();           // the microphone is released
    expect(fetchSpy).not.toHaveBeenCalled();          // nothing is uploaded
    unmount();
    expect(revoked).toContain(created[0]);            // the recording is dropped when the lock closes
  }, 90000);
});
