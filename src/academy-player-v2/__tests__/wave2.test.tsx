// @vitest-environment jsdom
// Wave 2 games (finder, workshop, beats, switchboard): logic, validators, full play-throughs with right and wrong answers, spoken lines, and the lessons that use them.
import '@/lib/i18n';
import fs from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { finderScene, type FinderScene } from '../scenes/finder/Finder';
import { bannedChips, canSend, checkGrid, chipTags, clueTags, diffOf, fitIds, fits, newWords, partnerPick, separatingChips, type FinderGrid } from '../scenes/finder/finderLogic';
import { workshopScene, type WorkshopScene } from '../scenes/workshop/Workshop';
import { chunkOf, halvesFit, splitStem } from '../scenes/workshop/workshopLogic';
import { beatsScene, type BeatsScene } from '../scenes/beats/Beats';
import { checkItem, HOLD_MS, isHold, markStress, noteFor } from '../scenes/beats/beatsLogic';
import { switchboardScene, type SwitchboardScene } from '../scenes/switchboard/Switchboard';
import { checkLevel, formFor, judgeEvent, judgeMarker, judgeVerb, MARKERS, sentenceOf, strip, stripText, zoneOf, type ReverseLevel } from '../scenes/switchboard/switchLogic';
import { Stinger } from '../quest/Cinematics';
import { advanceFlow, initialFlow } from '../quest/flow';
import { castArtOf } from '../engine/castArt';
import { artOf } from '../engine/artOf';
import { lessonResponses, responsesOf } from '../engine/responses';
import { spokenLines } from '../engine/spokenLines';
import { validateScript } from '../engine/validateScript';
import { ENCOUNTER_KINDS, SCORED_KINDS, potentialLoot } from '../engine/quest';
import { SCENES } from '../scenes/registry';
import { ART_REVIEW } from '../artReview';
import { B1_S01_E1 } from '../lessons/b1s01e1';
import { B1_S01_E2 } from '../lessons/b1s01e2';
import { B1_S01_E3 } from '../lessons/b1s01e3';

vi.mock('../services/voice', () => ({ sayLine: vi.fn(async () => false), stopVoice: vi.fn() }));
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });
const base = { script: { criteria: ['I can'] } as never, artBase: '/a', calm: true, seed: 3, summary: { xp: 0, gems: 0, mistakes: [] as string[] } };
const find = <T extends { id: string }>(l: { scenes: unknown[] }, id: string) => l.scenes.find((s) => (s as T).id === id) as unknown as T;
const btn = (name: string | RegExp) => screen.getByRole('button', { name });

// ---------- finder ----------
describe('finder logic', () => {
  const scene = find<FinderScene>(B1_S01_E2, 'finder');
  const [f1, f2, f3] = scene.grids;
  it('every grid of the lesson is playable (6 cards, trap, clues narrow the board, banned words leave a solution)', () => {
    for (const g of scene.grids) expect(checkGrid(g)).toEqual([]);
  });
  it('a clue fits a card that has all its tags; the first clue is vague, the last fits only the target', () => {
    expect(fitIds(f1.cards, clueTags(f1, 0)).length).toBe(4);
    expect(fitIds(f1.cards, clueTags(f1, 1))).toEqual(['a', 'b']);
    expect(fitIds(f1.cards, clueTags(f1, 2))).toEqual(['a']);
    expect(fits(f1.cards[0], ['Tower', 'FLAG'])).toBe(true);
  });
  it('the partner picks the lookalike when the clue is too vague, the target when it is exact', () => {
    const vague = chipTags(f2, ['relaxed', 'country', 'camp']);
    expect(partnerPick(f2, vague)).toEqual({ id: 'b', ambiguous: true });
    const exact = chipTags(f2, ['relaxed', 'country', 'camp', 'tent']);
    expect(partnerPick(f2, exact)).toEqual({ id: 'a', ambiguous: false });
    expect(partnerPick(f2, ['unicorn'])).toEqual({ id: null, ambiguous: false });
  });
  it('says what makes the lookalike different, and which chips would separate it', () => {
    expect(diffOf(f2.cards[1], f2.cards[0])).toEqual({ kind: 'detail', value: 'fire' });
    expect(diffOf(f2.cards[2], f2.cards[0]).kind).toBe('feeling'); // c has the same details, another feeling
    expect(separatingChips(f2, 'b').sort()).toEqual(['lake', 'tent']);
  });
  it('counts new words, needs the minimum before sending, and bans the Taboo words', () => {
    expect(newWords(f2, ['relaxed', 'country', 'tent'])).toBe(2);
    expect(canSend(f2, ['relaxed', 'country', 'tent'])).toBe(false);
    expect(canSend(f2, ['relaxed', 'country', 'camp'])).toBe(true);
    expect(canSend(f2, [])).toBe(false);
    expect(bannedChips(f3)).toEqual(['grateful']);
    expect(bannedChips(f1)).toEqual([]);
  });
  it('validate catches a trap that fits nothing, a last clue that is not exact, a chip that lies and a banned word that makes the grid unsolvable', () => {
    const copy = <T,>(x: T) => JSON.parse(JSON.stringify(x)) as T;
    const a = copy(f1); a.trapId = 'f';
    expect(checkGrid(a).join()).toMatch(/trap must fit the first clue/);
    const b = copy(f1); b.clues![2].tags = ['city'];
    expect(checkGrid(b).join()).toMatch(/last clue must fit only the target/);
    const c = copy(f2); c.acceptedChips!.push('boat');
    expect(checkGrid(c).join()).toMatch(/accepted but not true/);
    const d = copy(f3); d.cards[2].details = ['boat', 'sun']; // c is now identical but for the banned feeling
    expect(checkGrid(d).join()).toMatch(/banned words removed/);
    const e = copy(f2); e.minNewWords = 5;
    expect(checkGrid(e).join()).toMatch(/new words are available/);
    expect(finderScene.validate({ ...scene, grids: [f1] } as FinderScene).join()).toMatch(/build round/);
  });
  it('says the briefing, the partner lines and every clue aloud', () => {
    const lines = finderScene.spoken(scene).map((l) => l.text);
    expect(lines).toEqual(expect.arrayContaining([scene.intro, scene.askLine, scene.foundLine, 'I felt amazed.', 'There is a tower and a flag.']));
    expect(finderScene.spoken(scene).every((l) => l.who === 'Ava')).toBe(true);
  });
});

