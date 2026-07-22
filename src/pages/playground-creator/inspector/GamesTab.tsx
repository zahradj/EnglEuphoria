/**
 * GamesTab — Playground Creator V2
 *
 * Teacher authoring surface for the coherence-engine GamePack. Writes to
 * `lesson.authored_games`, which the orchestrator forwards to
 * `pinAuthoredGamePack()` so authored rounds override the auto-picker while
 * still respecting hub caps + reinforcement targets.
 */
import { GripVertical, Plus, Sparkles, Trophy, X } from "lucide-react";
import { useState } from "react";
import {
  usePlaygroundUnit,
  usePlaygroundUnitMutators,
} from "@/playground-blueprint/PlaygroundUnitContext";
import type {
  PlaygroundAuthoredGameRound,
  PlaygroundLessonContent,
} from "@/playground-blueprint/types";
import type { PlaygroundLessonNumber } from "@/playground-blueprint/unitTemplate";
import { GamesAnalyticsTile } from "./GamesAnalyticsTile";
import { ReinforcementTargetPicker } from "./ReinforcementTargetPicker";

// Playground hub catalog (mirrors coherence hubProfiles.ts).
const PG_GAME_CATALOG: { type: string; label: string; emoji: string; hint: string }[] = [
  { type: "WordRush", label: "Word Rush", emoji: "⚡", hint: "Fast retrieval of target vocab." },
  { type: "SoundMatch", label: "Sound Match", emoji: "🔊", hint: "Match audio to word/letter." },
  { type: "MemoryGrid", label: "Memory Grid", emoji: "🧠", hint: "Flip-and-match pairs." },
  { type: "BossRound", label: "Boss Round", emoji: "👑", hint: "Mixed challenge finale." },
];

const MAX_ROUNDS = 4; // playground game_rounds cap

