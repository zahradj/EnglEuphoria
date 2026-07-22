import { useState } from "react";
import { usePlaygroundUnitMutators, usePlaygroundUnit } from "@/playground-blueprint/PlaygroundUnitContext";
import type {
  PlaygroundPage, PageMascot, PageMotion,
  PipMascotState, PipEnvironment, MotionEntrance,
} from "@/playground-blueprint/types";
import type { PlaygroundLessonNumber } from "@/playground-blueprint/unitTemplate";
import SlideStage from "@/components/lesson-player/SlideStage";
import SceneBackdrop from "@/components/lesson-player/SceneBackdrop";
import { topicToEnvironment } from "@/orchestrator/topicToEnvironment";
import { phasePreset } from "@/orchestrator/phaseMotionPresets";

const STATES: PipMascotState[] = [
  'idle', 'blink', 'wave', 'point_left', 'point_right',
  'celebrate', 'thinking', 'listening', 'speaking', 'sad',
];
const ENVIRONMENTS: PipEnvironment[] = [
  'classroom', 'park', 'kitchen', 'space', 'beach',
  'library', 'forest', 'bedroom',
];
const ENTRANCES: MotionEntrance[] = [
  'fade_up', 'scale_in', 'slide_in_right', 'slide_in_left', 'pop',
];
const EMPHASIS: NonNullable<PageMotion['emphasis']>[] = ['none', 'pulse', 'shake', 'bounce'];

const DEFAULT_MASCOT: PageMascot = { state: 'idle', environment: 'classroom', speech: '' };
const DEFAULT_MOTION: PageMotion = { entrance: 'fade_up', duration_ms: 300, emphasis: 'none' };


