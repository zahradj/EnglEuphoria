// @vitest-environment jsdom
// Story state, "Previously on…", the highlight reel, the entry-voice fix and the On Air game (show + two truths): logic, validators and play-throughs.
import '@/lib/i18n';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { initialState, lessonReducer } from '../engine/lessonReducer';
import { previouslyBeats } from '../engine/quest';
import { recallChapter, rememberChapter } from '../services/chapterMemory';
import { loadProgress, saveProgress } from '../services/progress';
import { validateScript } from '../engine/validateScript';
import { onairScene, type OnAirScene } from '../scenes/onair/OnAir';
import { halo, maxWarmth, moodAfter, onAirSpoken, validateOnAir, warmthOf } from '../scenes/onair/onairLogic';
import { DEMO_SHOW, DEMO_TWOTRUTHS } from '../scenes/onair/onairDemo';
import { wrapScene } from '../scenes/wrap/Wrap';
import { lobbyScene } from '../scenes/lobby/Lobby';
import { castArtOf } from '../engine/castArt';
import { LessonPlayer } from '../LessonPlayer';
import { sayLine } from '../services/voice';
import type { LessonScript } from '../types';

const saySequence = vi.fn(async () => undefined);
vi.mock('../services/voice', () => ({ sayLine: vi.fn(async () => false), saySequence: (...a: unknown[]) => (saySequence as unknown as (...x: unknown[]) => unknown)(...a), setMuted: vi.fn(), stopVoice: vi.fn() }));
beforeEach(() => { window.localStorage.clear(); saySequence.mockClear(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
const base = { script: { criteria: ['I can'] } as never, artBase: '/a', calm: true, seed: 3, summary: { xp: 0, gems: 0, mistakes: [] as string[] } };
const btn = (name: string | RegExp) => screen.getByRole('button', { name });
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

describe('story state (engine)', () => {
  it('a scene result merges its flags into the story and appends reel lines, once per scene', () => {
    let s = lessonReducer(initialState(3), { type: 'done', id: 'a', result: { won: true, score: 10, story: { caughtLie: true }, reel: [{ who: 'You', text: 'Really?' }] } });
    s = lessonReducer(s, { type: 'done', id: 'b', result: { won: true, score: 10, story: { warm: 3 }, reel: [{ who: 'Mia', text: 'Thanks!' }] } });
    expect(s.story).toEqual({ caughtLie: true, warm: 3 });
    expect(s.reel.map((l) => l.text)).toEqual(['Really?', 'Thanks!']);
    // paying out twice changes nothing
    expect(lessonReducer(s, { type: 'done', id: 'a', result: { won: true, score: 10, story: { x: 1 } } }).story).toEqual({ caughtLie: true, warm: 3 });
  });
  it('is saved with the resume point and restored', () => {
    const s = lessonReducer(initialState(3), { type: 'done', id: 'a', result: { won: true, score: 5, story: { f: true }, reel: [{ who: 'You', text: 'Hi' }] } });
    saveProgress('B1-S01-E4', ['a', 'b', 'c'], { ...s, index: 1, furthest: 1 });
    const back = loadProgress('B1-S01-E4', ['a', 'b', 'c']);
    expect(back?.story).toEqual({ f: true });
    expect(lessonReducer(initialState(3), { type: 'restore', state: back! }).reel).toHaveLength(1);
  });
});

describe('chapter memory and "Previously on…"', () => {
  const prev = { from: 'B1-S01-E3', beats: [{ text: 'The postcard was found.', when: 'caseClosed' }, { text: 'You sorted been from gone.' }] };
  it('shows the beats whose flag was set, and always the beats with no flag', () => {
    expect(previouslyBeats(prev, { caseClosed: true })).toEqual(['The postcard was found.', 'You sorted been from gone.']);
    expect(previouslyBeats(prev, null)).toEqual(['You sorted been from gone.']);
    expect(previouslyBeats(undefined, null)).toEqual([]);
  });
  it('remembers flags only (no student text) between lessons, and forgets softly', () => {
    expect(recallChapter('B1-S01-E3')).toBeNull();
    rememberChapter('B1-S01-E3', { caseClosed: true });
    expect(recallChapter('B1-S01-E3')).toEqual({ caseClosed: true });
    window.localStorage.setItem('academy-player-chapters-v2', '{bad json');
    expect(recallChapter('B1-S01-E3')).toBeNull();
  });
  it('the lobby shows the recap from the remembered story', () => {
    rememberChapter('B1-S01-E3', { caseClosed: true });
    const View = lobbyScene.view;
    const script = { blueprintId: 'B1-S01-E4', title: 't', criteria: ['I can'], cast: ['Vee'], partMinutes: [3, 5, 20, 12, 3, 8, 5, 4], scenes: [], previously: prev } as unknown as LessonScript;
    render(<View {...base} script={script} scene={{ id: 'l', part: 0, kind: 'lobby', heading: 'Ask and React' }} onDone={() => undefined} />);
    expect(screen.getByTestId('av-previously').textContent).toContain('The postcard was found.');
    expect(screen.getByTestId('av-previously').textContent).toContain('You sorted been from gone.');
  });
  it('a script whose "previously" points at a missing lesson is rejected', () => {
    const bad = { blueprintId: 'B1-S01-E4', title: 't', criteria: ['I can'], cast: ['Vee'], partMinutes: [3, 5, 20, 12, 3, 8, 5, 4], scenes: [{ id: 'l', part: 0, kind: 'lobby', heading: 'x' }], previously: { from: 'NOPE', beats: [{ text: 'x' }] } } as unknown as LessonScript;
    expect(validateScript(bad).join(' ')).toContain('previously');
  });
});

describe('the player no longer reads a scene’s whole voice list on entry', () => {
  it('opens a game scene without playing every line in order (each scene says its own lines)', () => {
    const script = { blueprintId: 'B1-S01-E4', title: 't', criteria: ['I can'], cast: ['Mia', 'Vee'], partMinutes: [3, 5, 20, 12, 3, 8, 5, 4], scenes: [DEMO_SHOW] } as unknown as LessonScript;
    render(<LessonPlayer script={script} ephemeral role="teacher" index={0} />);
    expect(saySequence).not.toHaveBeenCalled();
    expect(sayLine).toHaveBeenCalled(); // the scene's own intro
  });
});

describe('On Air logic', () => {
  it('the demo scenes are valid, and every line has a recorded voice listed', () => {
    expect(validateOnAir(DEMO_SHOW)).toEqual([]);
    expect(validateOnAir(DEMO_TWOTRUTHS)).toEqual([]);
    expect(onAirSpoken(DEMO_SHOW).length).toBeGreaterThan(20);
    expect(onAirSpoken(DEMO_TWOTRUTHS).some((l) => l.text.includes('Tokyo'))).toBe(true);
    expect(onairScene.validate(DEMO_SHOW)).toEqual([]);
  });
  it('warmth moves the guest’s face, never a number', () => {
    expect([moodAfter(0), moodAfter(1), moodAfter(2)]).toEqual(['neutral', 'curious', 'happy']);
    const picks = DEMO_SHOW.exchanges!.map((e) => e.options.find((o) => o.fit === 2));
    expect(warmthOf(picks)).toBe(maxWarmth(DEMO_SHOW));
    expect(halo(4, 8)).toBe(0.5); expect(halo(99, 8)).toBe(1); expect(halo(1, 0)).toBe(0);
  });
  it('catches badly built scenes', () => {
    const noFlat = clone(DEMO_SHOW); noFlat.exchanges![0].options[2] = { ...noFlat.exchanges![0].options[2], fit: 1, kind: 'react' };
    expect(validateOnAir(noFlat).join(' ')).toContain('dead-end');
    const longFlat = clone(DEMO_SHOW); longFlat.exchanges![0].options[2].reply = 'Yeah, it was really good, and the food and the trains were so different and I loved all of it so much.';
    expect(validateOnAir(longFlat).join(' ')).toContain('shorter');
    const leaky = clone(DEMO_TWOTRUTHS); leaky.claims![0].probes[0].tell = true;
    expect(validateOnAir(leaky).join(' ')).toContain('must not give itself away');
    const noTell = clone(DEMO_TWOTRUTHS); noTell.claims![1].probes.forEach((p) => { p.tell = false; });
    expect(validateOnAir(noTell).join(' ')).toContain('gives it away');
    const badLie = clone(DEMO_TWOTRUTHS); badLie.lieId = 'zzz';
    expect(validateOnAir(badLie).join(' ')).toContain('lieId');
    const badFlag = clone(DEMO_SHOW); badFlag.flagAt = 99;
    expect(validateOnAir(badFlag).join(' ')).toContain('flagAt');
  });
  it('lists the guest portraits for the art check', () => {
    expect(castArtOf(DEMO_SHOW)).toEqual(expect.arrayContaining(['cast/mia/neutral', 'cast/mia/happy', 'cast/mia/surprised']));
  });
});

describe('On Air — the show', () => {
  const View = onairScene.view;
  const play = (scene: OnAirScene, picks: number[]) => {
    const onDone = vi.fn();
    render(<View {...base} scene={scene} onDone={onDone} />);
    for (const [k, n] of picks.entries()) {
      fireEvent.click(document.querySelectorAll<HTMLButtonElement>('.av-oa-card-btn')[n]);
      fireEvent.click(btn(k === picks.length - 1 ? /End the show/ : /Next question/));
    }
    return onDone;
  };
  it('good lines make the guest open up, set the story flag and fill the reel', () => {
    const onDone = play(DEMO_SHOW, [0, 1, 0, 0]);
    const r = onDone.mock.calls[0][0];
    expect(r.won).toBe(true); expect(r.mistakes).toEqual([]);
    expect(r.story).toEqual({ miaOpenedUp: true });
    expect(r.reel.filter((l: { who: string }) => l.who === 'You')).toHaveLength(4);
    expect(r.reel[1].who).toBe('Mia');
  });
  it('a dead-end card gets a one-word answer and a kind note, goes to the Mistake Bank and keeps the flag off', () => {
    const onDone = play(DEMO_SHOW, [2, 2, 1, 2]);
    const r = onDone.mock.calls[0][0];
    expect(r.mistakes).toEqual(['Oh. OK.', 'Good.', 'I see.', 'OK.']);
    expect(r.story).toBeUndefined();
    expect(r.reel).toHaveLength(0);
  });
  it('shows the guest’s reply and the note after a pick, and every card has a model button', () => {
    render(<View {...base} scene={DEMO_SHOW} onDone={() => undefined} />);
    expect(screen.getAllByRole('button', { name: /Hear Vee say it/ })).toHaveLength(3);
    fireEvent.click(document.querySelectorAll<HTMLButtonElement>('.av-oa-card-btn')[2]);
    expect(screen.getByText(/“Yeah.”/)).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('dead end');
  });
  it('has no timer, no score bar and no number for the guest’s mood', () => {
    const { container } = render(<View {...base} scene={DEMO_SHOW} onDone={() => undefined} />);
    expect(container.querySelector('[role="progressbar"], .av-boss-hp, .av-orbs')).toBeNull();
    expect(container.textContent).not.toMatch(/\d+\s*(s|sec|seconds)\b/);
  });
});

describe('On Air — two truths and a lie', () => {
  const View = onairScene.view;
  it('the notepad never highlights the tell, a true claim cannot be pinned, the lie can, then the student says why', () => {
    const onDone = vi.fn();
    render(<View {...base} scene={DEMO_TWOTRUTHS} onDone={onDone} />);
    for (let n = 0; n < 3; n++) fireEvent.click(screen.getAllByRole('button', { name: /Hear experience/ })[0]);
    // not enough answers yet: no "This is the lie" buttons
    expect(screen.queryAllByRole('button', { name: /This is the lie/ })).toHaveLength(0);
    const ask = () => screen.getAllByRole('button', { name: /^❓\s*Ask$/ });
    fireEvent.click(ask()[1]);
    const qs = () => document.querySelectorAll<HTMLButtonElement>('.av-oa-probes .av-oa-card-btn');
    fireEvent.click(qs()[0]); fireEvent.click(qs()[1]);
    fireEvent.click(ask()[0]); fireEvent.click(qs()[0]);
    expect(document.querySelector('.av-oa-pad')?.textContent).toContain('Tokyo');
    expect(document.querySelector('.av-oa-pad [data-tell], .av-oa-pad mark')).toBeNull();
    // pin a true claim: gentle, recorded as a mistake
    fireEvent.click(screen.getAllByRole('button', { name: /This is the lie/ })[0]);
    expect(screen.getByText(/sounds true/)).toBeTruthy();
    expect(document.querySelector('.av-oa-claim[data-lie]')).toBeNull();
    fireEvent.click(screen.getAllByRole('button', { name: /This is the lie/ })[1]);
    expect(document.querySelector('.av-oa-claim[data-lie]')).toBeTruthy();
    expect(screen.getByTestId('av-oa-say').textContent).toContain('I think number 2 is the lie, because she ate sushi in Tokyo last summer.');
    fireEvent.click(btn(/I said it/));
    const r = onDone.mock.calls[0][0];
    expect(r.story).toEqual({ caughtLie: true });
    expect(r.mistakes).toEqual(['Pinned a true experience']);
    expect(r.reel.at(-1)).toEqual({ who: 'You', text: 'I think number 2 is the lie, because she ate sushi in Tokyo last summer.' });
  });
});

describe('the highlight reel in the Wrap', () => {
  it('lists the lines and replays the show with the cast’s recorded voices', async () => {
    const View = wrapScene.view;
    const quest = { xp: 100, stars: 3, gems: 1, stagesCleared: 8, scored: 5, clean: 4, bestStreak: 3, level: { level: 2, rank: 'rookie', fill: 0.4 }, loot: [], potential: [], objectives: [] } as never;
    render(<View {...base} scene={{ id: 'w', part: 7, kind: 'wrap', heading: 'Show over', teachBack: 'How do you keep a guest talking?' }} onDone={() => undefined} summary={{ xp: 1, gems: 0, mistakes: [], quest, reel: [{ who: 'You', text: 'Really? That sounds amazing!' }, { who: 'Mia', text: 'Thanks!' }] }} />);
    expect(screen.getByTestId('av-reel').textContent).toContain('Really? That sounds amazing!');
    fireEvent.click(btn(/Replay the show/));
    await vi.waitFor(() => expect(sayLine).toHaveBeenCalledWith({ who: 'Mia', text: 'Thanks!' }, '/a'), { timeout: 4000 });
  });
});
