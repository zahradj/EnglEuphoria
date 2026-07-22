/**
 * HomeworkTab — Playground Creator V2
 *
 * Home Missions are now built the SAME way as in-lesson activities:
 * pick from the ACTIVITY_CATALOG (games, matches, phonics, speaking…),
 * edit the config with the shared ActivityEditor, and AI-fill against
 * the lesson vocab. This keeps homework interactive + gamified instead
 * of the old plain text "trace / recall" bullets.
 */
import { useMemo, useState } from "react";
import { Copy, GripVertical, Play, Plus, Sparkles, X } from "lucide-react";
import { RuntimeBlock } from "@/components/playground-player/PlaygroundLessonPlayer";
import { supabase } from "@/integrations/supabase/client";
import {
  usePlaygroundUnit,
  usePlaygroundUnitMutators,
} from "@/playground-blueprint/PlaygroundUnitContext";
import type {
  PlaygroundHomework,
  PlaygroundHomeworkTask,
  PlaygroundLessonContent,
} from "@/playground-blueprint/types";
import type { PlaygroundLessonNumber } from "@/playground-blueprint/unitTemplate";
import {
  ACTIVITY_CATALOG,
  ActivityEditor,
  GROUP_LABEL,
  type CatalogEntry,
} from "./ActivityTab";
import { HomeworkAnalyticsTile } from "./HomeworkAnalyticsTile";
import { ReinforcementTargetPicker } from "./ReinforcementTargetPicker";

// Playground homework favours short, high-fun retrieval games.
const HOMEWORK_FAVOURITES: CatalogEntry["type"][] = [
  "memory",
  "match",
  "multiple",
  "spin_wheel",
  "flashcard_review",
  "quick_quiz",
  "listen_match",
  "echo",
  "speaking_mission",
  "scratch_reveal",
  "trace",
  "phonics_hunt",
  "syllable_clap",
  "rhyme_match",
  "sentence_builder",
  "storybook",
  "canvas_game",
  "exit_ticket",
];

function pickDefaultForVocab(entry: CatalogEntry, vocab: string[]): Record<string, unknown> {
  const cfg = { ...entry.defaultConfig } as Record<string, unknown>;
  if (!vocab.length) return cfg;
  const v = vocab.slice(0, 4);
  if (Array.isArray((cfg as any).options)) (cfg as any).options = v;
  if (typeof (cfg as any).answer === "string" && v[0]) (cfg as any).answer = v[0];
  if (Array.isArray((cfg as any).items) && typeof (cfg as any).items[0] === "string") {
    (cfg as any).items = v;
  }
  if (typeof (cfg as any).word === "string" && v[0]) (cfg as any).word = v[0];
  return cfg;
}

function buildTask(
  entry: CatalogEntry,
  lesson: PlaygroundLessonContent,
): PlaygroundHomeworkTask {
  const config = pickDefaultForVocab(entry, lesson.vocab ?? []);
  return {
    id: `${lesson.lesson_number}.hw.${entry.type}.${Date.now().toString(36)}`,
    type: entry.type,
    label: entry.label,
    prompt: String((config as any).prompt ?? entry.hint),
    payload: config,
    minutes: 3,
  };
}

async function aiFillTask(
  entry: CatalogEntry,
  lesson: PlaygroundLessonContent,
  unitTopic: string,
): Promise<PlaygroundHomeworkTask> {
  const seed = buildTask(entry, lesson);
  try {
    const { data, error } = await supabase.functions.invoke("playground-activity-ai", {
      body: {
        activity_type: entry.type,
        topic: unitTopic,
        vocab: lesson.vocab ?? [],
        cefr: "Pre-A1",
        instructions: "Home mission: short, playful, retrieval-focused. Bind to the lesson vocab and grammar.",
        context: {
          lesson_number: lesson.lesson_number,
          scope: "homework",
          objective: (lesson as any)?.objective ?? "",
          grammar_target: (lesson as any)?.grammar_target ?? "",
          sentence_frame: (lesson as any)?.sentence_frame ?? "",
          phonic: (lesson as any)?.phonic ?? null,
        },
        current_config: seed.payload,
      },
    });
    if (error) throw new Error(error.message);
    const cfg = (data as any)?.config;
    if (cfg && typeof cfg === "object") {
      return { ...seed, payload: cfg, prompt: String((cfg as any).prompt ?? seed.prompt) };
    }
  } catch {
    // fall through to deterministic seed
  }
  return seed;
}

async function autoGenerate(
  lesson: PlaygroundLessonContent,
  unitTopic: string,
): Promise<PlaygroundHomework> {
  const preferred = ["memory", "quick_quiz", "speaking_mission"] as const;
  const entries = preferred
    .map((t) => ACTIVITY_CATALOG.find((c) => c.type === t))
    .filter((e): e is CatalogEntry => !!e)
    .slice(0, 3);
  const tasks = await Promise.all(entries.map((e) => aiFillTask(e, lesson, unitTopic)));
  return {
    lesson_number: lesson.lesson_number,
    title: `Lesson ${lesson.lesson_number} Home Mission`,
    tasks,
    total_minutes: tasks.reduce((s, t) => s + t.minutes, 0),
  };
}

