/**
 * SceneRouter — owns the Lesson → Moments → Scenes execution loop.
 *
 * Between scenes we play a brief MapScene interstitial showing Pip walking
 * from the previous spot to the next. World scene runs continuously below.
 */
import Phaser from 'phaser';
import type { CompiledLesson, SceneResult, CompiledMoment, SceneKind } from '../engine/types';
import type { EngineEvents } from '../engine/events';
import type { ScenePalette } from './scenes/BaseScene';
import { MapScene, MAP_SCENE_KEY } from './map';
import { WORLD_SCENE_KEY, type WorldDef, type WorldScene } from './world';

export class SceneRouter {
  private momentIdx = -1;
  private sceneIdx = 0;
  private results: SceneResult[] = [];
  private flatSceneKinds: SceneKind[] = [];
  /** Index across the flat scene list of the most recently completed scene (-1 = none). */
  private lastCompletedFlat = -1;
  /** Last scene result, used to drive Pip's reaction on the next map. */
  private lastResult?: SceneResult;
  /** Consecutive-correct streak across activity scenes. */
  private streak = 0;
  /** Running XP total across the lesson. */
  private totalXp = 0;
  /** XP awarded by the most recent scene (drives the count-up on the next map). */
  private lastXpAwarded = 0;

  constructor(
    private readonly game: Phaser.Game,
    private readonly compiled: CompiledLesson,
    private readonly events: EngineEvents,
    private readonly palette: ScenePalette,
    private readonly world: WorldDef,
  ) {
    this.flatSceneKinds = compiled.sequence.map((s) => s.kind);
  }

  start() {
    this.momentIdx = -1;
    this.sceneIdx = 0;
    this.results = [];
    this.lastCompletedFlat = -1;
    this.lastResult = undefined;
    this.streak = 0;
    this.totalXp = 0;
    this.lastXpAwarded = 0;
    this.beginNextMoment();
  }

  /** Compute XP for a scene result. Correct = 10, partial = scaled, wrong = 0. */
  private xpFor(result: SceneResult): number {
    if (result.correct === true) {
      // Streak bonus capped at +10
      const bonus = Math.min(10, Math.max(0, this.streak - 1) * 2);
      return 10 + bonus;
    }
    if (typeof result.score === 'number' && result.score > 0) {
      return Math.round(10 * Math.max(0, Math.min(1, result.score)));
    }
    return 0;
  }

  private get currentMoment(): CompiledMoment | undefined {
    return this.compiled.moments[this.momentIdx];
  }

  private beginNextMoment() {
    const prev = this.currentMoment;
    if (prev) {
      this.events.emit('momentComplete', { index: this.momentIdx, kind: prev.kind, id: prev.id });
    }
    this.momentIdx += 1;
    this.sceneIdx = 0;
    const next = this.currentMoment;
    if (!next) {
      this.events.emit('lessonComplete', { results: this.results });
      // Finale victory map pass
      this.playMap(this.flatSceneKinds.length - 1, this.flatSceneKinds.length - 1, true, () => {});
      return;
    }
    this.events.emit('momentStart', {
      index: this.momentIdx,
      total: this.compiled.moments.length,
      kind: next.kind,
      id: next.id,
    });
    this.playCurrentScene();
  }

