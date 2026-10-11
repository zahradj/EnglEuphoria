import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

vi.mock('@/content/playground-library/unit1/audio', () => ({ safeSpeak: vi.fn().mockResolvedValue(undefined) }));

import { TimeHopGame } from './TimeHopGame';
import { HOP_IRREGULAR, HOP_PAIRS, SIGNALS, signalAnswer } from './hopData';

const speak = vi.fn().mockResolvedValue(undefined);
beforeEach(() => { window.localStorage.clear(); speak.mockClear(); });
const open = (n: string) => fireEvent.click(screen.getByRole('button', { name: new RegExp(n) }));

describe('Time Hop', () => {
  it('map: four stops, only the first open, vault shown', () => {
    render(<TimeHopGame seed={5} speak={speak} />);
    expect(screen.getByText('Time Hop')).toBeTruthy();
    expect((screen.getByRole('button', { name: /Twin Match/ }) as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByRole('button', { name: /Past Rules/ }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByLabelText('Memory Vault')).toBeTruthy();
  });

  it('Twin Match: the right twin locks in and is said; a wrong twin is a gentle slip', async () => {
    render(<TimeHopGame seed={5} speak={speak} />);
    open('Twin Match');
    const present = await screen.findAllByRole('button', { name: /^present / });
    const first = HOP_IRREGULAR.find((v) => present.some((b) => b.getAttribute('aria-label') === `present ${v.base}`))!;
    fireEvent.click(screen.getByRole('button', { name: `present ${first.base}` }));
    fireEvent.click(screen.getByRole('button', { name: `past ${first.past}` }));
    await waitFor(() => expect(speak).toHaveBeenCalledWith(first.past));
    await waitFor(() => expect((screen.getByRole('button', { name: `past ${first.past}` }) as HTMLButtonElement).disabled).toBe(true));
    expect(screen.getByText(new RegExp(`${first.base} → ${first.past}`))).toBeTruthy();
  });

  const unlockAll = () => window.localStorage.setItem('eg.playgroundGames.v2', JSON.stringify({ 'time-hop': { stageStars: [3, 3, 3, 0], unlocked: 3 } }));

  it('Time Gate: the time word decides; the right form is accepted and the whole sentence is said', async () => {
    unlockAll();
    render(<TimeHopGame seed={5} speak={speak} />);
    open('Time Gate');
    await screen.findByText(/Read the time word/);
    const round = SIGNALS.find((s) => document.body.textContent!.includes(s.text.split('___')[1].trim()))!;
    expect(round).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: signalAnswer(round) }));
    await waitFor(() => expect(speak).toHaveBeenCalledWith(round.text.replace('___', signalAnswer(round))));
  });

  it('Recall: typing the right answer is accepted in either direction and is said', async () => {
    unlockAll();
    render(<TimeHopGame seed={5} speak={speak} />);
    open('Recall');
    await screen.findByText(/Type it from memory/);
    const prompt = document.querySelector('p.text-4xl')!.textContent!;
    const dir = screen.queryByText('Present → Past') ? 'toPast' : 'toPresent';
    const pair = HOP_PAIRS.find((p) => (dir === 'toPast' ? p.base : p.past) === prompt)!;
    const answer = dir === 'toPast' ? pair.past : pair.base;
    fireEvent.change(screen.getByLabelText('Your answer'), { target: { value: answer.toUpperCase() } });
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    await waitFor(() => expect(speak).toHaveBeenCalledWith(answer));
    await waitFor(() => expect(window.localStorage.getItem('eg.timeHop.vault.v1')).toMatch(new RegExp(`${pair.base}:${dir}`)));
  });
});
