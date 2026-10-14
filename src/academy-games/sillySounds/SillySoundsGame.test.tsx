import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

vi.mock('@/content/playground-library/unit1/audio', () => ({ safeSpeak: vi.fn().mockResolvedValue(undefined) }));

import { SillySoundsGame } from './SillySoundsGame';
import { DOCTORS, NINJAS, ODDS, RHYMES, doctorSentence } from './soundData';

const speak = vi.fn().mockResolvedValue(undefined);
beforeEach(() => { window.localStorage.clear(); speak.mockClear(); });
const open = (n: string) => fireEvent.click(screen.getByRole('button', { name: new RegExp(n) }));
const unlockAll = () => window.localStorage.setItem('eg.playgroundGames.v2', JSON.stringify({ 'silly-sounds': { stageStars: [3, 3, 3, 3, 0], unlocked: 4 } }));

describe('Silly Sounds Circus', () => {
  it('map: five stops, only the first open, privacy line shown', () => {
    render(<SillySoundsGame seed={2} speak={speak} />);
    expect(screen.getByText('Silly Sounds Circus')).toBeTruthy();
    expect((screen.getByRole('button', { name: /Rhyme Roulette/ }) as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByRole('button', { name: /Silent Ninja/ }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/never leaves your device/)).toBeTruthy();
  });

  it('Rhyme Roulette: the word is said, the rhyme is accepted and said', async () => {
    render(<SillySoundsGame seed={2} speak={speak} />);
    open('Rhyme Roulette');
    await waitFor(() => expect(speak).toHaveBeenCalled());
    const round = RHYMES.find((r) => r.word === speak.mock.calls[0][0])!;
    expect(round).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: round.answer }));
    await waitFor(() => expect(speak).toHaveBeenCalledWith(round.answer));
  });

  it('Odd One Out: the four words are said; the odd one is accepted', async () => {
    unlockAll();
    render(<SillySoundsGame seed={2} speak={speak} />);
    open('Odd One Out');
    await waitFor(() => expect(speak.mock.calls.length).toBeGreaterThanOrEqual(4), { timeout: 4000 });
    const said = speak.mock.calls.slice(0, 4).map((c) => c[0]);
    const round = ODDS.find((o) => o.words.every((w) => said.includes(w)))!;
    expect(round).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: round.odd }));
    expect(await screen.findByText(round.sound)).toBeTruthy();
  });

  it('Silent Ninja: tapping the silent letter is accepted', async () => {
    unlockAll();
    render(<SillySoundsGame seed={2} speak={speak} />);
    open('Silent Ninja');
    await waitFor(() => expect(speak).toHaveBeenCalled());
    const round = NINJAS.find((n) => n.word === speak.mock.calls[0][0])!;
    expect(round).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: `letter ${round.silent} position ${round.index + 1}` }));
    expect(await screen.findByText(round.note)).toBeTruthy();
  });

  it('Spelling Doctor: the right spelling fills the gap and the whole sentence is said', async () => {
    unlockAll();
    render(<SillySoundsGame seed={2} speak={speak} />);
    open('Spelling Doctor');
    await screen.findByText(/Cure the silly sentence ·/);
    const round = DOCTORS.find((d) => document.body.textContent!.includes(d.text.split('___')[1].trim()) && document.body.textContent!.includes(d.text.split('___')[0].trim()))!;
    expect(round).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: round.answer }));
    await waitFor(() => expect(speak).toHaveBeenCalledWith(doctorSentence(round)));
  });

  it('Parrot Echo: recording stays in the browser (no network) and finishing is possible without a microphone', async () => {
    unlockAll();
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    render(<SillySoundsGame seed={2} speak={speak} />);
    open('Parrot Echo');
    await screen.findByText(/not scored/);
    expect(screen.getAllByRole('button', { name: /Record both words/ }).length).toBe(3);
    fireEvent.click(screen.getByRole('button', { name: /Finish the circus/ }));
    expect(await screen.findByText(/complete!/)).toBeTruthy();
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