describe('finder play-through', () => {
  it('find round: a card that does not fit costs the gem, a lookalike that fits is not an error, the exact card flips to the stamp', () => {
    const scene = find<FinderScene>(B1_S01_E2, 'finder');
    const onDone = vi.fn();
    render(<finderScene.view {...base} scene={scene} onDone={onDone} />);
    fireEvent.click(btn(/^Start/));
    expect(screen.getByText(/fits 4 of 6 postcards/)).toBeTruthy();
    // countryside, amazed (fits clue 1 of "amazed"): the lookalike d is not the target but fits -> free "one more detail"
    fireEvent.click(document.querySelector('.av-fd-card[data-id="b"]')!);
    expect(screen.getByText(/This one fits too/)).toBeTruthy();
    expect(screen.getByText(/fits 2 of 6 postcards/)).toBeTruthy();
    // a card that does not fit: wrong
    fireEvent.click(document.querySelector('.av-fd-card[data-id="e"]')!);
    expect(screen.getByText(/does not show “city”/)).toBeTruthy();
    fireEvent.click(document.querySelector('.av-fd-card[data-id="a"]')!);
    expect(document.querySelector('.av-fd-card[data-id="a"]')!.getAttribute('data-state')).toBe('found');
    expect(screen.getByText(/City: found it/)).toBeTruthy();
    expect(onDone).not.toHaveBeenCalled();
  });
  it('build rounds: the lookalike is never called wrong, the student adds a detail, then the roles finish; a chip that is not true bounces', () => {
    const scene = find<FinderScene>(B1_S01_E2, 'finder');
    const onDone = vi.fn();
    render(<finderScene.view {...base} scene={scene} onDone={onDone} />);
    fireEvent.click(btn(/^Start/));
    fireEvent.click(document.querySelector('.av-fd-card[data-id="a"]')!); // round 1 exact at once
    fireEvent.click(btn(/Next postcard/));
    expect(screen.getByText('You give the clue')).toBeTruthy();
    expect(screen.getByText('New words 0/3')).toBeTruthy();
    expect((btn('Send the clue') as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(btn('a boat')); // not on the secret postcard
    expect(screen.getByText(/does not show that/)).toBeTruthy();
    for (const c of ['I felt relaxed', 'in the countryside']) fireEvent.click(btn(c));
    expect(screen.getByText('New words 2/3')).toBeTruthy();
    expect((btn('Send the clue') as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(btn('we went camping'));
    fireEvent.click(btn('Send the clue'));
    expect(screen.getByText(/also fits the postcard with the fire\. Add one detail/)).toBeTruthy();
    expect(document.querySelector('.av-fd-card[data-id="b"]')!.getAttribute('data-state')).toBe('asked');
    expect(document.querySelectorAll('.av-chip[data-glow]').length).toBe(2); // the tent and the lake would separate them
    fireEvent.click(btn('a tent'));
    fireEvent.click(btn('Send the clue'));
    expect(document.querySelector('.av-fd-card[data-id="a"]')!.getAttribute('data-state')).toBe('found');
    fireEvent.click(btn(/Next postcard/));
    // taboo round: grateful is banned and says so
    expect(screen.getByText(/Banned words today/)).toBeTruthy();
    fireEvent.click(btn('I felt grateful'));
    expect(screen.getByText(/Banned today/)).toBeTruthy();
    for (const c of ['at the beach', 'I tried something new', 'a boat', 'the sun']) fireEvent.click(btn(c));
    fireEvent.click(btn('Send the clue'));
    expect(document.querySelector('.av-fd-card[data-id="a"]')!.getAttribute('data-state')).toBe('found');
    fireEvent.click(btn('Finish the lesson'));
    expect(onDone).toHaveBeenCalledTimes(1);
    const r = onDone.mock.calls[0][0];
    expect(r.won).toBe(true);
    expect(r.mistakes).toEqual(['clue f2']); // the lookalike round of grid 2 only
    expect(r.score).toBe(10 + 5 + 10);
    expect(screen.getByTestId('av-reward')).toBeTruthy();
  });
});

// ---------- workshop ----------
describe('workshop', () => {
  const scene = find<WorkshopScene>(B1_S01_E2, 'workshop');
  it('validates, and exactly one pair snaps per item', () => {
    expect(workshopScene.validate(scene)).toEqual([]);
    const it0 = scene.items[0];
    expect(chunkOf(it0)).toBe('go camping');
    expect(halvesFit(it0, 'do', 'camping')).toEqual({ ok: false, firstOk: false, secondOk: true });
    expect(halvesFit(it0, 'go', 'sightseeing').firstOk).toBe(true);
    expect(splitStem(it0.sentence.stem)).toEqual(['Last summer we ', ' near a lake and slept in a tent.']);
    const broken = JSON.parse(JSON.stringify(scene)) as WorkshopScene;
    broken.items[0].first.options = ['do', 'make', 'try'];
    broken.items[1].sentence.stem = 'no blank';
    broken.items[2].sentence.sample = 'try new';
    const text = workshopScene.validate(broken).join('\n');
    expect(text).toMatch(/right first half is not among/);
    expect(text).toMatch(/needs a blank/);
    expect(text).toMatch(/sample sentence is not accepted/);
  });
  it('accepts inflected forms in the gap sentence', () => {
    const s = scene.items.map((i) => i.sentence);
    const ok = (k: number, text: string) => new RegExp(s[k].accepts[0], 'i').test(text);
    expect(ok(0, 'went camping')).toBe(true); expect(ok(0, 'go camping')).toBe(false);
    expect(ok(1, 'going sightseeing')).toBe(true); expect(ok(1, 'go sightseeing')).toBe(false);
    expect(ok(2, 'try something new')).toBe(true);
  });
  it('says the briefing, each chunk and each finished sentence aloud', () => {
    const lines = workshopScene.spoken(scene).map((l) => l.text);
    expect(lines).toEqual(expect.arrayContaining([scene.intro, 'go camping', 'go sightseeing', 'try something new', 'Last summer we went camping near a lake and slept in a tent.', 'Tomorrow we are going sightseeing in Rome.']));
  });
  it('full play: a wrong pair wobbles apart (the right half stays), the right pair snaps onto the shelf, then the gap sentences', () => {
    const onDone = vi.fn();
    render(<workshopScene.view {...base} scene={scene} onDone={onDone} />);
    fireEvent.click(btn(/^Start/));
    expect((btn('Snap them together') as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(btn('do')); fireEvent.click(btn('camping'));
    expect((btn('Snap them together') as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(btn('Snap them together'));
    expect(screen.getByText(/“do camping” is not a chunk we use\. We say go camping/)).toBeTruthy();
    expect(document.querySelector('.av-ws-ticket')!.getAttribute('data-snap')).toBeNull();
    expect(screen.getByRole('button', { name: 'camping' }).getAttribute('aria-pressed')).toBe('true'); // the right half stayed
    expect(screen.getByRole('button', { name: 'do' }).getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(btn('go')); fireEvent.click(btn('Snap them together'));
    expect(document.querySelector('.av-ws-ticket')!.getAttribute('data-snap')).toBe('true');
    expect(document.querySelectorAll('.av-ws-shelf li[data-full]')).toHaveLength(1);
    expect(screen.getByText(/“go camping” is one chunk/)).toBeTruthy();
    fireEvent.click(btn(/Next kit item/));
    fireEvent.click(btn('go')); fireEvent.click(btn('sightseeing')); fireEvent.click(btn('Snap them together'));
    fireEvent.click(btn(/Next kit item/));
    fireEvent.click(btn('try')); fireEvent.click(btn('something new')); fireEvent.click(btn('Snap them together'));
    expect(document.querySelectorAll('.av-ws-shelf li[data-full]')).toHaveLength(3);
    fireEvent.click(btn(/Use them in sentences/));
    const input = screen.getByRole('textbox');
    fireEvent.click(screen.getAllByRole('button', { name: 'go camping' })[1] ?? screen.getAllByRole('button', { name: 'go camping' })[0]);
    fireEvent.click(btn('Check')); // "go camping" after "Last summer we" is not past
    expect(screen.getByText(/Last summer is finished/)).toBeTruthy();
    fireEvent.change(input, { target: { value: 'went camping' } }); fireEvent.click(btn('Check'));
    expect(screen.getByText('Last summer we went camping near a lake and slept in a tent.')).toBeTruthy();
    fireEvent.click(btn(/^Next/));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'going sightseeing' } }); fireEvent.click(btn('Check'));
    fireEvent.click(btn(/^Next/));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'try something new' } }); fireEvent.click(btn('Check'));
    fireEvent.click(btn('Finish the lesson'));
    expect(onDone).toHaveBeenCalledTimes(1);
    const r = onDone.mock.calls[0][0];
    expect(r.won).toBe(true);
    expect(r.mistakes).toEqual(['do camping', 'Last summer we ___ near a lake and slept in a tent.']);
    expect(r.score).toBe(5 + 10 + 10 + 5 + 10 + 10);
  });
});

// ---------- beats ----------
describe('beats', () => {
  const scene = find<BeatsScene>(B1_S01_E2, 'beats');
  it('validates; stress is written in capitals; the -ed/-ing partner keeps the stress', () => {
    expect(beatsScene.validate(scene)).toEqual([]);
    expect(markStress(['em', 'bar', 'rassed'], 1)).toBe('em·BAR·rassed');
    expect(isHold(HOLD_MS)).toBe(true); expect(isHold(HOLD_MS - 1)).toBe(false);
    const it0 = scene.items[0];
    expect(checkItem({ ...it0, syllables: ['em', 'bar', 'rasd'] }).join()).toMatch(/join into/);
    expect(checkItem({ ...it0, stressIndex: 5 }).join()).toMatch(/outside the word/);
    // the check is strict: the stressed syllable of the partner must be written the same (re-LAXED / re-LAX-ing is not a pair for this game)
    expect(checkItem({ word: 'relaxed', syllables: ['re', 'laxed'], stressIndex: 1, sentence: 'I felt relaxed.', pair: { word: 'relaxing', syllables: ['re', 'lax', 'ing'], sentence: 'It was relaxing.' } }).join()).toMatch(/stress must stay/);
    expect(beatsScene.validate({ ...scene, items: scene.items.map((i) => ({ ...i, pair: undefined })) } as BeatsScene).join()).toMatch(/partner/);
  });
  it('the false-friend note is in the student’s language when we have it, else generic', () => {
    const n = scene.items[0].l1Note;
    expect(noteFor(n, 'es')!.text).toMatch(/embarazada/);
    expect(noteFor(n, 'es-MX')!.own).toBe(true);
    expect(noteFor(n, 'en')!.own).toBe(false);
    expect(noteFor(n, undefined)!.text).toBe(n!.generic);
    expect(noteFor(scene.items[2].l1Note, 'es')).toBeUndefined();
    expect(noteFor({ generic: 'g', es: ' ' }, 'es')!.own).toBe(false);
  });
  it('says the word and the sentence of every item, and the partner word', () => {
    const lines = beatsScene.spoken(scene).map((l) => l.text);
    expect(lines).toEqual(expect.arrayContaining(['embarrassed', 'embarrassing', 'destination', 'Our destination was a small village.']));
  });
  it('full play of one word: wrong pad replays with the right pad lit, strong pad thumps, accent lane needs a hold (or a double tap), sentence, partner, note', async () => {
    vi.useFakeTimers();
    let now = 1000;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    const only: BeatsScene = { ...scene, items: scene.items.slice(0, 1) };
    const onDone = vi.fn();
    render(<beatsScene.view {...base} scene={only} onDone={onDone} />);
    fireEvent.click(btn(/^Start/));
    act(() => { vi.advanceTimersByTime(2000); });
    // wrong pad: it shrinks, the right pad is lit, the word replays
    fireEvent.click(btn('first: em'));
    expect(screen.getByText(/The strong part is the second one/)).toBeTruthy();
    expect(document.querySelectorAll('.av-bt-pad[data-hint]')).toHaveLength(1);
    expect(document.querySelectorAll('.av-bt-pad[data-soft]')).toHaveLength(1);
    fireEvent.click(btn('second: bar'));
    expect(document.querySelector('.av-bt-pad[data-strong]')).toBeTruthy();
    act(() => { vi.advanceTimersByTime(100); });
    expect(screen.getByText('Now tap every part in order. Hold the strong part a little longer.')).toBeTruthy();
    const pad = (n: number) => document.querySelectorAll('.av-bt-pad')[n] as HTMLElement;
    const tap = (n: number, ms: number) => { fireEvent.pointerDown(pad(n)); now += ms; fireEvent.pointerUp(pad(n)); now += 50; };
    tap(2, 10); // out of order
    expect(screen.getByText(/Tap the parts in order/)).toBeTruthy();
    tap(0, 10);
    tap(1, 100); // too short on the strong pad
    expect(screen.getByText(/\(or tap it twice\)/)).toBeTruthy();
    expect(document.querySelectorAll('.av-bt-pad[data-done]')).toHaveLength(1);
    tap(1, 100); // a second quick tap right after = a double tap, the tap-only way
    expect(document.querySelectorAll('.av-bt-pad[data-done]')).toHaveLength(2);
    tap(2, 10);
    act(() => { vi.advanceTimersByTime(100); });
    expect(screen.getByText(/I was/)).toBeTruthy();
    fireEvent.click(btn(/Got it/));
    // the partner word: the stress stays
    expect(screen.getByText('-ed / -ing partner')).toBeTruthy();
    fireEvent.click(btn('second: bar'));
    expect(screen.getByText(/Same strong part: em·BAR·rassed and em·BAR·rass·ing/)).toBeTruthy();
    fireEvent.click(btn(/^Next/));
    // the note (generic: the test runs in English)
    expect(screen.getByText('Careful: a false friend')).toBeTruthy();
    expect(screen.getByText(/Spanish embarazada means pregnant/)).toBeTruthy();
    fireEvent.click(btn('Finish the lesson'));
    expect(onDone).toHaveBeenCalledTimes(1);
    const r = onDone.mock.calls[0][0];
    expect(r.won).toBe(true);
    expect(r.mistakes).toEqual(['embarrassed']);
    expect(r.score).toBe(5 + 5 + 5);
    expect(screen.getByTestId('av-reward')).toBeTruthy();
  });
});

// ---------- switchboard ----------
describe('switchboard logic', () => {
  const ev = { verbBase: 'see', object: 'a whale' };
  const forms = { past: 'saw', participle: 'seen' };
  it('a marker decides the zone and the zone decides the form', () => {
    expect(zoneOf('last summer')).toBe('point'); expect(zoneOf('never')).toBe('cloud'); expect(zoneOf('so far')).toBe('cloud');
    expect(formFor('point')).toBe('past'); expect(formFor('cloud')).toBe('participle');
    for (const [m, text] of [['last summer', 'I saw a whale last summer.'], ['yesterday', 'I saw a whale yesterday.'], ['in 2019', 'I saw a whale in 2019.'], ['two years ago', 'I saw a whale two years ago.'],
      ['ever', 'Have you ever seen a whale?'], ['never', 'I have never seen a whale.'], ['so far', 'I have seen a whale so far.'], ['just', 'I have just seen a whale.']]) expect(sentenceOf(ev, forms, m)).toBe(text);
    expect(Object.keys(MARKERS)).toHaveLength(8);
  });
  it('the strip rewrites itself: blanks first, the marker next, the verb last', () => {
    expect(stripText(strip(ev, forms, null, null), null)).toBe('I … a whale ….');
    expect(strip(ev, forms, 'never', null).map((t) => t.kind)).toEqual(['text', 'marker', 'slot-verb', 'text']);
    expect(stripText(strip(ev, forms, 'never', 'seen'), 'never')).toBe('I have never seen a whale.');
    expect(stripText(strip(ev, forms, 'ever', null), 'ever')).toBe('Have you ever … a whale?');
  });
  it('judges a marker in the wrong zone, a marker the goal does not ask for, a wrong form and a wrong event zone', () => {
    expect(judgeMarker('never', 'point')).toEqual({ ok: false, why: 'zone', expected: 'cloud' });
    expect(judgeMarker('yesterday', 'point', ['last summer'])).toEqual({ ok: false, why: 'goal', expected: 'point' });
    expect(judgeMarker('last summer', 'point', ['last summer']).ok).toBe(true);
    expect(judgeVerb('point', 'participle').ok).toBe(false); expect(judgeVerb('cloud', 'participle').ok).toBe(true);
    const lv = B1_S01_E1.scenes.find((s) => s.id === 'switchboard') as unknown as SwitchboardScene;
    expect(judgeEvent(lv.levels[2] as ReverseLevel, 'point').ok).toBe(false);
    expect(judgeEvent(lv.levels[2] as ReverseLevel, 'cloud').ok).toBe(true);
  });
  it('the E1 levels validate; broken levels are caught', () => {
    const sc = find<SwitchboardScene>(B1_S01_E1, 'switchboard');
    expect(switchboardScene.validate(sc)).toEqual([]);
    const copy = () => JSON.parse(JSON.stringify(sc)) as SwitchboardScene;
    const a = copy(); (a.levels[0] as { forms: { past: string; participle: string } }).forms.participle = 'saw';
    expect(switchboardScene.validate(a).join()).toMatch(/two different forms/);
    const b = copy(); (b.levels[2] as { goalSentence: string }).goalSentence = 'I ate spicy noodles.';
    expect(switchboardScene.validate(b).join()).toMatch(/must use "eaten"/);
    const c = copy(); (c.levels[3] as { marker: { text: string; zone: 'point' | 'cloud' } }).marker = { text: 'never', zone: 'cloud' };
    expect(switchboardScene.validate(c).join()).toMatch(/ever" and "never" change/);
    const d = copy(); d.levels.pop();
    expect(switchboardScene.validate(d).join()).toMatch(/last level is free play/);
    expect(checkLevel({ mode: 'forward', goalSentence: 'Goal: say it.', event: { verbBase: 'see', object: 'a whale' }, marker: { text: 'never', zone: 'point' }, forms, hint: 'h' }, 'x').join()).toMatch(/belongs in the cloud/);
  });
  it('speaks the briefing and the finished sentence of each guided level', () => {
    const sc = find<SwitchboardScene>(B1_S01_E1, 'switchboard');
    expect(switchboardScene.spoken(sc).map((l) => l.text)).toEqual([sc.intro, 'I saw a whale last summer.', 'I have never flown across the world.', 'I have just eaten spicy noodles.', 'I took a photo in a cave two years ago.']);
  });
});

describe('switchboard play-through (tap to select, tap to place)', () => {
  const zone = (z: 'point' | 'cloud') => document.querySelector(`.av-sw-zone[data-zone="${z}"]`) as HTMLElement;
  const block = (text: string) => screen.getAllByRole('button').find((b) => b.classList.contains('av-sw-block') && b.textContent === text) as HTMLElement;
  it('all five levels: wrong zone and wrong form are explained and cost the gem, the sentence powers on, free play ends the scene', () => {
    const sc = find<SwitchboardScene>(B1_S01_E1, 'switchboard');
    const onDone = vi.fn();
    render(<switchboardScene.view {...base} scene={sc} onDone={onDone} />);
    fireEvent.click(btn(/^Start/));
    // level 1 (forward, point): the goal needs last summer
    fireEvent.click(block('yesterday')); fireEvent.click(zone('point'));
    expect(screen.getByText(/The goal needs “last summer”/)).toBeTruthy();
    fireEvent.click(block('last summer')); fireEvent.click(zone('cloud')); // wrong zone
    expect(screen.getByText(/names a finished time, so it goes in the finished past/)).toBeTruthy();
    expect(zone('point').getAttribute('data-ghost')).toBe('true'); // the ghost shows the right zone
    fireEvent.click(block('last summer')); fireEvent.click(zone('point'));
    expect(document.querySelector('.av-sw-pin')?.textContent).toBe('last summer');
    expect(document.querySelector('.av-sw-strip')!.textContent).toMatch(/last summer/);
    fireEvent.click(block('seen')); fireEvent.click(screen.getByRole('button', { name: 'Verb slot' })); // wrong form
    expect(screen.getByText(/A finished time needs the past simple: saw/)).toBeTruthy();
    fireEvent.click(block('saw')); fireEvent.click(screen.getByRole('button', { name: 'Verb slot' }));
    expect(screen.getByText('I saw a whale last summer.')).toBeTruthy();
    expect(document.querySelector('.av-sw-light')).toBeTruthy(); // the light runs along the timeline
    fireEvent.click(btn(/^Next/));
    // level 2 (forward, cloud) all right
    fireEvent.click(block('never')); fireEvent.click(zone('cloud'));
    fireEvent.click(block('flown')); fireEvent.click(screen.getByRole('button', { name: 'Verb slot' }));
    expect(screen.getByText('I have never flown across the world.')).toBeTruthy();
    fireEvent.click(btn(/^Next/));
    // level 3 (reverse, cloud): place the event in the wrong zone first, then the right one, then a marker that does not fit
    expect(screen.getAllByText('I have eaten spicy noodles.').length).toBeGreaterThan(0);
    const photo = () => document.querySelector('.av-sw-polaroid[data-cur] .av-sw-block') as HTMLElement;
    fireEvent.click(photo()); fireEvent.click(zone('point'));
    expect(screen.getByText(/has have \+ a participle and no date, so the event belongs in the cloud/)).toBeTruthy();
    fireEvent.click(photo()); fireEvent.click(zone('cloud'));
    fireEvent.click(block('last summer')); fireEvent.click(zone('point'));
    expect(screen.getByText(/does not fit the sentence/)).toBeTruthy();
    fireEvent.click(block('so far')); fireEvent.click(zone('cloud')); // alsoOk
    expect(screen.getByText('I have eaten spicy noodles so far.')).toBeTruthy();
    fireEvent.click(btn(/^Next/));
    // level 4 (reverse, point)
    fireEvent.click(photo()); fireEvent.click(zone('point'));
    fireEvent.click(block('in 2019')); fireEvent.click(zone('point'));
    expect(screen.getByText('I took a photo in a cave in 2019.')).toBeTruthy();
    fireEvent.click(btn(/^Next/));
    // level 5 (free play): two sentences of the student's own, the right pairing is enforced by the zones
    fireEvent.click(screen.getByRole('button', { name: /eat spicy noodles/ }));
    fireEvent.click(block('ever')); fireEvent.click(zone('cloud'));
    fireEvent.click(block('eaten')); fireEvent.click(screen.getByRole('button', { name: 'Verb slot' }));
    expect(screen.getByText('Have you ever eaten spicy noodles?')).toBeTruthy();
    fireEvent.click(btn(/^Next/));
    fireEvent.click(screen.getByRole('button', { name: /take a photo in a cave/ }));
    fireEvent.click(block('two years ago')); fireEvent.click(zone('point'));
    fireEvent.click(block('took')); fireEvent.click(screen.getByRole('button', { name: 'Verb slot' }));
    expect(screen.getByText('I took a photo in a cave two years ago.')).toBeTruthy();
    expect(onDone).not.toHaveBeenCalled();
    fireEvent.click(btn('Finish the lesson'));
    expect(onDone).toHaveBeenCalledTimes(1);
    const r = onDone.mock.calls[0][0];
    expect(r.won).toBe(true);
    expect(r.mistakes).toEqual(['last summer', 'last summer seen', 'eat spicy noodles']);
    expect(r.score).toBe(5 + 10 + 5 + 10 + 10 + 10);
  });
  it('a pointer drag onto a zone works like tap-to-place (the ghost follows, a drop outside bounces back)', () => {
    const sc = find<SwitchboardScene>(B1_S01_E1, 'switchboard');
    render(<switchboardScene.view {...base} scene={sc} onDone={vi.fn()} />);
    fireEvent.click(btn(/^Start/));
    const rect = (x: number, y: number, w = 100, h = 60) => ({ left: x, top: y, right: x + w, bottom: y + h, width: w, height: h, x, y, toJSON: () => ({}) }) as DOMRect;
    vi.spyOn(zone('point'), 'getBoundingClientRect').mockReturnValue(rect(0, 0, 300, 100));
    vi.spyOn(zone('cloud'), 'getBoundingClientRect').mockReturnValue(rect(300, 0, 200, 100));
    const b = block('last summer');
    fireEvent(b, new MouseEvent('pointerdown', { bubbles: true, clientX: 50, clientY: 400, button: 0 }));
    fireEvent(window, new MouseEvent('pointermove', { clientX: 120, clientY: 300 }));
    fireEvent(window, new MouseEvent('pointermove', { clientX: 120, clientY: 50 }));
    expect(document.querySelector('.av-sw-ghost')).toBeTruthy();
    fireEvent(window, new MouseEvent('pointerup', { clientX: 120, clientY: 50 }));
    expect(document.querySelector('.av-sw-pin')?.textContent).toBe('last summer');
    expect(document.querySelector('.av-sw-ghost')).toBeNull();
  });
});

// ---------- wiring in the lessons, cast art, responses ----------
describe('Wave 2 wiring in B1 Season 1', () => {
  const ids = (l: typeof B1_S01_E1) => l.scenes.map((s) => s.id);
  it('E1: the switchboard sits after the rule and before the production games and the Mission, and trains criterion 4', () => {
    const i = ids(B1_S01_E1);
    expect(i.indexOf('switchboard')).toBe(i.indexOf('rule') + 1);
    expect(i.indexOf('switchboard')).toBeLessThan(i.indexOf('build'));
    expect(i.indexOf('switchboard')).toBeLessThan(i.indexOf('mission'));
    expect(find<{ id: string; trains: number[] }>(B1_S01_E1, 'switchboard').trains).toEqual([4]);
    expect(validateScript(B1_S01_E1)).toEqual([]);
  });
  it('E2: the workshop follows the chunk teach page, beats is in the Energiser part, the finder comes before the Mission speak scene; all validate', () => {
    const i = ids(B1_S01_E2);
    expect(i.indexOf('workshop')).toBe(i.indexOf('teach-c') + 1);
    expect(B1_S01_E2.scenes.find((s) => s.id === 'beats')!.part).toBe(4);
    expect(i.indexOf('finder')).toBe(i.indexOf('take') - 1);
    expect(find<{ id: string; trains: number[] }>(B1_S01_E2, 'workshop').trains).toEqual([3]);
    expect(find<{ id: string; trains: number[] }>(B1_S01_E2, 'beats').trains).toEqual([1, 5]);
    expect(find<{ id: string; trains: number[] }>(B1_S01_E2, 'finder').trains).toEqual([4]);
    expect(validateScript(B1_S01_E2)).toEqual([]);
    // the rule is still before every production game of its part and later
    const kinds = B1_S01_E2.scenes.map((s) => s.kind);
    expect(kinds.indexOf('rule')).toBeLessThan(i.indexOf('workshop'));
    // every criterion is still trained, and every scene is on a plate
    for (let c = 1; c <= B1_S01_E2.criteria.length; c++) expect(B1_S01_E2.scenes.some((s) => s.trains?.includes(c))).toBe(true);
    expect(B1_S01_E2.scenes.filter((s) => !s.plate)).toEqual([]);
    expect(B1_S01_E2.partMinutes.reduce((a, b) => a + b, 0)).toBe(60);
  });
  it('the four kinds are registered, scored games and encounters (stinger); the workshop shelf drops a trophy', () => {
    for (const k of ['finder', 'workshop', 'beats', 'switchboard']) {
      expect(SCENES[k]).toBeTruthy();
      expect(SCORED_KINDS.has(k)).toBe(true);
      expect([...ENCOUNTER_KINDS]).toContain(k);
    }
    expect(potentialLoot(B1_S01_E2).some((x) => x.kind === 'trophy' && x.sceneId === 'workshop')).toBe(true);
  });
  it('the four games open with a stinger the first time, once', () => {
    for (const [lesson, id, label] of [[B1_S01_E2, 'finder', 'POSTCARD FINDER'], [B1_S01_E2, 'workshop', 'CHUNK WORKSHOP'], [B1_S01_E2, 'beats', 'STRESS BEATS'], [B1_S01_E1, 'switchboard', 'TIMELINE SWITCHBOARD']] as const) {
      const sc = lesson.scenes.find((x) => x.id === id)!;
      const f = advanceFlow(initialFlow([sc.part]), sc, true, []);
      expect(f.queue.map((q) => q.type)).toEqual(['stinger']);
      const { unmount } = render(<Stinger kind={sc.kind as 'finder'} title="T" calm onDone={() => {}} />);
      expect(screen.getByText(label)).toBeTruthy();
      unmount();
    }
  });
  it('voice lines have no digits or symbols the voice cannot say', () => {
    for (const l of [B1_S01_E1, B1_S01_E2]) for (const x of spokenLines(l)) expect(x.text, x.text).not.toMatch(/[0-9_/\\=+*#@<>{}[\]|~^]/);
  });
});

describe('minimum-path student responses per lesson (owner target: Lesson 2 at least 80 per hour)', () => {
  const total = (l: typeof B1_S01_E1) => lessonResponses(l).total;
  it('counts each scene the same way a person would', () => {
    expect(responsesOf(find(B1_S01_E2, 'finder'))).toBe(7);        // find 1, build 3 + 1 send, taboo 1 + 1
    expect(responsesOf(find(B1_S01_E2, 'workshop'))).toBe(9);      // 3 items x (2 picks + 1 sentence)
    expect(responsesOf(find(B1_S01_E2, 'beats'))).toBe(13);        // 5 words x 2 + 3 partners
    expect(responsesOf(find(B1_S01_E1, 'switchboard'))).toBe(12);  // 4 levels x 2 + 2 free sentences x 2
    expect(responsesOf({ id: 'x', part: 0, kind: 'lobby' })).toBe(0);
  });
  it('fails if a lesson drops below its response count', () => {
    expect(total(B1_S01_E1)).toBeGreaterThanOrEqual(100);
    expect(total(B1_S01_E2)).toBeGreaterThanOrEqual(80);
    expect(total(B1_S01_E3)).toBeGreaterThanOrEqual(80);
  });
});

describe('cast portraits the scenes show are on the art register', () => {
  it('every cast portrait a scene can show is reviewed, and the table covers the moods the views use', () => {
    for (const l of [B1_S01_E1, B1_S01_E2, B1_S01_E3]) {
      for (const a of artOf(l).all.filter((x) => x.startsWith('cast/'))) expect(ART_REVIEW[a], a).toBeTruthy();
    }
    expect(castArtOf(find(B1_S01_E2, 'finder'))).toEqual(expect.arrayContaining(['cast/ava/thinking', 'cast/ava/happy', 'cast/ava/curious']));
    expect(castArtOf(find(B1_S01_E2, 'beats')).every((a) => a.startsWith('cast/theo/'))).toBe(true);
  });
  it('every mood a view can put on its character (useReactor base, hold(), cheer = happy, flinch = curious, surprise = surprised) is listed for its kind', () => {
    const dir = path.resolve(__dirname, '../scenes');
    const uncovered: string[] = [];
    for (const kind of Object.keys(SCENES)) {
      const dirs = fs.readdirSync(dir).filter((d) => fs.statSync(path.join(dir, d)).isDirectory() && d === kind);
      for (const d of dirs) for (const f of fs.readdirSync(path.join(dir, d)).filter((x) => x.endsWith('.tsx'))) {
        const src = fs.readFileSync(path.join(dir, d, f), 'utf8');
        const base0 = /useReactor\('(\w+)'\)/.exec(src)?.[1];
        if (!base0) continue;
        const moods = new Set<string>([base0]);
        for (const m of src.matchAll(/hold\('(\w+)'/g)) moods.add(m[1]);
        if (/\.cheer\(/.test(src)) moods.add('happy');
        if (/\.flinch\(/.test(src)) moods.add('curious');
        if (/\.surprise\(/.test(src)) moods.add('surprised');
        const fake = { id: 'x', part: 0, kind, who: 'Vee', npc: 'Vee', witness: 'Vee', chief: 'Vee', partner: 'Vee', guest: 'Vee', personas: [], look: 'friends' };
        const listed = new Set(castArtOf(fake as never).map((a) => a.split('/')[2]));
        for (const m of moods) if (!listed.has(m)) uncovered.push(`${kind}: ${m}`);
      }
    }
    expect(uncovered).toEqual([]);
  });
});
