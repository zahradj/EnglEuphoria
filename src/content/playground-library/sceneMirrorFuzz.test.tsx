import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { ComponentType } from 'react';
import type { ActivitySync } from './sceneActivitySync';

// The global test setup's supabase mock lacks these two exports, which the
// audio layer reads at import time.
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { getUser: async () => ({ data: { user: null } }) }, from: () => ({ insert: async () => ({}), select: () => ({}) }), functions: { invoke: async () => ({}) } },
  supabaseUrl: 'http://localhost',
  supabaseAnonKey: 'anon',
}));
// Audio / sfx are not what's under test and need real browser audio APIs.
vi.mock('@/content/playground-library/unit1/audio', async (importActual) => {
  const actual = await importActual<Record<string, unknown>>();
  return Object.fromEntries(Object.entries(actual).map(([k, v]) => [k, typeof v === 'function' ? vi.fn(async () => {}) : v]));
});
vi.mock('@/content/playground-library/unit1/sfx', async (importActual) => {
  const actual = await importActual<Record<string, unknown>>();
  return Object.fromEntries(Object.entries(actual).map(([k, v]) => [k, typeof v === 'function' ? vi.fn(() => {}) : v]));
});

import { SceneRenderer as Unit1Renderer } from './unit1/SceneRenderer';
import { SceneRenderer as WtRenderer } from './welcome-town/SceneRenderer';
import * as unit1 from './unit1/scenes';
import * as wt from './welcome-town/scenes';
import * as wtA2 from './welcome-town-a2/scenes';
import * as castle from './magic-castle/scenes';
import * as jungle from './jungle-adventure/scenes';
import { LIBRARY_GAMES } from './gamesCatalog';
import { gameToScenes } from './gameLessons';

type AnyScene = { id: string; kind: string };
const lessonsOf = (mod: Record<string, unknown>) =>
  Object.entries(mod).filter(([k, v]) => /^LESSON_.*_SCENES$/.test(k) && Array.isArray(v)) as [string, AnyScene[]][];

// Playground GAMES run in the classroom through the same scene players, so they get the same guarantee.
const gameLessons = LIBRARY_GAMES.map((g) => [`GAME_${g.id}`, gameToScenes(g) as unknown as AnyScene[]] as [string, AnyScene[]]);

const ENGINES: { name: string; Renderer: ComponentType<any>; lessons: [string, AnyScene[]][] }[] = [
  { name: 'unit1 (Pre-A1)', Renderer: Unit1Renderer, lessons: lessonsOf(unit1) },
  { name: 'welcome-town (A1)', Renderer: WtRenderer, lessons: lessonsOf(wt) },
  { name: 'welcome-town-a2 (A2)', Renderer: WtRenderer, lessons: lessonsOf(wtA2) },
  { name: 'magic-castle (A1 U9)', Renderer: WtRenderer, lessons: lessonsOf(castle) },
  { name: 'jungle (A1 U2)', Renderer: WtRenderer, lessons: lessonsOf(jungle) },
  { name: 'games in the classroom library (Welcome Town player)', Renderer: WtRenderer, lessons: gameLessons },
  { name: 'games in the classroom library (Pre-A1 player)', Renderer: Unit1Renderer, lessons: gameLessons },
];

/** What a student's mirror can be handed that is NOT the scene's own state:
 *  nothing yet, an empty/partial/older snapshot, a snapshot shaped like some
 *  other scene kind, a wrong primitive, and wildly out-of-range indices. */
const HOSTILE: [string, unknown][] = [
  ['null (no snapshot yet)', null],
  ['{} (empty)', {}],
  ['[] (array)', []],
  ['"x" (string)', 'x'],
  ['42 (number)', 42],
  ['other-scene shape A', { step: 3, revealed: true }],
  ['other-scene shape B', { roundIdx: 2, picked: 'x', correct: false }],
  ['other-scene shape C', { idx: 4, heard: true, repeated: false }],
  ['other-scene shape D', { round: 1, filledCount: 1, wrongIdx: null, gemDone: false, order: [1, 0] }],
  // Valid mid-interaction states: the branches that only run once a student has tapped something.
  ['mid-interaction (first item tapped)', { active: 0, opened: [0], tapped: [0], found: [0], flipped: [0], matched: [0], talkingIdx: 0, round: 0, roundIdx: 0, idx: 0, step: 1, turnIdx: 1, picked: 0, selected: 0, filledCount: 1, gemDone: false }],
  ['mid-interaction (second item tapped)', { active: 1, opened: [0, 1], tapped: [0, 1], found: [0, 1], flipped: [0, 1], matched: [0, 1], talkingIdx: 1, round: 1, roundIdx: 1, idx: 1, step: 2, turnIdx: 2, picked: 1, selected: 1, filledCount: 2, gemDone: true }],
  ['indices far out of range', { round: 999, roundIdx: 999, idx: 999, step: 999, turnIdx: 999, turn: 999, page: 999, qIdx: 999, order: [], found: [], flipped: [], matched: [] }],
  ['fields set to null', { round: null, roundIdx: null, idx: null, step: null, turnIdx: null, order: null, found: null, picked: null, flipped: null, matched: null }],
];

const mirror = (state: unknown): ActivitySync => ({ isSynced: true, isAuthority: false, state, setState: () => {} });

function tryRender(Renderer: ComponentType<any>, scene: AnyScene, sync: ActivitySync | undefined): string | null {
  try {
    const { unmount } = render(
      <Renderer scene={scene} onWin={() => {}} onLose={() => {}} onNext={() => {}} onRestart={() => {}} gemsCollected={0} heartsRemaining={3} lessonNumber={1} activitySync={sync} />,
    );
    unmount();
    return null;
  } catch (e) {
    return (e as Error).message;
  }
}

// jsdom lacks these browser APIs; scenes feature-detect them in real browsers.
class RO { observe() {} unobserve() {} disconnect() {} }
(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver ??= RO;

describe('student mirror: no scene may crash on a bad snapshot', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});

  for (const { name, Renderer, lessons } of ENGINES) {
    it(`${name}: every scene survives hostile snapshots`, () => {
      const failures: string[] = [];
      for (const [lessonName, scenes] of lessons) {
        for (const scene of scenes) {
          // Baseline: the scene must render solo with its own data. (A failure here is
          // a data/renderer bug that would crash for everyone, not just a mirror.)
          const base = tryRender(Renderer, scene, undefined);
          if (base !== null) { failures.push(`${lessonName} › ${scene.id} [${scene.kind}] solo render: ${base}`); continue; }
          for (const [label, snap] of HOSTILE) {
            const err = tryRender(Renderer, scene, mirror(snap));
            if (err) failures.push(`${lessonName} › ${scene.id} [${scene.kind}] with ${label}: ${err}`);
          }
        }
      }
      expect(failures, `\n${failures.slice(0, 40).join('\n')}\n(${failures.length} total)`).toEqual([]);
    }, 240_000);
  }
});
