// @vitest-environment jsdom
import '@/lib/i18n';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { StageIntro, Stinger, Toasts } from '../quest/Cinematics';
import { QuestMap } from '../quest/QuestMap';
import { Bag, QuestLog } from '../quest/Panels';
import { QuestButtons, RankChip, StreakChip } from '../quest/Hud';
import { huntScene, type HuntScene } from '../scenes/hunt/Hunt';
import { wrapScene, type WrapScene } from '../scenes/wrap/Wrap';
import { LessonPlayer } from '../LessonPlayer';
import { SCENES } from '../scenes/registry';
import { initialState, lessonReducer } from '../engine/lessonReducer';
import { levelOf, objectivesOf, potentialLoot, recapOf, stagesOf } from '../engine/quest';
import { lessonMeta } from '../shell/lessonMeta';
import type { LessonScript, SceneBase, SceneProps } from '../types';

vi.mock('../services/voice', () => ({ sayLine: vi.fn(async () => false), saySequence: vi.fn(async () => undefined), setMuted: vi.fn(), stopVoice: vi.fn() }));
beforeEach(() => { window.localStorage.clear(); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

const sc = (o: Record<string, unknown> & { id: string; part: number; kind: string }) => o as SceneBase;
const script: LessonScript = {
  blueprintId: 'B1-S01-E1', title: 'T', criteria: ['I can follow a blog post.', 'I understood the six new words.'], cast: ['Vee'], partMinutes: [3, 3, 21, 11, 3, 10, 5, 4],
  scenes: [
    sc({ id: 'l', part: 0, kind: 'lobby' }),
    sc({ id: 't1', part: 2, kind: 'teach', trains: [2], pages: [{ word: 'dare', art: 'b-dare' }, { word: 'tick it off', art: 'b-tick' }] }),
    sc({ id: 'c1', part: 3, kind: 'choice', trains: [1], title: 'Check' }),
    sc({ id: 'w', part: 7, kind: 'wrap' }),
  ],
};
const meta = lessonMeta(script);
const stages = stagesOf(script, []);
const objectives = objectivesOf(script, []);

describe('stage title card', () => {
  it('shows "QUEST STAGE n / 8", the title, the goal, the stage objectives and the loot; a tap continues', () => {
    const onDone = vi.fn();
    render(<StageIntro script={script} stage={stages[2]} objectives={objectives} calm={false} onDone={onDone} />);
    expect(screen.getByText(/QUEST STAGE 3 \/ 8/)).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'The Drop' })).toBeTruthy();
    expect(screen.getByText(/The understood|understood the six new words/i)).toBeTruthy();
    expect(screen.getByText(/2 Word Cards/)).toBeTruthy();
    fireEvent.click(screen.getByTestId('avq-intro'));
    expect(onDone).toHaveBeenCalledTimes(1);
  });
  it('continues by itself after a moment, and on Enter or Escape; the lesson can rename its stages', () => {
    vi.useFakeTimers();
    const onDone = vi.fn();
    const named = { ...script, quest: { stages: [{}, {}, { title: 'The Dare', goal: 'Hear the dare.' }] } };
    render(<StageIntro script={named} stage={stages[2]} objectives={objectives} calm={false} onDone={onDone} />);
    expect(screen.getByRole('heading', { name: 'The Dare' })).toBeTruthy();
    fireEvent.keyDown(screen.getByTestId('avq-intro'), { key: 'Escape' });
    expect(onDone).toHaveBeenCalledTimes(1);
    act(() => { vi.advanceTimersByTime(3000); });
    expect(onDone).toHaveBeenCalledTimes(2);
  });
});