export function GamesTab({
  lessonNumber,
  lesson,
}: {
  lessonNumber: PlaygroundLessonNumber;
  lesson: PlaygroundLessonContent;
}) {
  const unit = usePlaygroundUnit();
  const { setLessonField } = usePlaygroundUnitMutators();
  const [dragId, setDragId] = useState<string | null>(null);

  const rounds = lesson.authored_games ?? [];

  const commit = (next: PlaygroundAuthoredGameRound[]) => {
    setLessonField?.(lessonNumber, { authored_games: next.slice(0, MAX_ROUNDS) });
  };

  const addRound = (type: string) => {
    if (rounds.length >= MAX_ROUNDS) return;
    const isBoss = type === "BossRound";
    const round: PlaygroundAuthoredGameRound = {
      id: `${lessonNumber}.game.${type}.${Date.now().toString(36)}`,
      type,
      difficulty_tier: 2,
      is_boss: isBoss,
    };
    commit([...rounds, round]);
  };

  const removeRound = (id: string) => commit(rounds.filter((r) => r.id !== id));

  const patchRound = (id: string, patch: Partial<PlaygroundAuthoredGameRound>) => {
    commit(rounds.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const reorder = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    const list = [...rounds];
    const from = list.findIndex((r) => r.id === sourceId);
    const to = list.findIndex((r) => r.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    commit(list);
  };

  const autofill = () => {
    // Deterministic seed: vocab retrieval → sound → memory → boss finale.
    const seed = ["WordRush", "SoundMatch", "MemoryGrid", "BossRound"];
    const next: PlaygroundAuthoredGameRound[] = seed.map((type, i) => ({
      id: `${lessonNumber}.game.${type}.${Date.now().toString(36)}.${i}`,
      type,
      difficulty_tier: i === 3 ? 3 : 2,
      is_boss: type === "BossRound",
    }));
    commit(next);
  };

  const hasBoss = rounds.some((r) => r.is_boss);
  const pct = Math.round((rounds.length / MAX_ROUNDS) * 100);

  const targetsPreview = (unit?.lessons.find((l) => l.lesson_number === lessonNumber)?.vocab ?? [])
    .slice(0, MAX_ROUNDS);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs">
          <div className="font-semibold text-orange-900">Game Pack</div>
          <div className="text-orange-700">Up to {MAX_ROUNDS} rounds · Playground hub</div>
        </div>
        <button
          onClick={autofill}
          className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FE6A2F] to-amber-500 px-3 py-1 text-xs font-bold text-white shadow"
        >
          <Sparkles className="h-3 w-3" /> {rounds.length ? "Reset" : "Auto-fill"}
        </button>
      </div>

      <GamesAnalyticsTile lessonId={`L${lessonNumber}`} />

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-semibold">
          <span className={hasBoss || rounds.length === 0 ? "text-emerald-800" : "text-amber-800"}>
            {rounds.length}/{MAX_ROUNDS} rounds {hasBoss ? "· boss ✓" : rounds.length ? "· no boss yet" : ""}
          </span>
          <span className="text-orange-700">{pct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-orange-100">
          <div
            className="h-full bg-gradient-to-r from-[#FE6A2F] to-amber-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {!rounds.length && (
        <p className="rounded-lg bg-orange-50 p-2 text-xs text-orange-800">
          No authored rounds yet — coherence engine will auto-pick. Add rounds below to override.
        </p>
      )}

      {/* Rounds list */}
      {rounds.map((round, idx) => {
        const meta = PG_GAME_CATALOG.find((g) => g.type === round.type);
        const boundTarget = targetsPreview[idx] ?? "(auto-bound target)";
        return (
          <div
            key={round.id}
            onDragOver={(e) => { if (dragId && dragId !== round.id) e.preventDefault(); }}
            onDrop={(e) => { e.preventDefault(); if (dragId) reorder(dragId, round.id); setDragId(null); }}
            className={`rounded-xl border border-orange-200 bg-white p-2 ${dragId === round.id ? "opacity-40" : ""}`}
          >
            <div className="flex items-center gap-2">
              <button
                draggable
                onDragStart={() => setDragId(round.id)}
                onDragEnd={() => setDragId(null)}
                className="cursor-grab active:cursor-grabbing rounded p-0.5 text-orange-500 hover:bg-orange-100"
                aria-label="Drag to reorder"
              >
                <GripVertical className="h-3.5 w-3.5" />
              </button>
              <span className="text-lg leading-none">{meta?.emoji ?? "🎮"}</span>
              <div className="flex-1 text-xs">
                <div className="font-bold text-orange-900">
                  #{idx + 1} · {meta?.label ?? round.type}
                  {round.is_boss && <Trophy className="ml-1 inline h-3 w-3 text-amber-600" />}
                </div>
                <div className="text-[11px] text-orange-700">Target: {boundTarget}</div>
              </div>
              <button
                onClick={() => removeRound(round.id)}
                className="rounded-full p-1 text-orange-500 hover:bg-orange-100 hover:text-rose-600"
                aria-label="Remove round"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 pl-6 text-[11px] text-orange-800">
              <label className="flex items-center gap-1">
                <span>Difficulty</span>
                <select
                  value={round.difficulty_tier ?? 2}
                  onChange={(e) => patchRound(round.id, { difficulty_tier: Number(e.target.value) })}
                  className="rounded-md border border-orange-200 bg-white px-1 py-0.5"
                >
                  {[1, 2, 3, 4, 5].map((t) => (
                    <option key={t} value={t}>Tier {t}</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={!!round.is_boss}
                  onChange={(e) => patchRound(round.id, { is_boss: e.target.checked })}
                />
                Boss round
              </label>
              <ReinforcementTargetPicker
                lesson={lesson}
                value={round.reinforcement_key}
                onChange={(v) => patchRound(round.id, { reinforcement_key: v })}
              />
              <label className="flex items-center gap-1">
                <span>Scenario</span>
                <input
                  value={(round as any).scenario_key ?? ""}
                  onChange={(e) =>
                    patchRound(round.id, { scenario_key: e.target.value } as any)
                  }
                  placeholder="e.g. bakery, castle-01"
                  className="w-32 rounded-md border border-orange-200 bg-white px-1.5 py-0.5 text-[11px]"
                />
              </label>
            </div>
          </div>
        );
      })}

      {/* Catalog picker */}
      <div className="rounded-xl border border-orange-200 bg-white/70 p-2">
        <div className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-orange-700">
          <Plus className="h-3 w-3" /> Add a round
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PG_GAME_CATALOG.map((g) => (
            <button
              key={g.type}
              onClick={() => addRound(g.type)}
              title={g.hint}
              disabled={rounds.length >= MAX_ROUNDS}
              className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-orange-900 hover:border-[#FE6A2F] hover:bg-orange-50 disabled:opacity-40"
            >
              <span>{g.emoji}</span> {g.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
