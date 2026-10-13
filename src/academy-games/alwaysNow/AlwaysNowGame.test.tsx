import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

vi.mock('@/content/playground-library/unit1/audio', () => ({ safeSpeak: vi.fn().mockResolvedValue(undefined) }));

import { AlwaysNowGame } from './AlwaysNowGame';
import { CUES, FUNNY, GATES, JUDGES, MONSTERS, RECALLS, STATIVES, gateAnswer, gateSentence, recallSentence } from './nowData';

const speak = vi.fn().mockResolvedValue(undefined);
beforeEach(() => { window.localStorage.clear(); speak.mockClear(); });
const open = (n: string) => fireEvent.click(screen.getByRole('button', { name: new RegExp(n) }));
const unlockAll = () => window.localStorage.setItem('eg.playgroundGames.v2', JSON.stringify({ 'always-or-now': { stageStars: [3, 3, 3, 3, 3, 3, 3, 0], unlocked: 7 } }));

describe('Always or Now', () => {
  it('map: eight stops, only the first open, one is the funny one', () => {
    render(<AlwaysNowGame seed={4} speak={speak} />);
    expect(screen.getByText('Always or Now')).toBeTruthy();
    expect((screen.getByRole('button', { name: /Cue Sort/ }) as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByRole('button', { name: /Funny Reporter/ }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByLabelText('Memory Vault')).toBeTruthy();
  });

  it('Cue Sort: a cue is said and the right bin is accepted', async () => {
    render(<AlwaysNowGame seed={4} speak={speak} />);
    open('Cue Sort');
    await waitFor(() => expect(speak).toHaveBeenCalled());
    const cue = CUES.find((c) => c.text === speak.mock.calls[0][0])!;
    expect(cue).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: cue.tense === 'simple' ? 'Always' : 'Now' }));
    await waitFor(() => expect(speak.mock.calls.length).toBeGreaterThan(1));
  });

  it.each([['Scene Check', GATES], ['Funny Reporter', FUNNY], ['Monster Contrast', MONSTERS]] as const)('%s: the right form fills the blank and the whole sentence is said', async (stop, source) => {
    unlockAll();
    render(<AlwaysNowGame seed={4} speak={speak} />);
    open(stop);
    await screen.findByText(/of \d+/);
    const round = source.find((g) => document.body.textContent!.includes(g.context))!;
    expect(round).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: gateAnswer(round) }));
    await waitFor(() => expect(speak).toHaveBeenCalledWith(gateSentence(round)));
  });

  it('Silly Judge: a wrong verb is fixed, a right one is confirmed', async () => {
    unlockAll();
    render(<AlwaysNowGame seed={4} speak={speak} />);
    open('Silly Judge');
    await screen.findByText(/Is the verb right\? ·/);
    for (let n = 0; n < 2; n++) {
      const round = JUDGES.find((j) => document.body.textContent!.includes(j.text))!;
      expect(round).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: round.ok ? 'The verb is right' : 'Fix the verb' }));
      if (!round.ok) fireEvent.click(await screen.findByRole('button', { name: round.rightForm }));
      await waitFor(() => expect(speak).toHaveBeenCalledWith(round.fixed));
      speak.mockClear();
      await waitFor(() => expect(screen.getByText(new RegExp(`${n + 2} of`))).toBeTruthy(), { timeout: 4000 });
    }
  });

  it('No -ing Club: the state-verb sentence is the right one', async () => {
    unlockAll();
    render(<AlwaysNowGame seed={4} speak={speak} />);
    open('No -ing Club');
    await screen.findByText(/Which sentence is correct/);
    const round = STATIVES.find((s) => screen.queryByRole('button', { name: s.right }))!;
    fireEvent.click(screen.getByRole('button', { name: round.wrong }));
    await screen.findByText(/Look|State verbs|not that/i).catch(() => null);
    fireEvent.click(screen.getByRole('button', { name: round.right }));
    await waitFor(() => expect(speak).toHaveBeenCalledWith(round.right));
  });

  it('Recall: the typed form is accepted and saved in the vault', async () => {
    unlockAll();
    render(<AlwaysNowGame seed={4} speak={speak} />);
    open('Recall');
    await screen.findByText(/Type the verb/);
    const round = RECALLS.find((r) => document.body.textContent!.includes(r.text.split('___')[0]) && document.body.textContent!.includes(`(${r.base})`))!;
    expect(round).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Your answer'), { target: { value: round.answer.toUpperCase() } });
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    await waitFor(() => expect(speak).toHaveBeenCalledWith(recallSentence(round)));
    await waitFor(() => expect(window.localStorage.getItem('eg.alwaysNow.vault.v1')).toMatch(new RegExp(`ps:${round.id}`)));
  });
});