  private playCurrentScene() {
    const moment = this.currentMoment;
    if (!moment) return;
    if (this.sceneIdx >= moment.scenes.length) {
      this.beginNextMoment();
      return;
    }
    const cfg = moment.scenes[this.sceneIdx];

    const launch = () => {
      // Drive day/night based on lesson progress.
      const total = Math.max(1, this.flatSceneKinds.length - 1);
      const progress = cfg.index / total;
      const ws = this.game.scene.getScene(WORLD_SCENE_KEY) as WorldScene | null;
      ws?.setProgress?.(progress);
      this.events.emit('sceneStart', { index: cfg.index });
      const key = `${cfg.kind}:${cfg.index}`;
      const SceneCtor = SCENE_CTORS[cfg.kind];
      if (!SceneCtor) {
        this.events.emit('error', { message: `Unknown scene kind: ${cfg.kind}` });
        return;
      }
      this.game.scene.add(key, new SceneCtor(key), false);
      this.game.scene.start(key, {
        config: cfg,
        palette: this.palette,
        onComplete: (result: SceneResult) => {
          const enriched: SceneResult = {
            ...result,
            momentKind: cfg.momentKind,
            momentId: cfg.momentId,
          };
          this.results.push(enriched);
          this.events.emit('sceneComplete', enriched);
          this.game.scene.stop(key);
          this.game.scene.remove(key);
          this.lastCompletedFlat = cfg.index;
          this.lastResult = enriched;
          if (enriched.correct === true) this.streak += 1;
          else if (enriched.correct === false) this.streak = 0;
          this.lastXpAwarded = this.xpFor(enriched);
          this.totalXp += this.lastXpAwarded;
          this.sceneIdx += 1;
          this.playCurrentScene();
        },
      });
    };

    // Show map interstitial before each scene, including the very first.
    this.playMap(this.lastCompletedFlat, cfg.index, false, launch);
  }

  private playMap(fromIdx: number, toIdx: number, isFinale: boolean, onDone: () => void) {
    const completed = Math.max(0, this.lastCompletedFlat + 1);
    const total = Math.max(1, this.flatSceneKinds.length);
    // MapScene is registered once on the game; start it with fresh init data.
    this.game.scene.start(MAP_SCENE_KEY, {
      world: this.world,
      scenes: this.flatSceneKinds,
      fromIdx,
      toIdx,
      isFinale,
      lastResult: this.lastResult,
      streak: this.streak,
      totalXp: this.totalXp,
      xpAwarded: this.lastXpAwarded,
      completedCount: completed,
      totalCount: total,
      onDone: () => {
        this.lastXpAwarded = 0; // consumed
        this.game.scene.stop(MAP_SCENE_KEY);
        onDone();
      },
    });
    void MapScene;
  }
}

// --- Scene registry ---------------------------------------------------------
import { IntroScene } from './scenes/IntroScene';
import { PhonicsScene } from './scenes/PhonicsScene';
import { VocabScene } from './scenes/VocabScene';
import { QuizScene } from './scenes/QuizScene';
import { DragScene } from './scenes/DragScene';
import { MatchScene } from './scenes/MatchScene';
import { FillBlankScene } from './scenes/FillBlankScene';
import { StoryScene } from './scenes/StoryScene';
import { EndScene } from './scenes/EndScene';

type SceneCtor = new (key: string) => Phaser.Scene;

const wrap = (Cls: new (cfg: string | Phaser.Types.Scenes.SettingsConfig) => Phaser.Scene): SceneCtor =>
  class extends (Cls as unknown as { new (cfg: string): Phaser.Scene }) {
    constructor(key: string) { super(key); }
  } as unknown as SceneCtor;

const SCENE_CTORS: Record<SceneKind, SceneCtor> = {
  IntroScene: wrap(IntroScene as unknown as new (cfg: string) => Phaser.Scene),
  PhonicsScene: wrap(PhonicsScene as unknown as new (cfg: string) => Phaser.Scene),
  VocabScene: wrap(VocabScene as unknown as new (cfg: string) => Phaser.Scene),
  QuizScene: wrap(QuizScene as unknown as new (cfg: string) => Phaser.Scene),
  DragScene: wrap(DragScene as unknown as new (cfg: string) => Phaser.Scene),
  MatchScene: wrap(MatchScene as unknown as new (cfg: string) => Phaser.Scene),
  FillBlankScene: wrap(FillBlankScene as unknown as new (cfg: string) => Phaser.Scene),
  StoryScene: wrap(StoryScene as unknown as new (cfg: string) => Phaser.Scene),
  EndScene: wrap(EndScene as unknown as new (cfg: string) => Phaser.Scene),
};
