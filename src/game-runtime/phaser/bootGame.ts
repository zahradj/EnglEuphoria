/**
 * bootGame — sole entry point from React into Phaser.
 *
 * Accepts a CompiledLesson (NOT raw JSON) and a host element. Returns a
 * handle the host can use to tear down or subscribe to engine events,
 * including the moment lifecycle.
 */
import Phaser from 'phaser';
import type { CompiledLesson, MomentKind, SceneResult } from '../engine/types';
import { EngineEvents } from '../engine/events';
import { SceneRouter } from './SceneRouter';
import { DEFAULT_PALETTE, type ScenePalette } from './scenes/BaseScene';
import { WorldScene, WORLD_SCENE_KEY, pickWorldForLesson } from './world';
import { MapScene, MAP_SCENE_KEY } from './map';
import { SoundScape } from './audio';
import { Announcer, setupCanvasA11y } from './a11y';
import { setupTouchHost } from './touch';
import { attachTeacherAnalytics, type TeacherAnalyticsContext } from './analytics';

export interface BootHooks {
  onSceneStart?: (index: number) => void;
  onSceneComplete?: (result: SceneResult) => void;
  onMomentStart?: (m: { index: number; total: number; kind: MomentKind; id: string }) => void;
  onMomentComplete?: (m: { index: number; kind: MomentKind; id: string }) => void;
  onLessonComplete?: (results: SceneResult[]) => void;
  onError?: (message: string) => void;
  /**
   * Optional teacher analytics context. When provided, per-scene timing,
   * correctness, and errors are streamed to `lesson_slide_events` for
   * teacher dashboards. Best-effort, never blocks gameplay.
   */
  analytics?: TeacherAnalyticsContext;
}

export interface BootHandle {
  destroy: () => void;
  events: EngineEvents;
}

export function bootGame(
  host: HTMLDivElement,
  compiled: CompiledLesson,
  hooks: BootHooks = {},
  palette: ScenePalette = DEFAULT_PALETTE,
): BootHandle {
  const events = new EngineEvents();
  if (hooks.onSceneStart) events.on('sceneStart', ({ index }) => hooks.onSceneStart!(index));
  if (hooks.onSceneComplete) events.on('sceneComplete', (r) => hooks.onSceneComplete!(r));
  if (hooks.onMomentStart) events.on('momentStart', (m) => hooks.onMomentStart!(m));
  if (hooks.onMomentComplete) events.on('momentComplete', (m) => hooks.onMomentComplete!(m));
  if (hooks.onLessonComplete) events.on('lessonComplete', ({ results }) => hooks.onLessonComplete!(results));
  if (hooks.onError) events.on('error', ({ message }) => hooks.onError!(message));

  // Announce lesson lifecycle to assistive tech. Scenes layer their own
  // per-question announcements on top via BaseScene.announce().
  events.on('momentStart', ({ index, total, kind }) => {
    Announcer.say(`Section ${index + 1} of ${total}: ${kind}.`);
  });
  events.on('lessonComplete', () => {
    Announcer.alert('Lesson complete. Well done!');
  });
  events.on('error', ({ message }) => {
    Announcer.alert(`Something went wrong: ${message}`);
  });

  // Tag host + canvas with ARIA so screen readers can name the experience
  // and keyboard users can focus the game surface.
  const detachA11y = setupCanvasA11y(host, {
    label: `Interactive lesson: ${compiled.title}. Use arrow keys to move between choices and Enter to select.`,
  });

  // Lock browser gestures (pinch-zoom, double-tap-zoom, long-press menu,
  // pull-to-refresh) around the game host so the canvas owns all touch.
  const detachTouch = setupTouchHost(host);

  // Stream per-scene timing + correctness + errors to Supabase for teacher
  // dashboards when the host supplies a student/lesson context.
  const detachAnalytics = hooks.analytics
    ? attachTeacherAnalytics(events, hooks.analytics)
    : () => {};

  // Pick world from lesson topic; unit-mates share a world for continuity.
  const extraText = harvestLessonText(compiled);
  const world = pickWorldForLesson({
    lessonId: compiled.lessonId,
    title: compiled.title,
    extraText,
  });

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: host,
    transparent: true, // World scene paints its own background
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: host.clientWidth || 800,
      height: host.clientHeight || 600,
    },
    scene: [WorldScene, MapScene],
    banner: false,
  });

  game.events.once(Phaser.Core.Events.READY, () => {
    // Launch the persistent world scene first
    game.scene.start(WORLD_SCENE_KEY, { world });
    // Make sure it stays underneath everything
    game.scene.sendToBack(WORLD_SCENE_KEY);

    // Unlock & tune the soundscape for this world on first pointer interaction.
    const unlockAudio = () => {
      SoundScape.unlock();
      SoundScape.setWorld(world.id);
    };
    host.addEventListener('pointerdown', unlockAudio, { once: true });
    host.addEventListener('touchstart', unlockAudio, { once: true, passive: true });

    const router = new SceneRouter(game, compiled, events, palette, world);
    router.start();
  });

  return {
    events,
    destroy: () => {
      detachAnalytics();
      detachA11y();
      detachTouch();
      events.clear();
      game.destroy(true);
    },
  };
}

/**
 * Collect topic-bearing text from a compiled lesson so the world picker can
 * sniff keywords (vocab words, intro titles, story text, etc.).
 */
function harvestLessonText(compiled: CompiledLesson): string {
  const out: string[] = [];
  for (const m of compiled.moments) {
    if (m.title) out.push(m.title);
    for (const s of m.scenes) {
      const d = s.data as Record<string, unknown>;
      if (typeof d.title === 'string') out.push(d.title);
      if (typeof d.subtitle === 'string') out.push(d.subtitle);
      if (typeof d.topic === 'string') out.push(d.topic);
      if (typeof d.theme === 'string') out.push(d.theme);
      const words = (d.words ?? d.items ?? d.cards) as unknown;
      if (Array.isArray(words)) {
        for (const w of words) {
          if (typeof w === 'string') out.push(w);
          else if (w && typeof w === 'object') {
            const wo = w as Record<string, unknown>;
            if (typeof wo.word === 'string') out.push(wo.word);
            if (typeof wo.term === 'string') out.push(wo.term);
            if (typeof wo.label === 'string') out.push(wo.label);
          }
        }
      }
    }
  }
  return out.join(' ');
}