describe('encounter stinger', () => {
  it('frames a boss as a boss fight and ends on a tap', () => {
    const onDone = vi.fn();
    render(<Stinger kind="boss" title="Break the Clock!" calm={false} onDone={onDone} />);
    expect(screen.getByText('BOSS FIGHT')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Break the Clock!' })).toBeTruthy();
    fireEvent.click(screen.getByTestId('avq-stinger'));
    expect(onDone).toHaveBeenCalled();
  });
});

describe('toasts', () => {
  it('a level-up toast names the level and rank and removes itself', () => {
    vi.useFakeTimers();
    const gone = vi.fn();
    render(<Toasts toasts={[{ id: 1, kind: 'level', title: 'Level up!', sub: 'LV 2 · Explorer' }]} level={levelOf(80)} onGone={gone} />);
    expect(screen.getByText('Level up!')).toBeTruthy();
    expect(screen.getByText('LV 2 · Explorer')).toBeTruthy();
    act(() => { vi.advanceTimersByTime(3500); });
    expect(gone).toHaveBeenCalledWith(1);
  });
});

describe('quest map', () => {
  it('draws 8 nodes (done / now / locked), the token, the Season chapter and the next stage teaser', () => {
    const onClose = vi.fn();
    render(<QuestMap script={script} meta={meta} stages={stages} part={2} walk={{ from: 1, to: 2 }} calm artBase="/a" onClose={onClose} />);
    const nodes = document.querySelectorAll('.avq-node');
    expect(nodes).toHaveLength(8);
    // calm: the token is simply at the next node, which is now "now"
    expect([...nodes].map((n) => n.getAttribute('data-state'))).toEqual(['done', 'done', 'now', 'todo', 'todo', 'todo', 'todo', 'todo']);
    expect(screen.getByText(/Chapter 1 of 8/)).toBeTruthy();
    expect(screen.getByText(/Up next · stage 3/)).toBeTruthy();
    expect(document.querySelector('.avq-token img')?.getAttribute('src')).toBe('/a/cast/vee/happy.webp');
    fireEvent.click(screen.getByRole('button', { name: /Go/ }));
    expect(onClose).toHaveBeenCalled();
  });
  it('opened from the HUD it shows where you are and goes back to the lesson', () => {
    const onClose = vi.fn();
    render(<QuestMap script={script} meta={meta} stages={stages} part={3} calm artBase="/a" onClose={onClose} />);
    expect(document.querySelectorAll('.avq-node')[3].getAttribute('data-state')).toBe('now');
    expect(screen.getByText(/You are here · stage 4/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Back to the lesson/ }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('quest log, bag and HUD pieces', () => {
  it('the log lists the objectives (ticked when complete), the 8 stages and opens the map', () => {
    const done = objectivesOf(script, ['t1']);
    const onMap = vi.fn(); const onClose = vi.fn();
    render(<QuestLog script={script} meta={meta} stages={stagesOf(script, ['t1'])} objectives={done} part={3} level={levelOf(0)} streak={0} onClose={onClose} onMap={onMap} />);
    const items = screen.getByTestId('avq-objectives').querySelectorAll('li');
    expect([...items].map((li) => li.hasAttribute('data-done'))).toEqual([false, true]);
    expect(document.querySelectorAll('.avq-stages li')).toHaveLength(8);
    fireEvent.click(screen.getByText(/Open the quest map/));
    expect(onMap).toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
  it('the bag shows earned loot and silhouettes for the empty slots', () => {
    let s = initialState(script.scenes.length);
    s = lessonReducer(s, { type: 'done', id: 't1' });
    const loot = recapOf(script, s).loot;
    render(<Bag loot={loot} potential={potentialLoot(script)} artBase="/a" onClose={() => undefined} />);
    expect(screen.getByText(/2 of 3 collected/)).toBeTruthy();
    expect(screen.getByTestId('avq-cards').querySelectorAll('li[data-have]')).toHaveLength(2);
    expect(screen.getByTestId('avq-gems').querySelectorAll('li')).toHaveLength(1);
    expect(screen.getByTestId('avq-gems').querySelectorAll('li[data-have]')).toHaveLength(0);
  });
  it('rank chip: level, rank name and an XP progress bar; streak chip only from 2', () => {
    const { rerender } = render(<><RankChip level={levelOf(100)} xp={100} /><StreakChip streak={1} /></>);
    expect(screen.getByText('Explorer')).toBeTruthy();
    expect(screen.getByRole('progressbar', { name: 'XP' }).getAttribute('aria-valuenow')).toBe(String(Math.round(levelOf(100).fill * 100)));
    expect(document.querySelector('.avq-streak')).toBeNull();
    rerender(<><RankChip level={levelOf(100)} xp={100} /><StreakChip streak={4} /></>);
    expect(screen.getByLabelText('Streak 4')).toBeTruthy();
  });
  it('the quest buttons show progress and the bag count, and open the panels', () => {
    const onLog = vi.fn(); const onBag = vi.fn(); const onMap = vi.fn();
    render(<QuestButtons objective={objectives[0]} objectives={objectives} bagCount={3} bagKey={0} onLog={onLog} onMap={onMap} onBag={onBag} />);
    expect(screen.getByTestId('avq-track').textContent).toMatch(/0\/2.*Follow a blog post/);
    fireEvent.click(screen.getByTestId('avq-track')); fireEvent.click(screen.getByTestId('avq-bagbtn')); fireEvent.click(screen.getByTestId('avq-mapbtn'));
    expect([onLog, onBag, onMap].every((f) => f.mock.calls.length === 1)).toBe(true);
    expect(screen.getByTestId('avq-bagbtn').textContent).toBe('3');
  });
});

const huntScript: HuntScene = {
  id: 'h', part: 2, kind: 'hunt', plate: 'bucket-list-wall', title: 'Hunt', who: 'Vee', intro: 'Find them.',
  targets: [
    { id: 'a', label: 'the board', word: 'bucket list', clue: 'Find the board.', reveal: 'bucket list: a list.', x: 30, y: 20, w: 30, h: 30 },
    { id: 'b', label: 'the window', clue: 'Find the window.', x: 0, y: 0, w: 20, h: 40 },
    { id: 'c', label: 'the flags', clue: 'Find the flags.', x: 60, y: 2, w: 30, h: 12 },
  ],
  decoys: [{ label: 'the plant', x: 76, y: 60, w: 10, h: 30 }],
};
const baseProps = { script: { criteria: ['I can'] } as never, artBase: '/a', calm: true, seed: 1, summary: { xp: 0, gems: 0, mistakes: [] } };
const spots = () => [...document.querySelectorAll<HTMLButtonElement>('.av-hunt-spot')];
const spotAt = (x: number) => spots().find((b) => b.style.left.startsWith(`${x}%`))!;

describe('hunt scene: the plate is the board', () => {
  it('validates: a plate, 3-7 targets, hotspots inside the plate', () => {
    expect(huntScene.validate(huntScript)).toEqual([]);
    expect(huntScene.validate({ ...huntScript, plate: undefined }).join()).toMatch(/needs a plate/);
    expect(huntScene.validate({ ...huntScript, targets: huntScript.targets.slice(0, 2) }).join()).toMatch(/3-7 targets/);
    expect(huntScene.validate({ ...huntScript, targets: [{ ...huntScript.targets[0], x: 90 }, ...huntScript.targets.slice(1)] }).join()).toMatch(/outside the plate/);
  });
  it('hotspots are real buttons with a 44px minimum, labelled without giving the answer away', () => {
    render(<huntScene.view {...baseProps} scene={huntScript} onDone={() => undefined} />);
    expect(spots()).toHaveLength(4);
    for (const b of spots()) { expect(b.tagName).toBe('BUTTON'); expect(b.style.width).toContain('44px'); expect(b.getAttribute('aria-label')).toBe('Look here'); }
  });
  it('a wrong tap is a gentle explained shimmer (no penalty, no mistake); the right tap finds it, reports it and moves on', () => {
    const onFound = vi.fn(); const onDone = vi.fn();
    render(<huntScene.view {...baseProps} scene={huntScript} onDone={onDone} onFound={onFound} />);
    fireEvent.click(spotAt(10)); // the window: another thing
    expect(screen.getByText(/That is another thing: the window\. Read the clue again\./)).toBeTruthy();
    expect(document.querySelector('.av-hunt-ripple')).toBeTruthy();
    fireEvent.click(spotAt(81)); // the plant (a decoy)
    expect(screen.getByText(/That is the plant/)).toBeTruthy();
    fireEvent.click(screen.getByTestId('av-hunt-board')); // empty plate
    expect(screen.getByText(/Nothing here\. Look again\./)).toBeTruthy();
    expect(onFound).not.toHaveBeenCalled();
    fireEvent.click(spotAt(45)); // the board
    expect(onFound).toHaveBeenCalledWith('a', expect.anything());
    expect(screen.getByText(/Clue 2 of 3/)).toBeTruthy();
    expect(screen.getAllByText('bucket list: a list.').length).toBeGreaterThan(0);
    expect(onDone).not.toHaveBeenCalled();
  });
  it('after four misses the target gets a ring; "Show me" is free but costs the gem; finishing reports every find', () => {
    const onDone = vi.fn(); const onFound = vi.fn();
    render(<huntScene.view {...baseProps} scene={huntScript} onDone={onDone} onFound={onFound} />);
    for (let i = 0; i < 2; i++) fireEvent.click(screen.getByTestId('av-hunt-board'));
    expect(spotAt(45).getAttribute('data-hint')).toBe('1');
    for (let i = 0; i < 2; i++) fireEvent.click(screen.getByTestId('av-hunt-board'));
    expect(spotAt(45).getAttribute('data-hint')).toBe('2');
    fireEvent.click(screen.getByText(/Show me/));
    fireEvent.click(spotAt(45)); fireEvent.click(spotAt(10)); fireEvent.click(spotAt(75)); // the flags are at 60 + 15 = 75%
    expect(onFound).toHaveBeenCalledTimes(3);
    expect(onDone).toHaveBeenCalledWith({ won: true, score: 30, gem: false, mistakes: [], found: ['a', 'b', 'c'] });
  });
  it('a clean hunt keeps the gem', () => {
    const onDone = vi.fn();
    render(<huntScene.view {...baseProps} scene={huntScript} onDone={onDone} />);
    fireEvent.click(spotAt(45)); fireEvent.click(spotAt(10)); fireEvent.click(spotAt(75));
    expect(onDone.mock.calls[0][0].gem).toBe(true);
    expect(onDone.mock.calls[0][0].mistakes).toEqual([]);
  });
  it('says its clues with the recorded voice and lists the Word Card art it uses', () => {
    expect(huntScene.spoken(huntScript).map((l) => l.text)).toEqual(['Find them. Find the board.', 'Find the window.', 'Find the flags.']);
    expect(huntScene.art?.({ ...huntScript, targets: [{ ...huntScript.targets[0], art: 'b-dare' }] })).toEqual(['cards/b-dare']);
  });
});

describe('Quest Complete (the Wrap)', () => {
  const w: WrapScene = { id: 'w', part: 7, kind: 'wrap', heading: 'Cold open complete!', teachBack: 'Been or gone?' };
  it('shows stars, rank, loot, ticked objectives and a LOCKED Season clue that unlocks after the teach-back', () => {
    let s = initialState(script.scenes.length);
    s = lessonReducer(lessonReducer(s, { type: 'done', id: 't1' }), { type: 'done', id: 'c1', result: { won: true, score: 20 } });
    const onDone = vi.fn();
    render(<wrapScene.view {...baseProps} script={{ ...script, quest: { clue: 'The class has a dare.' } }} scene={w} onDone={onDone} summary={{ xp: s.xp, gems: s.gems, mistakes: ['I have went'], quest: recapOf(script, s) }} />);
    expect(screen.getByText('QUEST COMPLETE')).toBeTruthy();
    expect(screen.getByText('Cold open complete!')).toBeTruthy();
    expect(screen.getByTestId('av-qc-loot').querySelectorAll('img')).toHaveLength(2);
    expect(screen.getByText('2/2', { selector: 'h3 b' })).toBeTruthy();
    expect(screen.getByText(/Season clue · 1 of 8/)).toBeTruthy();
    expect(screen.getByText(/Say the rule back to unlock it/)).toBeTruthy();
    expect(screen.getByText(/Coming up: chapter 2/)).toBeTruthy();
    fireEvent.click(screen.getByText(/Say it out loud/));
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(screen.getByText('The class has a dare.')).toBeTruthy();
    expect(screen.getByTestId('av-clue').hasAttribute('data-unlocked')).toBe(true);
  });
});

describe('the quest layer inside the player', () => {
  interface TestScene extends SceneBase { kind: 'test' }
  function TestView({ onDone, scene }: SceneProps<TestScene>) { return <button type="button" onClick={() => onDone({ won: true, score: 10 })}>win {scene.id}</button>; }
  const lesson: LessonScript = {
    blueprintId: 'B1-S01-E1', title: 'Test', criteria: ['I can test'], cast: ['Vee'], partMinutes: [5, 8, 8, 8, 8, 8, 8, 7],
    scenes: [{ id: 'l', part: 0, kind: 'lobby' } as SceneBase, { id: 't1', part: 1, kind: 'test', trains: [1] }, { id: 't2', part: 2, kind: 'test' }],
  };
  beforeEach(() => { SCENES.test = { view: TestView, spoken: () => [], validate: () => [] }; });
  afterEach(() => { delete SCENES.test; });

  it('a new stage plays its title card over the plate, then the scene; the HUD tracks the objective', () => {
    render(<LessonPlayer script={lesson} ephemeral />);
    fireEvent.click(screen.getByText(/Start the mission/));
    expect(screen.getByTestId('avq-intro')).toBeTruthy();
    expect(screen.getByText(/QUEST STAGE 2 \/ 8/)).toBeTruthy();
    expect(screen.getByTestId('avq-track').textContent).toMatch(/0\/1/);
    fireEvent.click(screen.getByTestId('avq-intro'));
    expect(screen.queryByTestId('avq-intro')).toBeNull();
    fireEvent.click(screen.getByText('win t1'));
    expect(screen.getByText('Objective complete')).toBeTruthy();
    expect(screen.getByTestId('avq-track').textContent).toMatch(/1\/1/);
    expect(screen.getByRole('progressbar', { name: 'XP' })).toBeTruthy();
  });
  it('leaving a stage plays the quest map, then the next title card', () => {
    render(<LessonPlayer script={lesson} ephemeral />);
    fireEvent.click(screen.getByText(/Start the mission/));
    fireEvent.click(screen.getByTestId('avq-intro'));
    fireEvent.click(screen.getByText('win t1'));
    fireEvent.click(screen.getByText(/Next/));
    expect(screen.getByTestId('avq-map')).toBeTruthy();
    expect(document.querySelectorAll('.avq-node')).toHaveLength(8);
    fireEvent.click(screen.getByRole('button', { name: /Go/ }));
    expect(screen.getByText(/QUEST STAGE 3 \/ 8/)).toBeTruthy();
  });
  it('the bag and the quest log open from the HUD and close with Escape', () => {
    render(<LessonPlayer script={lesson} ephemeral />);
    fireEvent.click(screen.getByTestId('avq-bagbtn'));
    expect(screen.getByRole('dialog', { name: 'Bag' })).toBeTruthy();
    fireEvent.keyDown(screen.getByRole('dialog', { name: 'Bag' }), { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'Bag' })).toBeNull();
    fireEvent.click(screen.getByTestId('avq-track'));
    expect(screen.getByRole('dialog', { name: 'Quest log' })).toBeTruthy();
  });
  it('a live class has no cinematics (the teacher moves, the student follows) but keeps the HUD', () => {
    render(<LessonPlayer script={lesson} role="student" index={1} ephemeral />);
    expect(screen.queryByTestId('avq-intro')).toBeNull();
    expect(screen.getByTestId('avq-track')).toBeTruthy();
    cleanup();
    render(<LessonPlayer script={lesson} role="teacher" index={2} onIndex={() => undefined} ephemeral />);
    expect(screen.queryByTestId('avq-map')).toBeNull();
  });
  it('quest panels are local to a screen (not mirrored in a live class)', () => {
    render(<LessonPlayer script={lesson} ephemeral />);
    for (const id of ['avq-track', 'avq-bagbtn', 'avq-mapbtn']) expect(screen.getByTestId(id).hasAttribute('data-av-local'), id).toBe(true);
  });
});
