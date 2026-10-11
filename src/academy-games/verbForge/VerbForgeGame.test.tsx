import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

vi.mock('@/content/playground-library/unit1/audio', () => ({ safeSpeak: vi.fn().mockResolvedValue(undefined) }));

import { VerbForgeGame, VERB_FORGE_ID } from './VerbForgeGame';
import { ALL_VERBS, IRREGULAR_VERBS, PATTERNS, SENTENCES, answerOf, verbByBase } from './verbData';
import { readVault } from './verbMemory';
import { recordStageResult } from '@/content/playground-library/gameProgress';

const speak = vi.fn().mockResolvedValue(undefined);
const unlockAll = () => { for (let i = 0; i < 3; i++) recordStageResult(VERB_FORGE_ID, i, 2, 4); };
const open = (n: string) => fireEvent.click(screen.getByRole('button', { name: new RegExp(n) }));
// the stage mounts after the map has animated out
const verbNow = async (container: HTMLElement) => {
  await waitFor(() => expect(container.querySelector('[data-verb]')).toBeTruthy(), { timeout: 4000 });
  return verbByBase(container.querySelector('[data-verb]')!.getAttribute('data-verb')!)!;
};

beforeEach(() => { window.localStorage.clear(); speak.mockClear(); });

describe('Verb Forge', () => {
  it('opens on the map: the memory method, four stops (only the first open) and the Memory Vault', () => {
    render(<VerbForgeGame seed={7} speak={speak} />);
    expect(screen.getByText('Verb Forge')).toBeTruthy();
    for (const t of ['Pattern Forge', 'Family Forge', 'Memory Forge', 'Sentence Forge']) expect(screen.getByRole('button', { name: new RegExp(t) })).toBeTruthy();
    expect((screen.getByRole('button', { name: /Pattern Forge/ }) as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByRole('button', { name: /Family Forge/ }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByLabelText('How to remember faster').textContent).toMatch(/Group.*Hear.*Recall.*Use.*Return/s);
    expect(screen.getByLabelText('Memory Vault')).toBeTruthy();
  });

  it('Pattern Forge: says the three forms first, a wrong pattern wobbles and costs nothing else, the right one explains itself', async () => {
    const { container } = render(<VerbForgeGame seed={7} speak={speak} />);
    open('Pattern Forge');
    const verb = await verbNow(container);
    await waitFor(() => expect(speak.mock.calls.length).toBeGreaterThanOrEqual(3)); // ears first: base, past, participle
    expect(speak.mock.calls.map((c) => c[0]).slice(0, 3)).toEqual([verb.base, verb.past, verb.pp]);

    const wrongPattern = PATTERNS.find((p) => p.id !== verb.pattern)!;
    fireEvent.click(screen.getByRole('button', { name: wrongPattern.label }));
    expect((screen.getByRole('button', { name: wrongPattern.label }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByText(/all three forms are the same|the 2nd and 3rd forms are the same|all three forms are different|the 3rd form comes back|add -ed/)).toBeNull();

    const right = PATTERNS.find((p) => p.id === verb.pattern)!;
    fireEvent.click(screen.getByRole('button', { name: right.label }));
    await waitFor(() => expect(screen.getByText(`${right.label}: ${right.rule}`)).toBeTruthy());
  });

  it('Pattern Forge: finishing all ten earns stars and unlocks the next stop', async () => {
    const { container } = render(<VerbForgeGame seed={11} speak={speak} />);
    open('Pattern Forge');
    for (let n = 0; n < 10; n++) {
      const verb = await verbNow(container);
      const right = PATTERNS.find((p) => p.id === verb.pattern)!;
      await waitFor(() => expect(screen.getByRole('button', { name: right.label })).toBeTruthy());
      fireEvent.click(screen.getByRole('button', { name: right.label }));
      await waitFor(() => expect(screen.getByText(`${right.label}: ${right.rule}`)).toBeTruthy());
      if (n < 9) await waitFor(() => expect(screen.queryByText(`${right.label}: ${right.rule}`)).toBeNull(), { timeout: 4000 });
    }
    await waitFor(() => expect(screen.getByText('Pattern Forge complete!')).toBeTruthy(), { timeout: 4000 });
    expect(screen.getByLabelText('3 of 3 stars')).toBeTruthy(); // not one slip
    expect(JSON.parse(window.localStorage.getItem('eg.playgroundGames.v2')!)[VERB_FORGE_ID].unlocked).toBe(1);
  }, 40000);

  it('Family Forge: picks the past, then the participle, from near-miss choices (never the regular -ed guess)', async () => {
    unlockAll();
    const { container } = render(<VerbForgeGame seed={5} speak={speak} />);
    open('Family Forge');
    const verb = await verbNow(container);
    expect(screen.getByText(/^The [A-Z]+ family$/)).toBeTruthy();
    await waitFor(() => expect(screen.getByText(new RegExp(`PAST SIMPLE of "${verb.base}"`))).toBeTruthy());
    expect(screen.getByRole('button', { name: verb.past })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: verb.past }));
    await waitFor(() => expect(screen.getByText(new RegExp(`PAST PARTICIPLE of "${verb.base}"`))).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: verb.pp }));
    await waitFor(() => expect(screen.getByText('Forged!')).toBeTruthy());
  });

  it('Memory Forge: typing the forms from memory fills the Vault (first try = box 2); a hint after a slip; the answer after two', async () => {
    unlockAll();
    const { container } = render(<VerbForgeGame seed={3} speak={speak} />);
    open('Memory Forge');
    const verb = await verbNow(container);
    await waitFor(() => expect(screen.getByLabelText('Past simple')).toBeTruthy());

    // a slip: hint appears, nothing is saved as known
    fireEvent.change(screen.getByLabelText('Past simple'), { target: { value: 'nope' } });
    fireEvent.change(screen.getByLabelText('Past participle'), { target: { value: verb.pp } });
    fireEvent.click(screen.getAllByRole('button', { name: /Forge it/ })[0]);
    await waitFor(() => expect(screen.getByText(/Hint:/)).toBeTruthy());
    expect((screen.getByLabelText('Past simple') as HTMLInputElement).placeholder.startsWith(verb.past[0])).toBe(true);

    // right after the hint: counted as "not known yet" (box 1), then it moves on
    fireEvent.change(screen.getByLabelText('Past simple'), { target: { value: ` ${verb.past.toUpperCase()} ` } });
    fireEvent.click(screen.getAllByRole('button', { name: /Forge it/ })[0]);
    await waitFor(() => expect(readVault()[`${verb.base}:past`]?.box).toBe(1), { timeout: 4000 });
    expect(readVault()[`${verb.base}:pp`]?.box).toBe(1);
  }, 20000);

  it('Memory Forge: two misses reveal the answer and send the verb back to the embers', async () => {
    unlockAll();
    const { container } = render(<VerbForgeGame seed={3} speak={speak} />);
    open('Memory Forge');
    const verb = await verbNow(container);
    await waitFor(() => expect(screen.getByLabelText('Past simple')).toBeTruthy());
    for (let k = 0; k < 2; k++) {
      fireEvent.change(screen.getByLabelText('Past simple'), { target: { value: 'x' } });
      fireEvent.click(screen.getAllByRole('button', { name: /Forge it/ })[0]);
    }
    await waitFor(() => expect(screen.getByText(new RegExp(`${verb.base} – ${verb.past} – ${verb.pp}`))).toBeTruthy());
    expect(readVault()[`${verb.base}:past`]?.box).toBe(1);
    expect(screen.getByRole('button', { name: /Next/ })).toBeTruthy();
  });

  it('Sentence Forge: the right form fills the gap in its colour and explains why', async () => {
    unlockAll();
    render(<VerbForgeGame seed={9} speak={speak} />);
    open('Sentence Forge');
    await waitFor(() => expect(screen.getByTestId('sentence')).toBeTruthy());
    const shown = screen.getByTestId('sentence').textContent!;
    const round = SENTENCES.find((s) => s.text.replace('___', '____') === shown)!;
    expect(round).toBeDefined();
    const answer = answerOf(round);
    fireEvent.click(screen.getByRole('button', { name: answer }));
    await waitFor(() => expect(screen.getByText(round.why)).toBeTruthy());
    expect(speak).toHaveBeenCalledWith(round.text.replace('___', answer));
  });

  it('the pool really has regular and irregular verbs and every irregular form is in the sung/typed data', () => {
    expect(ALL_VERBS.length).toBeGreaterThan(55);
    expect(IRREGULAR_VERBS.some((v) => v.pattern === 'ABA')).toBe(true);
  });
});