export function MotionTab({
  lessonNumber, page,
}: { lessonNumber: PlaygroundLessonNumber; page: PlaygroundPage }) {
  const { updatePage } = usePlaygroundUnitMutators();
  const unit = usePlaygroundUnit();
  const theme = unit?.unit_theme ?? null;
  const mascot = page.mascot ?? { ...DEFAULT_MASCOT, environment: topicToEnvironment(theme) as PipEnvironment };
  const motion = page.motion ?? DEFAULT_MOTION;

  const patchMascot = (p: Partial<PageMascot>) =>
    updatePage?.(lessonNumber, page.id, { mascot: { ...mascot, ...p } });
  const patchMotion = (p: Partial<PageMotion>) =>
    updatePage?.(lessonNumber, page.id, { motion: { ...motion, ...p } });

  const applyAuto = () => {
    const { mascot: m, motion: mo } = phasePreset(page.phase_id, theme);
    updatePage?.(lessonNumber, page.id, { mascot: m, motion: mo });
  };

  // Preset chips — apply a phase preset regardless of the current phase_id.
  const PRESETS: Array<{ label: string; beat: string }> = [
    { label: '👋 Warm-Up',   beat: 'warm'      },
    { label: '👂 Listen',    beat: 'listen'    },
    { label: '📚 Story',     beat: 'story'     },
    { label: '🗣 Speak',      beat: 'speak'     },
    { label: '🧠 Quiz',       beat: 'quiz'      },
    { label: '🎉 Celebrate', beat: 'celebrate' },
  ];
  const applyPreset = (beat: string) => {
    const { mascot: m, motion: mo } = phasePreset(beat, theme);
    updatePage?.(lessonNumber, page.id, { mascot: m, motion: mo });
  };

  // Replay button — bump nonce to force SlideStage remount and re-run entrance.
  const [replayNonce, setReplayNonce] = useState(0);
  const previewKey = `${replayNonce}-${motion.entrance}-${motion.duration_ms}-${motion.emphasis}-${mascot.state}-${mascot.environment}-${mascot.speech}`;


  return (
    <div className="space-y-4">
      {/* Live preview */}
      <section className="rounded-xl border border-orange-200 bg-white p-2">
        <div className="mb-2 flex items-center justify-between gap-2 px-1">
          <h3 className="text-sm font-bold text-orange-900">Live preview</h3>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setReplayNonce((n) => n + 1)}
              className="rounded-lg border border-orange-300 bg-white px-2.5 py-1 text-xs font-bold text-orange-800 hover:bg-orange-50"
              title="Replay entrance animation"
            >
              ▶ Replay
            </button>
            <button
              type="button"
              onClick={applyAuto}
              className="rounded-lg bg-orange-500 px-2.5 py-1 text-xs font-bold text-white hover:bg-orange-600"
              title={`Auto-fill from beat: ${page.phase_id}`}
            >
              ✨ Auto from beat
            </button>
          </div>
        </div>
        <div className="relative h-40 overflow-hidden rounded-lg bg-gradient-to-br from-orange-50 to-yellow-50">
          <SlideStage key={previewKey} mascot={mascot} motion={motion}>
            <div className="flex h-full items-center justify-center p-4 text-center text-sm font-semibold text-orange-900">
              {page.title || page.phase_id}
            </div>
          </SlideStage>
        </div>
        {/* Preset chips — one click applies a phase preset */}
        <div className="mt-2 flex flex-wrap gap-1.5 px-1">
          {PRESETS.map((p) => (
            <button
              key={p.beat}
              type="button"
              onClick={() => applyPreset(p.beat)}
              className="rounded-full border border-orange-200 bg-white px-2.5 py-1 text-[11px] font-bold text-orange-900 hover:border-[#FE6A2F] hover:bg-orange-50"
              title={`Apply the ${p.beat} preset`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-orange-200 bg-orange-50/40 p-3">
        <h3 className="mb-2 text-sm font-bold text-orange-900">Mascot (Rive state)</h3>

        <label className="mb-2 block text-xs">
          <span className="mb-1 block font-semibold text-orange-900">State</span>
          <select
            value={mascot.state}
            onChange={(e) => patchMascot({ state: e.target.value as PipMascotState })}
            className="w-full rounded-lg border border-orange-200 bg-white px-2 py-1.5 text-sm"
          >
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <label className="mb-2 block text-xs">
          <span className="mb-1 block font-semibold text-orange-900">Environment</span>
          <select
            value={mascot.environment ?? 'classroom'}
            onChange={(e) => patchMascot({ environment: e.target.value as PipEnvironment })}
            className="w-full rounded-lg border border-orange-200 bg-white px-2 py-1.5 text-sm"
          >
            {ENVIRONMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {/* Live theme preview strip — click a thumb to switch backdrop */}
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {ENVIRONMENTS.map((env) => {
              const active = (mascot.environment ?? 'classroom') === env;
              return (
                <button
                  key={env}
                  type="button"
                  onClick={() => patchMascot({ environment: env })}
                  title={env}
                  className={`relative h-12 overflow-hidden rounded-md border transition ${
                    active
                      ? 'border-[#FE6A2F] ring-2 ring-[#FE6A2F]/40'
                      : 'border-orange-200 hover:border-orange-400'
                  }`}
                >
                  <div className="absolute inset-0">
                    <SceneBackdrop environment={env} />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-black/40 py-0.5 text-center text-[9px] font-bold uppercase tracking-wider text-white">
                    {env}
                  </div>
                </button>
              );
            })}
          </div>
        </label>

        <label className="block text-xs">
          <span className="mb-1 block font-semibold text-orange-900">Speech (≤12 words)</span>
          <input
            value={mascot.speech ?? ''}
            onChange={(e) => patchMascot({ speech: e.target.value })}
            placeholder="Bind to lesson vocab or the active character"
            className="w-full rounded-lg border border-orange-200 bg-white px-2 py-1.5 text-sm"
          />
        </label>
      </section>

      <section className="rounded-xl border border-orange-200 bg-orange-50/40 p-3">
        <h3 className="mb-2 text-sm font-bold text-orange-900">Motion (entrance)</h3>

        <label className="mb-2 block text-xs">
          <span className="mb-1 block font-semibold text-orange-900">Entrance</span>
          <select
            value={motion.entrance}
            onChange={(e) => patchMotion({ entrance: e.target.value as MotionEntrance })}
            className="w-full rounded-lg border border-orange-200 bg-white px-2 py-1.5 text-sm"
          >
            {ENTRANCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <label className="mb-2 block text-xs">
          <span className="mb-1 block font-semibold text-orange-900">
            Duration ({motion.duration_ms ?? 300}ms)
          </span>
          <input
            type="range" min={80} max={1200} step={20}
            value={motion.duration_ms ?? 300}
            onChange={(e) => patchMotion({ duration_ms: Number(e.target.value) })}
            className="w-full"
          />
        </label>

        <label className="block text-xs">
          <span className="mb-1 block font-semibold text-orange-900">Emphasis</span>
          <select
            value={motion.emphasis ?? 'none'}
            onChange={(e) => patchMotion({ emphasis: e.target.value as PageMotion['emphasis'] })}
            className="w-full rounded-lg border border-orange-200 bg-white px-2 py-1.5 text-sm"
          >
            {EMPHASIS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <p className="mt-2 text-[11px] text-orange-700">
          Playground personality: 150–300ms, ease-out-back, playful overshoot. Celebration → <em>pop + bounce</em>. Error → <em>shake</em>.
        </p>
      </section>
    </div>
  );
}