export function HomeworkTab({
  lessonNumber,
  lesson,
}: {
  lessonNumber: PlaygroundLessonNumber;
  lesson: PlaygroundLessonContent;
}) {
  const unit = usePlaygroundUnit();
  const { setHomework } = usePlaygroundUnitMutators();
  const [busy, setBusy] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const hw = lesson.homework;

  const groups = useMemo(() => {
    const wanted = new Set(HOMEWORK_FAVOURITES);
    return (Object.keys(GROUP_LABEL) as CatalogEntry["group"][]).map((g) => ({
      group: g,
      label: GROUP_LABEL[g],
      items: ACTIVITY_CATALOG.filter((c) => c.group === g && wanted.has(c.type)),
    })).filter((g) => g.items.length > 0);
  }, []);

  // Playground coherence caps (mem://coherence/game-homework-engine):
  // 2–4 tasks max, total ≤10 minutes.
  const MAX_TASKS = 4;
  const MAX_MINUTES = 10;

  const commit = (rawTasks: PlaygroundHomeworkTask[]) => {
    // Hard clamp task count — keep the most recently added.
    const tasks = rawTasks.slice(-MAX_TASKS).map((t) => ({
      ...t,
      minutes: Math.max(1, Math.min(MAX_MINUTES, t.minutes || 1)),
    }));
    const next: PlaygroundHomework = {
      lesson_number: lessonNumber,
      title: hw?.title ?? `Lesson ${lessonNumber} Home Mission`,
      tasks,
      total_minutes: tasks.reduce((s, t) => s + t.minutes, 0),
    };
    setHomework?.(lessonNumber, next);
  };

  const addTask = (entry: CatalogEntry) => {
    if ((hw?.tasks?.length ?? 0) >= MAX_TASKS) return;
    commit([...(hw?.tasks ?? []), buildTask(entry, lesson)]);
  };

  const autofill = async () => {
    setBusy(true);
    try {
      const gen = await autoGenerate(lesson, unit?.unit_topic ?? "");
      commit(gen.tasks);
    } finally {
      setBusy(false);
    }
  };

  const removeTask = (id: string) => commit((hw?.tasks ?? []).filter((t) => t.id !== id));

  const patchTask = (id: string, patch: Partial<PlaygroundHomeworkTask>) => {
    commit((hw?.tasks ?? []).map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const reorder = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    const list = [...(hw?.tasks ?? [])];
    const from = list.findIndex((t) => t.id === sourceId);
    const to = list.findIndex((t) => t.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    commit(list);
  };

  const totalMin = hw?.total_minutes ?? 0;
  const pct = Math.min(100, Math.round((totalMin / MAX_MINUTES) * 100));
  const overCap = totalMin > MAX_MINUTES;

  const otherLessons = (unit?.lessons ?? [])
    .map((l) => l.lesson_number)
    .filter((n) => n !== lessonNumber);

  const bulkApply = () => {
    if (!hw?.tasks?.length || !otherLessons.length) return;
    if (!confirm(`Copy this Home Mission to lesson${otherLessons.length === 1 ? "" : "s"} ${otherLessons.join(", ")}? Existing homework there will be overwritten.`)) return;
    for (const target of otherLessons) {
      const clonedTasks = hw.tasks.map((t) => ({
        ...t,
        id: `${target}.hw.${t.type}.${Date.now().toString(36)}.${Math.random().toString(36).slice(2, 6)}`,
      }));
      setHomework?.(target, {
        lesson_number: target,
        title: `Lesson ${target} Home Mission`,
        tasks: clonedTasks,
        total_minutes: clonedTasks.reduce((s, t) => s + t.minutes, 0),
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs">
          <div className="font-semibold text-orange-900">Home Mission Games</div>
          <div className="text-orange-700">≤10 min · 2–4 gamified tasks</div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={bulkApply}
            disabled={!hw?.tasks?.length || !otherLessons.length}
            title={`Copy to lessons ${otherLessons.join(", ")}`}
            className="inline-flex items-center gap-1 rounded-full border border-orange-300 bg-white px-2.5 py-1 text-[11px] font-bold text-orange-900 hover:bg-orange-50 disabled:opacity-40"
          >
            <Copy className="h-3 w-3" />
            Copy to unit
          </button>
          <button
            onClick={autofill}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FE6A2F] to-amber-500 px-3 py-1 text-xs font-bold text-white shadow disabled:opacity-50"
          >
            <Sparkles className="h-3 w-3" />
            {busy ? "…" : hw?.tasks?.length ? "Regenerate" : "Auto-fill"}
          </button>
        </div>
      </div>

      <HomeworkAnalyticsTile lessonId={`L${lessonNumber}`} />


      {hw?.tasks?.length ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className={overCap ? "text-rose-800" : "text-emerald-800"}>
              {totalMin} / {MAX_MINUTES} min · {hw.tasks.length}/{MAX_TASKS} task{hw.tasks.length === 1 ? "" : "s"}
            </span>
            <span className="text-orange-700">{pct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-orange-100">
            <div
              className={`h-full transition-all ${
                overCap
                  ? "bg-gradient-to-r from-rose-500 to-red-600"
                  : "bg-gradient-to-r from-[#FE6A2F] to-amber-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {overCap && (
            <div className="rounded-lg bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-800">
              ⚠ Over Playground cap ({MAX_MINUTES} min). Trim task minutes below.
            </div>
          )}
        </div>
      ) : (
        <p className="rounded-lg bg-orange-50 p-2 text-xs text-orange-800">
          No home mission yet. Add a game below or Auto-fill from this lesson's vocab.
        </p>
      )}

      {/* Existing tasks — same editor as in-lesson activities */}
      {(hw?.tasks ?? []).map((task, idx) => (
        <div
          key={task.id}
          onDragOver={(e) => { if (dragId && dragId !== task.id) e.preventDefault(); }}
          onDrop={(e) => { e.preventDefault(); if (dragId) reorder(dragId, task.id); setDragId(null); }}
          className={`space-y-1 rounded-xl ${dragId === task.id ? "opacity-40" : ""}`}
        >
          <div className="flex items-center gap-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-orange-600">
            <button
              draggable
              onDragStart={() => setDragId(task.id)}
              onDragEnd={() => setDragId(null)}
              className="cursor-grab active:cursor-grabbing rounded p-0.5 hover:bg-orange-100"
              title="Drag to reorder"
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </button>
            <span>#{idx + 1} · {task.type}</span>
          </div>
          <ActivityEditor
            block={{
              kind: "activity" as const,
              id: task.id,
              label: task.label ?? task.type,
              type: task.type,
              config: task.payload,
            }}
            topic={unit?.unit_topic ?? ""}
            vocab={lesson.vocab ?? []}
            context={{
              lesson_number: lessonNumber,
              scope: "homework",
              objective: (lesson as any)?.objective ?? "",
              grammar_target: (lesson as any)?.grammar_target ?? "",
              phonic: (lesson as any)?.phonic ?? null,
            }}
            onChange={(next) => patchTask(task.id, {
              label: next.label ?? task.label,
              type: next.type ?? task.type,
              payload: (next.config as Record<string, unknown>) ?? task.payload,
              prompt: String((next.config as any)?.prompt ?? task.prompt),
            })}
            onRemove={() => removeTask(task.id)}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 pl-1">
            <label className="flex items-center gap-2 text-[11px] text-orange-800">
              <span>Minutes</span>
              <input
                type="number"
                min={1}
                max={10}
                value={task.minutes}
                onChange={(e) => patchTask(task.id, { minutes: Math.max(1, Math.min(10, Number(e.target.value) || 1)) })}
                className="w-16 rounded-md border border-orange-200 px-2 py-0.5 text-xs"
              />
            </label>
            <ReinforcementTargetPicker
              lesson={lesson}
              value={task.reinforcement_key}
              onChange={(v) => patchTask(task.id, { reinforcement_key: v })}
            />
            <button
              onClick={() => setPreviewId(previewId === task.id ? null : task.id)}
              className="inline-flex items-center gap-1 rounded-full border border-orange-300 bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-900 hover:bg-orange-100"
            >
              {previewId === task.id ? <><X className="h-3 w-3" /> Close</> : <><Play className="h-3 w-3" /> Preview</>}
            </button>
          </div>
          {previewId === task.id && (
            <div className="rounded-xl border border-orange-200 bg-white p-2">
              <RuntimeBlock
                block={{
                  kind: "activity" as const,
                  id: task.id,
                  label: task.label ?? task.type,
                  type: task.type,
                  config: { ...(task.payload ?? {}), prompt: task.prompt ?? (task.payload as any)?.prompt },
                } as any}
                lesson={lesson}
              />
            </div>
          )}
        </div>
      ))}

      {/* Catalog picker */}
      <div className="rounded-xl border border-orange-200 bg-white/70 p-2">
        <div className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-orange-700">
          <Plus className="h-3 w-3" /> Add a home game
        </div>
        <div className="space-y-2">
          {groups.map((g) => (
            <div key={g.group}>
              <div className="mb-1 text-[10px] font-semibold uppercase text-orange-600">
                {g.label}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {g.items.map((c) => (
                  <button
                    key={c.type}
                    onClick={() => addTask(c)}
                    title={c.hint}
                    disabled={(hw?.tasks?.length ?? 0) >= 4}
                    className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-orange-900 hover:border-[#FE6A2F] hover:bg-orange-50 disabled:opacity-40"
                  >
                    <span>{c.emoji}</span> {c.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
