import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

vi.mock('@/content/playground-library/unit1/audio', () => ({ safeSpeak: vi.fn().mockResolvedValue(undefined) }));

import { TwisterGame } from './TwisterGame';
import { TWISTERS } from './twisterData';

const speak = vi.fn().mockResolvedValue(undefined);
beforeEach(() => { window.localStorage.clear(); speak.mockClear(); });
afterEach(() => { vi.unstubAllGlobals(); });

const toBuild = async () => {
  render(<TwisterGame seed={3} speak={speak} />);
  fireEvent.click(screen.getByRole('button', { name: /Seashells/ }));
  fireEvent.click(await screen.findByRole('button', { name: /I know how it sounds/ }));
  await screen.findByText(/Tap the chunks/);
};

const toSpell = async () => {
  await toBuild();
  for (const c of TWISTERS[0].chunks) fireEvent.click(screen.getByRole('button', { name: c }));
  fireEvent.click(await screen.findByRole('button', { name: /Now spell it/ }));
  return screen.findByLabelText('Your twister');
};

describe('Twister Lab', () => {
  it('map: eight twisters, only the first open, no scores promised', () => {
    render(<TwisterGame seed={3} speak={speak} />);
    for (const t of TWISTERS) expect(screen.getByRole('button', { name: new RegExp(t.title) })).toBeTruthy();
    expect((screen.getByRole('button', { name: /Seashells/ }) as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByRole('button', { name: /Slippery snails/ }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/never leaves your device/)).toBeTruthy();
  });

  it('Listen: chunks and the whole twister are said with the registered text, in both voices', async () => {
    render(<TwisterGame seed={3} speak={speak} />);
    fireEvent.click(screen.getByRole('button', { name: /Seashells/ }));
    fireEvent.click(await screen.findByRole('button', { name: /Hear it at speed/ }));
    await waitFor(() => expect(speak).toHaveBeenCalledWith('She sells seashells by the seashore.', 'teacher'));
    fireEvent.click(screen.getByRole('button', { name: 'seashells' }));
    await waitFor(() => expect(speak).toHaveBeenCalledWith('seashells', 'teacher'));
    fireEvent.click(screen.getByRole('button', { name: 'Voice 2' }));
    fireEvent.click(screen.getByRole('button', { name: /Hear it at speed/ }));
    await waitFor(() => expect(speak).toHaveBeenCalledWith('She sells seashells by the seashore.', 'leo'));
  });

  it('Build then Spell: corrections show the fix, then a right answer moves on', async () => {
    const box = await toSpell();
    fireEvent.change(box, { target: { value: 'She sels sea shells by the seashore' } });
    fireEvent.click(screen.getByRole('button', { name: /Check my spelling/ }));
    const panel = await screen.findByLabelText('Spelling correction');
    expect(panel.textContent).toMatch(/2 things to fix/);
    expect(panel.textContent).toMatch(/Write it as one word/);
    fireEvent.change(box, { target: { value: TWISTERS[0].text } });
    fireEvent.click(screen.getByRole('button', { name: /Check my spelling/ }));
    await waitFor(() => expect(screen.getByLabelText('Spelling correction').textContent).toMatch(/Perfect spelling/));
    fireEvent.click(screen.getByRole('button', { name: /Next: say it/ }));
    expect(await screen.findByText(/not scored/)).toBeTruthy();
  });

  it('a chunk tapped out of order is not added', async () => {
    await toBuild();
    fireEvent.click(screen.getByRole('button', { name: TWISTERS[0].chunks[1] }));
    expect(screen.getByLabelText('Your chunks').textContent).toBe('…');
  });

  it('Say it: a recording stays in the browser (no network) and is revoked when the game closes', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const revoke = vi.fn();
    const create = vi.fn(() => 'blob:take');
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke }));
    class FakeRecorder {
      state = 'inactive';
      mimeType = 'audio/webm';
      ondataavailable: ((e: { data: Blob }) => void) | null = null;
      onstop: (() => void) | null = null;
      start() { this.state = 'recording'; }
      stop() { this.state = 'inactive'; this.ondataavailable?.({ data: new Blob(['x']) }); this.onstop?.(); }
    }
    vi.stubGlobal('MediaRecorder', FakeRecorder);
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop() {} }] }) } });

    const box = await toSpell();
    fireEvent.change(box, { target: { value: TWISTERS[0].text } });
    fireEvent.click(screen.getByRole('button', { name: /Check my spelling/ }));
    fireEvent.click(await screen.findByRole('button', { name: /Next: say it/ }));
    fireEvent.click((await screen.findAllByRole('button', { name: /Record/ }))[0]);
    fireEvent.click(await screen.findByRole('button', { name: /Stop/ }));
    await waitFor(() => expect(create).toHaveBeenCalled());
    expect(fetchSpy).not.toHaveBeenCalled();
    cleanup();
    expect(revoke).toHaveBeenCalledWith('blob:take');
  });
});
